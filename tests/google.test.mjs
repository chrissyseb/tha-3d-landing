// node tests/google.test.mjs : Google sign-in API with mocked token verification (no network, in-memory store).
import assert from 'node:assert/strict';
process.env.GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';
process.env.SESSION_SECRET = 'test-secret';
delete process.env.BLOB_READ_WRITE_TOKEN;
const TOK = { 'good.tok.a': { sub: '1001', aud: process.env.GOOGLE_CLIENT_ID, iss: 'https://accounts.google.com', exp: String(Date.now() / 1000 + 600 | 0), email: 'kid@example.com', name: 'Real Name', picture: 'http://x' },
  'good.tok.b': { sub: '2002', aud: process.env.GOOGLE_CLIENT_ID, iss: 'accounts.google.com', exp: String(Date.now() / 1000 + 600 | 0) },
  'bad.aud.x': { sub: '3003', aud: 'other.apps.googleusercontent.com', iss: 'accounts.google.com', exp: String(Date.now() / 1000 + 600 | 0) },
  'bad.iss.x': { sub: '3004', aud: process.env.GOOGLE_CLIENT_ID, iss: 'evil.com', exp: String(Date.now() / 1000 + 600 | 0) },
  'old.exp.x': { sub: '3005', aud: process.env.GOOGLE_CLIENT_ID, iss: 'accounts.google.com', exp: String(Date.now() / 1000 - 5 | 0) } };
