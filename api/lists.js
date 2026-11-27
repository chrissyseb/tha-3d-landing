import { body, send, csrfOk, rateOk, getSession, getJson, putJson, famPath, safe, paidFor, cleanOk } from './_lib.js';
import { DICT, REDIR } from './_dict.js';
import WORDS from './_words.js';
import { pickMeaning, toks } from './_meaning.js';
// My Lists: custom word lists built automatically from bundled open data (see README-lists.md).
const D = globalThis.__voDict || (globalThis.__voDict = new Map(DICT.map(r => [r[0], r])));
const BANK = globalThis.__voBank || (globalThis.__voBank = new Set(WORDS.map(w => String(w[0]).toLowerCase())));
const MAXW = 100, MAXL = 20, PROMOTE_AT = 3;
const POSN = { n: 'noun', v: 'verb', a: 'adjective', r: 'adverb' };
const STOP = new Set('the a an and or but if then of to in on at by for with from as is are was were be been being it its this that these those he she they we you i me my our your his her their them us not no yes do does did have has had will would can could shall should may might must so than too very just also there here what which who whom whose when where why how all any some each every more most much many few other such own same into over under about after before again once up down out off only both either neither nor'.split(' '));
const listPath = c => `lists/${safe(String(c).toUpperCase())}.json`;
const AUTO = 'bank/auto.json', LOG = 'bank/log.json';
const code6 = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += A[Math.random() * A.length | 0]; return s; };

