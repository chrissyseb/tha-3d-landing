import { verifyWebhook } from './_stripe.js';
import { transition, addEvent, customerFromSession, newToken } from './_orders.js';
import { notify as realNotify } from './_notify.js';

// POST /api/stripe-webhook. Signature is checked against the RAW body (5-minute tolerance, timing-safe compare).
// Each event.id is recorded under stripe-events/ so a replay returns 200 with no side effects.
// The success URL never grants anything: only a verified event here marks an order paid.

export const config = { api: { bodyParser: false } };

const orderIdOf = obj => (obj && ((obj.metadata && obj.metadata.orderId) || obj.client_reference_id)) || '';

async function orderByPaymentIntent(pi, fallbackOrderId, deps) {
  if (pi) {
    const link = await deps.readDoc('orders-by-pi', pi);
    if (link && link.orderId) return deps.readDoc('orders', link.orderId);
  }
  return fallbackOrderId ? deps.readDoc('orders', fallbackOrderId) : null;
}

async function markPlacementFeePaid(order, paidAmount, now, deps) {
  const p = await deps.readDoc('placements', order.placementId);
  if (!p) { addEvent(order, 'placement-missing', now, order.placementId); return false; }
  p.feeInvoice = { ...(p.feeInvoice && typeof p.feeInvoice === 'object' ? p.feeInvoice : {}), status: 'paid', paidAmount, paidAt: now.toISOString(), source: 'stripe' };
  await deps.saveDoc('placements', p);
  return true;
}

async function markPaid(order, session, eventType, now, deps) {
  const paid = Number(session.amount_total) / 100;
  if ((session.currency && session.currency !== 'sgd') || (Number.isFinite(paid) && Math.abs(paid - order.amount) > 0.001)) {
    addEvent(order, 'amount-mismatch', now, `${session.amount_total} ${session.currency}`);
    return 'amount-mismatch';
  }
  if (!transition(order, 'paid', eventType, now)) return 'unchanged';
  order.paidAt = now.toISOString();
  if (order.kind === 'resource' && !order.downloadToken) order.downloadToken = deps.token();
  if (order.kind === 'placement-fee') await markPlacementFeePaid(order, order.amount, now, deps);
  await deps.notify({
    type: order.kind === 'placement-fee' ? 'placement-fee-paid' : 'order-paid',
    id: order.kind === 'placement-fee' ? `${order.id} (placement ${order.placementId})` : order.id,
    detail: `${order.title} · S$${order.amount}${order.mode === 'test' ? ' · TEST MODE' : ''}`,
  });
  return 'paid';
}

async function handleSession(event, deps, now) {
  const s = event.data.object || {};
  const order = await deps.readDoc('orders', orderIdOf(s));
  if (!order) return { action: 'ignored-no-order' };
  if (order.stripe && order.stripe.sessionId && s.id && order.stripe.sessionId !== s.id) return { action: 'ignored-session-mismatch' };
  order.stripe = { ...(order.stripe || {}), sessionId: order.stripe && order.stripe.sessionId || s.id || '' };
  let action;
  if (event.type === 'checkout.session.completed') {
    order.customer = { ...(order.customer || {}), ...customerFromSession(s) };
    if (s.payment_intent) {
      order.stripe.paymentIntent = String(s.payment_intent);
      await deps.saveDoc('orders-by-pi', { id: order.stripe.paymentIntent, orderId: order.id });
    }
    action = s.payment_status === 'paid' ? await markPaid(order, s, event.type, now, deps)
      : (transition(order, 'pending', event.type, now) ? 'pending' : 'unchanged');
  } else if (event.type === 'checkout.session.async_payment_succeeded') {
    action = await markPaid(order, s, event.type, now, deps);
  } else if (event.type === 'checkout.session.async_payment_failed') {
    action = transition(order, 'failed', event.type, now) ? 'failed' : 'unchanged';
  } else {
    action = transition(order, 'expired', event.type, now) ? 'expired' : 'unchanged';
  }
  await deps.saveDoc('orders', order);
  return { action, orderId: order.id };
}

async function handleRefund(event, deps, now) {
  const c = event.data.object || {};
  const order = await orderByPaymentIntent(c.payment_intent, c.metadata && c.metadata.orderId, deps);
  if (!order) return { action: 'ignored-no-order' };
  const refunded = Number(c.amount_refunded || 0);
  const full = c.refunded === true || refunded >= Number(c.amount || 0);
  order.refundedAmount = refunded / 100;
  const changed = transition(order, full ? 'refunded' : 'part-refunded', event.type, now, `S$${refunded / 100}`);
  await deps.saveDoc('orders', order);
  return { action: changed ? (full ? 'refunded' : 'part-refunded') : 'unchanged', orderId: order.id };
}

async function handleDispute(event, deps, now) {
  const d = event.data.object || {};
  const order = await orderByPaymentIntent(d.payment_intent, d.metadata && d.metadata.orderId, deps);
  if (!order) return { action: 'ignored-no-order' };
  order.dispute = { id: d.id || '', reason: d.reason || '', amount: Number(d.amount || 0) / 100, status: d.status || '', at: now.toISOString() };
  const changed = transition(order, 'disputed', event.type, now, d.reason);
  await deps.saveDoc('orders', order);
  return { action: changed ? 'disputed' : 'unchanged', orderId: order.id };
}

const HANDLERS = {
  'checkout.session.completed': handleSession,
  'checkout.session.async_payment_succeeded': handleSession,
  'checkout.session.async_payment_failed': handleSession,
  'checkout.session.expired': handleSession,
  'charge.refunded': handleRefund,
  'charge.dispute.created': handleDispute,
};

// deps: { readDoc, saveDoc, notify, token?, now? }. Exported so tests can run it against an in-memory store.
export async function handleEvent(event, deps) {
  if (!event || !event.id || !event.type) return { action: 'ignored-malformed' };
  const d = { token: newToken, now: () => new Date(), ...deps };
  if (await d.readDoc('stripe-events', event.id)) return { action: 'duplicate', duplicate: true };
  const fn = HANDLERS[event.type];
  const now = d.now();
  const result = fn ? await fn(event, d, now) : { action: 'ignored-type' };
  await d.saveDoc('stripe-events', { id: event.id, type: event.type, at: now.toISOString(), livemode: !!event.livemode, result: result.action, orderId: result.orderId || '' });
  return result;
}

async function readRaw(req) {
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody;
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === 'string' ? Buffer.from(c) : c);
  return Buffer.concat(chunks);
}

async function realDeps() {
  const s = await import('./_store.js');
  return { readDoc: s.readDoc, saveDoc: s.saveDoc, notify: realNotify };
}

export function createWebhookHandler({ getDeps = realDeps, env = process.env, now } = {}) {
  return async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
    const secret = env.STRIPE_WEBHOOK_SECRET;
    if (!secret) { console.error('STRIPE_WEBHOOK_SECRET is not set'); return res.status(503).json({ error: 'Webhook not configured.' }); }
    let event;
    try {
      const raw = await readRaw(req);
      event = verifyWebhook(raw, req.headers['stripe-signature'], secret, 300, now ? now() : undefined);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid signature.' });
    }
    try {
      const result = await handleEvent(event, await getDeps());
      return res.status(200).json({ received: true, action: result.action });
    } catch (e) {
      console.error('webhook processing failed', event.type, event.id, e && e.message);
      return res.status(500).json({ error: 'Processing failed; Stripe will retry.' });
    }
  };
}

export default createWebhookHandler();
