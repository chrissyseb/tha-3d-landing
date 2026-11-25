// End-to-end purchase flow through the REAL handlers: checkout -> Stripe webhook -> order -> download.
// Fakes: @vercel/blob (test/fake-blob.js) and global fetch (Stripe and Resend). No network, no secrets.
import { test, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { Writable } from 'node:stream';
import { readFileSync } from 'node:fs';
import { blob, resetBlob, call } from './helpers.js';

const { default: checkoutHandler } = await import('../api/checkout.js');
const { default: webhookHandler } = await import('../api/stripe-webhook.js');
const { default: orderHandler } = await import('../api/order.js');
const { default: downloadHandler } = await import('../api/download.js');
const { default: configHandler } = await import('../api/config.js');

const WEBHOOK_SECRET = 'whsec_unit_test';
const O_ENGLISH = 'bundle-set-o-english';
// Literal expectations, copied from the product sheet (not computed from the catalogue).
const O_ENGLISH_FILES = [
  ['Start Here', 'products/bundle-set-o-english-00.pdf'],
  ['O-Level Comprehension Pack', 'products/res-o-comprehension.pdf'],
  ['O-Level Writing Pack', 'products/res-o-writing.pdf'],
  ['O-Level Oral Pack', 'products/res-o-oral.pdf'],
  ['O-Level Argumentative Essays: The Writing Method', 'products/bundle-set-o-english-04.pdf'],
  ['Argumentative Essay Workbook', 'products/bundle-set-o-english-05.pdf'],
  ['Comprehension Mastery Workbook', 'products/bundle-set-o-english-06.pdf'],
  ['O-Level English Summary Notes', 'products/bundle-set-o-english-07.pdf'],
];

let stripeCalls, emails, clock = Date.parse('2026-11-18T02:00:00Z'), eventNo = 0;

beforeEach(() => {
  resetBlob();
  clock += 10 * 60 * 1000; // each test starts 10 minutes later, so the 60-second product list cache never carries over
  mock.timers.enable({ apis: ['Date'], now: clock });
  process.env.STRIPE_SECRET_KEY = 'sk_test_unit';
  process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
  stripeCalls = []; emails = [];
  globalThis.fetch = async (url, init = {}) => {
    if (url === 'https://api.stripe.com/v1/checkout/sessions') {
      const params = new URLSearchParams(init.body);
      stripeCalls.push(params);
      const id = 'cs_test_' + stripeCalls.length;
      return new Response(JSON.stringify({ id, url: 'https://checkout.stripe.com/c/pay/' + id }), { status: 200 });
    }
    if (url === 'https://api.resend.com/emails') { emails.push(JSON.parse(init.body)); return new Response('{}', { status: 200 }); }
    throw new Error('network call in a test: ' + url);
  };
});
afterEach(() => {
  mock.timers.reset();
  for (const k of ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'SITE_URL', 'RESEND_API_KEY', 'NOTIFY_EMAIL']) delete process.env[k];
});

const upload = (...paths) => paths.forEach(p => blob.store.set(p, '%PDF- contents of ' + p));
const buy = (item, extra = {}, headers = {}) => call(checkoutHandler, { headers: { 'x-real-ip': '203.0.113.9', host: 'thinking-hack.vercel.app', ...headers }, body: { item, ...extra } });
const sessionFor = orderId => 'cs_test_' + (stripeCalls.findIndex(p => p.get('client_reference_id') === orderId) + 1);
const savedOrders = () => [...blob.store.keys()].filter(p => p.startsWith('orders/'));

// Sends one signed Stripe event to the real webhook handler.
function stripeEvent(type, object, { id = 'evt_' + (++eventNo), secret = WEBHOOK_SECRET, ageSec = 0 } = {}) {
  const raw = JSON.stringify({ id, type, livemode: false, data: { object } });
  const t = Math.floor(Date.now() / 1000) - ageSec;
  const v1 = createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex');
  return call(webhookHandler, { headers: { 'stripe-signature': `t=${t},v1=${v1}` }, rawBody: Buffer.from(raw) });
}
const session = (orderId, amount, over = {}) => ({
  id: sessionFor(orderId), client_reference_id: orderId, metadata: { orderId }, payment_status: 'paid',
  amount_total: amount * 100, currency: 'sgd', payment_intent: 'pi_' + orderId, customer_details: { email: 'buyer@example.com' }, ...over,
});
const pay = (orderId, amount) => stripeEvent('checkout.session.completed', session(orderId, amount));
const order = async id => (await call(orderHandler, { method: 'GET', query: { id } })).body;

