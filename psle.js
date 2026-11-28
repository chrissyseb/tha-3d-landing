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


  // ---------- Main runs (learn/world): same invisible approach, its own hidden state in S.mk ----------
  function minit(S) { const m = S.mk || (S.mk = {}); m.hist = m.hist || []; m.ease = m.ease || 0; return m }
  // Target ~75-80% first-try: ease up below 70%, back off above 80%.
  function mrecord(m, v) {
    m.hist.push(v); if (m.hist.length > 60) m.hist.splice(0, m.hist.length - 60);
    const a = acc(m); if (a == null) return;
    if (a < 0.7) m.ease = Math.min(1, m.ease + 0.025);
    else if (a > 0.85) m.ease = Math.max(0, m.ease - 0.025);
    else if (a > 0.8) m.ease = Math.max(0, m.ease - 0.01);
  }
  // Build the 50-word pick. o: {st(name)->word state, due:[rows], sh:[rows shared warm-up], rnd}
  function mainDeck(S, W, o) {
    const rnd = o.rnd || Math.random, st = o.st, N = o.n || 50, m = minit(S);
    const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]] } return a };
    const lv = S.lv == null ? 2 : S.lv, a = acc(m), cruise = a != null && a > 0.85 && m.ease < 0.1;
    const le = Math.max(0, lv - m.ease * 0.6), t = Math.floor(le), frac = le - t; // working rung drops while struggling; between rungs, blend
    const known = x => (st(x[0]).m || 0) >= 2, seen = x => !!st(x[0]).seen;
    const sh = o.sh || [], shS = new Set(sh.map(x => x[0])), nt = arr => arr.filter(x => !shS.has(x[0]));
    const fresh = W.filter(x => !seen(x));
    const inT = shuf(fresh.filter(x => rk(x) === t)), over0 = shuf(fresh.filter(x => rk(x) === t + 1));
    const low = shuf(W.filter(x => rk(x) < t && !known(x))).sort((p, q) => rk(q) - rk(p)), kn = shuf(W.filter(x => known(x) && rk(x) <= t));
    const pb = Math.max(0, Math.min(.6, (lv - 1.5) * .4)), over = [...over0.filter(isP).slice(0, Math.round(8 * pb)), ...over0.filter(x => !isP(x))];
    // shares of a 50-word run (after the shared warm-up and due reviews)
    const nKnown = Math.round(N * (0.06 + m.ease * 0.24)), nLow = Math.round(N * (0.04 + m.ease * 0.12 + (1 - frac) * 0.36));
    const nOver = Math.round(N * Math.min(0.5, 0.04 + frac * 0.42 + (cruise ? 0.06 : 0)));
    const due = (o.due || []).slice(0, 15);
    const body = shuf([...nt(kn).slice(0, nKnown), ...nt(low).slice(0, nLow), ...nt(over).slice(0, nOver), ...nt(inT).slice(0, N)]);
    let pick = [...new Set([...due, ...sh, ...body, ...nt(inT), ...nt(low), ...nt(over)])].slice(0, N);
    if (pick.length < N) pick = [...pick, ...shuf(W.filter(x => !pick.includes(x))).slice(0, N - pick.length)];
    // easy ramp: easier words first within each block of ten
    const out = []; for (let i = 0; i < pick.length; i += 10) out.push(...pick.slice(i, i + 10).sort((p, q) => rk(p) - rk(q) + (known(p) ? -1 : 0) - (known(q) ? -1 : 0) + (rnd() - .5) * 1.2));
    return out;
  }
  // After a main run: move the hidden level so runs sit around 75-80%.
  function mainEnd(S, accR) {
    if (S.lv == null) S.lv = 2;
    S.lvHot = 0;
    if (accR >= 90) S.lv = Math.min(5, S.lv + .5); else if (accR >= 85) S.lv = Math.min(5, S.lv + .25); else if (accR >= 81) S.lv = Math.min(5, S.lv + .1);
    else if (accR < 65) S.lv = Math.max(0, S.lv - .5); else if (accR < 72) S.lv = Math.max(0, S.lv - .2);
  }
  // Distractor safety: two options must never both be defensible.
  const NEG = /\b(not|no|little|less|without|un\w+|opposite)\b/i;
  const SYN = {}; ['wonderful|excellent|fantastic|brilliant|great|terrific|marvellous','protect|preserve|sustain|conserve','happy|glad|pleased|delighted|satisfied|cheerful|joyful','upset|anxious|worried|disturbing','commotion|pandemonium|chaos|uproar|bustle','crestfallen|dejected|down in the dumps|forlorn|sad|gloomy|miserable','bewildered|puzzled|confused|baffled','famished|ravenous|starving|hungry','consequently|because of|therefore|as a result|thus','furthermore|moreover|in addition|besides','ecstatic|over the moon|thrilled|elated|jubilant|overjoyed','aggravated|exacerbate|worsen','invent|create|devise','cope|handle|manage','break down|call it a day','attack|injure|injured|hurt|bully','devastated|tragic|heartbroken','easy prey|gullible','contribute|assist|help','launched|embarked|began|started|originated|set off|set up','evicted|displaced','surge|flurry|burst','squinted|peered|glanced|peeked','obey|obedient','responsible|responsibility','embarrassed|embarrassment|ashamed','proud|pleased','angry|cross|furious|annoyed','scared|afraid|frightened|terrified','tired|exhausted|weary|drained','big|huge|enormous|large|gigantic','small|tiny|little','quick|fast|rapid|swift'].forEach(g => { const a = g.split('|'); a.forEach(w => SYN[w] = (SYN[w] || []).concat(a.filter(v => v !== w))) });
  const stem = w => w.toLowerCase().replace(/(ing|ed|ly|ness|ful|less|er|est|s)$/, '').slice(0, 5);
  function near(x, y) {
    if (!x || !y || x[0] === y[0]) return true;
    const a = x[0].toLowerCase(), b = y[0].toLowerCase(), ma = toks(x[2]), mb = toks(y[2]);
    if ((ma.includes(b) && ma.length <= 1 && !NEG.test(x[2])) || (mb.includes(a) && mb.length <= 1 && !NEG.test(y[2]))) return true; // one word defines the other ("not X" is an opposite, fine)
    const A = new Set(ma), sh = mb.filter(t => A.has(t)).length;
    if (!/\s/.test(a + b) && stem(a) === stem(b) && a.length > 3 && sh * 2 >= Math.min(ma.length, mb.length) && !NEG.test(x[2] + ' ' + y[2])) return true; // same family, same meaning
    if (x[2].toLowerCase() === y[2].toLowerCase()) return true;
    if (SYN[a] && SYN[a].includes(b)) return true;
    return false;
  }
  // k distractor rows for meaning/reverse/under/lookalike; prefers the word's own look-alikes, then same level.
  function safeL(x, W, k, rnd) {
    rnd = rnd || Math.random; k = k || 3; const by = n => W.find(y => y[0].toLowerCase() === String(n).toLowerCase());
    const out = []; const ok = y => y && !near(x, y) && !out.some(z => near(z, y) || z[2] === y[2]);
    for (const n of (x[5] || [])) { const y = by(n); if (ok(y)) out.push(y); if (out.length >= k) return out }
    const pool = W.filter(y => y[1] === x[1]); for (let i = pool.length - 1; i > 0; i--) { const j = rnd() * (i + 1) | 0;[pool[i], pool[j]] = [pool[j], pool[i]] }
    for (const y of pool.concat(W)) { if (out.length >= k) break; if (ok(y)) out.push(y) }
    return out;
  }
  // Blank-fill distractor strings: drop any that would also fit (synonyms of the answer).
  function safeBlank(x, W) { const by = n => W.find(y => y[0].toLowerCase() === String(n).toLowerCase()), ans = String(x[6] || x[0]).toLowerCase(), mt = toks(x[2]);
    return (x[5] || []).filter(n => { const l = String(n).toLowerCase(); if (l === ans || mt.includes(l)) return false; const y = by(n); return !y || !near(x, y) }) }

  G.PK = { minit, mrecord, mainDeck, mainEnd, near, safeL, safeBlank, init, deck, record, acc, endRun, supports, isP, rk, wantsHint, hintOpen };
})(typeof window !== 'undefined' ? window : globalThis);
