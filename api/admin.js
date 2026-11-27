import { timingSafeEqual, createHash } from 'node:crypto';
import { body, send, rateOk, getJson, putJson, famPath, codePath, safe } from './_lib.js';
// Admin unlock for PayNow payments. Protected by ADMIN_KEY (Vercel env only).
function keyOk(req) {
  const k = process.env.ADMIN_KEY; if (!k || k.length < 24) return false;
  const got = String(req.headers['x-admin-key'] || '');
  const a = createHash('sha256').update(got).digest(), b = createHash('sha256').update(k).digest();
  return timingSafeEqual(a, b);
}
const view = fam => ({ code: fam.code, email: fam.email, created: fam.created || null, paid: fam.paid || null,
  children: (fam.children || []).map(c => ({ id: c.id, nick: c.nick })), payments: (fam.payments || []).slice(-10), supporter: fam.supporter || null });
export default async function handler(req, res) {
  if (!rateOk(req, 'admin', 30)) return send(res, 429, { error: 'Too many tries. Wait a minute.' });
  if (!keyOk(req)) return send(res, 401, { error: 'Wrong admin key.' });
  if (req.method === 'GET') {
    const code = safe(String(req.query?.code || new URL(req.url, 'http://x').searchParams.get('code') || '')).toUpperCase();
    const c = code && await getJson(codePath(code)); const fam = c && await getJson(famPath(c.fid));
    if (!fam) return send(res, 404, { error: 'No family with that code.' });
    return send(res, 200, { family: view(fam) });
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  const b = await body(req), code = safe(String(b.code || '')).toUpperCase();
  const c = code && await getJson(codePath(code)); const fam = c && await getJson(famPath(c.fid));
  if (!fam) return send(res, 404, { error: 'No family with that code.' });
  if (b.action === 'revoke') { fam.paid = null; (fam.payments = fam.payments || []).push({ id: 'admin-revoke', at: Date.now() }); await putJson(famPath(fam.id), fam); return send(res, 200, { family: view(fam) }); }
  if (b.action === 'supporter') {
    const tier = ['any', '10', '20'].includes(b.tier) ? b.tier : '';
    const since = Date.parse(String(b.date || '')) || Date.now();
    fam.supporter = tier ? { ...(fam.supporter || {}), tier, since } : { ...(fam.supporter || {}), tier: '' };
    (fam.payments = fam.payments || []).push({ id: 'support-admin', tier: tier || 'none', note: String(b.note || '').slice(0, 120), at: Date.now() });
    await putJson(famPath(fam.id), fam); globalThis.__voSupCache = null; return send(res, 200, { family: view(fam) });
  }
  if (b.action !== 'unlock') return send(res, 400, { error: 'Unknown action' });
  const until = Date.parse(String(b.until || '')); if (!(until > Date.now())) return send(res, 400, { error: 'Pick an end date in the future.' });
  const plan = b.plan === 'family' ? 'family' : 'child';
  const ids = (Array.isArray(b.childIds) ? b.childIds : []).filter(id => fam.children.some(k => k.id === id));
  if (plan === 'child' && !ids.length) return send(res, 400, { error: 'Tick at least one player.' });
  const prev = fam.paid && fam.paid.until > Date.now() ? fam.paid : { children: [] };
  fam.paid = plan === 'family' ? { plan: 'family', until: until + 864e5 - 1, children: prev.children || [] }
    : { plan: prev.plan === 'family' ? 'family' : 'child', until: Math.max(until + 864e5 - 1, prev.plan === 'family' ? prev.until : 0), children: [...new Set([...(prev.children || []), ...ids])] };
  (fam.payments = fam.payments || []).push({ id: 'paynow-admin', plan, amount: plan === 'family' ? 5990 : 2990 * ids.length, note: String(b.note || '').slice(0, 120), at: Date.now() });
  await putJson(famPath(fam.id), fam);
  return send(res, 200, { family: view(fam) });
}
