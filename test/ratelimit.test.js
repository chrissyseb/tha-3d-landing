import { test, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { blob, resetBlob, call, enquiry } from './helpers.js';

const { default: enquiryHandler } = await import('../api/enquiry.js');
const { default: applyHandler } = await import('../api/apply.js');
const { default: checkoutHandler } = await import('../api/checkout.js');

const ip = addr => ({ 'x-real-ip': addr });
const post = (headers, n) => call(enquiryHandler, { headers, body: enquiry(n) });
const statuses = async (headers, count, from = 1) => {
  const out = [];
  for (let i = 0; i < count; i++) out.push((await post(headers, from + i)).statusCode);
  return out;
};
const savedEnquiries = () => [...blob.store.keys()].filter(p => p.startsWith('enquiries/')).length;

beforeEach(() => {
  resetBlob();
  mock.timers.enable({ apis: ['Date'], now: new Date('2026-11-17T03:10:00Z') });
});
afterEach(() => mock.timers.reset());

test('the 5th enquiry in an hour from one IP is saved and the 6th gets 429', async () => {
  assert.deepEqual(await statuses(ip('203.0.113.7'), 6), [200, 200, 200, 200, 200, 429]);
  assert.equal(savedEnquiries(), 5);
});

test('the 429 tells the parent to try later or use WhatsApp', async () => {
  await statuses(ip('203.0.113.7'), 5);
  const res = await post(ip('203.0.113.7'), 6);
  assert.match(res.body.error, /try again later/i);
  assert.match(res.body.error, /WhatsApp/);
});

test('different IPs do not share a counter', async () => {
  await statuses(ip('203.0.113.7'), 6);
  assert.equal((await post(ip('203.0.113.8'), 7)).statusCode, 200);
});

test('a new hour resets the counter', async () => {
  assert.equal((await statuses(ip('203.0.113.7'), 6)).at(-1), 429);
  mock.timers.setTime(new Date('2026-11-17T04:00:01Z').getTime());
  assert.equal((await post(ip('203.0.113.7'), 7)).statusCode, 200);
});

test('enquiry and application limits are counted separately', async () => {
  await statuses(ip('203.0.113.7'), 6);
  const res = await call(applyHandler, { headers: ip('203.0.113.7'), body: application(1) });
  assert.equal(res.statusCode, 200);
});

test('a storage error in the limiter fails open: the parent is not told 429', async () => {
  blob.failWith = new Error('blob store down');
  const res = await post(ip('203.0.113.7'), 1);
  assert.notEqual(res.statusCode, 429);
  assert.equal(res.statusCode, 500); // the save itself failed, and says so
});

test('x-real-ip is preferred over x-forwarded-for', async () => {
  // Same x-real-ip, a different x-forwarded-for every time: still one counter.
  const codes = [];
  for (let i = 1; i <= 6; i++) codes.push((await post({ 'x-real-ip': '203.0.113.7', 'x-forwarded-for': `198.51.100.${i}` }, i)).statusCode);
  assert.equal(codes.at(-1), 429);
});

test('without x-real-ip the first x-forwarded-for entry is the key', async () => {
  // Same first entry, different later entries: one counter.
  const codes = [];
  for (let i = 1; i <= 6; i++) codes.push((await post({ 'x-forwarded-for': `203.0.113.7, 10.0.0.${i}` }, i)).statusCode);
  assert.equal(codes.at(-1), 429);
  // A different first entry is a different visitor.
  assert.equal((await post({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' }, 7)).statusCode, 200);
});

test('the honeypot path answers 200 without touching storage or the limiter', async () => {
  for (let i = 1; i <= 8; i++) {
    const res = await call(enquiryHandler, { headers: ip('203.0.113.7'), body: { ...enquiry(i), website: 'http://spam.example' } });
    assert.equal(res.statusCode, 200);
  }
  assert.equal(blob.store.size, 0);
  assert.equal((await post(ip('203.0.113.7'), 9)).statusCode, 200);
});

test('enquiries that fail validation do not use up the allowance', async () => {
  for (let i = 0; i < 5; i++) {
    const res = await call(enquiryHandler, { headers: ip('203.0.113.7'), body: { name: '', consent: true } });
    assert.equal(res.statusCode, 400);
  }
  assert.equal((await post(ip('203.0.113.7'), 1)).statusCode, 200);
});

test('applications that fail validation do not use up the allowance', async () => {
  for (let i = 0; i < 5; i++) {
    const res = await call(applyHandler, { headers: ip('203.0.113.7'), body: { ...application(i), experience: 'short' } });
    assert.equal(res.statusCode, 400);
  }
  assert.equal((await call(applyHandler, { headers: ip('203.0.113.7'), body: application(9) })).statusCode, 200);
});

test('the 5th application in an hour is saved and the 6th gets 429', async () => {
  const codes = [];
  for (let i = 1; i <= 6; i++) codes.push((await call(applyHandler, { headers: ip('203.0.113.7'), body: application(i) })).statusCode);
  assert.deepEqual(codes, [200, 200, 200, 200, 200, 429]);
});

test('checkout allows 10 attempts an hour and refuses the 11th', async () => {
  // A fake test-mode key only switches the endpoint on; an unknown item returns 400 before any Stripe call.
  process.env.STRIPE_SECRET_KEY = 'sk_test_unit';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_unit'; // selling needs both
  try {
    const codes = [];
    for (let i = 1; i <= 11; i++) codes.push((await call(checkoutHandler, { headers: ip('203.0.113.7'), body: { item: 'no-such-item' } })).statusCode);
    assert.deepEqual(codes, [...Array(10).fill(400), 429]);
  } finally {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  }
});

test('rate-limit records hold no IP address and stay out of the admin collections', async () => {
  await statuses(ip('203.0.113.7'), 2);
  const limiterPaths = [...blob.store.keys()].filter(p => !p.startsWith('enquiries/') && !p.startsWith('dedupe/'));
  assert.equal(limiterPaths.length, 1);
  assert.match(limiterPaths[0], /^ratelimit\/[0-9a-f]{64}\.json$/);
  assert.equal(blob.store.get(limiterPaths[0]), '{"n":2}');
  const { listDocs, COLLECTIONS } = await import('../api/_store.js');
  for (const c of [...COLLECTIONS, 'orders']) {
    for (const doc of await listDocs(c)) assert.equal(doc.n, undefined);
  }
});

function application(n) {
  return {
    name: 'Tutor ' + n, email: `tutor${n}@example.com`, whatsapp: '9123 456' + (n % 10),
    subjects: ['English'], levels: ['O-Level'],
    qualifications: 'BA English, NIE trained',
    experience: 'Eight years teaching secondary English in schools and privately.',
    formats: ['Online'], rates: 'S$80 an hour', agreeTerms: true, consent: true,
  };
}
