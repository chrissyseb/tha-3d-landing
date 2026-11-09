/* © 2026 Christine Sebastian. All rights reserved. EssayLabsg™ website and marking engine. Unauthorised copying, reproduction or reuse is prohibited. */
/* Designer-made animated icons (useAnimations, MIT licence, loaded from jsDelivr) for "What you'll get".
   lottie-web loads only when the section comes near the screen. With reduced motion the icons show their final frame. */
(() => {
  const icons = [...document.querySelectorAll(".get4 [data-lottie]")], sec = document.querySelector(".get4");
  if(!icons.length || !sec || !("IntersectionObserver" in window)) return;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Icon data comes from the published react-useanimations package, recoloured to the brand's light indigo.
  const BASE = "https://cdn.jsdelivr.net/npm/react-useanimations@3.1.1/lib/";
  const data = n => fetch(BASE + n + ".js").then(r => r.text()).then(code => {
    const ex = {}; new Function("exports", code)(ex);
    return JSON.parse(JSON.stringify(ex.default.animationData).replace(/"c":\{"a":0,"k":\[[^\]]*\]/g, '"c":{"a":0,"k":[0.647,0.706,0.988,1]'));
  });
  const start = () => icons.forEach((el, i) => data(el.dataset.lottie).then(animationData => {
    const a = lottie.loadAnimation({container: el, renderer: "svg", loop: false, autoplay: false, animationData});
    a.addEventListener("DOMLoaded", () => { if(still) a.goToAndStop(a.totalFrames - 1, true); else setTimeout(() => a.play(), 300 + i * 220); });
    if(!still) el.closest("li").addEventListener("mouseenter", () => a.goToAndPlay(0, true));
  }).catch(() => {}));
  const io = new IntersectionObserver(es => {
    if(!es.some(e => e.isIntersecting)) return; io.disconnect();
    if(window.lottie) return start();
    const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie_light.min.js";
    s.onload = start; document.head.append(s);
  }, {rootMargin: "0px 0px -8% 0px"});
  io.observe(sec);
})();
