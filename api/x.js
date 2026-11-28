// One function serving several small routes, to stay within the Vercel Hobby limit of 12 functions.
// /api/config, /api/google and /api/redeem are rewritten here with ?r=<route> (see vercel.json).
import config from './_config.js';
import google from './_google.js';
import redeem from './_redeem.js';
const R = { config, google, redeem };
export default function handler(req, res) {
  const u = new URL(req.url, 'http://x');
  const r = u.searchParams.get('r');
  const h = R[r];
  if (!h) { res.statusCode = 404; res.setHeader('content-type', 'application/json'); return res.end('{"error":"not found"}'); }
  return h(req, res);
}
