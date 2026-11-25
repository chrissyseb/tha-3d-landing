// Enquiry and application forms, and the admin upload paths, through the real handlers with the fake blob store.
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { readFileSync } from 'node:fs';
import { blob, resetBlob, call, fakeRes, enquiry } from './helpers.js';

const { default: enquiryHandler } = await import('../api/enquiry.js');
const { default: applyHandler } = await import('../api/apply.js');
const { default: adminHandler } = await import('../api/admin.js');
const { default: uploadHandler } = await import('../api/admin-upload.js');

const KEY = 'unit-test-admin-key';
const paths = prefix => [...blob.store.keys()].filter(p => p.startsWith(prefix));
const application = n => ({
  name: 'Tutor ' + n, email: `tutor${n}@example.com`, whatsapp: '9123 4567', subjects: ['English'], levels: ['O-Level'],
  qualifications: 'BA English, NIE trained', experience: 'Eight years teaching secondary English in schools and privately.',
  formats: ['Online'], rates: 'S$80 an hour', agreeTerms: true, consent: true,
});

beforeEach(() => { resetBlob(); process.env.ADMIN_KEY = KEY; });
afterEach(() => { for (const k of ['ADMIN_KEY', 'RESEND_API_KEY', 'NOTIFY_EMAIL']) delete process.env[k]; });

test('an application is not lost or doubled when the duplicate marker cannot be saved', async () => {
  blob.failOn = (p, op) => op === 'put' && p.startsWith('dedupe/');
  const res = await call(applyHandler, { body: application(1) });
  assert.equal(res.statusCode, 200, 'the application was saved, so the applicant must not be told it failed');
  assert.equal(paths('applications/').length, 1);
});

test('an enquiry is kept when the owner notification fails', async () => {
  process.env.RESEND_API_KEY = 're_unit'; process.env.NOTIFY_EMAIL = 'owner@example.com'; // fetch throws in tests
  const res = await call(enquiryHandler, { body: enquiry(1) });
  assert.equal(res.statusCode, 200);
  assert.equal(paths('enquiries/').length, 1);
});

test('the same form sent twice is stored once; two different enquiries are both stored', async () => {
  const first = await call(enquiryHandler, { body: { ...enquiry(1), submissionId: 'sub-a' } });
  const again = await call(enquiryHandler, { body: { ...enquiry(1), submissionId: 'sub-a' } });
  assert.equal(again.body.duplicate, true);
  assert.equal(again.body.id, first.body.id);
  await call(enquiryHandler, { body: { ...enquiry(1), message: 'Also the Science pack please', submissionId: 'sub-b' } });
  assert.equal(paths('enquiries/').length, 2);
});

test('only the form\'s own fields are stored: a sender cannot set status, admin notes or the id', async () => {
  await call(enquiryHandler, { body: { ...enquiry(1), id: '../orders/x', status: 'closed', admin: { notes: 'paid in full' }, statusHistory: [{ to: 'closed' }], extra: 'x' } });
  const [path] = paths('enquiries/');
  const doc = JSON.parse(blob.store.get(path));
  assert.match(path, /^enquiries\/\d{14}-[0-9a-f]{8}\.json$/);
  assert.equal(doc.status, 'new');
  assert.deepEqual(doc.admin, { notes: '', handledBy: '' });
  assert.equal(doc.statusHistory, undefined);
  assert.equal(doc.extra, undefined);
});

test('form errors say what to fix', async () => {
  assert.equal((await call(enquiryHandler, { body: { email: 'a@b.sg', consent: true } })).body.error, 'Please add your name.');
  assert.equal((await call(enquiryHandler, { body: { name: 'A', consent: true } })).body.error, 'Please add a valid email or WhatsApp number so we can reply.');
  assert.equal((await call(enquiryHandler, { body: { name: 'A', email: 'a@b.sg' } })).body.error, 'Please agree to be contacted about your enquiry.');
  assert.equal(blob.store.size, 0);
});

