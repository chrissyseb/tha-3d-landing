import { body, send, csrfOk, rateOk, lockCheck, lockFail, lockClear, hashSecret, checkSecret, setSession, clearSession, getSession, getJson, putJson, id, famPath, userPath, codePath, paidFor } from './_lib.js';
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const newCode = () => { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = ''; for (const b of id(16)) s += A[b.charCodeAt(0) % A.length]; return s.slice(0, 6); };

export default async function handler(req, res) {
  if (!csrfOk(req)) return send(res, 403, { error: 'Bad request' });
  if (req.method === 'GET') { // who am I
    const s = getSession(req); if (!s) return send(res, 200, { user: null });
    const fam = await getJson(famPath(s.fid)); if (!fam) return send(res, 200, { user: null });
    if (s.t === 'k') { const c = fam.children.find(x => x.id === s.cid); if (!c) return send(res, 200, { user: null });
      return send(res, 200, { user: { type: 'kid', childId: c.id, nick: c.nick, paid: paidFor(fam, c.id), code: fam.code } }); }
    return send(res, 200, { user: { type: 'parent', email: fam.email, code: fam.code, paid: fam.paid || null, children: fam.children.map(c => ({ id: c.id, nick: c.nick, paid: paidFor(fam, c.id) })) } });
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  const b = await body(req), act = b.action;
  if (act === 'logout') { clearSession(res); return send(res, 200, { ok: true }); }
  if (!rateOk(req, 'auth', 15)) return send(res, 429, { error: 'Too many tries. Please wait a minute.' });

  if (act === 'signup') {
    const email = String(b.email || '').trim().toLowerCase(), pw = String(b.password || '');
    if (!EMAIL.test(email)) return send(res, 400, { error: 'Please enter a valid email.' });
    if (pw.length < 8 || pw.length > 128) return send(res, 400, { error: 'Password needs at least 8 characters.' });
    if (await getJson(userPath(email))) return send(res, 409, { error: 'That email already has an account. Log in instead.' });
    let code; for (let i = 0; i < 8; i++) { code = newCode(); if (!(await getJson(codePath(code)))) break; }
    const fid = id(14);
    await putJson(famPath(fid), { id: fid, email, code, children: [], created: Date.now(), consent: !!b.consent });
    await putJson(codePath(code), { fid });
    await putJson(userPath(email), { email, fid, pw: hashSecret(pw) });
    setSession(res, { t: 'p', fid }); return send(res, 200, { ok: true, code });
  }
  if (act === 'login') {
    const email = String(b.email || '').trim().toLowerCase(), key = 'p:' + email;
    if (!(await lockCheck(key))) return send(res, 429, { error: 'Too many wrong tries. Try again in 15 minutes.' });
    const u = await getJson(userPath(email));
    if (!u || !checkSecret(b.password || '', u.pw)) { await lockFail(key); return send(res, 401, { error: 'Email or password is not right.' }); }
    await lockClear(key); setSession(res, { t: 'p', fid: u.fid }); return send(res, 200, { ok: true });
  }
  if (act === 'kid') {
    const code = String(b.code || '').trim().toUpperCase(), nick = String(b.nick || '').trim(), key = 'k:' + code + ':' + nick.toLowerCase();
    if (!(await lockCheck(key))) return send(res, 429, { error: 'Too many wrong tries. Ask a parent, or wait 15 minutes.' });
    const c = await getJson(codePath(code)); const fam = c && await getJson(famPath(c.fid));
    const kid = fam && fam.children.find(x => x.nick.toLowerCase() === nick.toLowerCase());
    if (!kid || !checkSecret(String(b.pin || ''), kid.pin)) { await lockFail(key); return send(res, 401, { error: 'Family code, name or PIN is not right.' }); }
    await lockClear(key); setSession(res, { t: 'k', fid: fam.id, cid: kid.id }); return send(res, 200, { ok: true });
  }
  return send(res, 400, { error: 'Unknown action' });
}
