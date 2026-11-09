/* Restrained scroll reveal. Everything is visible without this script.
   Under reduced motion the reveal still runs, without movement. */
(() => {
  const start = () => {
    const g = window.gsap, els = [...document.querySelectorAll("[data-reveal]")];
    if (!g || !els.length || !("IntersectionObserver" in window)) return;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const below = els.filter(e => e.getBoundingClientRect().top > innerHeight * 0.9);
    g.set(below, {opacity: 0, y: calm ? 0 : 16});
    const io = new IntersectionObserver(es => es.forEach(x => {
      if (!x.isIntersecting) return;
      io.unobserve(x.target);
      g.to(x.target, {opacity: 1, y: 0, duration: .8, ease: "expo.out", overwrite: "auto", clearProps: "transform"});
    }), {rootMargin: "0px 0px -8% 0px"});
    below.forEach(e => io.observe(e));
  };
  if (window.gsap) start(); else addEventListener("load", start, {once: true});
})();
