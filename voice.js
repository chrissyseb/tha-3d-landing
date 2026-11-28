// VocaBobby founder voice: plays Miss Christine's own recording of a single word when one exists,
// otherwise the caller falls back to en-GB speechSynthesis. Sentences always use TTS.
(function (G) {
  const V = { m: null, cache: {}, cur: null };
  const norm = t => String(t || '').trim().toLowerCase();
  // pure: which clip (if any) to use for this text
  V.pick = (m, t) => { const w = norm(t); if (!m || !w || w.length > 40 || /[.!?,]/.test(w) || w.split(/\s+/).length > 3) return null; return m[w] || null; };
  V.load = () => { if (V.p) return V.p; if (typeof fetch !== 'function') return (V.p = Promise.resolve(null));
    return (V.p = fetch('/api/x?r=voice').then(r => r.ok ? r.json() : null).then(j => (V.m = (j && j.voice) || {})).catch(() => (V.m = null))); };
  V.has = t => !!V.pick(V.m, t);
  // returns true if a founder clip will be played (caller must not also speak); fb() runs if playback fails
  V.play = (t, slow, fb) => {
    const e = V.pick(V.m, t); if (!e || typeof Audio === 'undefined') return false;
    try { G.speechSynthesis && G.speechSynthesis.cancel(); } catch (x) {}
    try { if (V.cur) V.cur.pause(); } catch (x) {}
    const go = src => { const a = new Audio(src); V.cur = a; a.volume = 1; a.preservesPitch = a.webkitPreservesPitch = a.mozPreservesPitch = true;
      a.playbackRate = slow ? 0.75 : 1; const p = a.play(); if (p && p.catch) p.catch(() => fb && fb()); };
    if (V.cache[e.url]) go(V.cache[e.url]);
    else fetch(e.url).then(r => { if (!r.ok) throw 0; return r.blob(); }) // fetch (not Range) so the service worker caches the whole clip
      .then(b => { V.cache[e.url] = URL.createObjectURL(b); go(V.cache[e.url]); }).catch(() => fb && fb());
    return true;
  };
  G.VBV = V;
  if (typeof window !== 'undefined' && !G.__VBV_NOLOAD) V.load();
})(typeof window !== 'undefined' ? window : globalThis);
