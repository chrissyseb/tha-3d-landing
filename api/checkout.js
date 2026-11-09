import { stripeConfigured, stripeMode, stripeRequest, siteOrigin } from './_stripe.js';
import { findItem, defaultCatalogue, STUDENT_LEVELS } from './_catalogue.js';
import { newOrder } from './_orders.js';

// POST /api/checkout { item: 'mc-01' } -> { url, orderId }. Amounts come from the server catalogue only.
// 503 { error } when Stripe is not configured, so the page falls back to the reserve/enquiry form.

const MASTERCLASS_TERMS = 'Pay to reserve. Dates and venue are confirmed with you after booking. Max 6 students per class. '
  + 'If the dates don\'t suit, or the class is full or cancelled, you get a full refund.';

const cents = s => Math.round(Number(s) * 100);
const validEmail = e => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 200;

function paymentMethods(env = process.env) {
  const list = String(env.STRIPE_PAYMENT_METHODS || '').split(',').map(s => s.trim()).filter(s => /^[a-z_]+$/.test(s));
  return list.length ? list : undefined; // unset: Stripe picks from the dashboard settings
}

async function loadStore() {
  const s = await import('./_store.js');
  return { saveDoc: s.saveDoc };
}

function successUrl(origin, orderId) {
  return `${origin}/paid?order=${encodeURIComponent(orderId)}`;
}

export function itemSessionParams(order, item, origin, { email, env = process.env } = {}) {
  const isMc = item.kind === 'masterclass';
  const name = isMc ? `${item.title} (Thinking Hack Masterclasses™)` : `${item.title} (Thinking Hack Exam Notes™)`;
  const description = isMc ? `${item.sessions} sessions × 2 h · ${item.level}` : (item.tagline || 'Digital download (PDF)');
  const params = {
    mode: 'payment',
    client_reference_id: order.id,
    success_url: successUrl(origin, order.id),
    cancel_url: `${origin}/#programmes`,
    line_items: [{
      quantity: 1,
      price_data: { currency: 'sgd', unit_amount: cents(item.price), product_data: { name, description } },
    }],
    metadata: { orderId: order.id, kind: item.kind, itemId: item.id },
    payment_intent_data: { description: name, metadata: { orderId: order.id, kind: item.kind, itemId: item.id } },
    customer_email: validEmail(email) ? email : undefined,
    payment_method_types: paymentMethods(env),
  };
  if (isMc) {
    params.custom_fields = [
      { key: 'studentname', label: { type: 'custom', custom: 'Student\'s name' }, type: 'text', text: { minimum_length: 2, maximum_length: 80 } },
      { key: 'studentlevel', label: { type: 'custom', custom: 'Student\'s level' }, type: 'dropdown', dropdown: { options: STUDENT_LEVELS } },
      { key: 'phone', label: { type: 'custom', custom: 'Phone / WhatsApp' }, type: 'text', text: { minimum_length: 8, maximum_length: 20 } },
    ];
    params.custom_text = { submit: { message: MASTERCLASS_TERMS } };
  } else {
    // Email is always collected by Checkout in payment mode; the download is tied to the order.
    params.custom_fields = [
      { key: 'studentlevel', label: { type: 'custom', custom: 'Student\'s level' }, type: 'dropdown', dropdown: { options: STUDENT_LEVELS } },
    ];
  }
  return params;
}

