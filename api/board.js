import { body, send, csrfOk, getSession, getJson, putJson, listJson, boardPath, famPath } from './_lib.js';
const n = v => { v = Number(v); return Number.isFinite(v) && v >= 0 ? Math.min(Math.floor(v), 1e7) : 0; };
const COL = /^(#[0-9a-f]{6}|f:(gold|silver|galaxy|rainbow)|f:neon#[0-9a-f]{6})$/i;
const col = (v, d) => typeof v === 'string' && COL.test(v) ? v : d;
let cache = { t: 0, rows: [] };
export default async function handler(req, res) {
  if (!csrfOk(req)) return send(res, 403, { error: 'Bad request' });
  if (req.method === 'GET') {
    if (Date.now() - cache.t > 15000) { cache = { t: Date.now(), rows: await listJson('board/', 500) }; }
    return send(res, 200, { rows: cache.rows });
  }
  const s = getSession(req); if (!s || s.t !== 'k') return send(res, 401, { error: 'Log in to join the leaderboard.' });
  const fam = await getJson(famPath(s.fid)); const kid = fam && fam.children.find(c => c.id === s.cid); if (!kid) return send(res, 401, { error: 'Log in again.' });
  const b = await body(req), e = b.psle || b;
  const row = { id: kid.id, nick: kid.nick, world: Math.min(5, n(b.world)), pet: Number.isInteger(b.pet) ? Math.max(-1, Math.min(40, b.pet)) : -1,
    av: { shirt: col(b.av && b.av.shirt, '#2f80ed'), pants: col(b.av && b.av.pants, '#2b2b2b'), hat: String((b.av && b.av.hat) || 'none').replace(/[^\w-]/g, '').slice(0, 20) },
    xp: n(e.xp), weekXp: n(e.weekXp), wk: String(e.wk || '').replace(/[^\w-]/g, '').slice(0, 12), speedBest: n(e.speedBest), mastered: n(e.mastered), updated: Date.now() };
  row.psle = { xp: row.xp, weekXp: row.weekXp, wk: row.wk, speedBest: row.speedBest, mastered: row.mastered };
  await putJson(boardPath(kid.id), row); cache.t = 0;
  return send(res, 200, { ok: true });
}
