import { body, send, csrfOk, getSession, getJson, putJson, hashSecret, id, famPath, progPath, nickOk, paidFor, supTier } from './_lib.js';
export default async function handler(req, res) {
  if (!csrfOk(req)) return send(res, 403, { error: 'Bad request' });
  const s = getSession(req); if (!s || s.t !== 'p') return send(res, 401, { error: 'Please log in as a parent.' });
  const fam = await getJson(famPath(s.fid)); if (!fam) return send(res, 401, { error: 'Please log in again.' });
  if (req.method === 'GET') { // children + progress reports
    const kids = [];
    for (const c of fam.children) {
      const p = await getJson(progPath(c.id)); const st = (p && p.state) || {};
      const w = (st.wE && st.wE.psle) || st.w || {};
      let seen = 0, mastered = 0, clean = 0, miss = []; for (const [k, v] of Object.entries(w)) { if (v.seen) seen++; if ((v.m || 0) >= 5) mastered++; if (v.seen && (v.m || 0) > 0 && !(v.miss > 0)) clean++; if ((v.miss || 0) > 0) miss.push([k, v.miss]); }
      miss.sort((a, b) => b[1] - a[1]);
            kids.push({ id: c.id, nick: c.nick, paid: paidFor(fam, c.id), seen, mastered, accuracy: seen ? Math.round(clean / seen * 100) : null, toRevise: miss.slice(0, 15).map(x => x[0]), world: st.lad ? st.lad.t || 0 : 0, lastPlayed: p ? p.updated : null, days: Array.isArray(st.days) ? st.days.length : 0 });
    }
    return send(res, 200, { code: fam.code, email: fam.email, paid: fam.paid || null, children: kids, stripe: !!process.env.STRIPE_SECRET_KEY, sup: supTier(fam), wall: !!(fam.supporter && fam.supporter.wall) });
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  const b = await body(req);
  if (b.action === 'addChild') {
    const nick = String(b.nick || '').trim(), pin = String(b.pin || '');
    if (!nickOk(nick)) return send(res, 400, { error: 'Player name: 2 to 14 letters or numbers, friendly words only.' });
    if (!/^\d{4}$/.test(pin)) return send(res, 400, { error: 'PIN must be 4 digits.' });
    if (fam.children.length >= 6) return send(res, 400, { error: 'Up to 6 players per family.' });
    if (fam.children.some(c => c.nick.toLowerCase() === nick.toLowerCase())) return send(res, 409, { error: 'You already have a player with that name.' });
    fam.children.push({ id: id(12), nick, pin: hashSecret(pin) }); await putJson(famPath(fam.id), fam);
    return send(res, 200, { ok: true });
  }
  if (b.action === 'setPin') {
    const c = fam.children.find(x => x.id === b.childId); if (!c || !/^\d{4}$/.test(String(b.pin || ''))) return send(res, 400, { error: 'PIN must be 4 digits.' });
    c.pin = hashSecret(String(b.pin)); await putJson(famPath(fam.id), fam); return send(res, 200, { ok: true });
  }
  if (b.action === 'wall') { fam.supporter = { ...(fam.supporter || {}), wall: b.on === true }; await putJson(famPath(fam.id), fam); globalThis.__voSupCache = null; return send(res, 200, { ok: true, wall: fam.supporter.wall }); }
  if (b.action === 'playAs') { // parent hands the device to a child
    const c = fam.children.find(x => x.id === b.childId); if (!c) return send(res, 404, { error: 'Player not found.' });
    const { setSession } = await import('./_lib.js'); setSession(res, { t: 'k', fid: fam.id, cid: c.id }); return send(res, 200, { ok: true });
  }
  return send(res, 400, { error: 'Unknown action' });
}
