import { send } from './_lib.js';
// Public runtime config. The Google client ID is not a secret; it is null when Google sign-in is not set up.
export default function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  const g = String(process.env.GOOGLE_CLIENT_ID || '').trim();
  return send(res, 200, { googleClientId: /^[\w.-]+\.apps\.googleusercontent\.com$/.test(g) ? g : null });
}
