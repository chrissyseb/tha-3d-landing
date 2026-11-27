import { send, listJson, supTier } from './_lib.js';
// Public, read-only Supporters Wall: only families who opted in; nicknames + tier only.
const ALLOW = new Set(['https://miss-christine.vercel.app', 'https://vocabobby.vercel.app']);
export default async function handler(req, res) {
  const o = req.headers.origin; if (o && ALLOW.has(o)) { res.setHeader('Access-Control-Allow-Origin', o); res.setHeader('Vary', 'Origin'); }
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  let c = globalThis.__voSupCache;
  if (!c || Date.now() - c.t > 300000) {
    const fams = await listJson('families/', 2000), rows = [];
    for (const f of fams) { const t = supTier(f); if (t && f.supporter.wall) for (const k of f.children || []) rows.push({ nick: k.nick, tier: t, since: f.supporter.since || 0 }); }
    rows.sort((a, b) => (b.tier === '20') - (a.tier === '20') || (b.tier === '10') - (a.tier === '10') || a.since - b.since);
    c = globalThis.__voSupCache = { t: Date.now(), rows: rows.slice(0, 300).map(r => ({ nick: r.nick, tier: r.tier })) };
  }
  res.setHeader('Cache-Control', 'public, max-age=120');
  return send(res, 200, { supporters: c.rows });
}