test('no admin data or action is reachable without the key', async () => {
  blob.store.set('enquiries/20261118020000-aaaaaaaa.json', JSON.stringify({ id: '20261118020000-aaaaaaaa', contact: { name: 'Parent', whatsapp: '91234567' } }));
  const before = blob.store.size;
  for (const kind of ['enquiries', 'applications', 'placements', 'orders', 'products', 'overview', 'summary']) {
    const res = await call(adminHandler, { method: 'GET', query: { kind } });
    assert.equal(res.statusCode, 401, kind);
    assert.deepEqual(res.body, { error: 'Wrong admin key.' });
  }
  for (const method of ['PATCH', 'POST', 'DELETE']) {
    assert.equal((await call(adminHandler, { method, body: { kind: 'enquiries', id: '20261118020000-aaaaaaaa', confirm: true } })).statusCode, 401, method);
  }
  assert.equal(blob.store.size, before);
  assert.equal((await call(adminHandler, { method: 'GET', query: { kind: 'enquiries' }, headers: { 'x-admin-key': KEY } })).body.enquiries.length, 1);
});

async function upload(id, body = '%PDF-1.7 test', method = 'POST') {
  const req = Object.assign(Readable.from(method === 'POST' ? [Buffer.from(body)] : []), { method, query: { id }, headers: { 'x-admin-key': KEY, 'content-type': 'application/pdf' } });
  const res = fakeRes();
  await uploadHandler(req, res);
  return res;
}

test('an upload lands only on a product path the catalogue lists, and never touches another record', async () => {
  blob.store.set('orders/ord-1.json', '{"id":"ord-1"}');
  for (const id of ['../orders/ord-1', 'orders/ord-1', 'ord-1', 'bundle-psle', 'bundle-set-psle-maths-09', 'bundle-set-psle-maths-02/../../orders/ord-1', 'res-psle-maths.pdf', '']) {
    const res = await upload(id);
    assert.equal(res.statusCode, 404, id);
    assert.equal((await upload(id, '', 'DELETE')).statusCode, 404, 'delete ' + id);
  }
  assert.deepEqual([...blob.store.keys()], ['orders/ord-1.json']);
  assert.equal((await upload('bundle-set-psle-maths-02')).statusCode, 200);
  assert.equal((await upload('res-psle-maths')).statusCode, 200);
  assert.deepEqual(paths('products/').sort(), ['products/bundle-set-psle-maths-02.pdf', 'products/res-psle-maths.pdf']);
  assert.equal((await upload('res-psle-science', '<html>not a pdf</html>')).statusCode, 400);
  assert.equal(paths('products/').length, 2);
});

// The admin page's bulk upload, taken from admin.html as written and run with stand-ins for the page.
function loadUploadMany(stubs) {
  const html = readFileSync(new URL('../admin.html', import.meta.url), 'utf8');
  const src = html.match(/async function uploadMany\(files\) \{[\s\S]*?\n  \}\n/)[0];
  const names = Object.keys(stubs);
  return new Function(...names, src + '; return uploadMany;')(...names.map(n => stubs[n]));
}

test('bulk upload reports what went up, what did not and why, and what was skipped, as plain text', async () => {
  const status = {}; // only textContent is ever set: a file name can never run as markup
  Object.defineProperty(status, 'innerHTML', { set() { throw new Error('status must be set as text'); } });
  let toastMsg = '';
  const uploadMany = loadUploadMany({
    $: () => status, MAX_UPLOAD: 4400000, loadKind: async () => {}, render: () => {}, load: () => {}, toast: m => { toastMsg = m; },
    uploadCall: async (_method, id) => { if (id !== 'res-psle-maths') throw Object.assign(new Error('Unknown file.'), { status: 404 }); },
  });
  await uploadMany([
    { name: 'res-psle-maths.pdf', size: 1000 },
    { name: '<img src=x onerror=alert(1)>.pdf', size: 1000 },
    { name: 'res-psle-science.pdf', size: 5000000 },
    { name: 'notes.docx', size: 1000 },
  ]);
  assert.equal(status.textContent, toastMsg);
  assert.match(status.textContent, /^1 of 3 uploaded/);
  assert.match(status.textContent, /<img src=x onerror=alert\(1\)>\.pdf \(Unknown file\.\)/);
  assert.match(status.textContent, /res-psle-science\.pdf \(over 4\.4 MB\)/);
  assert.match(status.textContent, /1 skipped \(not a PDF\)/);
});
