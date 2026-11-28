import { checkEggSpend } from './_prices.js';
import { body, send, csrfOk, getSession, getJson, putJson, progPath } from './_lib.js';
export default async function handler(req, res) {
  if (!csrfOk(req)) return send(res, 403, { error: 'Bad request' });
  const s = getSession(req); if (!s || s.t !== 'k') return send(res, 401, { error: 'Not a player session.' });
  if (req.method === 'GET') { const p = await getJson(progPath(s.cid)); return send(res, 200, p || { state: null, updated: 0 }); }
  if (req.method !== 'PUT' && req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  const b = await body(req);
  if (!b.state || typeof b.state !== 'object') return send(res, 400, { error: 'No state' });
  const updated = Math.min(Number(b.updated) || Date.now(), Date.now() + 60000);
  const cur = await getJson(progPath(s.cid));
  if (cur && cur.updated > updated) return send(res, 409, cur); // server copy is newer
  // Coin sanity cap: coins can only grow as fast as real play allows (about 25 a second, plus room for a boss, run bonus and daily gift).
  if (cur && cur.state && typeof b.state.coins === 'number') {
    const prev = Number(cur.state.coins) || 0, secs = Math.max(0, (updated - (Number(cur.updated) || 0)) / 1000);
    const max = prev + Math.round(secs * 25) + 1200;
    if (b.state.coins > max) b.state.coins = max;
    // Egg purchases must be paid for at the real price: a tampered client price is rejected
    const chk = checkEggSpend(cur.state, b.state, max);
    if (!chk.ok) return send(res, 400, { error: chk.error });
  }
  await putJson(progPath(s.cid), { state: b.state, updated });
  return send(res, 200, { ok: true, updated });
}
