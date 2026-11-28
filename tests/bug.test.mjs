// node tests/bug.test.mjs : Report a bug awards Bug Hunter only for a fresh real incident from the same device (in-memory store).
import assert from 'node:assert/strict';
process.env.SESSION_SECRET = 'test-secret'; delete process.env.BLOB_READ_WRITE_TOKEN;
const B = (await import('../api/_bug.js')).default;
let ipn = 0;
async function call(b, method = 'POST', hdr = {}) {
  const req = { method, headers: { 'x-vo': '1', host: 'x', 'x-forwarded-for': '10.9.0.' + (ipn++), ...hdr }, body: b, url: '/api/x?r=bug' };
  const out = {}; const res = { statusCode: 200, setHeader() {}, end: s => { out.code = res.statusCode; out.j = JSON.parse(s); } };
  await B(req, res); return out;
}
let r = await call({ act: 'report', dev: 'd1', text: 'it froze' }); assert.equal(r.code, 200); assert.equal(r.j.thanks, true, 'no incident -> thanks');
r = await call({ act: 'inc', dev: 'd1', kind: 'error', msg: 'TypeError: x is undefined @index.html' }); assert.equal(r.code, 200);
r = await call({ act: 'report', dev: 'd2', text: 'other device' }); assert.equal(r.j.thanks, true, 'other device cannot claim');
r = await call({ act: 'report', dev: 'd1', text: 'boss froze' }); assert.equal(r.j.reward, 'bughunter');
r = await call({ act: 'report', dev: 'd1', text: 'again' }); assert.equal(r.j.thanks, true, 'incident used once');
r = await call({ act: 'inc', dev: 'd3', kind: 'error', msg: 'TypeError: x is undefined @index.html' });
r = await call({ act: 'report', dev: 'd3', text: 'same bug' }); assert.equal(r.j.thanks, true, 'same signature already found');
delete process.env.ADMIN_KEY; r = await call(null, 'GET'); assert.equal(r.code, 401);
process.env.ADMIN_KEY = 'k'.repeat(30); r = await call(null, 'GET', { 'x-admin-key': 'k'.repeat(30) }); assert.equal(r.code, 200); assert.equal(r.j.reports.length, 4);
console.log('bug tests passed');
