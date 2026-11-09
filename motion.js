/* © 2026 Christine Sebastian. All rights reserved. EssayLabsg™ website and marking engine. Unauthorised copying, reproduction or reuse is prohibited. */
/* Brand motion: smooth scrolling (Lenis), hero entrance and the pen-marking demo, scroll reveals (GSAP).
   Visual only. Without this script, or with reduced motion, everything is shown in its final state. */
(() => {
  // Sample marking card: PSLE, O-Level and A-Level GP tabs. Works with or without animation.
  const MK = {
    psle: {lbl: "PSLE Continuous Writing", pre: "When the lights went out in the stairwell, ", hl: "I felt very scared", post: " and ran down the steps.", note: "Feelings told, not shown",
      fix: "show it instead: “My palms were clammy and every footstep made me flinch.”", num: 24, max: 36, grade: "Mid band"},
    ol: {lbl: "O-Level English Continuous Writing", pre: "At night the hawker centre comes alive. ", hl: "There were many stalls selling many things.", post: "", note: "A list of sights, no single mood",
      fix: "pick one stall and give it a sound, a smell and a person: the hiss of the wok, the uncle shouting orders.", num: 19, max: 30, grade: "Mid band"},
    gp: {lbl: "A-Level GP Paper 1", pre: "Social media does help students learn, but ", hl: "this benefit is small", post: " compared to the harms.", note: "Counter-argument not weighed",
      fix: "weigh the other side with a yardstick instead of dismissing it in one line.", num: 28, max: 50, grade: "Est. C"},
  };
  const demo = document.querySelector(".mk-demo"), tabs = document.querySelector(".mk-tabs");
  const full = 2 * Math.PI * 26;
  function fill(k){
    const d = MK[k]; if(!demo || !d) return;
    const q = c => demo.querySelector(c), len = full * d.num / d.max;
    q(".mk-lbl").textContent = "Sample · " + d.lbl; q(".mk-pre").textContent = d.pre; q(".mk-hlt").textContent = d.hl; q(".mk-post").textContent = d.post;
    q(".mk-note").textContent = d.note; q(".mk-fixt").textContent = d.fix; q(".mk-num").textContent = d.num; q(".mk-max").textContent = "/ " + d.max; q(".mk-grade").textContent = d.grade;
    const arc = q(".mk-arc"); arc.dataset.len = len.toFixed(1); arc.setAttribute("stroke-dasharray", len.toFixed(1) + " " + full.toFixed(1));
    demo.setAttribute("aria-label", `Sample marked sentence from a ${d.lbl} essay: ${d.num} out of ${d.max}, ${d.grade}, with an examiner's note and an improvement to try.`);
    if(tabs) tabs.querySelectorAll("[data-mk]").forEach(b => b.setAttribute("aria-selected", b.dataset.mk === k ? "true" : "false"));
  }
  let onPick = null, auto = null;
  if(tabs) tabs.addEventListener("click", e => { const b = e.target.closest("[data-mk]"); if(!b) return; clearInterval(auto); fill(b.dataset.mk); if(onPick) onPick(); });

  const g = window.gsap;
  if(!g || matchMedia("(prefers-reduced-motion: reduce)").matches){ document.documentElement.classList.remove("mo"); return; }
  const has = n => typeof window[n] !== "undefined";
  g.registerPlugin(...["ScrollTrigger", "SplitText", "DrawSVGPlugin"].filter(has).map(n => window[n]));
  const ST = window.ScrollTrigger;

  // Smooth scrolling on mouse and trackpad; phones keep their native scrolling.
  if(window.Lenis){
    const lenis = new Lenis({lerp: 0.11, wheelMultiplier: 1, syncTouch: false});
    window.elLenis = lenis;
    if(ST) lenis.on("scroll", ST.update);
    g.ticker.add(t => lenis.raf(t * 1000)); g.ticker.lagSmoothing(0);
    // Plain in-page links glide; "#msg?text=" links still open the message form.
    document.addEventListener("click", e => {
      const a = e.target.closest('a[href^="#"]'); if(!a || e.defaultPrevented) return;
      const id = a.getAttribute("href").slice(1); if(!/^[\w-]+$/.test(id)) return;
      const el = document.getElementById(id); if(!el) return;
      e.preventDefault(); lenis.scrollTo(el, {offset: id === "top" ? 0 : -72, duration: 1.1});
      history.replaceState(null, "", "#" + id);
    });
    // Let the message form, chat log and side-scrolling rows scroll on their own.
    ["#msgBox", "#chatLog", ".ex-track", ".lvl-tabs", "#mcList"].forEach(s => document.querySelectorAll(s).forEach(el => el.setAttribute("data-lenis-prevent", "")));
  }

  // Hero entrance.
  const hero = document.querySelector(".mast.hero");
  document.documentElement.classList.add("gs"); document.documentElement.classList.remove("mo");
  if(hero){
    const tl = g.timeline({defaults: {ease: "power3.out"}});
    const name = hero.querySelector(".el-name .grad"), what = hero.querySelector(".hero-what");
    let words = what;
    if(what && window.SplitText){ words = new SplitText(what, {type: "words", wordsClass: "h1w"}).words; }
    tl.from(name, {yPercent: 30, autoAlpha: 0, scale: .94, filter: "blur(10px)", duration: 1, clearProps: "filter"})
      .from(words, {yPercent: 60, autoAlpha: 0, duration: .7, stagger: .05}, "-=.5")
      .from(hero.querySelectorAll(".hero-q, .lede, .exam-card, .hero-facts li, .hero-cta, .hero-steps li, .hero-note"), {y: 16, autoAlpha: 0, duration: .6, stagger: .08}, "-=.45");
    markDemo(tl);
  }

  // The pen-marking demo: underline the weak phrase, write the examiner's note, count the score up.
  function markSteps(tl){
    const d = demo, wave = d.querySelector(".mk-wave"), note = d.querySelector(".mk-note"), fix = d.querySelector(".mk-fix"),
      num = d.querySelector(".mk-num"), arc = d.querySelector(".mk-arc");
    const to = +num.textContent, len = +arc.dataset.len;
    if(window.DrawSVGPlugin) tl.from(wave, {drawSVG: "0%", duration: .9, ease: "power1.inOut"}, "+=.15");
    tl.from(note, {clipPath: "inset(0 100% 0 0)", duration: .8, ease: "power2.out"}, "-=.2")
      .from(fix, {y: 10, autoAlpha: 0, duration: .5}, "-=.15");
    const o = {v: 0};
    tl.to(o, {v: 1, duration: 1.2, ease: "power2.out", onUpdate(){
      arc.setAttribute("stroke-dasharray", (len * o.v).toFixed(1) + " " + full.toFixed(1));
    }}, "-=1.3");
  }
  function markDemo(tl){
    if(!demo) return;
    if(tabs) tl.from(tabs, {y: 16, autoAlpha: 0, duration: .6}, "-=.35");
    tl.from(demo, {y: 24, autoAlpha: 0, duration: .7}, "-=.35");
    markSteps(tl);
    let cur = null;
    const replay = () => { if(cur) cur.progress(1).kill(); cur = g.timeline({defaults: {ease: "power3.out"}}); cur.from(demo.querySelector(".mk-paper"), {autoAlpha: 0, x: 12, duration: .35}); markSteps(cur); };
    onPick = replay;
    const order = ["psle", "ol", "gp"];
    tl.call(() => { auto = setInterval(() => { const k = order[(order.indexOf(tabs.querySelector('[aria-selected="true"]').dataset.mk) + 1) % 3]; fill(k); replay(); }, 7000); });
  }

  if(!ST) return;
  // Section reveals as they scroll into view.
  const reveal = sel => {
    const els = [...document.querySelectorAll(sel)].filter(el => el.getBoundingClientRect().top > innerHeight * .9);
    if(!els.length) return;
    g.set(els, {y: 28, autoAlpha: 0});
    ST.batch(els, {start: "top 90%", once: true, onEnter: b => g.to(b, {y: 0, autoAlpha: 1, duration: .7, ease: "power3.out", stagger: .08, overwrite: true})});
  };
  reveal(".get4 h2, .get4 li");
  reveal("#examples .sec-head, #papersList .sec-head, .pl-g, .pl-note, .pl-cta, .endcta > *");
  // Headings in the lighter sections sweep in word by word.
  if(window.SplitText) document.querySelectorAll("#t-ex, #t-pl, #t-end").forEach(h => {
    const w = new SplitText(h, {type: "words", wordsClass: "h1w"}).words;
    g.from(w, {yPercent: 60, autoAlpha: 0, duration: .7, stagger: .05, ease: "power3.out", scrollTrigger: {trigger: h, start: "top 88%", once: true}});
  });
  // Recalculate positions once fonts and late content (results, history) settle.
  addEventListener("load", () => ST.refresh());
  new MutationObserver(() => ST.refresh()).observe(document.getElementById("result"), {childList: true});
})();
