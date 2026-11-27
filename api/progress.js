import { body, send, csrfOk, getSession, getJson, putJson, progPath } from './_lib.js';
export default async function handler(req, res) {
  if (!csrfOk(req)) return send(res, 403, { error: 'Bad request' });
  const s = getSession(req); if (!s || s.t !== 'k') return send(res, 401, { error: 'Not a player session.' });
  if (req.method === 'GET') { const p = await getJson(progPath(s.cid)); return send(res, 200, p || { state: null, updated: 0 }); }
  if (req.method !== 'PUT' && req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  const b = await body(req);
  if (!b.state || typeof b.state !== 'object') return send(res, 400, { error: 'No state' });
  const updated = Number(b.updated) || Date.now();
  const cur = await getJson(progPath(s.cid));
  if (cur && cur.updated > updated) return send(res, 409, cur); // server copy is newer
  await putJson(progPath(s.cid), { state: b.state, updated });
  return send(res, 200, { ok: true, updated });
}
