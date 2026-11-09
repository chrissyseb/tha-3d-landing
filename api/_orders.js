import { randomBytes } from 'node:crypto';
import { STUDENT_LEVELS } from './_catalogue.js';

// Order records live at orders/<id>.json. Placement fees are orders too (kind 'placement-fee'),
// kept separate from tuition (families pay Specialists directly) and from product orders.
//
// { id, createdAt, kind: 'masterclass'|'resource'|'placement-fee', itemId, title, amount (S$), currency: 'sgd',
//   status, mode: 'test'|'live', stripe: { sessionId, paymentIntent }, customer: { email, name, studentName, studentLevel, phone },
//   placementId?, downloadToken?, refundedAmount?, dispute?, events: [{ type, at, note? }] }

export const ORDER_KINDS = ['masterclass', 'resource', 'placement-fee'];
export const ORDER_STATUSES = ['created', 'pending', 'paid', 'failed', 'expired', 'refunded', 'part-refunded', 'disputed'];

// Which statuses each status may be entered from. A paid order is never downgraded by a late or replayed event.
const ALLOWED_FROM = {
  pending: ['created'],
  paid: ['created', 'pending', 'failed'],
  failed: ['created', 'pending'],
  expired: ['created', 'pending'],
  refunded: ['paid', 'part-refunded', 'disputed'],
  'part-refunded': ['paid', 'part-refunded', 'disputed'],
  disputed: ['paid', 'part-refunded', 'refunded'],
};

export function newOrderId(now = new Date()) {
  return 'ord-' + now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14) + '-' + randomBytes(12).toString('hex');
}

export const newToken = () => randomBytes(24).toString('hex');

export function newOrder({ kind, itemId = '', title, amount, mode = 'test', customer = {}, placementId, now = new Date() }) {
  if (!ORDER_KINDS.includes(kind)) throw new Error('Unknown order kind: ' + kind);
  const order = {
    id: newOrderId(now),
    createdAt: now.toISOString(),
    kind,
    itemId,
    title: String(title || ''),
    amount: Math.round(Number(amount) * 100) / 100,
    currency: 'sgd',
    status: 'created',
    mode,
    stripe: { sessionId: '', paymentIntent: '' },
    customer: { email: '', name: '', studentName: '', studentLevel: '', phone: '', ...customer },
    events: [{ type: 'created', at: now.toISOString() }],
  };
  if (placementId) order.placementId = String(placementId);
  return order;
}

export function addEvent(order, type, now = new Date(), note) {
  order.events = Array.isArray(order.events) ? order.events : [];
  const e = { type, at: now.toISOString() };
  if (note) e.note = String(note).slice(0, 300);
  order.events.push(e);
  return order;
}

// Moves the order to `status` if allowed; always records the event. Returns true if the status changed.
export function transition(order, status, eventType, now = new Date(), note) {
  addEvent(order, eventType || status, now, note);
  const from = ALLOWED_FROM[status] || [];
  if (order.status === status && status !== 'part-refunded') return false;
  if (!from.includes(order.status)) return false;
  order.status = status;
  order.updatedAt = now.toISOString();
  return true;
}

// Copies Stripe Checkout customer_details and custom_fields into order.customer (only non-empty values).
export function customerFromSession(session = {}) {
  const d = session.customer_details || {};
  const out = {};
  if (d.email || session.customer_email) out.email = String(d.email || session.customer_email).slice(0, 200);
  if (d.name) out.name = String(d.name).slice(0, 120);
  if (d.phone) out.phone = String(d.phone).slice(0, 40);
  (session.custom_fields || []).forEach(f => {
    const v = f.type === 'dropdown' ? f.dropdown && f.dropdown.value
      : f.type === 'numeric' ? f.numeric && f.numeric.value
        : f.text && f.text.value;
    if (!v) return;
    if (f.key === 'studentname') out.studentName = String(v).slice(0, 120);
    if (f.key === 'studentlevel') out.studentLevel = (STUDENT_LEVELS.find(l => l.value === v) || { label: String(v) }).label;
    if (f.key === 'phone') out.phone = String(v).slice(0, 40);
  });
  return out;
}

// Public-safe view for /api/order: no personal data, no token.
export function publicView(order) {
  return { id: order.id, status: order.status, kind: order.kind, title: order.title, amount: order.amount, currency: order.currency, mode: order.mode };
}
