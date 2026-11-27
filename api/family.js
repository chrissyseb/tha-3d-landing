import WORDS from './_words.js';
import { body, send, csrfOk, getSession, getJson, putJson, hashSecret, id, famPath, progPath, nickOk, paidFor, supTier } from './_lib.js';
export { weekly };
const WM = new Map(WORDS.map(x => [x[0], x]));
const WEEK = 7 * 864e5;
// Weekly parent report. Mastered = right again on a later spaced review (m>=2) and spelt correctly once.
function weekly(w, now = Date.now()) {
  const since = now - WEEK, ent = Object.entries(w);
  const mast = v => (v.m || 0) >= 2 && !!v.sp;
  const met = ent.filter(([, v]) => v.seen && (v.f ? v.f >= since : false)).map(([k]) => k);
  const mastered = ent.filter(([, v]) => mast(v) && v.ms && v.ms >= since).map(([k]) => k);
  const tricky = ent.filter(([, v]) => (v.miss || 0) > 0).sort((a, b) => b[1].miss - a[1].miss).slice(0, 8).map(([k]) => k);
  const dueSoon = ent.filter(([, v]) => v.seen && !mast(v) && !(v.miss > 0) && (v.due || 0) <= now + 2 * 864e5).sort((a, b) => (a[1].due || 0) - (b[1].due || 0)).map(([k]) => k);
  const next = [...tricky.slice(0, 3), ...dueSoon].filter((x, i, a) => a.indexOf(x) === i).slice(0, 5);
  const pool = [...mastered, ...met, ...tricky].filter((x, i, a) => a.indexOf(x) === i && WM.has(x));
  const T = [
    x => `Can you describe something that happened today using the word "${x[0]}"?`,
    x => `"${x[0]}" means ${x[2]}. Where might you see or hear this word outside school?`,
    x => `What is the opposite of "${x[0]}"? Can you make one sentence with both words?`,
    x => `Tell me a 3-sentence story that uses "${x[0]}".`
  ];
  const prompts = pool.slice(0, 2).map((k, i) => T[(i * 2 + k.length) % T.length](WM.get(k)));
  while (prompts.length < 2) prompts.push(prompts.length ? 'Pick a new word you met in a book this week. What do you think it means?' : 'What was the most interesting word you saw or heard today? Where did you see it?');
  const gloss = k => (WM.get(k) || [k, 0, ''])[2];
  return { met: met.length, metAll: ent.filter(([, v]) => v.seen).length, mastered: mastered.length, masteredAll: ent.filter(([, v]) => mast(v)).length, tricky: tricky.map(k => ({ w: k, m: gloss(k) })), next: next.map(k => ({ w: k, m: gloss(k) })), prompts, from: since, to: now };
}

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
            kids.push({ id: c.id, nick: c.nick, paid: paidFor(fam, c.id), seen, mastered, accuracy: seen ? Math.round(clean / seen * 100) : null, toRevise: miss.slice(0, 15).map(x => x[0]), world: st.lad ? st.lad.t || 0 : 0, lastPlayed: p ? p.updated : null, report: weekly(w), days: Array.isArray(st.days) ? st.days.length : 0 });
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
