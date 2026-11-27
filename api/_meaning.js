// Picks the meaning for a My Lists word (see README-lists.md, "Choosing the meaning").
// Order: the game's own words.json entry (word or lemma) > hand-checked override > ranked WordNet senses
// (context overlap when the words came from a pasted paragraph) > the dictionary row.
import { DICT } from './_dict.js';
import { SENSES } from './_senses.js';
import { OVERRIDES } from './_overrides.js';
import WORDS from './_words.js';
const D = globalThis.__voDict || (globalThis.__voDict = new Map(DICT.map(r => [r[0], r])));
const WB = globalThis.__voWB || (globalThis.__voWB = new Map(WORDS.map(w => [String(w[0]).toLowerCase(), w])));
const STOP = new Set('the a an and or but if of to in on at by for with from as is are was were be been it its this that these those he she they we you i me my our your his her their them not no do does did have has had will would can could should may might must so than too very just also there here what which who when where why how all any some each more most much many other such into over under about after before up down out off only one used especially usually'.split(' '));
export const toks = s => new Set(String(s || '').toLowerCase().match(/[a-z]{3,}/g)?.filter(t => !STOP.has(t)) || []);
const stem = t => t.replace(/(ing|ed|es|s|ly)$/, '');
function overlap(bag, ctx) { let n = 0; const cs = new Set([...ctx].map(stem)); for (const t of bag) if (ctx.has(t) || cs.has(stem(t))) n++; return n; }
// returns { m, pos, sure, src }
export function pickMeaning(w, typed, ctx) {
  for (const k of [typed, w]) { const x = k && WB.get(k); if (x) return { m: x[2], pos: '', sure: true, src: 'bank', row: x }; }
  const S = SENSES[w], r = D.get(w);
  if (OVERRIDES[w]) {
    const o = { m: OVERRIDES[w][1], pos: OVERRIDES[w][0], sure: true, src: 'override' };
    if (!(ctx && ctx.size && S)) return o;
    // a pasted paragraph can point to another sense (river bank): switch only on clear evidence
    const oo = overlap(toks(o.m), ctx); let best = null, bs = 0;
    for (const s of S.slice(1)) { const v = overlap(toks(s[1] + ' ' + s[2]), ctx); if (v > bs) { bs = v; best = s; } }
    return best && bs >= 2 && bs > oo + 1 && !toks(o.m).has([...toks(best[1])][0]) ? { m: best[1], pos: best[0], sure: false, src: 'context' } : o;
  }
  if (S) {
    const list = S.slice(1);
    if (ctx && ctx.size) {
      const sc = list.map((s, i) => overlap(toks(s[1] + ' ' + s[2]), ctx) - i * 0.25);
      let b = 0; for (let i = 1; i < sc.length; i++) if (sc[i] > sc[b]) b = i;
      const sorted = [...sc].sort((a, c) => c - a), margin = sorted[0] - (sorted[1] ?? -9);
      return { m: list[b][1], pos: list[b][0], sure: !!S[0] || margin >= 1, src: 'context' };
    }
    return { m: list[0][1], pos: list[0][0], sure: !!S[0], src: 'senses' };
  }
  if (r && r[3]) return { m: r[3], pos: r[2], sure: r[8] >= 2, src: 'dict' };
  return { m: '', pos: '', sure: false, src: 'none' };
}
