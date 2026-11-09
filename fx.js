/* © 2026 Christine Sebastian. All rights reserved. EssayLabsg™ website and marking engine. Unauthorised copying, reproduction or reuse is prohibited. */
/* Visual-only enhancements: scroll reveal, score and stat count-up. Content is fully visible without this script. */
(() => {
  if(!("IntersectionObserver" in window) || !window.requestAnimationFrame) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const ease = k => 1 - Math.pow(1 - k, 3);
  const tween = (dur, fn, done) => { const t0 = performance.now(); const step = now => { const k = Math.min(1, (now - t0) / dur); fn(ease(k)); if(k < 1) requestAnimationFrame(step); else if(done) done(); }; requestAnimationFrame(step); };
  const countText = (el, dur) => {
    const orig = el.textContent; const m = /^(\D*)(\d{1,4})(\D*)$/.exec(orig.trim()); if(!m) return;
    const to = +m[2]; tween(dur, k => { if(el.isConnected) el.textContent = m[1] + Math.round(to * k) + m[3]; }, () => { el.textContent = orig; });
  };
  const animRing = ring => {
    const arc = ring.querySelectorAll("circle")[1]; if(!arc) return;
    const da = (arc.getAttribute("stroke-dasharray") || "").split(/\s+/).map(Number); if(da.length < 2 || !isFinite(da[0])) return;
    const orig = arc.getAttribute("stroke-dasharray");
    tween(1100, k => arc.setAttribute("stroke-dasharray", (da[0] * k).toFixed(1) + " " + da[1]), () => arc.setAttribute("stroke-dasharray", orig));
  };
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if(!en.isIntersecting) return;
    const el = en.target; io.unobserve(el);
    if(reduce.matches) return;
    el.classList.add("rv-in");
    const ring = el.querySelector(".ring"); if(ring) animRing(ring);
  }), {rootMargin:"0px 0px -6% 0px", threshold:0.06});
  const below = el => el.getBoundingClientRect().top > innerHeight;
  const watch = (el, i, force) => { if(force || below(el)){ if(i) el.style.animationDelay = Math.min(i, 5) * 70 + "ms"; io.observe(el); } };
  document.querySelectorAll(".wrap > section.sheet, .wrap > .duo > *, #result > *").forEach(el => watch(el, 0));  // no count-ups, and fine print never animates
  ["#mcList > div", "#joinRoles > a", "#teamStats > .stat"].forEach(sel => document.querySelectorAll(sel).forEach((el, i) => watch(el, i)));
  // A fresh result (after marking) animates in as it scrolls into view.
  new MutationObserver(() => { [...document.querySelectorAll("#result > *")].forEach((el, i) => watch(el, 0, true)); })
    .observe(document.getElementById("result"), {childList:true});
})();

// Hero motion: sliding tab indicator, typewriter placeholder, count-ups and photo drag-and-drop.
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tabs = $("#lvlTabs"), ind = tabs.querySelector(".tab-ind");
  const place = () => { const b = tabs.querySelector('[aria-pressed="true"]'); if(!b){ ind.style.opacity = 0; return; }
    ind.style.opacity = 1; ind.style.width = b.offsetWidth + "px"; ind.style.height = b.offsetHeight + "px"; ind.style.transform = `translate(${b.offsetLeft}px,${b.offsetTop}px)`; };
  new MutationObserver(place).observe(tabs, {subtree: true, attributes: true, attributeFilter: ["aria-pressed"]});
  addEventListener("resize", place); place(); requestAnimationFrame(() => tabs.classList.add("ready"));
  if(document.fonts) document.fonts.ready.then(place);

  const ta = $("#essay"), base = ta.placeholder;
  const lines = ["Paste your GP essay: 'Social media does more harm than good.' Discuss...", "Paste your PSLE composition about 'A Kind Act'...", "Paste your O-Level situational writing email...", base];
  if(!still){ let li = 0, ci = 0, del = false, hold = 0;
    setInterval(() => { if(ta.value || document.activeElement === ta) return;
      if(hold > 0){ hold--; return; }
      const s = lines[li];
      if(!del){ ci++; if(ci >= s.length){ del = true; hold = 28; } }
      else { ci -= 2; if(ci <= 0){ ci = 0; del = false; li = (li + 1) % lines.length; hold = 4; } }
      ta.placeholder = s.slice(0, ci) + (hold ? "" : "▍"); }, 45); }

  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if(!e.isIntersecting) return; io.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, t0 = performance.now(), d = 1400;
    const step = now => { const k = Math.min(1, (now - t0) / d); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if(k < 1) requestAnimationFrame(step); };
    if(!still){ el.textContent = "0"; requestAnimationFrame(step); } }), {threshold: .4}) : null;
  // numbers stay as written (no count-up), so text never changes width

  const dz = $("#dropZone");
  ["dragenter", "dragover"].forEach(ev => dz.addEventListener(ev, e => { if([...(e.dataTransfer.types || [])].includes("Files")){ e.preventDefault(); dz.classList.add("over"); } }));
  ["dragleave", "drop"].forEach(ev => dz.addEventListener(ev, () => dz.classList.remove("over")));
  dz.addEventListener("drop", e => { const f = [...e.dataTransfer.files].find(x => x.type.startsWith("image/")); if(!f) return; e.preventDefault();
    const dt = new DataTransfer(); dt.items.add(f); $("#photo").files = dt.files; $("#photo").dispatchEvent(new Event("change", {bubbles: true})); });
})();

