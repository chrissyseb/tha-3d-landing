/* © 2026 Christine Sebastian. All rights reserved. EssayLabsg™ website and marking engine. Unauthorised copying, reproduction or reuse is prohibited. */
/* Skills to practise: spaced repetition (ts-fsrs) over the weaknesses found in each marked essay.
   A weakness that shows up again is rated "Again"; one that has gone from the next essay on the same paper is rated "Good".
   Everything stays in this browser (localStorage "el_skills"), next to the essay history ("ec_hist"). */
(() => {
  const F = window.FSRS; if(!F || !document.getElementById("histBox")) return;
  const KEY = "el_skills", f = F.fsrs({enable_fuzz: false});
  const read = (k, d) => { try{ return JSON.parse(localStorage.getItem(k)) || d; }catch{ return d; } };
  const revive = c => ({...c, due: new Date(c.due), last_review: c.last_review ? new Date(c.last_review) : undefined});
  const keep = (c, name, paper) => ({...c, name, paper});
  const LV = {psle:"psle", pslesw:"psle", olang:"ol", olsw:"ol", gp:"gp", gpaq:"gp"};
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));

  function sync(){
    const s = read(KEY, {cards: {}, seen: 0}), hist = read("ec_hist", []);
    hist.filter(e => e && e.t > s.seen && e.paper).sort((a, b) => a.t - b.t).forEach(e => {
      const now = new Date(e.t), tags = new Set((e.tags || []).filter(Boolean)), pre = e.paper + "|";
      tags.forEach(t => {
        const k = pre + t, c = s.cards[k] ? revive(s.cards[k]) : F.createEmptyCard(now);
        s.cards[k] = keep(f.next(c, now, F.Rating.Again).card, t, e.paper);
      });
      Object.keys(s.cards).filter(k => k.startsWith(pre) && !tags.has(k.slice(pre.length))).forEach(k => {
        const old = s.cards[k]; s.cards[k] = keep(f.next(revive(old), now, F.Rating.Good).card, old.name, e.paper);
      });
      s.seen = Math.max(s.seen, e.t);
    });
    try{ localStorage.setItem(KEY, JSON.stringify(s)); }catch{}
    return s;
  }

  function render(){
    const box = document.getElementById("histBox"); if(box.hidden) return;
    let el = document.getElementById("skillsBox");
    if(!el){ el = document.createElement("div"); el.id = "skillsBox"; el.className = "skills"; document.getElementById("histWeak").after(el); }
    const cards = Object.values(sync().cards).map(revive).filter(c => c.reps > 0 || c.lapses > 0);
    if(!cards.length){ el.innerHTML = ""; return; }
    const now = Date.now(), papers = typeof PAPERS !== "undefined" ? PAPERS : [];
    const pname = id => (papers.find(p => p.id === id) || {name: id}).name;
    const due = cards.filter(c => c.due <= now).sort((a, b) => a.due - b.due);
    const later = cards.filter(c => c.due > now).sort((a, b) => a.due - b.due).slice(0, 3);
    const day = d => d.toLocaleDateString("en-SG", {weekday: "short", day: "numeric", month: "short"});
    const item = (c, when) => `<li><span><b>${esc(c.name)}</b><small>${esc(pname(c.paper))} · ${when}</small></span>${when === "Practise now"
      ? `<button type="button" class="ex-try" data-pq="${esc(c.paper)}" data-lv="${LV[c.paper] || "more"}">Write one now</button>` : ""}</li>`;
    el.innerHTML = `<h3>Skills to practise</h3>
      <p class="hint">We bring back each weakness from your feedback until it stops showing up in your essays.</p>
      ${due.length ? `<ul>${due.slice(0, 3).map(c => item(c, "Practise now")).join("")}</ul>` : `<p class="skills-ok">Nothing due today. Nice work.</p>`}
      ${later.length ? `<p class="skills-next">Coming up: ${later.map(c => `${esc(c.name)} (${day(c.due)})`).join(", ")}</p>` : ""}`;
  }

  render();
  new MutationObserver(render).observe(document.getElementById("histPapers"), {childList: true});
})();