// Creates the order (status 'created') and a Checkout Session for a catalogue item.
export async function createItemCheckout(itemId, { origin, email, catalogue = defaultCatalogue, env = process.env } = {}, deps = {}) {
  const item = findItem(itemId, catalogue);
  if (!item) return { error: 'That item is not available.', status: 400 };
  if (item.kind === 'resource') {
    const paths = await (deps.uploadedPaths || (await import('./_products.js')).uploadedPaths)();
    const { deliverable } = await import('./_products.js');
    if (!deliverable(item, paths)) return { error: 'This pack is not ready to buy yet. Join the waitlist and we will tell you when it opens.', status: 409 };
  }
  const { saveDoc } = deps.saveDoc ? deps : await loadStore();
  const request = deps.stripeRequest || stripeRequest;
  const order = newOrder({ kind: item.kind, itemId: item.id, title: item.title, amount: item.price, mode: stripeMode(env), customer: validEmail(email) ? { email } : {} });
  await saveDoc('orders', order);
  const session = await request('POST', '/checkout/sessions', itemSessionParams(order, item, origin, { email, env }), { idempotencyKey: 'checkout-' + order.id });
  order.stripe.sessionId = session.id;
  await saveDoc('orders', order);
  return { url: session.url, orderId: order.id };
}

// Used by admin: a Checkout Session for a Specialist's placement fee. Checkout Sessions expire after at most 24 h,
// so the admin regenerates the link if it is not paid in time. Returns { url, orderId, sessionId, expiresAt }.
export async function createPlacementFeeSession({ placementId, amount, description, email, host }, deps = {}) {
  const env = deps.env || process.env;
  if (!stripeConfigured(env)) throw Object.assign(new Error('Stripe is not configured.'), { status: 503 });
  const pid = String(placementId || '').replace(/[^\w-]/g, '').slice(0, 80);
  const amt = Math.round(Number(amount) * 100) / 100;
  if (!pid) throw Object.assign(new Error('placementId is required.'), { status: 400 });
  if (!(amt >= 1 && amt <= 50000)) throw Object.assign(new Error('Fee amount must be between S$1 and S$50,000.'), { status: 400 });
  const origin = /^https?:\/\//.test(String(host || '')) ? String(host).replace(/\/+$/, '') : siteOrigin({ headers: { host } }, env);
  const title = String(description || '').trim().slice(0, 200) || `Thinking Hack placement fee (${pid})`;
  const { saveDoc } = deps.saveDoc ? deps : await loadStore();
  const request = deps.stripeRequest || stripeRequest;
  const order = newOrder({ kind: 'placement-fee', itemId: pid, title, amount: amt, mode: stripeMode(env), placementId: pid, customer: validEmail(email) ? { email } : {} });
  await saveDoc('orders', order);
  const expiresAt = Math.floor(Date.now() / 1000) + 23 * 3600;
  const meta = { orderId: order.id, kind: 'placement-fee', placementId: pid };
  const session = await request('POST', '/checkout/sessions', {
    mode: 'payment',
    client_reference_id: order.id,
    success_url: successUrl(origin, order.id),
    cancel_url: `${origin}/`,
    expires_at: expiresAt,
    line_items: [{ quantity: 1, price_data: { currency: 'sgd', unit_amount: cents(amt), product_data: { name: title } } }],
    metadata: meta,
    payment_intent_data: { description: title, metadata: meta },
    customer_email: validEmail(email) ? email : undefined,
    payment_method_types: paymentMethods(env),
  }, { idempotencyKey: 'fee-' + order.id });
  order.stripe.sessionId = session.id;
  await saveDoc('orders', order);
  return { url: session.url, orderId: order.id, sessionId: session.id, expiresAt: new Date(expiresAt * 1000).toISOString() };
}

function bodyOf(req) {
  const b = req.body;
  if (b && typeof b === 'object') return b;
  if (typeof b === 'string') { try { return JSON.parse(b) || {}; } catch (e) { return {}; } }
  return {};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  if (!stripeConfigured()) return res.status(503).json({ error: 'Online payment is not available yet. Please use the reservation form instead.' });
  const b = bodyOf(req);
  try {
    const out = await createItemCheckout(String(b.item || ''), { origin: siteOrigin(req), email: b.email });
    if (out.error) return res.status(out.status || 400).json({ error: out.error });
    return res.status(200).json({ url: out.url, orderId: out.orderId });
  } catch (e) {
    console.error('checkout failed', e && e.message);
    return res.status(502).json({ error: 'We could not start the payment just now. Please try again, or use the reservation form.' });
  }
}
