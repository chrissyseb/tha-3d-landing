/* Home page layout helpers. They only rearrange or add around the old essay-box markup; marking logic stays in marker.js. */
(() => {
  /* Papers grouped by level. marker.js re-renders the buttons, so regroup each time. */
  const box = document.getElementById("papers");
  const FREE = new Set(["psle", "pslesw", "gp", "olang", "olsw"]);
  const level = b => { const n = b.textContent; return /^PSLE/.test(n) ? "Primary" : /^(GP|IB|IGCSE)/.test(n) ? "JC and international" : "Secondary"; };
  let openLevel = null, wantFocus = "";
  if (box) box.addEventListener("click", ev => { const o = ev.target.closest(".paper-opt"); if (o) wantFocus = o.dataset.id; }, true);
  const LEVELS = ["Primary", "Secondary", "JC and international"];
  const show = () => {
    box.querySelectorAll(".paper-group").forEach(g => { g.hidden = g.getAttribute("aria-label") !== openLevel; });
    box.querySelectorAll(".paper-tabs button").forEach(b => b.setAttribute("aria-pressed", String(b.textContent === openLevel)));
    { const pt = box.querySelector(".paper-tabs"); if (pt) pt.style.setProperty("--i", LEVELS.indexOf(openLevel)); }
  };
  const group = () => {
    if (!box || box.querySelector(":scope > .paper-group")) return;
    const btns = [...box.querySelectorAll(":scope > .paper-opt")]; if (!btns.length) return;
    btns.forEach(b => { if (FREE.has(b.dataset.id)) b.dataset.free = ""; });
    const on = btns.find(b => b.getAttribute("aria-pressed") === "true");
    if (on) openLevel = level(on); else if (!openLevel) openLevel = LEVELS[0];
    const frag = document.createDocumentFragment();
    const tabs = document.createElement("div"); tabs.className = "paper-tabs"; tabs.setAttribute("role", "group"); tabs.setAttribute("aria-label", "Level");
    tabs.innerHTML = LEVELS.map(n => `<button type="button">${n}</button>`).join("");
    tabs.addEventListener("click", ev => { const t = ev.target.closest("button"); if (t) { ev.stopPropagation(); tabs.style.setProperty("--t", ev.detail === 0 ? "0s" : ".25s"); openLevel = t.textContent; show(); } });
    frag.appendChild(tabs);
    LEVELS.forEach(name => {
      const g = document.createElement("div"); g.className = "paper-group"; g.setAttribute("role", "group"); g.setAttribute("aria-label", name);
      g.innerHTML = '<div class="paper-list"></div>';
      btns.filter(b => level(b) === name).forEach(b => g.lastChild.appendChild(b)); frag.appendChild(g);
    });
    box.appendChild(frag); show();
    if (wantFocus) { const f = box.querySelector(`.paper-opt[data-id="${wantFocus}"]`); wantFocus = ""; if (f) f.focus({preventScroll: true}); }
  };
  if (box) { new MutationObserver(group).observe(box, {childList: true}); group(); }

  /* Upload box: drop a photo, choose one, or take one on a phone. Hands the file to the existing input. */
  const pb = document.getElementById("photoBox"), input = document.getElementById("photo");
  if (pb && input) {
    pb.classList.add("dropzone");
    const choose = document.createElement("button");
    choose.type = "button"; choose.className = "btn ghost choose-btn"; choose.textContent = "Choose a photo";
    choose.addEventListener("click", () => input.click());
    input.after(choose); input.tabIndex = -1; input.setAttribute("aria-hidden", "true");
    const cam = pb.querySelector(".cam-btn"); if (cam) { const c = document.createElement("button"); c.type = "button"; c.className = cam.className; c.style.cssText = cam.style.cssText; c.textContent = cam.textContent; c.addEventListener("click", () => document.getElementById("photoCam").click()); cam.replaceWith(c); }
    ["dragenter", "dragover"].forEach(t => pb.addEventListener(t, e => { e.preventDefault(); pb.classList.add("over"); }));
    ["dragleave", "drop"].forEach(t => pb.addEventListener(t, e => { e.preventDefault(); pb.classList.remove("over"); }));
    pb.addEventListener("drop", e => {
      const f = e.dataTransfer && e.dataTransfer.files[0]; if (!f || !/^image\//.test(f.type)) return;
      const dt = new DataTransfer(); dt.items.add(f); input.files = dt.files; input.dispatchEvent(new Event("change", {bubbles: true}));
    });
  }

  /* Result screen: one main path. Extras move into one closed panel; every id and listener stays intact. */
  const res = document.getElementById("result");
  const shorten = () => {
    if (!res || !res.children.length || res.querySelector(":scope > .result-more")) return;
    const extras = [];
    const script = res.querySelector(".script");
    if (script) { let n = script.nextElementSibling; while (n) { extras.push(n); n = n.nextElementSibling; } }
    const kids = [...res.children], firstRow = kids.findIndex(k => k.classList.contains("row"));
    if (firstRow >= 0) kids.slice(firstRow).forEach(k => extras.push(k));
    if (!extras.length) return;
    const d = document.createElement("details"); d.className = "result-more";
    d.innerHTML = "<summary>More: rate, share or save this report</summary>";
    extras.forEach(k => d.appendChild(k)); res.appendChild(d);
  };
  if (res) new MutationObserver(shorten).observe(res, {childList: true});

  /* Clear messages: read out, in view, and next to the problem. */
  const note = document.getElementById("notice"), essay = document.getElementById("essay"), prog = document.getElementById("progress"), up = document.getElementById("upgradeBox"), markBtn = document.getElementById("markBtn");
  const say = m => { note.textContent = m; note.hidden = false; };
  if (note) {
    note.setAttribute("role", "alert");
    new MutationObserver(() => {
      if (note.hidden) { essay.removeAttribute("aria-invalid"); essay.removeAttribute("aria-describedby"); return; }
      if (/too short/.test(note.textContent)) { essay.setAttribute("aria-invalid", "true"); essay.setAttribute("aria-describedby", "notice"); }
      note.tabIndex = -1; note.focus({preventScroll: true}); note.scrollIntoView({block: "center"});
    }).observe(note, {attributes: true, attributeFilter: ["hidden"], childList: true});
  }
  if (up) new MutationObserver(() => { if (!up.hidden) { up.classList.toggle("is-limit", /used your/.test(document.getElementById("upgradeWhy").textContent)); up.setAttribute("role", "alert"); up.tabIndex = -1; up.focus({preventScroll: true}); up.scrollIntoView({block: "center"}); } }).observe(up, {attributes: true, attributeFilter: ["hidden"]});
  if (prog) { prog.setAttribute("role", "status"); new MutationObserver(() => { document.getElementById("handin").setAttribute("aria-busy", String(!prog.hidden && !!markBtn.disabled));
      if (!prog.hidden) { prog.tabIndex = -1; prog.focus({preventScroll: true}); }
      else setTimeout(() => { const a = document.activeElement; if (a === document.body || a === prog) markBtn.focus({preventScroll: true}); const rs = document.getElementById("result"); if (a === rs && rs.children.length) rs.scrollIntoView({block: "start"}); }, 0); }).observe(prog, {attributes: true, attributeFilter: ["hidden"]}); }
  if (up) { const row = up.querySelector(".row"), codeBtn = document.getElementById("codeBtn");
    if (row) { const pay = document.createElement("a"); pay.className = "btn primary upgrade-pay"; pay.href = "/app.html#planBox"; pay.textContent = "Get 4 detailed reports · S$39"; row.before(pay); }
    if (codeBtn) codeBtn.classList.replace("primary", "ghost"); }
  /* Upload: a photo only, up to 20 MB, with a plain message otherwise. */
  const MAX_PHOTO = 20 * 1024 * 1024;
  if (input) input.addEventListener("change", ev => {
    const f = input.files[0]; if (!f) return;
    const bad = !/^image\//.test(f.type) ? "That file isn't a photo. Please choose a JPG or PNG photo of the script." : f.size > MAX_PHOTO ? "That photo is too big. Please choose one under 20 MB." : "";
    if (bad) { ev.stopImmediatePropagation(); input.value = ""; say(bad); }
  }, true);
  if (pb) pb.addEventListener("drop", ev => { const f = ev.dataTransfer && ev.dataTransfer.files[0]; if (f && !/^image\//.test(f.type)) say("That file isn't a photo. Please choose a JPG or PNG photo of the script."); });
  /* Labels for the fields that only had placeholders. */
  { const q = document.getElementById("question"); if (q) q.placeholder = "Paste the question here"; }
  [["code", "Your pass code"], ["promo", "Invite or promo code"], ["stuName", "Your full name"]].forEach(([id, l]) => { const f = document.getElementById(id); if (f) f.setAttribute("aria-label", l); });
  /* Result: move focus to the top of it, rather than reading the whole report aloud. */
  if (res) { res.removeAttribute("aria-live"); res.tabIndex = -1; res.setAttribute("aria-label", "Your marked essay");
    new MutationObserver(() => { if (res.children.length) res.focus({preventScroll: true}); }).observe(res, {childList: true}); }

  /* The moving crest banner has a pause control. */
  { const wrap = document.querySelector("#crest .crest-wrap"), note = document.querySelector("#crest .crest-note");
    if (wrap && note) { const b = document.createElement("button"); b.type = "button"; b.className = "crest-pause"; b.textContent = "Pause the banner"; note.append(" ", b);
      b.addEventListener("click", () => { const off = wrap.classList.toggle("paused"); b.textContent = off ? "Play the banner" : "Pause the banner"; }); } }
  /* Phone: one script at a time, photo or marked. */
  { const pair = document.querySelector("#product .pd-pair");
    if (pair) { const t = document.createElement("div"); t.className = "pd-toggle"; t.setAttribute("role", "group"); t.setAttribute("aria-label", "Sample script");
      t.innerHTML = '<button type="button" data-show="photo" aria-pressed="false">The photo</button><button type="button" data-show="marked" aria-pressed="true">Marked in red pen</button>';
      const set = v => { pair.dataset.show = v; t.style.setProperty("--i", v === "marked" ? 1 : 0); t.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.show === v))); };
      t.addEventListener("click", e => { const b = e.target.closest("button"); if (b) set(b.dataset.show); });
      pair.before(t); set("marked"); } }

  /* Sample report: pointing at a comment lights up the words it is about, and the other way round. */
  if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
    const marks = [...document.querySelectorAll("#sample-report .sr-script mark")], notes = [...document.querySelectorAll("#sample-report .sr-note")];
    marks.forEach((m, i) => { const n = notes[i]; if (!n) return;
      const on = v => { m.classList.toggle("sr-on", v); n.classList.toggle("sr-on", v); };
      [m, n].forEach(el => { el.addEventListener("pointerenter", () => on(true)); el.addEventListener("pointerleave", () => on(false)); }); });
  }

  /* Demo video: loads and plays only when on screen, and can be paused. */
  { const v = document.getElementById("demoVideo"), b = document.getElementById("videoPause");
    if (v && b && "IntersectionObserver" in window) { let held = false;
      new IntersectionObserver(es => { if (es[0].isIntersecting && !held) v.play().catch(() => {}); else v.pause(); }, {threshold: .3}).observe(v);
      b.addEventListener("click", () => { held = !held; b.textContent = held ? "Play the video" : "Pause the video"; if (held) v.pause(); else v.play().catch(() => {}); }); } }

  /* compact essay box: sample and timed exam share one row. */
  { const t = document.getElementById("timerBtn"), l = document.getElementById("loadSample"); if (t && l && l.parentElement) { const old = t.closest(".row"), out = document.getElementById("timerOut"); l.after(t); if (out) t.after(out); if (old && !old.children.length) old.remove(); } }

  /* Footer wordmark rises in, as on the other pages. */
  { const w = document.querySelector(".foot-word"); if (w && "IntersectionObserver" in window && w.getBoundingClientRect().top >= innerHeight) { document.documentElement.classList.add("fw-arm"); const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { w.classList.add("fw-in"); io.disconnect(); } }, {threshold: .4}); io.observe(w); } }

  /* Say the rules before they press Mark, not after. */
  { const count = document.getElementById("count"), essayBox = document.getElementById("essay"), pbox = document.getElementById("papers");
    if (count) { const tip = document.createElement("span"); tip.textContent = " · at least 80 words"; count.after(tip); tip.className = "hint"; }
    if (pbox) { const need = document.createElement("p"); need.className = "paper-need"; need.hidden = true; need.textContent = "This paper needs a detailed feedback plan. Free marking covers PSLE English, O-Level English and A-Level GP."; pbox.after(need);
      const check = () => { const on = pbox.querySelector('.paper-opt[aria-pressed="true"]'); need.hidden = !on || "free" in on.dataset; };
      new MutationObserver(check).observe(pbox, {subtree: true, childList: true, attributes: true, attributeFilter: ["aria-pressed"]}); check(); } }

  /* Say so when the connection drops; the draft stays on this device. */
  { const btn = document.getElementById("markBtn");
    if (btn) { const n = document.createElement("p"); n.className = "net-note"; n.setAttribute("role", "status"); n.hidden = navigator.onLine; n.textContent = "You're offline. Your essay stays here on this device. Reconnect, then press the button."; btn.parentNode.insertBefore(n, btn.nextSibling);
      addEventListener("offline", () => { n.hidden = false; }); addEventListener("online", () => { n.hidden = true; }); } }
})();