function streamRes() {
  const chunks = [];
  const res = new Writable({ write(c, _enc, cb) { chunks.push(Buffer.from(c)); cb(); } });
  Object.assign(res, {
    statusCode: 0, headers: {}, body: undefined, headersSent: false,
    setHeader(k, v) { res.headers[k] = v; }, status(c) { res.statusCode = c; return res; }, json(b) { res.body = b; return res; },
    text: () => Buffer.concat(chunks).toString(),
  });
  return res;
}
async function download(url) {
  const res = streamRes();
  await downloadHandler({ method: 'GET', headers: {}, query: Object.fromEntries(new URL(url, 'https://x.test').searchParams) }, res);
  return res;
}

test('buy a single pack: the price is the server\'s, nothing downloads before payment, then the PDF arrives', async () => {
  upload('products/res-psle-maths.pdf');
  const res = await buy('res-psle-maths', { price: 1, amount: 1, unit_amount: 1 });
  assert.equal(res.statusCode, 200);
  assert.match(res.body.url, /^https:\/\/checkout\.stripe\.com\//);
  const sent = stripeCalls[0];
  assert.equal(sent.get('line_items[0][price_data][unit_amount]'), '3500'); // S$35, whatever the browser sent
  assert.equal(sent.get('line_items[0][price_data][currency]'), 'sgd');
  assert.equal(sent.get('success_url'), 'https://thinking-hack.vercel.app/paid?order=' + res.body.orderId);

  const before = await order(res.body.orderId);
  assert.equal(before.status, 'created');
  assert.equal(before.download, undefined);
  assert.equal((await download(`/api/download?order=${res.body.orderId}&token=anything`)).statusCode, 403);

  assert.equal((await pay(res.body.orderId, 35)).body.action, 'paid');
  const after = await order(res.body.orderId);
  assert.equal(after.status, 'paid');
  assert.equal(after.email, undefined, 'the public order view carries no personal data');
  const file = await download(after.download);
  assert.equal(file.statusCode, 200);
  assert.equal(file.headers['Content-Type'], 'application/pdf');
  assert.equal(file.headers['Content-Disposition'], 'attachment; filename="Thinking-Hack-PSLE-Maths.pdf"');
  assert.equal(file.text(), '%PDF- contents of products/res-psle-maths.pdf');
});

test('buy a Full Set: all eight files arrive, in order, each with its own title', async () => {
  upload(...O_ENGLISH_FILES.map(f => f[1]));
  const res = await buy(O_ENGLISH);
  assert.equal(res.statusCode, 200);
  assert.equal(stripeCalls[0].get('line_items[0][price_data][unit_amount]'), '12900');
  await pay(res.body.orderId, 129);
  const o = await order(res.body.orderId);
  assert.deepEqual(o.downloads.map(d => d.title), O_ENGLISH_FILES.map(f => f[0]));
  for (const [i, d] of o.downloads.entries()) {
    const file = await download(d.url);
    assert.equal(file.statusCode, 200, d.title);
    assert.equal(file.text(), '%PDF- contents of ' + O_ENGLISH_FILES[i][1], d.title);
  }
  assert.equal((await download(o.downloads[0].url.replace('file=0', 'file=8'))).statusCode, 404, 'there is no ninth file');
  assert.equal((await download(o.downloads[0].url.replace('file=0', 'file=../../orders/x'))).statusCode, 404, 'a path is not a file number');
});

test('the order page can show a Full Set buyer every file', () => {
  assert.match(readFileSync(new URL('../paid.html', import.meta.url), 'utf8'), /\.downloads\b/);
});

test('PayNow paid later: no download while pending, download once the payment succeeds', async () => {
  upload('products/res-o-oral.pdf');
  const { body } = await buy('res-o-oral');
  assert.equal((await stripeEvent('checkout.session.completed', session(body.orderId, 29, { payment_status: 'unpaid' }))).body.action, 'pending');
  const pending = await order(body.orderId);
  assert.equal(pending.status, 'pending');
  assert.equal(pending.download, undefined);
  assert.equal((await stripeEvent('checkout.session.async_payment_succeeded', session(body.orderId, 29))).body.action, 'paid');
  assert.equal((await download((await order(body.orderId)).download)).statusCode, 200);
});

test('events out of order: a late "completed, unpaid" does not undo a payment', async () => {
  upload('products/res-o-oral.pdf');
  const { body } = await buy('res-o-oral');
  await stripeEvent('checkout.session.async_payment_succeeded', session(body.orderId, 29));
  const link = (await order(body.orderId)).download;
  assert.equal((await stripeEvent('checkout.session.completed', session(body.orderId, 29, { payment_status: 'unpaid' }))).body.action, 'unchanged');
  const o = await order(body.orderId);
  assert.equal(o.status, 'paid');
  assert.equal(o.download, link);
});

test('a replayed webhook changes nothing: same link, one owner email', async () => {
  process.env.RESEND_API_KEY = 're_unit'; process.env.NOTIFY_EMAIL = 'owner@example.com';
  upload('products/res-gp-essay.pdf');
  const { body } = await buy('res-gp-essay');
  const ev = session(body.orderId, 45);
  assert.equal((await stripeEvent('checkout.session.completed', ev, { id: 'evt_replay' })).body.action, 'paid');
  const link = (await order(body.orderId)).download;
  const again = await stripeEvent('checkout.session.completed', ev, { id: 'evt_replay' });
  assert.equal(again.statusCode, 200);
  assert.equal(again.body.action, 'duplicate');
  assert.equal((await order(body.orderId)).download, link);
  assert.equal(emails.length, 1);
  assert.equal(JSON.stringify(emails[0]).includes('buyer@example.com'), false, 'the owner email carries no buyer data');
});

test('a webhook that is unsigned, signed with another secret, or older than 5 minutes is refused and pays nothing', async () => {
  upload('products/res-psle-science.pdf');
  const { body } = await buy('res-psle-science');
  const ev = session(body.orderId, 39);
  assert.equal((await stripeEvent('checkout.session.completed', ev, { secret: 'whsec_wrong' })).statusCode, 400);
  assert.equal((await stripeEvent('checkout.session.completed', ev, { ageSec: 301 })).statusCode, 400);
  assert.equal((await call(webhookHandler, { headers: {}, rawBody: Buffer.from(JSON.stringify({ id: 'evt_x', type: 'checkout.session.completed', data: { object: ev } })) })).statusCode, 400);
  assert.equal((await order(body.orderId)).status, 'created');
});

test('a Full Set with one file missing cannot be bought, and is not listed as available', async () => {
  upload(...O_ENGLISH_FILES.slice(0, 7).map(f => f[1])); // Summary Notes not uploaded
  const res = await buy(O_ENGLISH);
  assert.equal(res.statusCode, 409);
  assert.match(res.body.error, /not ready to buy yet/);
  assert.equal(stripeCalls.length, 0, 'no Stripe session is created');
  assert.deepEqual(savedOrders(), [], 'no order is saved');
  const cfg = (await call(configHandler, { method: 'GET' })).body;
  assert.equal(cfg.available.includes(O_ENGLISH), false);
  assert.equal(cfg.available.includes('res-o-oral'), true, 'its packs are still on sale');
});

test('a file removed after payment: the buyer is told it is being prepared, the other files still download', async () => {
  upload(...O_ENGLISH_FILES.map(f => f[1]));
  const { body } = await buy(O_ENGLISH);
  await pay(body.orderId, 129);
  blob.store.delete('products/bundle-set-o-english-07.pdf');
  const o = await order(body.orderId);
  const missing = await download(o.downloads[7].url);
  assert.equal(missing.statusCode, 404);
  assert.match(missing.body.error, /being prepared/);
  assert.equal((await download(o.downloads[6].url)).statusCode, 200);
});

test('a refunded order loses its download', async () => {
  upload('products/res-psle-maths.pdf');
  const { body } = await buy('res-psle-maths');
  await pay(body.orderId, 35);
  const link = (await order(body.orderId)).download;
  assert.equal((await download(link)).statusCode, 200);
  const refund = await stripeEvent('charge.refunded', { id: 'ch_1', payment_intent: 'pi_' + body.orderId, amount: 3500, amount_refunded: 3500, refunded: true });
  assert.equal(refund.body.action, 'refunded');
  const o = await order(body.orderId);
  assert.equal(o.status, 'refunded');
  assert.equal(o.download, undefined);
  assert.equal((await download(link)).statusCode, 403);
});

test('a forged token, another order\'s token, or a guessed order id gets nothing', async () => {
  upload('products/res-psle-maths.pdf', 'products/res-o-oral.pdf');
  const a = (await buy('res-psle-maths')).body.orderId;
  const b = (await buy('res-o-oral')).body.orderId;
  await pay(a, 35); await pay(b, 29);
  const linkA = (await order(a)).download, linkB = (await order(b)).download;
  const tokenB = new URL(linkB, 'https://x.test').searchParams.get('token');
  assert.equal((await download(`/api/download?order=${a}&token=${'0'.repeat(48)}`)).statusCode, 403);
  assert.equal((await download(`/api/download?order=${a}&token=${tokenB}`)).statusCode, 403);
  assert.equal((await download(`/api/download?order=${a}`)).statusCode, 403);
  assert.equal((await download('/api/download?order=ord-20261118020000-000000000000000000000000&token=x')).statusCode, 403);
  assert.equal((await call(orderHandler, { method: 'GET', query: { id: 'ord-20261118020000-000000000000000000000000' } })).statusCode, 404);
  assert.equal((await download(linkA)).statusCode, 200);
});

test('a hidden pack-only bundle cannot be bought by posting its id, and is not listed as available', async () => {
  upload('products/res-psle-comprehension.pdf', 'products/res-psle-science.pdf', 'products/res-psle-maths.pdf',
    'products/res-o-comprehension.pdf', 'products/res-o-writing.pdf', 'products/res-o-oral.pdf', 'products/res-o-ss.pdf',
    'products/res-gp-comprehension.pdf', 'products/res-gp-essay.pdf');
  for (const id of ['bundle-psle', 'bundle-o', 'bundle-o-english', 'bundle-gp']) {
    const res = await buy(id);
    assert.equal(res.statusCode, 400, id);
    assert.equal(res.body.error, 'That item is not available.');
  }
  assert.equal(stripeCalls.length, 0);
  assert.deepEqual(savedOrders(), []);
  const { available } = (await call(configHandler, { method: 'GET' })).body;
  assert.deepEqual(available.filter(id => /^bundle-(psle|o|o-english|gp)$/.test(id)), []);
});

test('an unknown item id is refused', async () => {
  for (const id of ['res-nope', '', '../orders', '__proto__']) assert.equal((await buy(id)).statusCode, 400, id);
});

test('with no Stripe key the shop is waitlist only: config says so and checkout answers 503, not an error page', async () => {
  delete process.env.STRIPE_SECRET_KEY;
  upload('products/res-psle-maths.pdf');
  const cfg = await call(configHandler, { method: 'GET' });
  assert.equal(cfg.statusCode, 200);
  assert.deepEqual(cfg.body, { stripe: false, mode: 'test', available: [] });
  const res = await buy('res-psle-maths');
  assert.equal(res.statusCode, 503);
  assert.match(res.body.error, /not available yet/);
  assert.deepEqual([...blob.store.keys()].filter(p => !p.startsWith('products/')), [], 'nothing is stored');
});

test('a Stripe key without the webhook secret does not sell: money could be taken and never confirmed', async () => {
  delete process.env.STRIPE_WEBHOOK_SECRET;
  upload('products/res-psle-maths.pdf');
  assert.equal((await call(configHandler, { method: 'GET' })).body.stripe, false);
  assert.equal((await buy('res-psle-maths')).statusCode, 503);
  assert.equal(stripeCalls.length, 0);
});

test('Stripe being down: the buyer is told to try again or use the form, and no payment link is given', async () => {
  upload('products/res-psle-maths.pdf');
  globalThis.fetch = async () => new Response(JSON.stringify({ error: { message: 'Invalid API Key provided' } }), { status: 401 });
  const res = await buy('res-psle-maths');
  assert.equal(res.statusCode, 502);
  assert.match(res.body.error, /could not start the payment/);
  assert.equal(JSON.stringify(res.body).includes('Invalid API Key'), false, 'Stripe\'s own error text is not shown to the buyer');
});

test('return URL: SITE_URL when set, otherwise the host the buyer is on', async () => {
  upload('products/res-psle-maths.pdf');
  await buy('res-psle-maths', {}, { host: 'www.thinkinghack.example' });
  assert.match(stripeCalls[0].get('success_url'), /^https:\/\/www\.thinkinghack\.example\/paid\?order=ord-/);
  process.env.SITE_URL = 'https://shop.example.sg/';
  await buy('res-psle-maths', {}, { host: 'www.thinkinghack.example' });
  assert.match(stripeCalls[1].get('success_url'), /^https:\/\/shop\.example\.sg\/paid\?order=ord-/);
});

test('a payment whose amount or currency does not match is not marked paid, and the owner is told', async () => {
  process.env.RESEND_API_KEY = 're_unit'; process.env.NOTIFY_EMAIL = 'owner@example.com';
  upload('products/res-psle-maths.pdf');
  const { body } = await buy('res-psle-maths');
  const res = await stripeEvent('checkout.session.completed', session(body.orderId, 35, { amount_total: 11800, currency: 'myr' }));
  assert.equal(res.body.action, 'amount-mismatch');
  const o = await order(body.orderId);
  assert.notEqual(o.status, 'paid');
  assert.equal(o.download, undefined);
  assert.equal(emails.length, 1, 'the owner gets one email, so a buyer who paid is not left waiting unseen');
  assert.match(emails[0].subject, /needs checking/i);
  assert.match(emails[0].text, new RegExp(body.orderId));
});
