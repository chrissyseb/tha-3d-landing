/* © 2026 Christine Sebastian. All rights reserved. EssayLabsg™ website and marking engine. Unauthorised copying, reproduction or reuse is prohibited. */
/* Framework audit: the framework hint under the paper picker, and the audit panel in every result. */
(function(){
  var FW = {
    gp: ["PEEL", "Point · Evidence · Explanation · Link, paragraph by paragraph"],
    psle: ["Story Arc + Show, Don't Tell", "5-stage arc pacing and show-not-tell (PEEL for argumentative pieces)"],
    olang: ["PEEL or Story Arc", "PEEL for argumentative, Story Arc + Show, Don't Tell for narrative"],
    igcse: ["PEEL or Story Arc", "PEEL for argumentative, Story Arc + Show, Don't Tell for narrative"],
    pslesw: ["PAC/PACT", "Purpose · Audience · Context · Tone"],
    olsw: ["PAC/PACT", "Purpose · Audience · Context · Tone"],
    gpaq: ["R-E-A-L", "Relate · Evaluate · Apply to Singapore · Link"],
    ss: ["LORMS + C-A-P-P", "your level hurdle, then Content · Audience · Purpose · Provenance"],
    hist: ["LORMS + C-A-P-P", "your level hurdle, then Content · Audience · Purpose · Provenance"],
    geog: ["LORMS", "your level hurdle, with each point explained and evidenced"],
    olit: ["PEEL-L", "Point · Evidence · Explanation · Link · Language"],
    ib1: ["PEEL (IB Criteria A-D)", "PEEL, mapped to IB Criteria A to D"],
    ib2: ["PEEL (comparative)", "PEEL, with both works compared in every paragraph"]
  };
  var EXAMPLE_FW = {name: "PEEL", summary: "Locked in the middle band: evidence is generic in 3 of 4 body paragraphs and the counter-argument is never weighed.",
    rows: [
      {label: "Para 2 · Mental health", checks: [{k:"Point",status:"ok",note:"Clear claim that answers the question."},{k:"Evidence",status:"weak",note:"Generic: 'many studies' names no source."},{k:"Explanation",status:"weak",note:"Names the comparison effect but not how far it harms."},{k:"Link",status:"ok",note:"Ties back to harm to young people."}]},
      {label: "Para 3 · Wasted time", checks: [{k:"Point",status:"ok",note:"Clear claim."},{k:"Evidence",status:"weak",note:"Generic: hours on TikTok, no figure or case."},{k:"Explanation",status:"weak",note:"Effect on grades is asserted, not shown."},{k:"Link",status:"weak",note:"Never weighed against the benefits."}]},
      {label: "Para 4 · Counter-argument", checks: [{k:"Point",status:"ok",note:"Concedes connection and learning."},{k:"Evidence",status:"ok",note:"Named: COVID-19 and YouTube."},{k:"Explanation",status:"missing",note:"Dismissed in one line, no weighing."},{k:"Link",status:"missing",note:"No yardstick back to 'more harm than good'."}]},
      {label: "Para 5 · Online dangers", checks: [{k:"Point",status:"ok",note:"Clear claim."},{k:"Evidence",status:"missing",note:"No case or figure for cyberbullying."},{k:"Explanation",status:"weak",note:"'Very hurt' tells, does not explain."},{k:"Link",status:"weak",note:"Not tied to the 'how far' judgement."}]}
    ]};
  var esc = function(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
  var MARK = {ok: "✓", weak: "~", missing: "✕"};

  // 1. Framework hint under the paper picker
  var sel = document.getElementById("paperSel");
  if(sel){
    var hint = document.createElement("p"); hint.className = "fw-hint"; hint.setAttribute("aria-live", "polite");
    var host = sel.closest("label") || sel.parentNode; host.parentNode.insertBefore(hint, host.nextSibling);
    var upd = function(){ var f = FW[sel.value]; hint.innerHTML = f ? '<span class="fw-badge">' + esc(f[0]) + '</span> Audited with ' + esc(f[1]) + '.' : ""; };
    new MutationObserver(upd).observe(sel, {childList: true}); sel.addEventListener("change", upd); upd();
  }

  // 2. Audit panel in each result, placed after the analytics sheet
  var res = document.getElementById("result"); if(!res) return;
  function panel(){
    if(res.querySelector(".fw-sheet")) return;
    var r; try{ r = last; }catch(e){ return; }
    if(!r || !r.criteria) return;
    try{ if(!unlocked && !r.example) return; }catch(e){}
    var f = r.framework || (r.example ? EXAMPLE_FW : null);
    if(!f || !f.rows || !f.rows.length) return;
    var rows = f.rows.slice(0, 6).map(function(row){
      return '<div class="fw-row"><span class="fw-lbl">' + esc(row.label) + '</span><ul>' + (row.checks || []).map(function(c){
        var st = /^(ok|weak|missing)$/.test(c.status) ? c.status : "weak";
        return '<li class="fw-' + st + '"><i aria-hidden="true">' + MARK[st] + '</i><b>' + esc(c.k) + '</b><span>' + esc(c.note) + '</span></li>';
      }).join("") + '</ul></div>';
    }).join("");
    var el = document.createElement("div"); el.className = "sheet fw-sheet"; el.style.marginTop = "20px";
    el.innerHTML = '<div class="sheet-inner"><div class="sec-title"><h2>Framework Audit</h2><span class="fw-badge">' + esc(f.name || (FW[r.paper] || ["Framework"])[0]) + '</span></div>' +
      (f.summary ? '<p class="fw-sum">' + esc(f.summary) + '</p>' : "") +
      '<div class="fw-key"><span class="fw-ok"><i>✓</i>Secure</span><span class="fw-weak"><i>~</i>Weak</span><span class="fw-missing"><i>✕</i>Missing</span></div>' + rows + '</div>';
    var anchor = res.querySelector(".anl") || res.firstElementChild;
    if(anchor && anchor.nextSibling) res.insertBefore(el, anchor.nextSibling); else res.appendChild(el);
  }
  new MutationObserver(panel).observe(res, {childList: true}); panel();
})();
