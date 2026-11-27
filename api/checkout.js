import { body, send, csrfOk, getSession, getJson, famPath } from './_lib.js';
export default async function handler(req, res) {
  if (!csrfOk(req)) return send(res, 403, { error: 'Bad request' });
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  const s = getSession(req); if (!s || s.t !== 'p') return send(res, 401, { error: 'Please log in as a parent to buy.' });
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return send(res, 503, { error: 'Online payment is opening soon. To unlock now, WhatsApp +65 9003 0002.' });
  const fam = await getJson(famPath(s.fid)); if (!fam) return send(res, 401, { error: 'Please log in again.' });
  const b = await body(req), plan = b.plan === 'family' ? 'family' : 'child';
  const child = plan === 'child' ? fam.children.find(c => c.id === b.childId) : null;
  if (plan === 'child' && !child) return send(res, 400, { error: 'Pick which player to unlock.' });
  const cents = plan === 'family' ? Number(process.env.PRICE_FAMILY_CENTS || 5990) : Number(process.env.PRICE_CHILD_CENTS || 2990);
  const origin = `https://${req.headers.host}`;
  const f = new URLSearchParams({
    mode: 'payment', 'line_items[0][quantity]': '1', 'line_items[0][price_data][currency]': 'sgd',
    'line_items[0][price_data][unit_amount]': String(cents),
    'line_items[0][price_data][product_data][name]': plan === 'family' ? 'VocaBobby Family Pass (1 year, up to 3 players)' : `VocaBobby PSLE Edition (1 year) for ${child.nick}`,
    success_url: `${origin}/account.html?paid=1`, cancel_url: `${origin}/account.html?cancel=1`,
    customer_email: fam.email, client_reference_id: fam.id,
    'metadata[fid]': fam.id, 'metadata[plan]': plan, 'metadata[childId]': child ? child.id : '',
    'payment_method_types[0]': 'card', 'payment_method_types[1]': 'paynow'
  });
  const r = await fetch('https://api.stripe.com/v1/checkout/sessions', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: f });
  const j = await r.json(); if (!r.ok) return send(res, 502, { error: 'Payment page could not open. Please try again.', detail: j.error && j.error.message });
  return send(res, 200, { url: j.url });
}
