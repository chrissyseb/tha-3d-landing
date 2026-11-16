import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { verifyWebhook, encodeForm } from '../api/_stripe.js';
import { newOrder, transition } from '../api/_orders.js';
import { handleEvent } from '../api/stripe-webhook.js';
import { createDownloadHandler } from '../api/download.js';
import { buildEnquiry } from '../api/_validate.js';

const sign = (body, secret, t) => `t=${t},v1=${createHmac('sha256', secret).update(`${t}.${body}`).digest('hex')}`;

function memStore() {
  const m = new Map();
  return {
    m,
    readDoc: async (c, id) => (m.has(`${c}/${id}`) ? JSON.parse(m.get(`${c}/${id}`)) : null),
    saveDoc: async (c, d) => { m.set(`${c}/${d.id}`, JSON.stringify(d)); return d; },
  };
}

function fakeRes() {
  return { code: 0, body: null, headers: {}, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; }, setHeader(k, v) { this.headers[k] = v; } };
}

test('webhook signature: accepts a valid one, rejects tampering and old timestamps', () => {
  const body = JSON.stringify({ id: 'evt_1', type: 'x' });
  const now = 1_800_000_000;
  assert.equal(verifyWebhook(body, sign(body, 'whsec', now), 'whsec', 300, now).id, 'evt_1');
  assert.throws(() => verifyWebhook(body + ' ', sign(body, 'whsec', now), 'whsec', 300, now));
  assert.throws(() => verifyWebhook(body, sign(body, 'other', now), 'whsec', 300, now));
  assert.throws(() => verifyWebhook(body, sign(body, 'whsec', now - 301), 'whsec', 300, now));
  assert.throws(() => verifyWebhook(body, sign(body, 'whsec', now), '', 300, now));
});

test('stripe form encoding nests objects and arrays', () => {
  assert.equal(decodeURIComponent(encodeForm({ a: { b: 1 }, c: [{ d: 'x y' }], e: undefined })), 'a[b]=1&c[0][d]=x y');
});

test('a paid order is never downgraded by a late event', () => {
  const o = newOrder({ kind: 'resource', title: 't', amount: 29 });
  assert.equal(transition(o, 'paid'), true);
  assert.equal(transition(o, 'expired'), false);
  assert.equal(transition(o, 'failed'), false);
  assert.equal(o.status, 'paid');
});

test('webhook marks an order paid once, only for the right amount, and ignores replays', async () => {
  const s = memStore();
  const notes = [];
  const deps = { ...s, notify: async n => { notes.push(n); }, token: () => 'tok' };
  const order = newOrder({ kind: 'resource', itemId: 'res-x', title: 'Pack', amount: 29 });
  order.stripe.sessionId = 'cs_1';
  await s.saveDoc('orders', order);
  const ev = (id, amount, session = 'cs_1') => ({ id, type: 'checkout.session.completed', data: { object: { id: session, payment_status: 'paid', amount_total: amount, currency: 'sgd', payment_intent: 'pi_1', metadata: { orderId: order.id } } } });

  assert.equal((await handleEvent(ev('evt_a', 100), deps)).action, 'amount-mismatch');
  assert.equal((await s.readDoc('orders', order.id)).status, 'created');
  assert.equal((await handleEvent(ev('evt_b', 2900, 'cs_other'), deps)).action, 'ignored-session-mismatch');
  assert.equal((await handleEvent(ev('evt_c', 2900), deps)).action, 'paid');
  assert.equal((await handleEvent(ev('evt_c', 2900), deps)).action, 'duplicate');
  const saved = await s.readDoc('orders', order.id);
  assert.equal(saved.status, 'paid');
  assert.equal(saved.downloadToken, 'tok');
  assert.equal(notes.length, 1);

  const refund = { id: 'evt_d', type: 'charge.refunded', data: { object: { payment_intent: 'pi_1', amount: 2900, amount_refunded: 2900, refunded: true } } };
  assert.equal((await handleEvent(refund, deps)).action, 'refunded');
});

test('download needs a paid resource order and the matching token', async () => {
  const s = memStore();
  const catalogue = { masterclasses: [], resources: [{ id: 'res-x', title: 'Pack', price: 29, file: 'products/res-x.pdf' }] };
  const handler = createDownloadHandler({ getDeps: async () => ({ readDoc: s.readDoc, getFile: async () => null }), catalogue });
  const order = newOrder({ kind: 'resource', itemId: 'res-x', title: 'Pack', amount: 29 });
  order.downloadToken = 'secret-token';
  await s.saveDoc('orders', order);
  const call = async q => { const res = fakeRes(); await handler({ method: 'GET', query: q }, res); return res.code; };

  assert.equal(await call({ order: order.id, token: 'secret-token' }), 403); // not paid yet
  order.status = 'paid';
  await s.saveDoc('orders', order);
  assert.equal(await call({ order: order.id, token: 'wrong-token!' }), 403);
  assert.equal(await call({ order: order.id }), 403);
  assert.equal(await call({ order: order.id, token: 'secret-token' }), 404); // authorised; file not uploaded in this test
  order.status = 'refunded';
  await s.saveDoc('orders', order);
  assert.equal(await call({ order: order.id, token: 'secret-token' }), 403);
});

test('enquiry needs a name, a way to reply and consent', () => {
  assert.ok(buildEnquiry({ name: 'A', email: 'a@b.sg' }).error);
  assert.ok(buildEnquiry({ name: 'A', consent: true }).error);
  assert.equal(buildEnquiry({ name: 'A', whatsapp: '9123 4567', consent: true }).doc.status, 'new');
});

// The pages were once rewritten with "./" paths for GitHub Pages, which broke canonical, Open Graph and JSON-LD URLs.
test('public pages keep absolute canonical/OG URLs and no "./" paths', () => {
  for (const f of readdirSync('.').filter(n => n.endsWith('.html') && n !== 'admin.html')) {
    const html = readFileSync(f, 'utf8');
    assert.match(html, /<link rel="canonical" href="https:\/\/[^"]+"/, f + ': canonical must be absolute');
    assert.doesNotMatch(html, /(href|src|content)="\.\//, f + ': no ./ paths');
    assert.doesNotMatch(html, /"url":"\.\//, f + ': JSON-LD url must be absolute');
  }
});