/* paper banner: tap a paper to jump to it */
(function(){
  document.addEventListener("click", function(e){
    if(e.target.closest("[data-passbuy]")) return;
    var c = e.target.closest(".pq-chip, .exam-card, button.ex-try[data-pq]"); if(!c) return;
    var tab = document.querySelector('#lvlTabs [data-level="' + c.dataset.lv + '"]'); if(tab) tab.click();
    var sel = document.getElementById("paperSel");
    if(sel && sel.querySelector('option[value="' + c.dataset.pq + '"]')){ sel.value = c.dataset.pq; sel.dispatchEvent(new Event("change", {bubbles:true})); }
    var m = document.getElementById("mark"); if(m) m.scrollIntoView({behavior:"smooth", block:"start"});
  });
})();

/* example carousel: auto-advance, dots, arrows; why-row reveal */
(function(){
  var tr = document.querySelector(".ex-track"); if(!tr) return;
  var cards = [].slice.call(tr.querySelectorAll(".ex-card")), dots = [].slice.call(document.querySelectorAll(".ex-dot"));
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, cur = -1, hold = 0, seen = false;
  function center(c){ return c.offsetLeft + c.offsetWidth / 2 - tr.clientWidth / 2; }
  function mark(i){ if(i === cur) return; cur = i; cards.forEach(function(c, k){ c.classList.toggle("on", k === i); }); dots.forEach(function(d, k){ d.classList.toggle("on", k === i); d.setAttribute("aria-current", k === i ? "true" : "false"); }); }
  function go(i){ i = (i + cards.length) % cards.length; tr.scrollTo({left: center(cards[i]), behavior: reduce ? "auto" : "smooth"}); mark(i); }
  function near(){ var x = tr.scrollLeft, b = 0, bd = 1e9; cards.forEach(function(c, k){ var d = Math.abs(center(c) - x); if(d < bd){ bd = d; b = k; } }); return b; }
  var t; tr.addEventListener("scroll", function(){ clearTimeout(t); t = setTimeout(function(){ mark(near()); }, 80); }, {passive: true});
  function user(){ hold = Date.now() + 12000; }
  ["pointerdown", "wheel", "touchstart", "keydown", "focusin"].forEach(function(ev){ tr.addEventListener(ev, user, {passive: true}); });
  dots.forEach(function(d, k){ d.addEventListener("click", function(){ user(); go(k); }); });
  [].forEach.call(document.querySelectorAll(".ex-arrow"), function(a){ a.addEventListener("click", function(){ user(); go(cur + (+a.dataset.dir)); }); });
  mark(0);
  if("IntersectionObserver" in window){ new IntersectionObserver(function(es){ seen = es[0].isIntersecting; }, {threshold: .3}).observe(tr); }
  if(!reduce) setInterval(function(){ if(seen && Date.now() > hold && !document.hidden) go(cur + 1); }, 4500);
  var rows = document.querySelectorAll(".why-row");
  if(!reduce && "IntersectionObserver" in window){
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ io.unobserve(e.target); e.target.classList.add("in"); } }); }, {threshold: .15});
    [].forEach.call(rows, function(r, i){ if(r.getBoundingClientRect().top > innerHeight){ r.classList.add("rv"); r.style.transitionDelay = (i % 2) * 90 + "ms"; io.observe(r); } });
  }
})();

/* phones: a "Mark my essay" bar after the hero, hidden while the marking form is on screen */
(function(){
  var b = document.getElementById("mCta"), hero = document.querySelector(".mast.hero"), form = document.getElementById("mark");
  if(!b || !hero || !form || !("IntersectionObserver" in window)) return;
  var pastHero = false, atForm = false, upd = function(){ b.hidden = !pastHero || atForm; };
  new IntersectionObserver(function(es){ pastHero = !es[0].isIntersecting && es[0].boundingClientRect.top < 0; upd(); }).observe(hero);
  new IntersectionObserver(function(es){ atForm = es[0].isIntersecting; upd(); }, {threshold: 0.15}).observe(form);
})();
