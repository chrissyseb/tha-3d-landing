import { createHmac, randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { put, get, list } from '@vercel/blob';

// ---------- storage (private Vercel Blob, one JSON doc per record) ----------
const mem = globalThis.__voMem || (globalThis.__voMem = new Map()); // local tests only
const useMem = () => !process.env.BLOB_READ_WRITE_TOKEN;
export const safe = s => String(s || '').replace(/[^\w-]/g, '');
export async function putJson(path, doc) {
  if (useMem()) { mem.set(path, JSON.stringify(doc)); return doc; }
  await put(path, JSON.stringify(doc), { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true });
  return doc;
}
export async function getJson(path) {
  if (useMem()) { const v = mem.get(path); return v ? JSON.parse(v) : null; }
  try {
    const r = await get(path, { access: 'private', useCache: false });
    if (!r || !r.stream) return null;
    return JSON.parse(await new Response(r.stream).text());
  } catch (e) { if (/not.?found/i.test(String(e.name) + String(e.message))) return null; throw e; }
}
export async function listJson(prefix, limit = 300) {
  if (useMem()) return [...mem.entries()].filter(([k]) => k.startsWith(prefix)).slice(0, limit).map(([, v]) => JSON.parse(v));
  const out = []; let cursor;
  do {
    const page = await list({ prefix, limit: 1000, cursor });
    for (const b of page.blobs) { if (out.length >= limit) break; const d = await getJson(b.pathname); if (d) out.push(d); }
    cursor = page.hasMore && out.length < limit ? page.cursor : undefined;
  } while (cursor);
  return out;
}

// ---------- passwords / PINs ----------
export function hashSecret(secret, salt = randomBytes(16).toString('hex')) {
  return { salt, hash: scryptSync(String(secret), salt, 64).toString('hex') };
}
export function checkSecret(secret, rec) {
  if (!rec || !rec.salt || !rec.hash) return false;
  const a = scryptSync(String(secret), rec.salt, 64), b = Buffer.from(rec.hash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}
export const id = (n = 12) => randomBytes(n).toString('base64url').replace(/[^\w]/g, '').slice(0, n);
export const sha = s => createHash('sha256').update(String(s)).digest('hex').slice(0, 32);

// ---------- sessions (signed httpOnly cookie) ----------
const SECRET = () => process.env.SESSION_SECRET || 'local-dev-secret';
const sign = s => createHmac('sha256', SECRET()).update(s).digest('base64url');
export function setSession(res, data, days = 60) {
  const body = Buffer.from(JSON.stringify({ ...data, exp: Date.now() + days * 864e5 })).toString('base64url');
  const secure = process.env.VERCEL ? '; Secure' : '';
  res.setHeader('Set-Cookie', `vo=${body}.${sign(body)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${days * 86400}${secure}`);
}
export function clearSession(res) { res.setHeader('Set-Cookie', 'vo=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0'); }
export function getSession(req) {
  const m = /(?:^|;\s*)vo=([\w-]+)\.([\w-]+)/.exec(req.headers.cookie || '');
  if (!m) return null;
  const good = Buffer.from(sign(m[1])), got = Buffer.from(m[2]);
  if (good.length !== got.length || !timingSafeEqual(good, got)) return null;
  try { const s = JSON.parse(Buffer.from(m[1], 'base64url').toString()); return s.exp > Date.now() ? s : null; } catch { return null; }
}

// ---------- request helpers ----------
export async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = ''; for await (const c of req) { raw += c; if (raw.length > 400000) throw new Error('too big'); }
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
export function send(res, code, obj) { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(obj)); }
// CSRF: state-changing calls must carry our custom header (cross-site forms/fetches can't add it without a CORS preflight we never allow) and, when present, a same-site Origin.
export function csrfOk(req) {
  if (req.method === 'GET') return true;
  if (req.headers['x-vo'] !== '1') return false;
  const o = req.headers.origin; if (!o) return true;
  try { return new URL(o).host === req.headers.host; } catch { return false; }
}
// Rate limit: best-effort per instance + persistent per-key lockout for logins.
const hits = globalThis.__voHits || (globalThis.__voHits = new Map());
export function rateOk(req, key, max = 20, windowMs = 60000) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const k = key + ':' + ip, now = Date.now(), h = hits.get(k) || { n: 0, t: now };
  if (now - h.t > windowMs) { h.n = 0; h.t = now; }
  h.n++; hits.set(k, h); return h.n <= max;
}
export async function lockCheck(key) { const l = await getJson(`locks/${sha(key)}.json`); return !(l && l.until > Date.now()); }
export async function lockFail(key) {
  const p = `locks/${sha(key)}.json`, l = (await getJson(p)) || { n: 0 };
  l.n++; if (l.n >= 8) { l.until = Date.now() + 15 * 60000; l.n = 0; } await putJson(p, l);
}
export async function lockClear(key) { await putJson(`locks/${sha(key)}.json`, { n: 0 }); }

// ---------- domain ----------
export const famPath = f => `families/${safe(f)}.json`;
export const userPath = email => `users/${sha(String(email).trim().toLowerCase())}.json`;
export const codePath = c => `codes/${safe(String(c).toUpperCase())}.json`;
export const progPath = c => `progress/${safe(c)}.json`;
export const boardPath = c => `board/${safe(c)}.json`;
export function paidFor(fam, childId) {
  const p = fam && fam.paid; if (!p || !(p.until > Date.now())) return false;
  return p.plan === 'family' || (p.children || []).includes(childId);
}
export function supTier(fam) { const s = fam && fam.supporter; return s && ['any', '10', '20'].includes(s.tier) ? s.tier : ''; }
export const NICK = /^[A-Za-z0-9]{2,14}$/;
const BAD = ['fuck','shit','bitch','cunt','dick','pussy','slut','whore','nigg','fag','rape','sex','porn','bastard','asshole','arse','wank','cock','knn','ccb','cb','lanjiao','lj','nabeh','pukimak','chibai','kanina','lancau','sohai','motherf','tits','boob','penis','vagina','kill','die','hitler','nazi'];
export const nickOk = n => NICK.test(n) && !BAD.some(b => n.toLowerCase().includes(b));
