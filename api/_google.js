import { createHmac } from 'node:crypto';
import { body, send, csrfOk, rateOk, getSession, setSession, getJson, putJson, hashSecret, id, sha, famPath, codePath, progPath, nickOk } from './_lib.js';
import { mergeStates } from './_merge.js';
// "Continue with Google" for players. We keep only a keyed hash of Google's anonymous account number (sub):
// no email, name or photo is ever stored.
const ISS = new Set(['accounts.google.com', 'https://accounts.google.com']);
const MERGE_WINDOW = 15 * 60000;
const newCode = () => { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = ''; for (const b of id(16)) s += A[b.charCodeAt(0) % A.length]; return s.slice(0, 6); };
const salt = () => process.env.GOOGLE_SUB_SALT || process.env.SESSION_SECRET || 'local-dev-secret';
export const gPath = sub => `google/${createHmac('sha256', salt()).update('google-sub:' + sub).digest('hex').slice(0, 40)}.json`;

export async function verify(token) {
  const aud = String(process.env.GOOGLE_CLIENT_ID || '').trim();
  if (!aud || typeof token !== 'string' || token.length > 4096 || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) return null;
  let t; try { const r = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token)); if (!r.ok) return null; t = await r.json(); } catch { return null; }
  if (!t || t.aud !== aud || !ISS.has(t.iss) || !(Number(t.exp) * 1000 > Date.now()) || !/^\d{1,40}$/.test(String(t.sub || ''))) return null;
  return String(t.sub); // everything else in the token (email, name, picture) is dropped here
}

export default async function handler(req, res) {
  if (!csrfOk(req)) return send(res, 403, { error: 'Bad request' });
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  const b = await body(req), s = getSession(req);

  if (b.action === 'signin') {
    if (!rateOk(req, 'google', 20)) return send(res, 429, { error: 'Too many tries. Please wait a minute.' });
    const sub = await verify(b.credential); if (!sub) return send(res, 401, { error: 'Google sign-in did not work. Please try again.' });
    const gp = gPath(sub), map = await getJson(gp);
    if (map) { // returning player, any device
      const fam = await getJson(famPath(map.fid)); const kid = fam && fam.children.find(c => c.id === map.cid);
      if (kid) { setSession(res, { t: 'k', fid: fam.id, cid: kid.id }); return send(res, 200, { ok: true, nick: kid.nick }); }
    }
    if (s && s.t === 'k') { // a nickname+PIN player linking Google to the same account (their save is already on it)
      const fam = await getJson(famPath(s.fid)); const kid = fam && fam.children.find(c => c.id === s.cid);
      if (kid) { kid.g = 1; await putJson(famPath(fam.id), fam); await putJson(gp, { fid: fam.id, cid: kid.id, t: Date.now() }); return send(res, 200, { ok: true, linked: true, nick: kid.nick }); }
    }
    const nick = String(b.nick || '').trim();
    if (!nick) return send(res, 200, { needNick: true });
    if (!nickOk(nick)) return send(res, 400, { error: 'Player name: 2 to 14 letters or numbers, friendly words only.' });
    let code; for (let i = 0; i < 8; i++) { code = newCode(); if (!(await getJson(codePath(code)))) break; }
    const fid = id(14), cid = id(12);
    await putJson(famPath(fid), { id: fid, email: null, google: true, code, children: [{ id: cid, nick, pin: null, g: 1, mergeOpen: Date.now() + MERGE_WINDOW }], created: Date.now() });
    await putJson(codePath(code), { fid });
    await putJson(gp, { fid, cid, t: Date.now() });
    setSession(res, { t: 'k', fid, cid }); return send(res, 200, { ok: true, isNew: true, nick });
  }

  if (!s || s.t !== 'k') return send(res, 401, { error: 'Please sign in first.' });
  const fam = await getJson(famPath(s.fid)); const kid = fam && fam.children.find(c => c.id === s.cid);
  if (!kid) return send(res, 401, { error: 'Please sign in again.' });

  if (b.action === 'merge') { // first Google sign-in only: bring this device's guest save into the account
    const dev = String(b.deviceId || '');
    if (!/^[\w-]{8,64}$/.test(dev)) return send(res, 400, { error: 'Bad device.' });
    if (!(kid.mergeOpen > Date.now())) return send(res, 409, { error: 'Already merged.' });
    const mp = `merges/${sha('dev:' + dev)}.json`;
    if (await getJson(mp)) return send(res, 409, { error: 'This device has already been merged.' });
    if (!b.state || typeof b.state !== 'object' || Array.isArray(b.state)) return send(res, 400, { error: 'No state' });
    delete kid.mergeOpen; await putJson(famPath(fam.id), fam); // single use, closed before writing progress
    await putJson(mp, { cid: kid.id, t: Date.now() });
    const cur = await getJson(progPath(kid.id));
    const state = mergeStates(cur && cur.state, b.state); state.nick = kid.nick;
    const updated = Date.now();
    await putJson(progPath(kid.id), { state, updated });
    return send(res, 200, { ok: true, state, updated });
  }
  if (b.action === 'setPin') { // backup login for Google players: family code + nickname + PIN
    if (!fam.google) return send(res, 400, { error: 'Ask a parent to change your PIN.' });
    const pin = String(b.pin || ''); if (!/^\d{4}$/.test(pin)) return send(res, 400, { error: 'PIN must be 4 digits.' });
    kid.pin = hashSecret(pin); await putJson(famPath(fam.id), fam); return send(res, 200, { ok: true, code: fam.code });
  }
  return send(res, 400, { error: 'Unknown action' });
}
