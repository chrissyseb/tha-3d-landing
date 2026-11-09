/* Red pen draws on the sample script when it scrolls into view. Without GSAP the page simply shows fully marked. */
(() => {
  const el = document.querySelector("#product .pd-marked"); if (!el || !("IntersectionObserver" in window)) return;
  const run = () => { const g = window.gsap; if (!g) return;
    const q = s => el.querySelectorAll(s), tl = g.timeline({defaults: {ease: "power2.inOut"}});
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) tl.timeScale(4);
    tl.fromTo(q(".pd-u"), {"--d": 1}, {"--d": 0, duration: .5, stagger: .22})
      .fromTo(q(".pd-n"), {opacity: 0}, {opacity: 1, duration: .5, stagger: .35}, .3)
      .fromTo(q(".pd-c"), {"--d": 1}, {"--d": 0, duration: .9}, "-=.2")
      .fromTo(q(".pd-s, .pd-g"), {opacity: 0}, {opacity: 1, duration: .4, stagger: .2}, "-=.5");
  };
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); run(); } }, {threshold: .35});
  io.observe(el);
})();
