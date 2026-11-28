import { timingSafeEqual, createHash } from 'node:crypto';
import { body, send, csrfOk, getSession, getJson, putJson, listJson, rateOk, safe, sha } from './_lib.js';
// Report a bug: the game logs real incidents (errors, soft-lock watchdog) per device. A report wins the Bug Hunter badge
// automatically only if that device logged a real incident in the last ~3 minutes whose signature nobody has been awarded for yet.
// Otherwise the player gets a thank-you. Admin list behind ADMIN_KEY. Served from api/x.js (?r=bug).
const WIN = 3 * 60 * 1000;
const clip = (v, n) => String(v || '').replace(/[\u0000-\u001f]/g, ' ').slice(0, n);
export const sigOf = (kind, msg) => sha(clip(kind, 20) + '|' + clip(msg, 200).replace(/\d+/g, '#').replace(/:\d+:\d+/g, '')).slice(0, 24);
function adminOk(req) {
  const k = process.env.ADMIN_KEY; if (!k || k.length < 24) return false;
  const a = createHash('sha256').update(String(req.headers['x-admin-key'] || '')).digest(), b = createHash('sha256').update(k).digest();
  return timingSafeEqual(a, b);
}
export default async function handler(req, res) {
  if (req.method === 'GET') {
    if (!adminOk(req)) return send(res, 401, { error: 'Wrong admin key.' });
    const list = (await listJson('bugs/rep/', 500)).sort((x, y) => (y.at || 0) - (x.at || 0)).slice(0, 200);
    return send(res, 200, { reports: list });
  }
  if (!csrfOk(req)) return send(res, 403, { error: 'Bad request' });
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  const b = await body(req), dev = safe(String(b.dev || '')).slice(0, 40);
  if (!dev) return send(res, 400, { error: 'Missing device' });
  const ip = await getJson(`bugs/inc/${dev}.json`) || { ev: [] };
  if (b.act === 'inc') {
    if (!rateOk(req, 'buginc', 20)) return send(res, 429, { error: 'Too many' });
    const kind = clip(b.kind, 20) || 'error', msg = clip(b.msg, 200);
    if (!msg) return send(res, 400, { error: 'Empty' });
    const now = Date.now(); ip.ev = ip.ev.filter(e => now - e.t < 30 * 60 * 1000).slice(-19);
    ip.ev.push({ t: now, kind, msg, sig: sigOf(kind, msg), scr: clip(b.scr, 30) });
    await putJson(`bugs/inc/${dev}.json`, ip);
    return send(res, 200, { ok: true });
  }
  if (b.act === 'report') {
    if (!rateOk(req, 'bugrep', 4)) return send(res, 429, { error: 'Too many reports. Wait a minute.' });
    const text = clip(b.text, 600).trim();
    if (text.length < 4) return send(res, 400, { error: 'Tell us a little about what happened.' });
    const now = Date.now(), recent = ip.ev.filter(e => now - e.t <= WIN && !e.used);
    let award = false, match = null;
    for (const e of recent.reverse()) {
      const sp = `bugs/sig/${safe(e.sig)}.json`;
      if (await getJson(sp)) continue; // someone already found this one
      await putJson(sp, { dev, at: now, msg: e.msg }); e.used = 1; award = true; match = e; break;
    }
    if (award) await putJson(`bugs/inc/${dev}.json`, ip);
    const s = getSession(req);
    if (award && s && s.t === 'k' && s.cid) { const bp = `badges/${safe(s.cid)}.json`, old = (await getJson(bp)) || {}; await putJson(bp, { ...old, bh: 1, at: now }); }
    await putJson(`bugs/rep/${now}-${safe(dev).slice(0, 12)}.json`, { at: now, dev, text, scr: clip(b.scr, 30), ua: clip(req.headers['user-agent'], 120), award, match: match && { kind: match.kind, msg: match.msg, t: match.t }, recent: recent.length });
    return send(res, 200, award ? { ok: true, reward: 'bughunter' } : { ok: true, thanks: true });
  }
  return send(res, 400, { error: 'Unknown action' });
}
