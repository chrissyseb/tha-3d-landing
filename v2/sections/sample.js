/* EssayLab v2 sample report: the marker's pen draws once, when each part scrolls into view.
   The page already shows everything fully marked, so without GSAP or IntersectionObserver nothing changes.
   Each part has its own trigger, because on a phone they sit one above the other. */
(() => {
  const root = document.getElementById("sample-report");
  if (!root || !("IntersectionObserver" in window)) return;

  const start = () => {
    const g = window.gsap;
    if (!g) return;
    // With reduced motion the marks fade in where they are instead of being drawn across.
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const q = s => [...root.querySelectorAll(s)];
    const OFF = "rgba(196,18,47,0)", ON = "rgba(196,18,47,1)";

    const line = (tl, el, dur, at) => calm
      ? tl.fromTo(el, {"--sr-ink": OFF}, {"--sr-ink": ON, duration: .5, ease: "none"}, at)
      : tl.fromTo(el, {"--sr-ink": OFF}, {"--sr-ink": ON, duration: dur, ease: "none"}, at);
    const note = (tl, el, at) => calm
      ? tl.fromTo(el, {opacity: 0}, {opacity: 1, duration: .5, ease: "none"}, at)
      : tl.fromTo(el, {"--n": "100%"}, {"--n": "0%", duration: .6, ease: "power1.inOut"}, at);

    const paper = g.timeline({paused: true});
    q(".sr-script mark").forEach((m, i) => {
      line(paper, m, Math.min(.8, .25 + m.textContent.length / 150), i ? "+=.1" : 0);
      note(paper, q(".sr-note")[i], "-=.05");
    });

    const marks = g.timeline({paused: true});
    if (calm) marks.fromTo(q(".sr-ring svg"), {opacity: 0}, {opacity: 1, duration: .6, ease: "none"}, 0);
    else marks.fromTo(q(".sr-ring path"), {"--d": 1}, {"--d": 0, duration: .9, ease: "power2.inOut"}, 0);
    marks.fromTo(q(".sr-grade"), {opacity: 0}, {opacity: 1, duration: .4, ease: "none"}, .6);
    if (calm) marks.fromTo(q(".sr-bar i"), {opacity: 0}, {opacity: 1, duration: .5, stagger: .1, ease: "none"}, .2);
    else marks.fromTo(q(".sr-bar i"), {scaleX: 0}, {scaleX: 1, duration: .8, stagger: .1, ease: "expo.out"}, .2);

    const fixes = g.timeline({paused: true});
    line(fixes, q(".sr-was del"), .8, 0);

    const all = [paper, marks, fixes];

    // Side by side on a wide screen, each part waits for the one before it to finish.
    const ends = new Map();
    const left = t => Math.max(0, (ends.get(t) || 0) - g.ticker.time);
    const parts = [[".sr-paper", paper, () => 0],
                   [".sr-marks", marks, () => Math.max(0, left(paper) - .6)],
                   [".sr-fixes", fixes, () => Math.max(left(paper), left(marks))]]
      .map(([sel, tl, wait]) => ({el: root.querySelector(sel), tl, wait}));
    // One observer, so parts that come into view together always start in reading order.
    const io = new IntersectionObserver(es => {
      parts.filter(p => es.some(e => e.target === p.el && e.isIntersecting)).forEach(p => {
        io.unobserve(p.el);
        const w = p.wait();
        ends.set(p.tl, g.ticker.time + w + p.tl.duration());
        g.delayedCall(w, () => p.tl.play());
      });
    }, {threshold: .25, rootMargin: "0px 0px -10% 0px"});
    parts.forEach(p => io.observe(p.el));

    window.addEventListener("beforeprint", () => all.forEach(t => t.progress(1)));
  };

  if (window.gsap) start(); else window.addEventListener("load", start, {once: true});
})();