globalThis.fetch = async url => { const t = new URL(url).searchParams.get('id_token'); assert.ok(String(url).startsWith('https://oauth2.googleapis.com/tokeninfo?')); return TOK[t] ? { ok: true, json: async () => TOK[t] } : { ok: false, json: async () => ({}) }; };
const G = (await import('../api/_google.js')).default, A = (await import('../api/auth.js')).default, P = (await import('../api/progress.js')).default, F = (await import('../api/family.js')).default, C = (await import('../api/_config.js')).default;
const mem = globalThis.__voMem;
let ip = 0;
async function call(h, method, b, cookie) {
  const req = { method, headers: { 'x-vo': '1', host: 'x', cookie: cookie || '', 'x-forwarded-for': '10.0.0.' + (ip++ % 250) }, body: b || {} };
  let out = { code: 0, h: {}, j: null }; const res = { statusCode: 200, setHeader: (k, v) => out.h[k.toLowerCase()] = v, end: s => { out.code = res.statusCode; out.j = JSON.parse(s); } };
  await h(req, res); const sc = out.h['set-cookie']; out.cookie = sc ? sc.split(';')[0] : cookie; return out;
}
// config
let r = await call(C, 'GET'); assert.equal(r.j.googleClientId, process.env.GOOGLE_CLIENT_ID);
delete process.env.GOOGLE_CLIENT_ID; r = await call(C, 'GET'); assert.equal(r.j.googleClientId, null); process.env.GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';
// bad tokens
for (const t of ['bad.aud.x', 'bad.iss.x', 'old.exp.x', 'nope.nope.nope', '<script>']) { r = await call(G, 'POST', { action: 'signin', credential: t }); assert.equal(r.code, 401, t); }
// first sign-in asks for a nickname, rejects rude ones
r = await call(G, 'POST', { action: 'signin', credential: 'good.tok.a' }); assert.equal(r.j.needNick, true);
r = await call(G, 'POST', { action: 'signin', credential: 'good.tok.a', nick: 'Lexi9' }); assert.equal(r.code, 200);
r = await call(G, 'POST', { action: 'signin', credential: 'good.tok.b', nick: 'fuckface' }); assert.equal(r.code, 400);
r = await call(G, 'POST', { action: 'signin', credential: 'good.tok.b', nick: 'Star Fox' }); assert.equal(r.code, 400);
r = await call(G, 'POST', { action: 'signin', credential: 'good.tok.b', nick: 'StarFox7' }); assert.equal(r.j.isNew, true); const ck = r.cookie;
// nothing personal stored
const dump = JSON.stringify([...mem.entries()]);
for (const bad of ['kid@example.com', 'Real Name', '1001', '2002', 'http://x']) assert.ok(!dump.includes(bad), 'stored ' + bad);
assert.ok([...mem.keys()].some(k => /^google\/[0-9a-f]{40}\.json$/.test(k)));
// who am I
r = await call(A, 'GET', null, ck); assert.equal(r.j.user.nick, 'StarFox7'); assert.equal(r.j.user.google, true); assert.equal(r.j.user.solo, true); assert.equal(r.j.user.hasPin, false);
// merge: guest save with inflated coins is capped, creatures/wardrobe unioned, furthest progress kept
const guest = { coins: 9e9, days: ['a', 'b', 'c'], pts: 500, lad: { t: 3, pr: 1, placed: 1 }, av: { own: ['#2f80ed', '#ff0000'] }, cr: { eggs: Array.from({ length: 99 }, (_, i) => ({ r: 3, t: i })), own: { bobby: { xp: 5 }, drako: { xp: 9 } }, act: 'drako' }, w: { cat: { m: 3, seen: 1 } }, nick: 'Hacker' };
r = await call(G, 'POST', { action: 'merge', state: guest, deviceId: 'dev-aaaaaaaa' }, ck); assert.equal(r.code, 200);
assert.equal(r.j.state.coins, 1200 + 3 * 8000); assert.equal(r.j.state.nick, 'StarFox7'); assert.equal(r.j.state.lad.t, 3);
assert.ok(r.j.state.cr.own.drako); assert.ok(r.j.state.cr.eggs.length <= 30); assert.deepEqual(r.j.state.av.own, ['#2f80ed', '#ff0000']);
// merge is single use (per account and per device)
r = await call(G, 'POST', { action: 'merge', state: guest, deviceId: 'dev-bbbbbbbb' }, ck); assert.equal(r.code, 409);
// progress endpoint still applies the ledger cap after merge
r = await call(P, 'GET', null, ck); assert.equal(r.j.state.coins, 25200);
r = await call(P, 'PUT', { state: { ...r.j.state, coins: 9e9 }, updated: Date.now() }, ck); assert.equal(r.code, 200);
r = await call(P, 'GET', null, ck); assert.ok(r.j.state.coins < 30000, 'cap ' + r.j.state.coins);
// returning sign-in on a new device (no cookie) loads the same player; no merge window
r = await call(G, 'POST', { action: 'signin', credential: 'good.tok.b' }); assert.equal(r.j.ok, true); assert.ok(!r.j.isNew); const ck2 = r.cookie;
r = await call(P, 'GET', null, ck2); assert.ok(r.j.state.coins > 0);
r = await call(G, 'POST', { action: 'merge', state: guest, deviceId: 'dev-cccccccc' }, ck2); assert.equal(r.code, 409);
// backup PIN, then family code + nickname + PIN login works
r = await call(G, 'POST', { action: 'setPin', pin: '12a4' }, ck2); assert.equal(r.code, 400);
r = await call(G, 'POST', { action: 'setPin', pin: '4321' }, ck2); assert.equal(r.code, 200); const code = r.j.code;
r = await call(A, 'POST', { action: 'kid', code, nick: 'starfox7', pin: '4321' }); assert.equal(r.code, 200);
// existing nickname+PIN player links Google to their own account (no new family, no merge window)
r = await call(A, 'POST', { action: 'signup', email: 'p@example.com', password: 'longpassword', consent: true }); const pc = r.cookie;
await call(F, 'POST', { action: 'addChild', nick: 'Momo', pin: '1111' }, pc); const fc = (await call(F, 'GET', null, pc)).j.code;
r = await call(A, 'POST', { action: 'kid', code: fc, nick: 'Momo', pin: '1111' }); const kc = r.cookie;
TOK['good.tok.c'] = { ...TOK['good.tok.b'], sub: '4004' };
r = await call(G, 'POST', { action: 'signin', credential: 'good.tok.c' }, kc); assert.equal(r.j.linked, true); assert.equal(r.j.nick, 'Momo');
r = await call(G, 'POST', { action: 'merge', state: guest, deviceId: 'dev-dddddddd' }, kc); assert.equal(r.code, 409);
r = await call(G, 'POST', { action: 'signin', credential: 'good.tok.c' }); assert.equal(r.j.nick, 'Momo');
r = await call(G, 'POST', { action: 'setPin', pin: '9999' }, kc); assert.equal(r.code, 400); // parent-managed PINs stay with the parent
// CSRF header required
r = await new Promise(async ok => { const res = { statusCode: 200, setHeader() { }, end: s => ok({ code: res.statusCode }) }; await G({ method: 'POST', headers: { host: 'x' }, body: {} }, res); }); assert.equal(r.code, 403);
console.log('google sign-in tests: PASS');
