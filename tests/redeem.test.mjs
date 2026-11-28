// node tests/redeem.test.mjs : Bug Hunter codes are single-use, rate-limited, admin-only to generate (in-memory store).
import assert from 'node:assert/strict';
process.env.SESSION_SECRET = 'test-secret'; delete process.env.BLOB_READ_WRITE_TOKEN;
process.env.BUGHUNTER_CODES = 'BUG-TEST-0001, BUG-TEST-0002';
const R = (await import('../api/_redeem.js')).default, A = (await import('../api/admin.js')).default;
async function call(h, b, ip = '10.0.0.1', hdr = {}) {
  const req = { method: 'POST', headers: { 'x-vo': '1', host: 'x', 'x-forwarded-for': ip, ...hdr }, body: b };
  const out = {}; const res = { statusCode: 200, setHeader() {}, end: s => { out.code = res.statusCode; out.j = JSON.parse(s); } };
  await h(req, res); return out;
}
// env code: works once, then refused for another player; same player gets an idempotent ok
let r = await call(R, { code: 'bug-test-0001', dev: 'devA' }, '10.0.1.1'); assert.equal(r.code, 200); assert.equal(r.j.reward, 'bughunter'); assert.equal(r.j.coins, undefined);
r = await call(R, { code: 'BUG-TEST-0001', dev: 'devB' }, '10.0.1.2'); assert.equal(r.code, 409);
r = await call(R, { code: 'BUG-TEST-0001', dev: 'devA' }, '10.0.1.3'); assert.equal(r.code, 200); assert.equal(r.j.again, true);
// admin generation disabled without ADMIN_KEY
delete process.env.ADMIN_KEY; r = await call(A, { action: 'bhGen', n: 5 }, '10.0.2.1', { 'x-admin-key': '' }); assert.equal(r.code, 401);
process.env.ADMIN_KEY = 'k'.repeat(30);
r = await call(A, { action: 'bhGen', n: 5 }, '10.0.2.2', { 'x-admin-key': 'wrong' }); assert.equal(r.code, 401);
r = await call(A, { action: 'bhGen', n: 5 }, '10.0.2.3', { 'x-admin-key': 'k'.repeat(30) }); assert.equal(r.code, 200); assert.equal(r.j.codes.length, 5);
for (const c of r.j.codes) assert.match(c, /^BUG-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
// stored hashed: plaintext never appears in storage
const dump = JSON.stringify([...globalThis.__voMem.entries()]); for (const c of r.j.codes) assert.ok(!dump.includes(c) && !dump.includes(c.replace(/-/g, '')));
const gen = r.j.codes;
r = await call(R, { code: gen[0], dev: 'devC' }, '10.0.3.1'); assert.equal(r.code, 200);
r = await call(R, { code: gen[0], dev: 'devD' }, '10.0.3.2'); assert.equal(r.code, 409);
// rate limit: guessing from one device is cut off after 8 wrong codes an hour, even across IPs
for (let i = 0; i < 8; i++) { r = await call(R, { code: 'BUG-AAAA-' + i + 'AAA', dev: 'guesser' }, '10.0.4.' + i); assert.equal(r.code, 404); }
r = await call(R, { code: gen[1], dev: 'guesser' }, '10.0.4.99'); assert.equal(r.code, 429, 'device locked out');
// ...and from one IP across devices
for (let i = 0; i < 8; i++) await call(R, { code: 'BUG-BBBB-' + i + 'BBB', dev: 'g' + i }, '10.0.5.5');
r = await call(R, { code: gen[1], dev: 'fresh' }, '10.0.5.5'); assert.equal(r.code, 429, 'ip locked out');
// burst limit per minute
let burst = 0; for (let i = 0; i < 10; i++) { r = await call(R, { code: 'x', dev: 'b' + i }, '10.0.6.6'); if (r.code === 429) burst++; } assert.ok(burst > 0);
// valid code still works for an honest player
r = await call(R, { code: gen[1], dev: 'honest' }, '10.0.7.7'); assert.equal(r.code, 200);
console.log('redeem tests passed');
