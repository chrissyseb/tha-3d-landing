/* EssayLab v2 hero: results strip and live red-pen demo. */

(() => {
  const nav = document.querySelector(".nav"), burger = document.querySelector(".burger");
  if (burger) {
    const links = nav.querySelector(".nav-links"), brand = nav.querySelector(".brand");
    links.id = "navLinks"; burger.setAttribute("aria-controls", "navLinks");
    const close = refocus => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); if (refocus) burger.focus(); };
    const place = () => { if (getComputedStyle(burger).display === "none") { brand.after(links); close(); } else burger.after(links); };
    burger.addEventListener("click", () => burger.setAttribute("aria-expanded", String(nav.classList.toggle("open"))));
    links.addEventListener("click", e => { if (e.target.closest("a")) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("open")) close(true); });
    addEventListener("resize", place); place();
  }
})();

(() => {
  const S = {
    psle: {tab: "PSLE", name: "PSLE composition", grade: "Est. AL3", score: 24, max: 36,
      crit: [["Content", 12, 18], ["Language", 12, 18]], fix: "Show me the fear. Don't tell me!",
      body: [["s", "I was very scared when the lights went out. <span class=\"w\">I was very scared and my heart was beating very fast.</span>"],
             ["n", "Say it once, then zoom in"],
             ["s", "Then I heard a <span class=\"u\">loud noise</span>. I went to see what it was. It was my cat."],
             ["n", "Show me the fear. Don't tell me!"]]},
    ol: {tab: "O-Level", name: "O-Level English", grade: "Est. B3", score: 19, max: 30,
      crit: [["Content", 6, 10], ["Language", 13, 20]], fix: "Take a stand, then defend it!",
      body: [["s", "Technology has changed our lives in many ways. <span class=\"w\">There are many advantages and disadvantages of technology.</span>"],
             ["n", "Take a stand, then defend it!"],
             ["s", "For example, phones <span class=\"u\">help us to communicate</span>."],
             ["n", "Which phones? Whose lives? Be specific"]]},
    gp: {tab: "GP", name: "GP Paper 1", grade: "Est. B", score: 34, max: 50,
      crit: [["Content", 21, 30], ["Language", 13, 20]], fix: "Which studies? Name one.",
      body: [["s", "Social media <span class=\"u\">does more harm than good</span> for young people because <span class=\"w\">many studies show it</span> affects their mental health."],
             ["n", "Which studies? Name one."],
             ["s", "However, others argue that it helps them stay connected."],
             ["n", "Weigh this, don't dismiss it"]]}
  };
  const order = ["psle", "ol", "gp"];
  const frame = document.querySelector(".frame");
  const tabs = frame.querySelector(".tabs"), stack = frame.querySelector(".stack");
  let cur = "psle", tl = null, timer = 0, touched = false, inView = true, pane = null, played = false, held = false;

  tabs.innerHTML = order.map(k => `<button type="button" role="tab" data-k="${k}" aria-selected="${k === cur}">${S[k].tab}</button>`).join("");
  // All three samples share one grid cell, so the frame keeps its height and the page never moves.
  stack.innerHTML = order.map(k => { const x = S[k]; return `<div class="pane" data-k="${k}" role="tabpanel" aria-label="Sample marking, ${x.name}">
    <div class="paper"><div class="paper-head"><span>Sample marking · ${x.name}</span></div>
      <div class="ruled">${x.body.map(([t, h]) => t === "s" ? `<p class="script">${h}</p>` : `<p class="note">${h}</p>`).join("")}</div></div>
    <div class="marks"><p class="marks-head">Marked against the published criteria</p>
      <div class="score"><div class="ring"><svg viewBox="0 0 128 88" aria-hidden="true"><path pathLength="1" d="M92 8C60-2 14 8 6 38c-7 28 28 44 62 43 34-1 58-16 54-42C119 18 96 8 70 7"/></svg><span>${x.score}<small>/${x.max}</small></span></div><div class="grade">${x.grade}</div></div>
      ${x.crit.map(([n, a, b]) => `<div class="crit"><div class="crit-row"><b>${n}</b><span>${a}/${b}</span></div><div class="bar"><i style="--v:${(a / b * 100).toFixed(1)}%"></i></div></div>`).join("")}
      <div class="fix"><b>The one fix worth the most marks</b><p>${x.fix}</p></div></div></div>`; }).join("");

  function render(k) {
    stack.querySelectorAll(".pane").forEach(p => { const on = p.dataset.k === k; p.classList.toggle("on", on); p.setAttribute("aria-hidden", String(!on)); if (on) pane = p; });
    tabs.querySelectorAll("button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.k === k)));
    tabs.style.setProperty("--i", order.indexOf(k));
  }
  function play() {
    const g = window.gsap, q = s => pane.querySelectorAll(s);
    if (tl) tl.kill();
    if (!g) return;   // without GSAP the sample simply shows, fully marked
    tl = g.timeline({defaults: {ease: "power2.inOut"}});
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) tl.timeScale(4);   // still animates, quickly
    else if (played) tl.timeScale(1.8);   // the first marking plays in full; later ones get to the score sooner
    played = true;
    tl.fromTo(q(".u"), {"--uc": "rgba(196,18,47,0)"}, {"--uc": "rgba(196,18,47,1)", duration: .5}, .25)
      .fromTo(q(".w"), {"--wc": "rgba(196,18,47,0)"}, {"--wc": "rgba(196,18,47,1)", duration: .5}, "<")
      .fromTo(q(".note"), {"--n": "100%"}, {"--n": "0%", duration: .9, stagger: .45, ease: "power1.inOut"}, "-=.1")
      .fromTo(q(".ring path"), {"--d": 1, opacity: 0}, {"--d": 0, opacity: 1, duration: .9}, "-=.3")
      .fromTo(q(".bar i"), {scaleX: 0}, {scaleX: 1, duration: .7, stagger: .1, ease: "expo.out"}, "-=.3");
  }
  function show(k, user) {
    if (user) { touched = true; clearTimeout(timer); }
    cur = k; render(k); play();
    if (!touched) { clearTimeout(timer); timer = setTimeout(next, 9000); }
  }
  function next() {
    if (touched) return;
    if (!inView || document.hidden || held) { timer = setTimeout(next, 2000); return; }
    const n = (order.indexOf(cur) + 1) % order.length;
    if (n === 0) touched = true;   // one full round, then it stays still
    show(order[n]);
    if (tl) tl.progress(1);
    if (window.gsap) window.gsap.fromTo(pane, {y: 6}, {y: 0, duration: .3, ease: "power1.out", clearProps: "transform"});
  }
  tabs.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { show(b.dataset.k, true); tabs.style.setProperty("--t", e.detail === 0 ? "0s" : ".25s"); if (e.detail === 0 && tl) tl.progress(1); } });
  tabs.addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = (order.indexOf(cur) + (e.key === "ArrowRight" ? 1 : order.length - 1)) % order.length;
    tabs.style.setProperty("--t", "0s"); show(order[i], true); if (tl) tl.progress(1); tabs.querySelector(`[data-k="${order[i]}"]`).focus();
  });
  if ("IntersectionObserver" in window) new IntersectionObserver(es => { inView = es[0].isIntersecting; if (tl) inView ? tl.resume() : tl.pause(); }).observe(frame);

  frame.addEventListener("pointerenter", () => { held = true; });
  frame.addEventListener("pointerleave", () => { held = false; });
  frame.addEventListener("focusin", () => { held = true; });
  frame.addEventListener("focusout", () => { held = false; });

  render(cur);
  const intro = () => {
    const g = window.gsap;
    if (!g) return;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;   // still animates, without movement
    g.timeline({defaults: {ease: "expo.out", clearProps: "transform"}})
      .from(".hero h1", {y: calm ? 0 : 14, duration: .7}, 0)
      .from(".hero-side", {y: calm ? 0 : 12, duration: .7}, .1)
      .from(".frame", {y: calm ? 0 : 16, duration: .8, onStart: () => show(cur)}, .1);
  };
  if (window.gsap) intro(); else window.addEventListener("load", intro, {once: true});
})();
