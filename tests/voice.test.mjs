// node tests/voice.test.mjs : founder voice route (admin key, size, word checks; in-memory blob) and speak() fallback logic.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
process.env.SESSION_SECRET = 'test-secret'; delete process.env.BLOB_READ_WRITE_TOKEN;
const X = (await import('../api/x.js')).default;
let ip = 0;
async function call(method, url, b, hdr = {}) {
  const req = { method, url, headers: { 'x-vo': '1', host: 'x', 'x-forwarded-for': '10.9.0.' + (++ip), ...hdr }, body: b };
  const out = { h: {} }; const res = { statusCode: 200, setHeader(k, v) { out.h[k.toLowerCase()] = v; }, end: s => { out.code = res.statusCode; out.raw = s; try { out.j = JSON.parse(s); } catch { } } };
  await X(req, res); return out;
}
const U = '/api/x?r=voice', K = 'k'.repeat(30), clip = n => Buffer.alloc(n, 7).toString('base64');
// no ADMIN_KEY set -> locked
delete process.env.ADMIN_KEY;
let r = await call('POST', U, { action: 'check' }, { 'x-admin-key': '' }); assert.equal(r.code, 401);
process.env.ADMIN_KEY = K;
r = await call('POST', U, { action: 'check' }, { 'x-admin-key': 'wrong' }); assert.equal(r.code, 401);
r = await call('POST', U, { action: 'save', word: 'happy', mime: 'audio/wav', data: clip(100) }, { 'x-admin-key': 'wrong' }); assert.equal(r.code, 401, 'save needs key');
r = await call('POST', U, { action: 'check' }, { 'x-admin-key': K }); assert.equal(r.code, 200);
// validation
r = await call('POST', U, { action: 'save', word: 'notarealwordzz', mime: 'audio/wav', data: clip(100) }, { 'x-admin-key': K }); assert.equal(r.code, 400);
r = await call('POST', U, { action: 'save', word: 'happy', mime: 'text/html', data: clip(100) }, { 'x-admin-key': K }); assert.equal(r.code, 400);
r = await call('POST', U, { action: 'save', word: 'happy', mime: 'audio/wav', data: clip(200 * 1024 + 1) }, { 'x-admin-key': K }); assert.equal(r.code, 413);
r = await call('POST', U, { action: 'save', word: 'happy', mime: 'audio/wav', data: '' }, { 'x-admin-key': K }); assert.equal(r.code, 400);
// exactly 200 KB is fine; manifest + versioning
r = await call('POST', U, { action: 'save', word: ' Happy ', mime: 'audio/wav', data: clip(200 * 1024) }, { 'x-admin-key': K }); assert.equal(r.code, 200); assert.deepEqual(r.j.entry, { url: '/voice/happy.wav?v=1', mime: 'audio/wav', v: 1 });
r = await call('POST', U, { action: 'save', word: 'happy', mime: 'audio/mp4', data: clip(50) }, { 'x-admin-key': K }); assert.equal(r.j.entry.v, 2); assert.equal(r.j.entry.url, '/voice/happy.m4a?v=2');
r = await call('GET', U); assert.equal(r.code, 200); assert.equal(r.j.voice.happy.v, 2);
r = await call('GET', U + '&f=happy.m4a'); assert.equal(r.code, 200); assert.equal(r.h['content-type'], 'audio/mp4'); assert.equal(r.raw.length, 50); assert.match(r.h['cache-control'], /immutable/);
r = await call('GET', U + '&f=../index.json'); assert.equal(r.code, 404);
r = await call('GET', U + '&f=nope.wav'); assert.equal(r.code, 404);
r = await call('POST', U, { action: 'delete', word: 'happy' }, { 'x-admin-key': K }); assert.equal(r.code, 200);
r = await call('GET', U); assert.equal(r.j.voice.happy, undefined);

// ---- speak() fallback logic (voice.js in a sandbox) ----
const plays = [], tts = [];
class FakeAudio { constructor(src) { this.src = src; } play() { plays.push({ src: this.src, rate: this.playbackRate, vol: this.volume, pitch: this.preservesPitch }); return Promise.resolve(); } pause() { } }
const ctx = { __VBV_NOLOAD: 1, Audio: FakeAudio, URL: { createObjectURL: () => 'blob:clip' }, speechSynthesis: { cancel() { } }, Promise,
  fetch: async u => ({ ok: true, blob: async () => ({}) }) };
ctx.globalThis = ctx; vm.createContext(ctx); vm.runInContext(fs.readFileSync(new URL('../voice.js', import.meta.url), 'utf8'), ctx);
const V = ctx.VBV;
assert.equal(V.play('happy', false, () => tts.push('happy')), false, 'manifest not loaded -> TTS');
V.m = { happy: { url: '/voice/happy.wav?v=1', mime: 'audio/wav', v: 1 } };
assert.equal(V.pick(V.m, 'Mei was so happy.'), null, 'sentences keep TTS');
assert.equal(V.pick(V.m, 'sad'), null, 'no clip -> TTS');
assert.ok(V.pick(V.m, ' Happy '));
assert.equal(V.play('happy', true, () => tts.push('x')), true);
await new Promise(r => setTimeout(r, 10));
assert.deepEqual(plays.at(-1), { src: 'blob:clip', rate: 0.75, vol: 1, pitch: true });
V.play('happy', false); assert.equal(plays.at(-1).rate, 1, 'cached clip plays immediately');
// failing fetch -> fallback to TTS
V.m.sad = { url: '/voice/sad.wav?v=1' }; ctx.fetch = async () => ({ ok: false });
assert.equal(V.play('sad', false, () => tts.push('sad')), true); await new Promise(r => setTimeout(r, 10)); assert.deepEqual(tts, ['sad']);
// index.html hook: mute respected, clip first, TTS fallback otherwise
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /function speak\(t,slow,_f\)\{if\(S\.voice===false\|\|!t\)return;if\(!_f&&window\.VBV&&VBV\.play\(t,slow,\(\)=>speak\(t,slow,1\)\)\)return;/);
assert.match(fs.readFileSync(new URL('../team.html', import.meta.url), 'utf8'), /say\(t,r,_f\)\{if\(!_f&&window\.VBV&&VBV\.play/);
console.log('voice tests passed');