export function lemma(raw) {
  const w = String(raw || '').toLowerCase().trim().replace(/[^a-z'-]/g, '');
  if (!w) return '';
  if (REDIR[w]) return REDIR[w];
  if (D.has(w)) return w;
  const tries = [];
  if (w.endsWith('ies')) tries.push(w.slice(0, -3) + 'y');
  if (w.endsWith('es')) tries.push(w.slice(0, -2));
  if (w.endsWith('s')) tries.push(w.slice(0, -1));
  if (w.endsWith('ied')) tries.push(w.slice(0, -3) + 'y');
  if (w.endsWith('ed')) tries.push(w.slice(0, -2), w.slice(0, -1), w.slice(0, -3));
  if (w.endsWith('ing')) tries.push(w.slice(0, -3), w.slice(0, -3) + 'e', w.slice(0, -4));
  if (w.endsWith('er')) tries.push(w.slice(0, -2), w.slice(0, -3));
  if (w.endsWith('est')) tries.push(w.slice(0, -3), w.slice(0, -4));
  if (w.endsWith('ly')) tries.push(w.slice(0, -2));
  return tries.find(t => D.has(t)) || w;
}
const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const POOLS = globalThis.__voPools || (globalThis.__voPools = (() => { const m = new Map(); for (const r of DICT) if (r[8] === 2 && r[2]) { const k = r[1] + r[2]; if (!m.has(k)) m.set(k, []); m.get(k).push(r[0]); } return m; })());
// Build one game entry: [word, level, meaning, hint, sentence, distractors, answer, tags, syllables, tip] + {conf, need}
export function build(raw, meaning, ctx) {
  const typed = String(raw || '').trim().toLowerCase();
  const w = lemma(typed); const r = D.get(w);
  const pk = meaning ? null : pickMeaning(w, typed, ctx);
  if (pk && pk.src === 'bank') { const x = pk.row; return { e: [x[0], r ? r[1] : 'B1', x[2], '', x[3], (x[4] || []).slice(0, 3), x[5] || x[0], ['quest'], r ? r[6] : x[0], r ? r[7] : ''], conf: 2, need: false, check: false, src: 0 }; }
  const lvl = r ? r[1] : 'B1', pos = (pk && pk.pos) || (r ? r[2] : '');
  const m = String(meaning || '').trim().slice(0, 120) || (pk ? pk.m : '');
  const conf = meaning ? 2 : r ? r[8] : 0;
  const check = !meaning && !!m && !pk.sure;
  const pool = (POOLS.get(lvl + pos) || POOLS.get(lvl + 'n') || []).filter(x => x !== w);
  const dis = shuf(pool).slice(0, 3);
  // the dictionary example sentence only fits when we kept the dictionary's own sense
  const sentOk = r && r[4] && (!pk || m === r[3] || [...toks(m)].some(t => toks(r[3]).has(t)));
  const sent = sentOk ? r[4] : m ? `The word that means "${m}" is ___.` : 'Spell the word you hear: ___.';
  return { e: [w, lvl, m, pos ? POSN[pos] : '', sent, dis, w, ['quest'], r ? r[6] : w, r ? r[7] : ''], conf, need: !m, check, src: r && r[5] ? r[5] : 0 };
}
export function extract(text) {
  const seen = new Set(), out = [];
  for (const t of String(text || '').slice(0, 6000).toLowerCase().match(/[a-z][a-z'-]{2,}/g) || []) {
    const w = lemma(t); if (STOP.has(w) || seen.has(w) || !D.has(w) || !cleanOk(w)) continue;
    seen.add(w); const r = D.get(w); out.push({ w, lvl: r[1], tick: ['B1', 'B2', 'C1', 'C2'].includes(r[1]) || r[0].length >= 7 });
  }
  return out.slice(0, 150);
}
// Optional LLM polish (OFF unless LIST_LLM_POLISH=1 and ANTHROPIC_API_KEY are set in Vercel env). Rewrites meanings in child-friendly words.
async function polish(entries) {
  if (process.env.LIST_LLM_POLISH !== '1' || !process.env.ANTHROPIC_API_KEY) return entries;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.LIST_LLM_MODEL || 'claude-haiku-4-5', max_tokens: 2000, messages: [{ role: 'user', content: 'Rewrite each meaning in simple British English for a 10-year-old, max 12 words. Reply JSON array of strings, same order.\n' + JSON.stringify(entries.map(x => [x.e[0], x.e[2]])) }] }) });
    const j = await r.json(); const arr = JSON.parse(j.content[0].text.match(/\[[\s\S]*\]/)[0]);
    entries.forEach((x, i) => { if (typeof arr[i] === 'string' && arr[i] && cleanOk(arr[i])) x.e[2] = arr[i].slice(0, 120); });
  } catch (e) { }
  return entries;
}
async function log(ev) { const l = (await getJson(LOG)) || { ev: [] }; l.ev.push({ ...ev, at: Date.now() }); l.ev = l.ev.slice(-2000); await putJson(LOG, l); }
// Self-growing bank: high-confidence words not in the main bank become candidates; 3 different lists promotes them.
async function feed(code, entries) {
  const auto = (await getJson(AUTO)) || { words: [], removed: [] };
  let changed = false;
  for (const x of entries) {
    const w = x.e[0]; if (x.conf < 2 || x.need || x.check || BANK.has(w) || !cleanOk(w) || !cleanOk(x.e[2]) || auto.removed.includes(w) || auto.words.some(a => a.e[0] === w)) continue;
    const p = `candidates/${safe(w)}.json`, c = (await getJson(p)) || { w, lists: [], first: Date.now() };
    if (!c.lists.includes(code)) { c.lists.push(code); c.e = x.e; await putJson(p, c); await log({ t: 'candidate', w, list: code, n: c.lists.length }); }
    if (c.lists.length >= PROMOTE_AT) { const e = x.e.slice(); e[7] = ['auto']; auto.words.push({ e, at: Date.now(), lists: c.lists.slice(0, 10) }); changed = true; await log({ t: 'promoted', w, level: e[1], lists: c.lists.length }); }
  }
  if (changed) await putJson(AUTO, auto);
}
const pub = L => ({ code: L.code, name: L.name, theme: L.theme || '', shared: !!L.shared, words: L.words.map(x => x.e), need: L.words.filter(x => x.need).map(x => x.e[0]), check: L.words.filter(x => x.check).map(x => x.e[0]), updated: L.updated });
function clean(b) {
  const name = String(b.name || '').trim().slice(0, 40), theme = String(b.theme || '').trim().slice(0, 40);
  if (!name) return { err: 'Give your list a name.' };
  if (!cleanOk(name) || !cleanOk(theme)) return { err: 'Please choose friendly words for the name and theme.' };
  const items = Array.isArray(b.words) ? b.words : [];
  if (!items.length) return { err: 'Add at least one word.' };
  if (items.length > MAXW) return { err: `Up to ${MAXW} words per list.` };
  const seen = new Set(), words = [], ctx = b.ctx ? toks(String(b.ctx).slice(0, 6000)) : null;
  for (const it of items) {
    const w = String(typeof it === 'string' ? it : it.w || '').trim().toLowerCase();
    if (!/^[a-z][a-z' -]{0,30}$/.test(w)) return { err: `"${w.slice(0, 20)}" isn't a word we can use.` };
    const m = typeof it === 'object' ? String(it.m || '').trim() : '';
    if (!cleanOk(w) || !cleanOk(m)) return { err: `Please remove "${w}". Friendly words only.` };
    const x = build(w, m, ctx); if (seen.has(x.e[0])) continue; seen.add(x.e[0]); words.push(x);
  }
  return { name, theme, words, shared: b.shared === true };
}
export default async function handler(req, res) {
  if (!csrfOk(req)) return send(res, 403, { error: 'Bad request' });
  const q = new URL(req.url, 'http://x').searchParams, s = getSession(req);
  if (req.method === 'GET') {
    if (q.get('auto')) { const a = (await getJson(AUTO)) || { words: [] }; res.setHeader('Cache-Control', 'public, max-age=300'); return send(res, 200, { words: a.words.map(x => x.e) }); }
    if (q.get('code')) {
      if (!rateOk(req, 'listcode', 30)) return send(res, 429, { error: 'Too many tries. Wait a minute.' });
      const L = await getJson(listPath(q.get('code')));
      if (!L || L.deleted || (!L.shared && !(s && s.fid === L.owner))) return send(res, 404, { error: "We couldn't find a Quest with that code." });
      return send(res, 200, { list: pub(L) });
    }
    if (!s) return send(res, 200, { guest: true });
    const fam = await getJson(famPath(s.fid)); if (!fam) return send(res, 200, { guest: true });
    const out = []; for (const c of fam.lists || []) { const L = await getJson(listPath(c)); if (L) out.push(pub(L)); }
    return send(res, 200, { lists: out, limit: listLimit(fam), canEdit: s.t === 'p' || s.t === 'k' });
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  const b = await body(req);
  if (b.action === 'extract') { if (!rateOk(req, 'listx', 30)) return send(res, 429, { error: 'Slow down a little.' }); return send(res, 200, { words: extract(b.text) }); }
  if (b.action === 'build') { // guests: build a local list without saving
    if (!rateOk(req, 'listb', 20)) return send(res, 429, { error: 'Slow down a little.' });
    const c = clean(b); if (c.err) return send(res, 400, { error: c.err });
    await polish(c.words); return send(res, 200, { list: { code: '', name: c.name, theme: c.theme, shared: false, words: c.words.map(x => x.e), need: c.words.filter(x => x.need).map(x => x.e[0]), check: c.words.filter(x => x.check).map(x => x.e[0]) } });
  }
  if (!s) return send(res, 401, { error: 'Log in to save lists.' });
  if (!rateOk(req, 'listw', 30)) return send(res, 429, { error: 'Slow down a little.' });
  const fam = await getJson(famPath(s.fid)); if (!fam) return send(res, 401, { error: 'Please log in again.' });
  fam.lists = fam.lists || [];
  if (b.action === 'save') {
    const c = clean(b); if (c.err) return send(res, 400, { error: c.err });
    let L;
    if (b.code) { L = await getJson(listPath(b.code)); if (!L || L.owner !== fam.id) return send(res, 404, { error: 'List not found.' }); }
    else {
      const lim = listLimit(fam);
      if (fam.lists.length >= lim) return send(res, 402, { error: lim === 1 ? 'Free accounts get 1 custom list. A Family or PSLE Pass unlocks up to 20.' : `Up to ${MAXL} lists per account.`, upgrade: lim === 1 });
      let code; for (let i = 0; i < 8; i++) { code = code6(); if (!(await getJson(listPath(code)))) break; }
      L = { code, owner: fam.id, created: Date.now() }; fam.lists.push(code); await putJson(famPath(fam.id), fam);
    }
    await polish(c.words);
    Object.assign(L, { name: c.name, theme: c.theme, words: c.words, shared: c.shared, updated: Date.now() });
    await putJson(listPath(L.code), L); await feed(L.code, c.words);
    return send(res, 200, { list: pub(L) });
  }
  if (b.action === 'delete') {
    const L = await getJson(listPath(b.code)); if (!L || L.owner !== fam.id) return send(res, 404, { error: 'List not found.' });
    L.words = []; L.deleted = Date.now(); L.shared = false; await putJson(listPath(L.code), L);
    fam.lists = fam.lists.filter(c => c !== L.code); await putJson(famPath(fam.id), fam); return send(res, 200, { ok: true });
  }
  return send(res, 400, { error: 'Unknown action' });
}
function listLimit(fam) { const paid = fam.paid && fam.paid.until > Date.now(); return paid || (fam.children || []).some(c => paidFor(fam, c.id)) ? MAXL : 1; }
export { AUTO, LOG };
