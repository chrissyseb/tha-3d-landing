import { createHash, randomBytes } from 'node:crypto';
import { body, send, csrfOk, getSession, getJson, putJson, rateOk, safe } from './_lib.js';
// Bug Hunter reward codes: one-time, cosmetic only (badge + goggles). No coins.
// Codes are stored hashed (bhcodes/<hash>.json). Pre-seeded single-use codes can also come from env BUGHUNTER_CODES (comma-separated).
export const norm = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
export const codeHash = c => createHash('sha256').update('vb-bh:' + norm(c)).digest('hex').slice(0, 40);
export const bhPath = h => `bhcodes/${safe(h)}.json`;
const ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
export function newCode(kind) { const b = randomBytes(8); let s = ''; for (let i = 0; i < 8; i++) s += ALPH[b[i] % ALPH.length]; return `${kind === 'legend' ? 'LEGEND' : 'BUG'}-${s.slice(0, 4)}-${s.slice(4)}`; }
const envList = v => new Set(String(v || '').split(',').map(norm).filter(c => c.length >= 6).map(codeHash));
const envHashes = () => envList(process.env.BUGHUNTER_CODES);
const legendHashes = () => envList(process.env.LEGEND_CODES); // Day One Legend: single-use LEGEND- codes, never obtainable in game
const ipOf = req => String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
const MAX_FAILS = 8, WINDOW = 60 * 60 * 1000; // 8 wrong tries an hour per IP and per device
async function failCount(key) { const r = await getJson(`rl/bh/${createHash('sha256').update(key).digest('hex').slice(0, 32)}.json`); return r && Date.now() - r.t < WINDOW ? r.n : 0; }
async function addFail(key) { const p = `rl/bh/${createHash('sha256').update(key).digest('hex').slice(0, 32)}.json`; const r = await getJson(p); const fresh = !r || Date.now() - r.t >= WINDOW; await putJson(p, { n: fresh ? 1 : r.n + 1, t: fresh ? Date.now() : r.t }); }
export default async function handler(req, res) {
  if (!csrfOk(req)) return send(res, 403, { error: 'Bad request' });
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  if (!rateOk(req, 'redeem', 6)) return send(res, 429, { error: 'Too many tries. Wait a minute.' });
  const b = await body(req), dev = safe(String(b.dev || '')).slice(0, 40), ip = ipOf(req);
  const keys = ['ip:' + ip, ...(dev ? ['dev:' + dev] : [])];
  for (const k of keys) if ((await failCount(k)) >= MAX_FAILS) return send(res, 429, { error: 'Too many wrong codes. Try again in an hour.' });
  const code = norm(b.code);
  const s = getSession(req), who = s && s.t === 'k' && s.cid ? 'kid:' + s.cid : dev ? 'dev:' + dev : 'ip:' + ip;
  const h = code.length >= 6 && code.length <= 24 ? codeHash(code) : null;
  let rec = h && await getJson(bhPath(h));
  if (!rec && h && legendHashes().has(h) && /^LEGEND/.test(code)) rec = { src: 'env', created: 0, reward: 'legend' };
  if (!rec && h && envHashes().has(h)) rec = { src: 'env', created: 0 };
  const reward = rec && rec.reward === 'legend' ? 'legend' : 'bughunter';
  if (!rec) { for (const k of keys) await addFail(k); return send(res, 404, { error: 'That code is not right. Check it and try again.' }); }
  if (rec.usedBy) return send(res, rec.usedBy === who ? 200 : 409, rec.usedBy === who ? { ok: true, reward, again: true } : { error: 'That code has already been used.' });
  rec.usedBy = who; rec.usedAt = Date.now(); await putJson(bhPath(h), rec);
  if (s && s.t === 'k' && s.cid) { const bp = `badges/${safe(s.cid)}.json`, old = (await getJson(bp)) || {}; await putJson(bp, { ...old, ...(reward === 'legend' ? { fd: 1 } : { bh: 1 }), at: Date.now() }); }
  return send(res, 200, { ok: true, reward });
}
