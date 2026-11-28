// Founder voice clips: Miss Christine's own recordings of each word.
// GET  /api/x?r=voice            -> manifest {voice:{word:{url,mime,v}}} (public)
// GET  /voice/<slug>.<ext>       -> the clip (rewritten here with &f=), long-cached; ?v= busts it
// POST /api/x?r=voice            -> admin only (x-admin-key = ADMIN_KEY): {action:'check'} | {action:'save',word,mime,data(base64)} | {action:'delete',word}
import { timingSafeEqual, createHash } from 'node:crypto';
import { put, get } from '@vercel/blob';
import { body, send, rateOk, getJson, putJson } from './_lib.js';
import WORDS from './_words.js';

export const MAX = 200 * 1024;
export const MIME = { 'audio/wav': 'wav', 'audio/mp4': 'm4a', 'audio/webm': 'webm', 'audio/mpeg': 'mp3', 'audio/ogg': 'ogg' };
const IDX = 'voice/index.json';
const mem = globalThis.__voMem || (globalThis.__voMem = new Map());
const useMem = () => !process.env.BLOB_READ_WRITE_TOKEN;
export const norm = w => String(w || '').trim().toLowerCase();
export const slug = w => norm(w).replace(/[^a-z0-9-]/g, '_').slice(0, 60);
let SET = null;
async function wordOk(w) {
  if (!SET) SET = new Set(WORDS.map(x => norm(x[0])));
  if (SET.has(w)) return true;
  const a = await getJson('bank/auto.json'); // admin-approved extra words
  return !!(a && (a.words || []).some(x => norm(x.e && x.e[0]) === w));
}
function keyOk(req) {
  const k = process.env.ADMIN_KEY; if (!k || k.length < 24) return false;
  const got = String(req.headers['x-admin-key'] || '');
  return timingSafeEqual(createHash('sha256').update(got).digest(), createHash('sha256').update(k).digest());
}
async function putBin(path, buf, type) {
  if (useMem()) { mem.set(path, { buf, type }); return; }
  await put(path, buf, { access: 'private', contentType: type, addRandomSuffix: false, allowOverwrite: true });
}
async function getBin(path) {
  if (useMem()) return mem.get(path) || null;
  try { const r = await get(path, { access: 'private' }); if (!r || !r.stream) return null; return { buf: Buffer.from(await new Response(r.stream).arrayBuffer()), type: r.blob?.contentType || r.contentType }; }
  catch (e) { if (/not.?found/i.test(String(e.name) + String(e.message))) return null; throw e; }
}
export default async function handler(req, res) {
  const q = new URL(req.url, 'http://x').searchParams;
  if (req.method === 'GET') {
    const f = String(q.get('f') || '');
    if (!f) { const m = (await getJson(IDX)) || {}; res.setHeader('Cache-Control', 'no-store'); return send(res, 200, { voice: m }); }
    if (!/^[a-z0-9_-]{1,60}\.(wav|m4a|webm|mp3|ogg)$/.test(f)) return send(res, 404, { error: 'not found' });
    const b = await getBin('voice/' + f); if (!b) return send(res, 404, { error: 'not found' });
    res.statusCode = 200; res.setHeader('Content-Type', b.type || 'audio/wav'); res.setHeader('Content-Length', b.buf.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); return res.end(b.buf);
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  if (!rateOk(req, 'voice', 120)) return send(res, 429, { error: 'Too many tries. Wait a minute.' });
  if (!keyOk(req)) return send(res, 401, { error: 'Wrong admin key.' });
  const b = await body(req);
  if (b.action === 'check') return send(res, 200, { ok: true });
  const w = norm(b.word);
  if (!w || !(await wordOk(w))) return send(res, 400, { error: 'Not a game word.' });
  const m = (await getJson(IDX)) || {};
  if (b.action === 'delete') { delete m[w]; await putJson(IDX, m); return send(res, 200, { ok: true }); }
  if (b.action !== 'save') return send(res, 400, { error: 'Unknown action' });
  const mime = String(b.mime || '').split(';')[0].trim(), ext = MIME[mime];
  if (!ext) return send(res, 400, { error: 'Unsupported audio type.' });
  const data = String(b.data || '');
  if (data.length > Math.ceil(MAX / 3) * 4 + 8) return send(res, 413, { error: 'Clip too big (max 200 KB).' });
  const buf = Buffer.from(data, 'base64');
  if (!buf.length) return send(res, 400, { error: 'Empty clip.' });
  if (buf.length > MAX) return send(res, 413, { error: 'Clip too big (max 200 KB).' });
  const name = slug(w) + '.' + ext, v = ((m[w] && m[w].v) || 0) + 1;
  await putBin('voice/' + name, buf, mime);
  m[w] = { url: `/voice/${name}?v=${v}`, mime, v };
  await putJson(IDX, m);
  return send(res, 200, { ok: true, entry: m[w], count: Object.keys(m).length });
}
