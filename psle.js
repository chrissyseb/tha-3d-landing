// VocaBobby PSLE Kingdom adaptive engine (pure logic, no DOM; also loaded by tests/psle-sim.js).
// Never shows levels or difficulty to the player. Everything here is invisible tuning.
(function (G) {
  const LV = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const rk = x => Math.max(0, LV.indexOf(x[1]));
  const isP = x => (x[7] || []).includes('psle');
  const STOP = new Set('a an the of to in on or and for with be is are as at by from that this not very something someone somebody way make do have get feel feeling very much more one who which what it its into out up about'.split(' '));
  const toks = s => String(s || '').toLowerCase().split(/[^a-z]+/).filter(t => t.length > 2 && !STOP.has(t));

  // --- player state (lives in S.pk) ---
  function init(S) {
    const pk = S.pk || (S.pk = {});
    if (pk.lv == null) pk.lv = Math.max(1, Math.min(4, (S.lv == null ? 2 : S.lv) + 0.25)); // start at the main-game estimate (PSLE list starts at A2)
    pk.hist = pk.hist || [];   // rolling answers: 1 right, 0.5 assisted, 0 wrong
    pk.ease = pk.ease || 0;    // 0..1 hidden easing
    pk.due = pk.due || {};     // missed PSLE words: {word: runNumber when due}
    pk.box = pk.box || {};     // spaced box per missed word
    pk.runs = pk.runs || 0;
    return pk;
  }
  function acc(pk) { const h = pk.hist.slice(-40); return h.length < 8 ? null : h.reduce((a, b) => a + b, 0) / h.length; }

  // Win-rate guard: below ~65% ease off; back off easing once 75-85% is reached.
  function record(pk, v) {
    pk.hist.push(v); if (pk.hist.length > 60) pk.hist.splice(0, pk.hist.length - 60);
    const a = acc(pk); if (a == null) return;
    if (a < 0.65) pk.ease = Math.min(1, pk.ease + 0.08);
    else if (a > 0.85) pk.ease = Math.max(0, pk.ease - 0.06);
    else if (a > 0.75) pk.ease = Math.max(0, pk.ease - 0.02);
  }

  // Supporting words: easier relatives / synonyms / prerequisites from the main bank.
  const supCache = new Map();
  function supports(p, W) {
    if (supCache.has(p[0])) return supCache.get(p[0]);
    const pr = rk(p), mt = new Set(toks(p[2] + ' ' + p[3])), dist = new Set((p[5] || []).map(s => s.toLowerCase())), stem = p[0].toLowerCase().slice(0, 4);
    const out = W.filter(y => !isP(y) && y[0] !== p[0] && rk(y) < Math.max(pr, 2) + (pr <= 1 ? 1 : 0)).map(y => {
      let s = 0; const yt = toks(y[2] + ' ' + y[3]);
      for (const t of yt) if (mt.has(t)) s += 2;
      if (mt.has(y[0].toLowerCase())) s += 4;                      // the PSLE word's meaning uses this word
      if (toks(y[2]).includes(p[0].toLowerCase())) s += 3;
      if (dist.has(y[0].toLowerCase())) s += 3;                     // a contrast the exam will test
      if (y[0].toLowerCase().slice(0, 4) === stem) s += 3;         // same family
      s -= Math.abs(pr - 1 - rk(y)) * 0.5;                          // ideally one step easier
      return [s, y];
    }).filter(z => z[0] > 0.5).sort((a, b) => b[0] - a[0]).slice(0, 4).map(z => z[1]);
    supCache.set(p[0], out); return out;
  }

  // Build one 30-word PSLE Kingdom deck.
  function deck(S, W, CW, opt) {
    opt = opt || {}; const rnd = opt.rnd || Math.random, N = opt.n || 30;
    const pk = init(S), shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]] } return a };
    const supShare = Math.min(0.5, 0.32 + pk.ease * 0.18);           // 32% normally, up to 50% when easing
    const nSup = Math.round(N * supShare), nP = N - nSup;
    const t = Math.round(pk.lv - pk.ease * 0.6);                     // working rung inside the PSLE list
    const wst = w => (S.w && S.w[w[0]]) || {};
    const fresh = a => a.filter(x => !(wst(x).m >= 4));
    // 10%: missed PSLE words whose spaced slot has come up
    const dueW = shuf(CW.filter(x => pk.due[x[0]] != null && pk.due[x[0]] <= pk.runs)).slice(0, Math.max(2, Math.round(nP * 0.2)));
    const at = shuf(fresh(CW.filter(x => rk(x) <= t && !dueW.includes(x)))).sort((a, b) => rk(b) - rk(a) + (rnd() - .5) * 1.6);
    const up = shuf(fresh(CW.filter(x => rk(x) === t + 1 && !dueW.includes(x))));
    const nUp = Math.round(nP * (pk.ease > 0.5 ? 0.1 : 0.2));
    let ps = [...dueW, ...up.slice(0, nUp)];
    for (const x of at) { if (ps.length >= nP) break; if (!ps.includes(x)) ps.push(x) }
    if (ps.length < nP) for (const x of shuf(CW).sort((a, b) => rk(a) - rk(b))) { if (ps.length >= nP) break; if (!ps.includes(x)) ps.push(x) }
    // supporting words, tied to the PSLE words they lead into
    const sup = [], seen = new Set(ps.map(x => x[0]));
    for (const p of shuf(ps)) { if (sup.length >= nSup) break; for (const y of supports(p, W)) if (!seen.has(y[0])) { seen.add(y[0]); sup.push({ x: y, for: p[0] }); break } }
    for (const y of shuf(W.filter(y => !isP(y) && rk(y) === Math.max(1, t - 1)))) { if (sup.length >= nSup) break; if (!seen.has(y[0])) { seen.add(y[0]); sup.push({ x: y, for: null }) } }
    // order: easy ramp. Each supporting word sits just before its PSLE word; the run warms up then climbs.
    const order = ps.slice().sort((a, b) => rk(a) - rk(b) + (rnd() - .5) * 1.2), out = [];
    const supFor = new Map(); sup.forEach(s => s.for && !supFor.has(s.for) && supFor.set(s.for, s));
    const loose = sup.filter(s => !s.for || supFor.get(s.for) !== s);
    loose.slice(0, 2).forEach(s => out.push(s.x));                    // warm-up
    for (const p of order) { const s = supFor.get(p[0]); if (s) out.push(s.x); out.push(p); if (loose.length > 2 && out.length % 6 === 5) { const l = loose.splice(2, 1)[0]; if (l) out.push(l.x) } }
    loose.slice(2).forEach(s => out.push(s.x));
    return out.slice(0, N);
  }

  // After a PSLE run: nudge the working rung, schedule missed words with spaced repetition.
  function endRun(S, sess) {
    const pk = init(S); pk.runs++;
    const a = (sess.pkOk || 0) / Math.max(1, sess.pkN || 0);
    if (sess.pkN >= 6) { if (a >= 0.88) pk.lv = Math.min(5.5, pk.lv + 0.75); else if (a >= 0.8) pk.lv = Math.min(5.5, pk.lv + 0.4); else if (a >= 0.72) pk.lv = Math.min(5.5, pk.lv + 0.15); else if (a < 0.6) pk.lv = Math.max(1, pk.lv - 0.5) }
    for (const w of (sess.pkMiss || [])) { const b = Math.min(4, (pk.box[w] || 0)); pk.box[w] = b; pk.due[w] = pk.runs + [1, 2, 4, 7, 12][b] }
    for (const w of (sess.pkHit || [])) if (pk.due[w] != null && !(sess.pkMiss || []).includes(w)) { pk.box[w] = (pk.box[w] || 0) + 1; if (pk.box[w] >= 3) { delete pk.due[w]; delete pk.box[w] } else pk.due[w] = pk.runs + [1, 2, 4, 7][pk.box[w]] }
  }
  // Should this step show a hint button? More hints while easing.
  function wantsHint(S) { const pk = init(S); return true && pk.ease >= 0 }
  function hintOpen(S) { return init(S).ease > 0.5 } // when easing hard, open the hint card automatically

  G.PK = { init, deck, record, acc, endRun, supports, isP, rk, wantsHint, hintOpen };
})(typeof window !== 'undefined' ? window : globalThis);
