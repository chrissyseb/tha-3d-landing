/* © 2026 Christine Sebastian. All rights reserved. EssayLabsg™ website and marking engine. Unauthorised copying, reproduction or reuse is prohibited. */
// Owner pass: after Chrissy logs in to ?admin on this device, marking requests carry her key (from this browser's storage only).
(() => { let k = ""; try{ k = localStorage.getItem("ec_admin") || ""; }catch{} if(!k) return;
  const f = window.fetch.bind(window); window.fetch = (u, o = {}) => { if(String(u).startsWith("/api/mark")) o = {...o, headers: {...(o.headers || {}), "X-Owner-Key": k}}; return f(u, o); }; })();
const PAPERS = [
  {id:"psle", free:true, name:"PSLE English", sub:"Continuous Writing /36", level:"PSLE English Language (Primary 6), Paper 1 Continuous Writing (composition based on a topic and pictures)",
   criteria:[["Content",18],["Language and Organisation",18]],
   grades:"PSLE Achievement Level AL1 to AL8 (estimate for the composition only)",
   method:"Story-arc planning (hook, problem, climax, resolution and reflection), show-not-tell with the five senses and feelings, a clear link to the topic and at least one picture, and accurate, varied Primary-level sentences. Use only PSLE terms; never mention O-Level, GP or IB."},
  {id:"pslesw", free:true, name:"PSLE Situational", sub:"Situational Writing /14", level:"PSLE English Language (Primary 6), Paper 1 Situational Writing (letter, email or speech for a given purpose and audience)",
   criteria:[["Task Fulfilment",6],["Language and Organisation",8]],
   grades:"PSLE Achievement Level AL1 to AL8 (estimate for this section only)",
   method:"Purpose, Audience, Context (PAC) check, every required content point covered, correct format and register for the reader, and clear paragraphing. Use only PSLE terms; never mention O-Level, GP or IB."},
  {id:"gp", free:true, name:"GP Paper 1", sub:"A-Level Essay /50", level:"A-Level (JC) General Paper 8881, Paper 1 essay",
   criteria:[["Content (relevance, argument, evaluation, examples)",30],["Language (clarity, range, accuracy, organisation)",20]],
   grades:"A-Level GP grade A to U",
   method:"AQ Localisation and Macro-Argumentation: define the key terms and the yardstick in the intro, answer the question in every topic sentence, weigh both sides with a clear criterion, and localise to Singapore with specific, checkable examples."},
  {id:"gpaq", name:"GP Paper 2 AQ", sub:"Application Question /10", free:true, level:"A-Level (JC) General Paper 8881, Paper 2 Application Question (responding to the author's views in the passage, applied to the student's own society)",
   criteria:[["Application Question (requirements, evaluation and language, holistic band)",10]],
   grades:"AQ band 1 to 5 (estimate)",
   method:"AQ Localisation: pick the author's views that best fit, state a clear stand on each, evaluate them against specific, current Singapore examples (policies, data, events), explain why the view does or does not apply here, and end with a reasoned overall judgement. The student may paste the author's points in the question box."},
  {id:"olang", free:true, name:"O-Level English", sub:"Continuous Writing /30", level:"GCE O-Level English Language 1184, Paper 1 Continuous Writing",
   criteria:[["Content and Development",10],["Language and Organisation",20]],
   grades:"O-Level grade A1 to F9",
   method:"PEEL essay architecture (Point, Evidence, Explain, Link), vivid but controlled vocabulary, varied sentence structures, and editing for accuracy."},
  {id:"olsw", free:true, name:"O-Level Situational", sub:"Situational Writing /30", level:"GCE O-Level English Language 1184, Paper 1 Situational Writing (email, letter, report, speech or proposal based on a visual text)",
   criteria:[["Task Fulfilment",10],["Language and Organisation",20]],
   grades:"O-Level grade A1 to F9 (estimate for this section)",
   method:"Purpose, Audience, Context (PAC) analysis, every task point addressed and developed with details from the visual stimulus, the correct format and tone for the reader, persuasive organisation, and accurate, varied language."},
  {id:"olit", name:"O-Level Literature", sub:"Prose/Drama/Poetry /20", level:"GCE O-Level Literature in English (Pure or Elective) essay question",
   criteria:[["Knowledge and understanding of the text",5],["Response to the question (argument)",5],["Analysis of language, form and structure",5],["Personal response and evaluation",5]],
   grades:"O-Level grade A1 to F9",
   method:"PEEL-L (Point, Evidence, Explain, Link, Language focus), close reading of word choice and form, character and conflict matrices, aligned to the Cambridge/SEAB band descriptors."},
  {id:"ss", name:"Social Studies", sub:"SBQ / SRQ, by Levels", lorms:true, level:"GCE O-Level Social Studies (Combined Humanities), Source-Based Case Study question or Structured-Response Question",
   criteria:[["Level of Response (LORMS)",10]], grades:"O-Level grade A1 to F9 (estimate for this answer)",
   method:"SBCS toolkit (Comparison, Cross-Referencing, Surprise, Purpose, Utility) with inference supported by source evidence and provenance, and for SRQs the Strategy > Impact > Outcome chain with a balanced, evaluated conclusion."},
  {id:"hist", name:"History", sub:"SBCS / SRQ / Essay, by Levels", lorms:true, level:"GCE O-Level History (Pure or Elective), Source-Based Case Study, Structured-Response Question or essay",
   criteria:[["Level of Response (LORMS)",10]], grades:"O-Level grade A1 to F9 (estimate for this answer)",
   method:"SBCS toolkit (Comparison, Cross-Referencing, Surprise, Purpose, Utility) and Causal Factor Mapping: explained factors with specific historical detail, links between factors, and a reasoned judgement on the most important factor."},
  {id:"geog", name:"Geography", sub:"Structured / Data Response, by Levels", lorms:true, level:"GCE O-Level Geography (Pure or Elective), structured, data-response or extended answer",
   criteria:[["Level of Response (LORMS)",10]], grades:"O-Level grade A1 to F9 (estimate for this answer)",
   method:"Data and graphic decoding (quote figures with units from the resource), process flowcharts for explanations, and named case studies with specific place detail; evaluate where the question asks 'to what extent'."},
  {id:"ib1", name:"IB Lang & Lit P1", sub:"Guided Analysis /20", level:"IB DP Language A: Language and Literature, Paper 1 guided textual analysis",
   criteria:[["A: Understanding and interpretation",5],["B: Analysis and evaluation",5],["C: Focus and organisation",5],["D: Language",5]],
   grades:"IB grade 1 to 7 (estimate)",
   method:"Strict alignment with IB Criteria A to D: a clear interpretive thesis answering the guiding question, analysis of how authorial choices create meaning, and controlled academic register."},
  {id:"ib2", name:"IB Lang & Lit P2", sub:"Comparative Essay /30", level:"IB DP Language A: Language and Literature, Paper 2 comparative essay",
   criteria:[["A: Knowledge, understanding and interpretation",10],["B: Analysis and evaluation",10],["C: Focus and organisation",5],["D: Language",5]],
   grades:"IB grade 1 to 7 (estimate)",
   method:"Comparative essay architecture: a thesis that compares from the first line, integrated point-by-point comparison, and evaluation of how each author's choices answer the question."},
  {id:"igcse", name:"IGCSE English", sub:"Composition /40", level:"Cambridge IGCSE First Language English 0500, Paper 2 Composition",
   criteria:[["Content and Structure",16],["Style and Accuracy",24]],
   grades:"IGCSE grade A* to G",
   method:"Cambridge IGCSE marking scheme: purposeful structure, sustained register, precise and ambitious vocabulary, and accurate sentence control."}
];

const SAMPLE_Q = "'Social media does more harm than good to young people.' How far do you agree?";
const SAMPLE = `In today's modern world, social media is everywhere. Almost every teenager has Instagram, TikTok or Snapchat on their phone and they spend many hours a day on it. Some people think that social media does more harm than good to young people, while others disagree. In my opinion, social media does more harm than good to young people because it affects their mental health, wastes their time and exposes them to dangers.

Firstly, social media affects the mental health of young people. When teenagers see perfect pictures of their friends and influencers, they start comparing themselves and feel bad about their own lives. This can lead to depression and anxiety. Many studies have shown that teenagers who use social media more are more unhappy. Therefore, social media is harmful to young people.

Secondly, social media wastes a lot of time. Instead of studying or exercising, students scroll through TikTok for hours. This affects their grades and their health. In Singapore, where students face a lot of pressure to do well in exams, this is a big problem because every hour counts.

However, some people may argue that social media is good because it lets young people connect with friends and learn new things. For example, during the COVID-19 pandemic, students used social media to keep in touch when they could not meet. There are also many educational videos on YouTube. But this benefit is small compared to the harms.

Lastly, social media exposes young people to dangers such as cyberbullying and strangers. Cyberbullying is very common and it can make victims feel very hurt and isolated. In serious cases, victims suffer long-term emotional harm.

In conclusion, although social media has some benefits, it does more harm than good to young people. Young people should limit their use of social media and parents should monitor their children more closely.`;

const EXAMPLE = {
  analytics: {"words":308,"paragraphs":6,"sentences":22,"avg_sentence":14,"sentence_spread":6,"long_sentences":0,"short_sentences":0,"repeated_opener":null,"vocab_range":82,"academic_words":["affects","benefit","conclusion","benefits"],"academic_count":4,"overused":[],"connectives":{"addition":0,"contrast":2,"cause":1,"example":2,"concession":0,"conclusion":1},"connective_variety":6,"connectives_per_100":1.9,"counter_argument":["however, some","some people may argue"],"evaluation":[],"vague_phrases":["in today's modern world","a lot of","things","many studies have shown","in my opinion"],"local_examples":["singapore"],"specific_evidence":6,"numbers":0,"contractions":0,"passive":0,"rhetorical_questions":0,"topic_sentences_on_question":4,"body_paragraphs":4,"dialogue":0,"sense_words":[],"feeling_words":[],"telling_not_showing":0,"and_then":0,"flags":[{"level":"red","criterion":"Length","text":"308 words: under the 500-word length this paper expects, so content will be thin."},{"level":"red","criterion":"Language","text":"Generic phrases examiners mark down: \"in today's modern world\", \"a lot of\", \"things\", \"many studies have shown\", \"in my opinion\"."},{"level":"green","criterion":"Content","text":"Counter-argument signalled (\"however, some\")."},{"level":"red","criterion":"Content","text":"No weighing language (e.g. \"to a large extent\", \"outweigh\", \"on balance\"). The argument asserts but does not evaluate."},{"level":"amber","criterion":"Content","text":"Mentions Singapore but names no specific local policy, place, event or figure."},{"level":"green","criterion":"Organisation","text":"Varied linking words (6 different connectives)."}]},
  example:true, paper:"gp", question:SAMPLE_Q, essay:SAMPLE,
  total:28, max:50, grade:"C (borderline B)", band:"Mid Band",
  verdict:"A clear, well-organised stand, but the argument asserts more than it proves and dismisses the other side instead of weighing it.",
  criteria:[
    {name:"Content (relevance, argument, evaluation, examples)",score:16,max:30,band:"Middle band",
     comment:"Every paragraph stays on the question and the stand is consistent. The reasoning stops one step short: each point names a harm but never shows how much harm, to whom, or why it outweighs the benefits.",
     strength:"Clear stand in the introduction that the conclusion keeps.",
     descriptor:"A relevant, consistent argument with some development, but evidence stays general and evaluation is limited.",
     evidence:"Many studies have shown that teenagers who use social media more are more unhappy.",
     next_band:"Not yet upper band because the other side is dismissed, not weighed. Weigh it against a clear yardstick and give one checkable example per paragraph."},
    {name:"Language (clarity, range, accuracy, organisation)",score:12,max:20,band:"Middle band",
     comment:"Accurate and easy to follow, with sound paragraphing. The register is plain and repetitive ('young people' appears nine times) and linking is mechanical (Firstly, Secondly, Lastly).",
     strength:"Very few grammatical errors; paragraphs each carry one idea.",
     descriptor:"Clear and mostly accurate expression with sound paragraphing, but a limited range of vocabulary and sentence structures.",
     evidence:"Firstly, social media affects the mental health of young people.",
     next_band:"Not yet upper band because the wording and linking stay plain. Vary your sentence openings and use links that carry the argument, not just Firstly and Secondly."}
  ],
  fixes:[
    {tag:"Generic Evidence", rewrite:"The 2023 US Surgeon General's advisory warned that teenagers on social media for over three hours a day face double the risk of anxiety and depression.", title:"Replace vague evidence with one specific, checkable example",quote:"Many studies have shown that teenagers who use social media more are more unhappy.",
     why:"Examiners reward evidence they can verify. 'Many studies' earns nothing and caps Content in the middle band.",
     try:"Name one source and localise it, e.g. the 2023 US Surgeon General's advisory on social media and youth mental health, then ask whether Singapore's exam culture makes the comparison effect stronger here."},
    {tag:"Unweighed Counter-argument", rewrite:"These benefits are real, but they are replaceable: friendships survive on messaging apps, while the damage to self-esteem is not so easily undone.", title:"Weigh the other side instead of dismissing it",quote:"But this benefit is small compared to the harms.",
     why:"This is the single biggest loss of marks. A one-line dismissal is assertion, not evaluation, and 'How far' questions are marked on the weighing.",
     try:"Concede the benefit properly, then set a yardstick (e.g. 'harm that lasts outweighs convenience that can be replaced') and show why your side wins on it."},
    {tag:"No Yardstick", rewrite:"Whether social media does more harm than good depends on what it costs young people that cannot be recovered: their attention, their self-worth and their safety.", title:"Define the terms and set your yardstick in the introduction",quote:"In today's modern world, social media is everywhere.",
     why:"A generic opener wastes your best real estate. 'More harm than good' needs a measure, or the essay cannot prove a balance.",
     try:"Open with the tension in the question, define 'young people' and 'harm', and state the criterion you will judge by. That is AQ Localisation."}
  ],
  model:{source_quote:"However, some people may argue that social media is good because it lets young people connect with friends and learn new things.",
    rewrite:"Admittedly, social media can be a genuine lifeline. During the Circuit Breaker in 2020, it was often the only space where Singaporean teenagers could keep their friendships alive, and free channels now offer teacher-quality explanations to students whose families cannot afford private help. Yet these benefits are largely substitutable: friendships survive on messaging apps without algorithmic feeds, and the same lessons exist on school learning platforms. The harms are not so easily replaced. A teenager's self-esteem, worn down by years of comparison, cannot simply be switched back on. Weighed by what can and cannot be recovered, the balance still tilts towards harm.",
    why:"It concedes with a specific local example, introduces a clear yardstick (what is replaceable), and turns the counter-argument into proof of the stand. That is Macro-Argumentation in one paragraph."},
  note:"You already have the hardest habit in GP: a clear stand you hold from start to finish. Now make the examiner believe it. Your harms are real but unproven, and your counter-argument gets one line when it deserves a full paragraph of weighing. This week, rewrite paragraph four using the model, then add one named, checkable example to each body paragraph. Do that and you are writing at B level.",
  next_target:"Content 20/30 next essay: one specific example per paragraph and a weighed counter-argument."
};

const $ = s => document.querySelector(s);
const tcase = s => String(s ?? "").replace(/[A-Za-z][A-Za-z'’]*/g, (w, i) => (i && /^(and|or|of|the|a|an|in|on|for|to|vs|by|with|at|per|as)$/.test(w)) ? w : w[0].toUpperCase() + w.slice(1));  // criterion names in Title Case
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let remarkOf = null, paperId = "gp", photo = null, ctl = null, last = EXAMPLE;

// Explaining each criterion mark: evidence from the essay, the band descriptor and what the next band needs.
// Evidence is shown as the student's own words, so it is kept only if it really appears in the essay.
const normQ = s => String(s || "").replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\s+/g, " ").trim();
function evidenceIn(q, essay){
  const t = String(q || "").trim().replace(/^["\u201C]+|["\u201D]+$/g, "").trim(), n = normQ(t);
  if(n.length < 6) return "";
  return essay == null || normQ(essay).includes(n) ? t : "";  // no essay kept (detailed reports): the server already checked it
}
const nextBandOf = c => String(c.next_band || c.nextBand || "").trim();
function whyMark(c, essay, lite){
  const ev = evidenceIn(c.evidence, essay), nb = nextBandOf(c), top = +c.max > 0 && +c.score >= +c.max, rows = [];
  if(ev) rows.push(["", "Evidence from your essay", `<q>${esc(ev)}</q>`]);
  if(!lite && c.descriptor) rows.push(["", "What this band means", esc(c.descriptor)]);
  if(nb) rows.push(["wm-next", top ? "Staying in the top band" : "To reach the next band", esc(nb)]);
  return rows.length ? `<dl class="why-mark">${rows.map(([k, t, v]) => `<div${k ? ` class="${k}"` : ""}><dt>${t}</dt><dd>${v}</dd></div>`).join("")}</dl>` : "";
}
{ const st = document.createElement("style");
  st.textContent = ".why-mark{margin:2px 0 4px;display:grid;gap:8px;font-size:14px;line-height:1.5}.why-mark>div{border-left:3px solid var(--rule);padding:1px 0 1px 10px;min-width:0}.why-mark>div.wm-next{border-left-color:var(--pen)}.why-mark dt{font-weight:700;font-size:12.5px;letter-spacing:.03em;color:var(--ink-soft)}.why-mark dd{margin:2px 0 0;overflow-wrap:anywhere}.why-mark q{font-style:italic}.rep-crit .why-mark{margin:6px 0}";
  document.head.append(st); }

function store(k, v){ try{ v === undefined ? (v = localStorage.getItem(k)) : localStorage.setItem(k, v); return v; }catch{ return null; } }

let unlocked = false, uid = "", ref = "", left = 1, refs = 0, invited = 0, earned = 0, passUntilTs = 0;
try{
  unlocked = !!localStorage.getItem("ec_code");
  uid = localStorage.getItem("ec_uid") || "";
  if(!uid){ uid = Array.from(crypto.getRandomValues(new Uint8Array(9)), b => (b % 36).toString(36)).join("") + Date.now().toString(36); localStorage.setItem("ec_uid", uid); }
  const r = new URLSearchParams(location.search).get("ref");
  if(r && r !== uid && !localStorage.getItem("ec_ref")) localStorage.setItem("ec_ref", r);
  ref = localStorage.getItem("ec_ref") || "";
}catch{}
const myCode = () => { try{ return localStorage.getItem("ec_code") || ""; }catch{ return ""; } };
// Funnel: each stage the browser alone can see is reported once per device (one small request, one KV write).
const fnSent = (() => { try{ const a = JSON.parse(localStorage.getItem("ec_fn") || "[]"); return Array.isArray(a) ? a : []; }catch{ return []; } })();
const fnMark = s => { if(!fnSent.includes(s)){ fnSent.push(s); store("ec_fn", JSON.stringify(fnSent)); } };
function fnOnce(s){ if(fnSent.includes(s)) return; fnMark(s); fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({fn: s, uid})}).catch(() => {}); }
const isLead = () => store("ec_lead") === "1";
// Share links carry a random referral code from the server, never the uid (the uid is this device's private account id).
const refQ = (pre) => { const c = store("ec_refcode"); return c && /^[a-z0-9]{8,32}$/.test(c) ? pre + "ref=" + c : ""; };
const SITE_URL = "https://essaylab-sg.vercel.app";  // links people share always point at the main domain
const shareLink = () => SITE_URL + "/" + refQ("?");
async function refreshStatus(){
  const r = await fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({status:true, uid, ref, code: myCode(), fv: !fnSent.includes("visit") || undefined, ld: isLead() || store("ec_msg") === "1" || undefined})}).then(x => x.json()).catch(() => null);
  if(r) fnMark("visit");
  if(r && typeof r.left === "number"){ left = r.left; if(r.unlocked) unlocked = true; passUntilTs = r.until || 0; invited = r.invited || 0; earned = r.earned || 0; if(r.refcode) store("ec_refcode", r.refcode); renderInvites(); }
  updFree();
}
// Subscribe: Stripe Checkout for the monthly plan (created by the server) when Stripe is on, otherwise a request through the on-site message form.
let stripeOn = false;
fetch("/api/mark").then(x => x.json()).then(j => { stripeOn = !!j.stripe; updPassLink(); }).catch(() => {});
function passRequestHref(){
  const p = PAPERS.find(x => x.id === paperId);
  return "/api/wa?text=" + encodeURIComponent(`Hi, I'd like to subscribe to Detailed feedback (S$39 a month)${p ? " for " + p.name : ""}. Please send me the payment details.`);
}
function updPassLink(){
  const a = $("#subLink"); if(!a) return;
  let su = ""; try{ su = SUBSCRIBE_URL; }catch{}
  if(su || stripeOn){
    a.href = su ? su + (su.includes("?") ? "&" : "?") + "client_reference_id=" + encodeURIComponent(ref) : "#pay";
    a.textContent = "Subscribe by card: S$39 for 4 reports"; $("#passNote").hidden = true; $("#passPayHint").hidden = false; return;
  }
  a.href = passRequestHref();
  a.textContent = "Ask to subscribe"; $("#passNote").hidden = false; $("#passPayHint").hidden = true;
}
document.addEventListener("click", e => { if(e.target.closest("#passBuy, [data-passbuy]")){ e.preventDefault(); $("#subLink").click(); } });
document.addEventListener("keydown", e => { if((e.key === "Enter" || e.key === " ") && e.target.matches("[data-passbuy]")){ e.preventDefault(); e.stopPropagation(); $("#subLink").click(); } }, true);
$("#subLink").addEventListener("click", async e => {
  const a = e.currentTarget; if(a.getAttribute("href") !== "#pay") return;
  e.preventDefault(); a.textContent = "Opening secure payment…";
  const r = await fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({checkout: true, uid, ref})}).then(x => x.json()).catch(() => ({}));
  if(r.url){ location.href = r.url; return; }
  stripeOn = false; updPassLink(); a.click();  // payments unavailable: fall back to a pass request message
});
function showUnlock(why){ $("#unlockWhy").textContent = why; updPassLink(); $("#unlockBox").hidden = false; }
function updFree(){
  $("#freeLeft").textContent = unlocked ? "Unlimited marking is on for this device."
    : left > 3 ? `${left} free markings left` : left > 0 ? `${left} of 3 free markings left` : "No free markings left";
}
// Paper picker is grouped by level; the hero level pills filter it. "first" is the paper a pill pre-selects.
const LEVELS = [
  {id:"psle", label:"PSLE English", papers:["psle","pslesw"], first:"psle"},
  {id:"ol", label:"O-Level English", papers:["olang","olsw"], first:"olang"},
  {id:"gp", label:"A-Level GP", papers:["gp","gpaq"], first:"gp"},
  {id:"more", label:"More subjects", papers:["olit","ss","hist","geog","ib1","ib2","igcse"], first:"olit"},
];
let levelFilter = "all";
const levelOf = id => (LEVELS.find(l => l.papers.includes(id)) || {id:"other"}).id;
function renderPapers(){
  $("#marksRow").hidden = !(PAPERS.find(x => x.id === paperId) || {}).lorms;
  levelFilter = levelOf(paperId);
  const opt = p => `<button type="button" class="paper-opt${!p.free && !unlocked ? " locked" : ""}" data-id="${p.id}" aria-pressed="${p.id===paperId}"><b>${esc(p.name)}</b><small>${esc(p.sub)}</small></button>`;
  const groups = LEVELS.map(l => ({id: l.id, label: l.label, items: PAPERS.filter(p => levelOf(p.id) === l.id)}));
  groups.push({id:"other", label:"Other", items: PAPERS.filter(p => levelOf(p.id) === "other")});
  $("#papers").innerHTML = groups.filter(g => g.items.length).map(g => `<div class="pgroup" data-level="${g.id}"${levelFilter !== "all" && g.id !== levelFilter ? " hidden" : ""}>
    <span class="plevel" id="pl-${g.id}">${esc(g.label)}</span><div class="pgrid" role="group" aria-labelledby="pl-${g.id}">${g.items.map(opt).join("")}</div></div>`).join("")
    + (levelFilter !== "all" ? `<button type="button" class="pshowall" data-showall>Show all levels</button>` : "");
  document.querySelectorAll("#lvlTabs [data-level]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.level === levelFilter)));
  // The visible picker: level tabs plus a dropdown of that level's papers.
  const cur = PAPERS.find(x => x.id === paperId) || PAPERS[0];
  $("#paperSel").innerHTML = PAPERS.filter(p => levelOf(p.id) === levelFilter).map(p => `<option value="${p.id}"${p.id === paperId ? " selected" : ""}>${esc(p.name)} · ${esc(p.sub)}${!p.free && !unlocked ? " 🔒" : ""}</option>`).join("");
  $("#lockHint").hidden = !!(cur.free || unlocked);
  if(!remarkOf) $("#markBtn").textContent = markLabel();
  updPassLink();
}
$("#lvlTabs").addEventListener("click", e => {
  const b = e.target.closest("[data-level]"); if(!b) return;
  levelFilter = b.dataset.level;
  const L = LEVELS.find(l => l.id === levelFilter);
  if(L){ paperId = L.first; store("ec_paper", paperId); $("#unlockBox").hidden = true; }
  renderPapers();
});
$("#paperSel").addEventListener("change", e => { paperId = e.target.value; store("ec_paper", paperId); $("#unlockBox").hidden = true; renderPapers(); });
$("#papers").addEventListener("click", e => {
  if(e.target.closest("[data-showall]")){ levelFilter = "all"; renderPapers(); const sel = $("#papers .paper-opt[aria-pressed=true]"); if(sel) sel.focus(); return; }
  const b = e.target.closest(".paper-opt"); if(!b) return;
  paperId = b.dataset.id; store("ec_paper", paperId); renderPapers();
  $("#unlockBox").hidden = true;
});
function words(t){ return (t.trim().match(/\S+/g) || []).length; }
function updCount(){ $("#count").textContent = words($("#essay").value) + " words"; store("ec_draft", $("#essay").value); }
$("#essay").addEventListener("input", updCount);
$("#loadSample").addEventListener("click", () => { paperId="gp"; renderPapers(); $("#question").value = SAMPLE_Q; $("#essay").value = SAMPLE; updCount(); });

$("#photo").addEventListener("change", () => {
  photo = $("#photo").files[0] || null;
  const img = $("#photoPrev");
  if(photo){ img.src = URL.createObjectURL(photo); img.hidden = false; $("#photoHint").textContent = photo.name + " ready. We'll read the handwriting first."; }
  else { img.hidden = true; }
});

function notice(msg){ const n = $("#notice"); n.textContent = msg || ""; n.hidden = !msg; }
function setStage(k){
  const order = ["up","mark","done"]; const i = order.indexOf(k);
  document.querySelectorAll("#progress li").forEach((li, j) => { li.className = j < i ? "done" : j === i ? "on" : ""; });
}

$("#markBtn").addEventListener("click", async () => {
  const essay = $("#essay").value.trim(), question = $("#question").value.trim();
  const cur = PAPERS.find(x => x.id === paperId);
  if(!unlocked && left <= 0 && !(remarkOf && remarkOf.token)){ showUnlock("You've used your 3 free instant markings. Get 4 detailed reports for S$39, or share with 7 people to get a detailed report free."); return; }
  if(!photo && words(essay) < 80){ notice("Paste at least a full paragraph (80+ words), or upload a photo of the script."); return; }
  notice(""); $("#markBtn").disabled = true; $("#stopBtn").hidden = false; $("#progress").hidden = false;
  ctl = new AbortController();
  setStage("up"); const tick = null;  // real steps: Uploading while the essay is prepared and sent, Marking while we wait, Done on results
  try{
    const image = photo ? await shrink(photo) : null;
    setStage("mark");
    const res = await fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, signal: ctl.signal,
      body: JSON.stringify({code: myCode(), teach: !!document.getElementById("teachOk")?.checked, uid, ref, lead_email: (() => { try { return localStorage.getItem("ec_email") || undefined; } catch { return undefined; } })(), remark_token: remarkOf ? remarkOf.token : undefined, prev: remarkOf ? remarkOf.prev : undefined, paper: paperId, marks: +$("#marks").value || 10, question, essay: photo ? "" : essay, image, ...chPayload()})});
    const r = await res.json().catch(() => ({error:"bad_response"}));
    if(r.error === "weekly" || r.error === "freeused" || r.error === "ipweekly"){ left = 0; updFree(); showUnlock("You've used your 3 free instant markings. Get 4 detailed reports for S$39, or share with 7 people to get a detailed report free.");  return; }
    if(!res.ok || r.error) throw {code: r.error || "server", message: r.message};
    if(!unlocked && typeof r.left === "number"){ left = r.left; updFree(); }
    if(false){ left = typeof r.left === "number" ? r.left : Math.max(0, left - 1); updFree(); }
    if(remarkOf){ r.prev = remarkOf.prev; remarkOf = null; $("#markBtn").textContent = markLabel(); }
    r.paper = paperId; r.question = question; r.essay = (r.transcript && r.transcript.trim()) || essay;
    if(timer.end){ r.timedMin = Math.round((Date.now() - timer.start) / 60000); r.timedOf = timer.min; stopTimer(); }
    last = r; try{ localStorage.setItem("ec_last", JSON.stringify(r)); }catch{}
    setStage("done"); addHist(r); render(r); renderHist(); if(r.challenge) loadCh();
    $("#result").scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"start"});
  }catch(e){
    if(e && e.code === "locked" && !unlocked) showUnlock("Free instant marking doesn't cover this paper. Subscribe to Detailed feedback to have it marked.");
    if(e && e.name === "AbortError"){ notice(""); }
    else notice({busy:"Lots of students are marking right now. Please try again in a few minutes.",
      too_long:"That essay is too long for the free marker. Paste up to about 2,000 words.",
      image:"That photo couldn't be read. Try a clearer photo taken flat in good light.",
      full:"Free marking is full for this month. It reopens on the 1st. Tap Message us at the bottom of the page and we'll let you know when it reopens.",
      ipweekly:"Several people on this network have already used their free essay this week. Try on mobile data, or come back on Monday.",
      needemail:"Your next free markings need an email. Please mark this essay from the box on the home page.",
      freeused:"You've used your 3 free instant markings. Get 4 detailed reports for S$39, or share with 7 people to get a detailed report free.",
      weekly:"You've used your 3 free instant markings. Share with 7 people to get a detailed report free, or subscribe to Detailed feedback.",
      locked:"Free instant marking covers PSLE English, O-Level English and A-Level GP. For other papers, choose Detailed feedback.",
      rate:"You've marked a few essays already. Please try again in an hour, or tap Message us below."}[e && e.code]
      || "Something went wrong. Please try again, or message us on WhatsApp.");
  }finally{
    clearInterval(tick); $("#markBtn").disabled = false; $("#stopBtn").hidden = true; $("#progress").hidden = true;
  }
});

async function shrink(file){
  const url = URL.createObjectURL(file);
  try{
    const img = await new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
    const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth*k); c.height = Math.round(img.naturalHeight*k);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.82).split(",")[1];
  }catch{ throw {code:"image"}; }
  finally{ URL.revokeObjectURL(url); }
}
$("#stopBtn").addEventListener("click", () => ctl && ctl.abort());

function annotate(essay, fixes){
  const norm = s => s.replace(/\s+/g," ").trim();
  let ranges = [];
  (fixes || []).forEach((f, i) => {
    const q = norm(f.quote || ""); if(q.length < 6) return;
    let at = essay.indexOf(q);
    if(at < 0){ const short = q.slice(0, Math.min(60, q.length)); at = essay.indexOf(short); if(at >= 0) ranges.push([at, at+short.length, i+1]); }
    else ranges.push([at, at+q.length, i+1]);
  });
  ranges.sort((a,b) => a[0]-b[0]);
  let out = "", pos = 0;
  for(const [s,e,n] of ranges){ if(s < pos) continue; out += esc(essay.slice(pos,s)) + `<mark>${esc(essay.slice(s,e))}</mark><sup>${n}</sup>`; pos = e; }
  return out + esc(essay.slice(pos));
}

// Examiner analytics: what our engine measured in the text before the model marked it.
function anlHTML(a, p){
  if(!a || !a.words) return "";
  const narrative = p.id === "psle" || (a.dialogue >= 2 && !a.counter_argument.length);
  const tile = (v, l, s) => `<div class="anl-t ${s || ""}"><b>${v}</b><span>${l}</span></div>`;
  const yes = (arr) => arr && arr.length ? "ok" : "bad";
  const tiles = [tile(a.words, "words"), tile(a.sentence_spread, "sentence-length spread", a.sentence_spread >= 7 ? "ok" : a.sentence_spread < 4 ? "warn" : ""),
    tile(a.vocab_range + "<small>/100</small>", "vocabulary range", a.vocab_range >= 86 ? "ok" : a.vocab_range < 72 ? "warn" : ""),
    tile(a.connective_variety, "different linking words", a.connective_variety >= 6 ? "ok" : a.connective_variety <= 2 ? "warn" : "")]
    .concat(narrative ? [tile(a.dialogue, "lines of dialogue", a.dialogue ? "ok" : ""), tile(a.sense_words.length, "sense details", a.sense_words.length >= 3 ? "ok" : "warn"),
      tile(a.telling_not_showing, "feelings told, not shown", a.telling_not_showing ? "warn" : "ok"), tile(a.and_then, "uses of “then”", a.and_then >= 4 ? "warn" : "")]
    : [tile(a.counter_argument.length ? "Yes" : "No", "counter-argument", yes(a.counter_argument)), tile(a.evaluation.length ? "Yes" : "No", "weighing language", yes(a.evaluation)),
      tile(a.specific_evidence, "specific facts &amp; names", a.specific_evidence >= Math.max(3, a.body_paragraphs) ? "ok" : "warn"), tile(a.vague_phrases.length, "generic phrases", a.vague_phrases.length ? "bad" : "ok")]).join("");
  const C = a.connectives || {}, mx = Math.max(1, ...Object.values(C));
  const mix = Object.entries(C).map(([k, v]) => `<div class="anl-bar"><span>${esc(k)}</span><i><u style="width:${Math.round(v / mx * 100)}%"></u></i><b>${esc(v)}</b></div>`).join("");
  const order = {red: 0, amber: 1, green: 2};
  const fl = (a.flags || []).slice().sort((x, y) => order[x.level] - order[y.level]).map(f => `<li class="anl-f ${esc(f.level)}"><em>${esc(f.criterion)}</em>${esc(f.text)}</li>`).join("");
  return `<div class="sheet anl" style="margin-top:20px"><div class="sheet-inner">
    <div class="sec-title"><h2>Writing analytics</h2><span class="hint" style="color:var(--ink-soft);font-size:13px">Measured from your essay before marking</span></div>
    <div class="anl-grid">${tiles}</div>
    <div class="anl-cols"><div><span class="anl-lbl">What we found</span><ul class="anl-list">${fl}</ul></div>
    <div><span class="anl-lbl">Linking words by job</span><div class="anl-mix">${mix}</div>
    ${a.academic_words && a.academic_words.length ? `<span class="anl-lbl" style="margin-top:14px">Academic words used</span><div class="anl-words">${a.academic_words.map(w => `<span>${esc(w)}</span>`).join("")}</div>` : ""}</div></div>
  </div></div>`;
}
// "How was your marking?": stars and a short comment under every report. Saved as Pending and Off in ?admin → Testimonials;
// only comments with the consent box ticked can be switched On, and nothing is published automatically.
const fbKey = r => r.id ? "d" + r.id : "i" + r.total + "|" + String(r.verdict || "").slice(0, 40);
const fbSent = k => { try{ return JSON.parse(localStorage.getItem("el_fb") || "[]").includes(k); }catch{ return false; } };
function fbHTML(r){
  const k = fbKey(r); if(fbSent(k)) return "";
  const inp = "border:1.5px solid #D6D3CE;border-radius:10px;background:#fff;color:#111;padding:10px 12px;font:inherit;min-width:0";
  return `<form class="fb rv" data-fb="${esc(k)}" data-paper="${esc(r.paper || "")}" style="display:flex;flex-direction:column;gap:10px;margin-top:20px;padding:16px;border:1px solid #ECEAE7;border-radius:16px;background:#fff;color:#111">
    <b style="font-size:17px">How was your marking?</b>
    <div class="rv-stars" role="radiogroup" aria-label="Your rating">${[1, 2, 3, 4, 5].map(n => `<button type="button" role="radio" aria-checked="false" data-star="${n}" aria-label="${n} star${n > 1 ? "s" : ""}">★</button>`).join("")}</div>
    <textarea name="t" rows="2" maxlength="300" aria-label="Your comment" placeholder="A short comment (optional, up to 300 characters)" style="${inp};resize:vertical"></textarea>
    <div style="display:flex;flex-wrap:wrap;gap:8px">
      <input type="text" name="n" maxlength="30" aria-label="First name (optional)" placeholder="First name (optional)" style="${inp};flex:1 1 140px">
      <input type="text" name="lv" maxlength="20" aria-label="Level (optional)" placeholder="Level, e.g. Sec 3 (optional)" style="${inp};flex:1 1 140px">
    </div>
    <label style="display:flex;gap:8px;align-items:flex-start;font-size:14px;color:#3B3B3B"><input type="checkbox" name="ok" style="margin-top:3px"> You may show my comment on the EssayLabsg™ site (first name and level only)</label>
    <p style="margin:0;font-size:13px;color:#6B6660">If you're under 18, please ask a parent first.</p>
    <div class="row"><button class="btn primary" type="submit">Send</button></div></form>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest(".rv-stars [data-star]"); if(!b) return;
  const n = +b.dataset.star; b.parentElement.querySelectorAll("[data-star]").forEach(x => { const on = +x.dataset.star <= n; x.classList.toggle("on", on); x.setAttribute("aria-checked", String(+x.dataset.star === n)); });
  b.closest("form").dataset.stars = n;
});
document.addEventListener("submit", async e => {
  const f = e.target.closest && e.target.closest("form.rv"); if(!f) return;
  e.preventDefault();
  const el = f.elements, stars = +f.dataset.stars || 0, t = el.t.value.trim();
  if(!stars && !t){ toast("Tap a star or write a short comment first."); return; }
  const btn = f.querySelector("button[type=submit]"); btn.disabled = true;
  try{
    const r = await fetch("/api/mark", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({review: true, uid, stars, comment: t, name: el.n.value.trim(), level: el.lv.value.trim(), consent: el.ok.checked, paper: f.dataset.paper})}).then(x => x.json());
    if(!r.ok) throw r.error || 0;
    try{ const a = JSON.parse(localStorage.getItem("el_fb") || "[]"); a.push(f.dataset.fb); localStorage.setItem("el_fb", JSON.stringify(a.slice(-50))); }catch{}
    f.outerHTML = `<p style="margin-top:20px;padding:16px;border:1px solid #ECEAE7;border-radius:16px;background:#fff;color:#111"><b>Thank you!</b> Your feedback helps us make EssayLabsg™ better.</p>`;
  }catch(err){ btn.disabled = false; toast(err === "rate" ? "Thanks, you've sent a few already. Please try again later." : "That didn't send. Please try again in a minute."); }
});
// Share EssayLabsg™: one-tap buttons after each result and in the footer. Links carry the referral code (shareLink).
const SHARE_WRITE = "Get your essay marked like the real exam, free. EssayLabsg™ by Thinking Hack™ marks PSLE, O-Level, GP, IB and IGCSE essays against the official criteria in minutes. Built by our Exam Preparation Specialists™. Try it:";
const SB_ICON = {ms: "M12 3C7 3 3 6.7 3 11.3c0 2.6 1.3 4.9 3.4 6.4V21l3.1-1.7c.8.2 1.6.3 2.5.3 5 0 9-3.7 9-8.3S17 3 12 3zM7 13l3.5-3.7 2 2 3.5-3.7", story: "M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM12 9v6M9 12h6", wa: "M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z", tg: "M21 4 3 11l5 2 2 6 3-4 5 4z", fb: "M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v7h4v-7h3l1-4h-4V8z", x: "M4 4l16 16M20 4 4 20", li: "M5 9h3v11H5zM6.5 4a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zM10 9h3v1.6c.5-1 1.8-1.8 3.4-1.8 3 0 3.6 2 3.6 4.6V20h-3v-5.6c0-1.4-.3-2.6-1.8-2.6s-2.2 1.1-2.2 2.6V20h-3z", copy: "M8 8h11v11H8zM5 5h11v2H7v9H5z", native: "M12 3v12M7 8l5-5 5 5M5 14v6h14v-6"};
// waOnly: after a free result the share stays WhatsApp only (it's the share-with-7 referral).
function shareBlockHTML(waOnly){
  const pill = (k, label) => `<button type="button" class="sb-btn${k === "wa" ? " sb-main" : ""}" data-sb="${k}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${SB_ICON[k]}"/></svg>${label}</button>`;
  if(waOnly) return `<div class="sb"><b class="sb-h">Share with 7 people. Get a free detailed report.</b>${shareProgHTML()}<div class="sb-row">${pill("wa", "Share on WhatsApp")}</div></div>`;
  return `<div class="sb"><b class="sb-h">Share EssayLabsg™</b><div class="sb-row">${pill("wa", "WhatsApp")}${pill("tg", "Telegram")}${pill("ms", "Messenger")}${pill("fb", "Facebook")}${pill("x", "X")}${pill("li", "LinkedIn")}${pill("story", "Instagram / TikTok Story")}${pill("copy", "Copy link and text")}${navigator.share ? pill("native", "More") : ""}</div></div>`;
}
// A 1080x1920 story image in the brand style (with the score when shown after a result), downloaded for Instagram or TikTok.
function storyImage(r){
  const W = 1080, H = 1920, c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
  g.fillStyle = BRAND.sheet; g.fillRect(0, 0, W, H);
  drawBrand(g, W / 2, 260, 72, BRAND.ink, "center", true);
  g.textAlign = "center"; g.fillStyle = "#000"; g.font = `300 108px ${DISPLAY}`; g.fillText("Essays, marked", W / 2, 640); g.fillText("like the real exam", W / 2, 770);
  g.strokeStyle = BRAND.pen; g.lineWidth = 7; g.lineCap = "round"; g.beginPath(); g.moveTo(W / 2 - 20, 668); g.bezierCurveTo(W / 2 + 120, 650, W / 2 + 260, 652, W / 2 + 330, 662); g.stroke();
  if(r && r.total != null && r.max){ g.fillStyle = BRAND.purple; g.beginPath(); g.roundRect(190, 900, 700, 420, 48); g.fill(); g.fillStyle = "#FFFFFF"; g.beginPath(); g.roundRect(240, 950, 600, 320, 32); g.fill();
    g.fillStyle = BRAND.pen; g.font = `700 220px ${HAND}`; g.fillText(`${r.total}/${r.max}`, W / 2, 1170); g.fillStyle = BRAND.ink; fitText(g, paperName(r.paper), W / 2, 1240, 520, 40); }
  else { g.fillStyle = BRAND.ink; g.font = `400 48px ${SANS}`; wrap(g, "PSLE, O-Level, A-Level GP, IB and IGCSE, against the official criteria, in minutes.", W / 2, 1000, 820, 66, 3); }
  signHand(g, W / 2, 1480, "center", 52);
  pill(g, 240, 1560, 600, 110, "Mark yours free", 48);
  g.textAlign = "center"; g.fillStyle = BRAND.soft; fitText(g, PRINT_HOST, W / 2, 1745, 900, 40);
  signOff(g, W, 1860, BRAND.soft);
  return c;
}
document.addEventListener("click", async e => {
  const b = e.target.closest && e.target.closest("[data-sb]"); if(!b) return;
  const link = shareLink(), t = SHARE_WRITE, E = encodeURIComponent;
  const urls = {wa: "https://wa.me/?text=" + E(t + " " + link), tg: "https://t.me/share/url?url=" + E(link) + "&text=" + E(t), fb: "https://www.facebook.com/sharer/sharer.php?u=" + E(link), x: "https://twitter.com/intent/tweet?text=" + E(t) + "&url=" + E(link), li: "https://www.linkedin.com/sharing/share-offsite/?url=" + E(link)};
  if(urls[b.dataset.sb]){ window.open(urls[b.dataset.sb], "_blank", "noopener"); return; }
  if(b.dataset.sb === "ms"){ if(matchMedia("(pointer: coarse)").matches){ location.href = "fb-messenger://share?link=" + E(link); return; } try{ await navigator.clipboard.writeText(t + " " + link); toast("Link copied. Paste it into a Messenger chat."); }catch{ toast("Your link: " + link); } return; }
  if(b.dataset.sb === "story"){ await loadFonts(); const c = storyImage(typeof last === "object" && last && !last.example ? last : null);
    const blob = await new Promise(res => c.toBlob(res, "image/png")); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "essaylab-story.png"; document.body.append(a); a.click(); a.remove();
    try{ await navigator.clipboard.writeText(t + " " + link); }catch{} toast("Story image saved and text copied. Paste the link as a link sticker."); return; }
  if(b.dataset.sb === "copy"){ try{ await navigator.clipboard.writeText(t + " " + link); toast("Copied. Paste it into your bio, story or chat."); }catch{ toast("Your link: " + link); } return; }
  if(b.dataset.sb === "native"){ try{ await navigator.share({title: "EssayLabsg™ by Thinking Hack™", text: t, url: link}); }catch{} }
});
document.querySelectorAll("[data-share-slot]").forEach(el => { el.innerHTML = shareBlockHTML(); });
// Email capture for tips, class dates, the checklist and notes. It never gates a result; the consent box is never pre-ticked.
const EC_V = "v1-2026-10-31", NOTES_LINK = "";  // NOTES_LINK: point at the Thinking Hack™ notes site once it exists
const EC_TXT = "Also send me exam tips and offers from EssayLabsg™ and Thinking Hack™ (about once a week). Unsubscribe any time.";
function emailCapHTML(source, heading, btn){
  const tap = (name, vals) => `<div class="ec-tap" data-name="${name}">${vals.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="false">${l}</button>`).join("")}</div>`;
  return `<form class="ecap" data-source="${source}"><b class="ecap-h">${heading}</b>
    <div class="ecap-row"><span>This is for</span>${tap("role", [["parent", "Parent"], ["student", "Student"]])}</div>
    <div class="ecap-row"><span>Level</span>${tap("level", [["psle", "PSLE"], ["olevel", "O-Level"], ["gp", "A-Level GP"], ["ib", "IB"], ["igcse", "IGCSE"]])}</div>
    <div class="ecap-in"><input type="email" name="email" autocomplete="email" required placeholder="Your email" aria-label="Your email"><button class="btn primary" type="submit">${btn}</button></div>
    <label class="ecap-c"><input type="checkbox" name="mc"> <span class="ecap-ct">${EC_TXT}</span> <a href="/privacy.html">Privacy</a></label>
    <p class="ecap-hint" hidden>Or use a parent's email.</p></form>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest(".ec-tap button"); if(!b) return;
  b.parentElement.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
  const f = b.closest("form.ecap"), on = n => (f.querySelector(`[data-name="${n}"] [aria-pressed="true"]`) || {dataset: {}}).dataset.v;
  const kid = on("role") === "student" && on("level") === "psle";
  f.querySelector(".ecap-ct").textContent = kid ? "My parent says it's OK to get tips and offers from EssayLabsg™ and Thinking Hack™." : EC_TXT;
  f.querySelector(".ecap-hint").hidden = !kid;
  const psle = on("level") === "psle"; f.elements.email.placeholder = psle ? "Parent's email" : "Your email"; f.elements.email.setAttribute("aria-label", psle ? "Parent's email" : "Your email");
  f.querySelector(".ecap-hint").hidden = !psle; f.querySelector(".ecap-hint").textContent = "For PSLE, please use a parent's email.";
});
document.addEventListener("submit", async e => {
  const f = e.target.closest && e.target.closest("form.ecap"); if(!f) return; e.preventDefault();
  const on = n => (f.querySelector(`[data-name="${n}"] [aria-pressed="true"]`) || {dataset: {}}).dataset.v || "";
  const btn = f.querySelector("button[type=submit]"); btn.disabled = true;
  try{
    const r = await fetch("/api/subscribe", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({email: f.elements.email.value, role: on("role"), level: on("level"), marketing_consent: f.elements.mc.checked, consent_text_version: EC_V, source: f.dataset.source, page: location.pathname})}).then(x => x.json());
    if(!r.ok) throw r.error || "x";
    const CL = [["PSLE Composition", "psle-composition"], ["O-Level English writing", "o-level-english"], ["A-Level GP Paper 1", "gp-paper-1"]];
    f.outerHTML = f.dataset.source === "checklist"
      ? `<div class="ecap-done"><b>Thanks, you're on the list. Your checklists:</b><div class="ecap-dl">${CL.map(([n, s]) => `<a href="/checklists/essaylab-checklist-${s}.pdf" download>${n} (PDF)</a>`).join("")}</div></div>`
      : `<p class="ecap-done"><b>Thanks, you're on the list.</b> We'll be in touch at that email.</p>`;
  }catch(err){ btn.disabled = false; toast(err === "email" ? "Please check your email address." : "That didn't save. Please try again in a minute."); }
});
document.querySelectorAll("[data-cap]").forEach(el => { const [s, h, b] = el.dataset.cap.split("|"); el.innerHTML = emailCapHTML(s, h, b); });
// Before paying: the refund terms sit right above the pay buttons, and the buttons stay off until the box is ticked.
const PAY_TERMS = 'No refunds, including for unused reports, except if we don\'t mark an essay you paid for. If a detailed report isn\'t delivered within 48 hours, we\'ll re-mark it free; if we still can\'t mark it, we\'ll refund that report. Monthly plan: Card, Apple Pay or Google Pay (renews monthly at S$39 until you cancel; cancel any time and keep access until the end of the paid month). 31-day pass: PayNow, GrabPay, Card or Google Pay (one-off, no renewal). <a href="/terms.html#refunds">Terms</a> · <a href="/privacy.html">Privacy</a>';
let payAgreed = false;
function payGate(){
  document.querySelectorAll("button[data-passbuy], button[data-paynow], #passBuy").forEach(b => {
    const row = b.closest(".row, .offer-row, .offer-cta, div") || b.parentElement;
    if(row && !row.previousElementSibling?.classList?.contains("pay-agree") && !row.querySelector(".pay-agree")){
      row.insertAdjacentHTML("beforebegin", `<div class="pay-agree" style="margin:10px 0;color:#111"><p style="margin:0 0 8px;font-size:16px;line-height:1.55">${PAY_TERMS}</p><label style="display:flex;gap:8px;align-items:flex-start;font-size:15px"><input type="checkbox" class="pay-ok"${payAgreed ? " checked" : ""} style="margin-top:4px"> I agree to the Terms, including the no-refund policy.</label></div>`);
    }
    b.disabled = !payAgreed; b.setAttribute("aria-disabled", String(!payAgreed)); b.style.opacity = payAgreed ? "" : ".5";
  });
}
document.addEventListener("change", e => { if(e.target.classList && e.target.classList.contains("pay-ok")){ payAgreed = e.target.checked; document.querySelectorAll(".pay-ok").forEach(x => x.checked = payAgreed); payGate(); } });
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-passbuy], [data-paynow], #passBuy");
  if(b && !payAgreed){ e.preventDefault(); e.stopImmediatePropagation(); const box = document.querySelector(".pay-agree"); if(box) box.scrollIntoView({behavior: "smooth", block: "center"}); toast("Please tick the box to agree to the Terms first."); } }, true);
new MutationObserver(() => payGate()).observe(document.documentElement, {childList: true, subtree: true});
payGate();
function markLabel(){ const c = PAPERS.find(x => x.id === paperId) || PAPERS[0]; return c.free && !unlocked ? "Mark my essay" : "Mark my essay"; }
function render(r){
  const lite = !unlocked && !r.example;
  const p = PAPERS.find(x => x.id === r.paper) || PAPERS[0];
  const pct = Math.max(0, Math.min(1, (+r.total || 0) / (+r.max || 1)));
  const C = 2*Math.PI*50;
  $("#result").innerHTML = `
  <div class="sheet"><div class="sheet-inner">
    ${r.example ? `<span class="result-tag">Example: a JC1 GP essay, marked</span>` : `<span class="result-tag">Marked · ${esc(p.name)}</span>`}
    <div class="scorehead">
      <div class="ring" role="img" aria-label="Score ${esc(r.total)} out of ${esc(r.max)}">
        <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="var(--rule)" stroke-width="9"/>
        <circle cx="60" cy="60" r="50" fill="none" stroke="var(--pen)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(C*pct).toFixed(1)} ${C.toFixed(1)}"/></svg>
        <div class="num"><b>${esc(r.total)}</b><small>${r.prev ? `was ${esc(r.prev.total)} · ` : ""}/ ${esc(r.max)}</small></div>
      </div>
      <div style="min-width:0">
        <div class="grade">${r.prev ? `<span class="chip" style="background:var(--good-soft);color:var(--good)">${(r.total - r.prev.total) >= 0 ? "+" : ""}${esc(r.total - r.prev.total)} marks after rewrite</span>` : ""}<span class="chip">Est. ${esc(r.grade)}</span>${r.challenge ? `<span class="chip" style="background:var(--good-soft);color:var(--good)">Challenge: ${esc(r.challenge.pct)}%${r.challenge.rank ? ` · #${esc(r.challenge.rank)} of ${esc(r.challenge.entries)}` : ""}</span>` : ""}</div>
        <h2 style="margin-top:8px">${esc(p.name)} · ${esc(p.sub.split(" /")[0])}</h2>
        <p>${esc(r.verdict)}</p>
      </div>
    </div>
    ${r.question ? `<p class="hint" style="color:var(--ink-soft);font-size:14px"><b>Question:</b> ${esc(r.question)}</p>` : ""}
  </div></div>

  ${anlHTML(r.analytics, p)}
  <div class="sheet" style="margin-top:20px"><div class="sheet-inner">
    <div class="sec-title"><h2>Criterion by criterion</h2></div>
    <div class="crit">${(r.criteria||[]).map(c => `
      <div class="crit-item">
        <div class="crit-top"><h3>${esc(tcase(c.name))}</h3><span class="mk">${(() => { const pc = r.prev && (r.prev.criteria || []).find(x => x.name === c.name); return pc ? `${esc(pc.score)} → ` : ""; })()}${esc(c.score)} / ${esc(c.max)}</span></div>
        <div class="bar"><i style="width:${Math.round(100*Math.max(0,Math.min(1,(+c.score||0)/(+c.max||1))))}%"></i></div>
        <span class="band">${esc(c.band)}</span>
        <p>${esc(c.comment)}</p>
        ${whyMark(c, r.essay || "", lite)}
        ${c.strength || (c.gap && !nextBandOf(c)) ? `<div class="sg">${c.strength ? `<div class="s"><b>Keep:</b> ${esc(c.strength)}</div>` : ""}${c.gap && !nextBandOf(c) ? `<div class="g"><b>Lift:</b> ${esc(c.gap)}</div>` : ""}</div>` : ""}
      </div>`).join("")}</div>
  </div></div>

  <div class="sheet" style="margin-top:20px"><div class="sheet-inner">
    <div class="sec-title"><h2>${lite ? "Your most important improvement" : "3 improvements worth the most marks"}</h2></div>
    <ol class="fixes">${(r.fixes||[]).slice(0, lite ? 1 : 3).map((f,i) => `
      <li class="fix redpen"><span class="n" aria-hidden="true">${i+1}</span><div class="body">
        <span class="rp-tag">[ ${esc((r.framework && r.framework.name) || (r.example ? "PEEL" : "Marking"))} Audit: ${esc(f.tag || f.title)} ]</span>
        ${f.quote ? `<q class="rp-quote">${esc(f.quote)}</q>` : ""}
        <p class="rp-verdict"><b>Why it costs marks:</b> ${esc(f.why)}</p>
        ${f.rewrite ? `<p class="rp-model"><b>Model rewrite:</b> ${esc(f.rewrite)}</p>` : ""}
        <p class="try"><b>${f.rewrite ? "How to get there" : "Try"}:</b> ${esc(f.try)}</p></div></li>`).join("")}</ol>
  </div></div>

  ${!r.prev && !r.example ? `<div class="sheet" style="margin-top:20px;border:1.5px solid var(--good)"><div class="sheet-inner">
    <div class="sec-title"><h2>Fix It, Then Re-Mark Free</h2></div>
    <p>${lite ? "Make this improvement" : "Make the 3 improvements"} in your essay and mark it again. The re-mark is free and shows exactly how many marks you gained.</p>
    <div class="row"><button class="btn primary" id="remarkBtn" type="button" style="background:var(--good)">Edit my essay and re-mark</button></div>
  </div></div>` : ""}
  ${!r.example ? leadCtaHTML(r) : ""}
  ${lite ? `<div class="sheet lock-sheet" style="margin-top:20px"><div class="sheet-inner">
    <div class="sec-title"><h2>We Found 1 Thing to Fix</h2></div>
    <p>The detailed report finds up to 3, each with a suggested rewrite, plus comments paragraph by paragraph and a paragraph rewritten at top band. Marked by Exam Preparation Specialists™ and ready within 48 hours, on any of our 13 papers.</p>
    <div class="row"><button class="btn primary" type="button" data-passbuy>Get 4 detailed reports · S$39 by card (S$9.75 each)</button><button class="btn ghost" type="button" data-paynow>Or get the 31-day pass: PayNow, GrabPay or Card</button></div>
  </div></div>` : `<div class="sheet" style="margin-top:20px"><div class="sheet-inner">
    <div class="sec-title"><h2>Model paragraph</h2><span class="hint" style="color:var(--ink-soft);font-size:13px">Your idea, written at top band</span></div>
    <div class="model">
      <p class="before">${esc(r.model?.source_quote)}</p>
      <p class="after">${esc(r.model?.rewrite)}</p>
      <p class="why">${esc(r.model?.why)}</p>
    </div>
  </div></div>`}

  <div class="sheet" style="margin-top:20px"><div class="sheet-inner">
    <p class="note">${esc(r.note)}<span class="sign">Marked by EssayLabsg™ · our Exam Preparation Specialists™</span></p>
    ${r.next_target ? `<p class="target"><b>Next target:</b> <span>${esc(r.next_target)}</span></p>` : ""}
  </div></div>

  <div class="sheet" style="margin-top:20px"><div class="sheet-inner">
    <div class="sec-title"><h2>Your script, marked</h2><span class="hint" style="color:var(--ink-soft);font-size:13px">Numbers match the fixes</span></div>
    <div class="script">${annotate(r.essay || "", lite ? (r.fixes || []).slice(0, 1) : r.fixes)}</div>
    ${r.example ? "" : fbHTML(r) + shareBlockHTML(lite) + (lite ? emailCapHTML("result", "Get exam tips and the Nov–Dec class dates by email", "Keep me posted") : "")}
  </div></div>

  <div class="row" style="margin-top:20px">
    <a class="btn primary" id="waSpecialist" href="#" target="_blank" rel="noopener" style="text-decoration:none;background:var(--ink);color:var(--sheet)">Get detailed feedback</a>
    <a class="btn primary" id="waParent" href="#" target="_blank" rel="noopener" style="text-decoration:none">Send report to my parent</a>
    <button class="btn ghost" id="copyParent" type="button">Copy report</button>
    <button class="btn ghost" id="shareBtn" type="button">Share with a friend</button>
  </div>
  <div class="row" style="margin-top:10px">
    <button class="btn ghost" id="cardBtn" type="button">Save my story card</button>
    <button class="btn ghost" id="pdfBtn" type="button">Download parent report (PDF)</button>
  </div>
  <div class="sheet" style="margin-top:20px"><div class="sheet-inner">
    <span class="chip">Recommended for this essay</span>
    <h2 style="margin:8px 0 6px" id="mcRecName"></h2>
    <p style="margin:0 0 12px;color:var(--ink-soft)" id="mcRecBlurb"></p>
    <div class="row">
      <a class="btn primary" id="mcRecBtn" href="#" target="_blank" rel="noopener" style="text-decoration:none">Ask about availability</a>
      <a class="btn ghost" id="mcRecPay" href="#" target="_blank" rel="noopener" hidden style="text-decoration:none">Reserve a seat</a>
      <a class="btn ghost" id="waGroup" href="#" target="_blank" rel="noopener" style="text-decoration:none">Join the online group class early list</a>
    </div>
  </div></div>`;
  const rb = document.getElementById("remarkBtn");
  if(rb) rb.onclick = () => {
    remarkOf = {token: r.remark_token || "", paper: r.paper, prev: {total: r.total, max: r.max, criteria: (r.criteria || []).map(c => ({name: c.name, score: c.score, max: c.max}))}};
    paperId = r.paper; renderPapers(); $("#essay").value = r.essay || ""; updCount();
    photo = null; $("#photo").value = ""; $("#photoPrev").hidden = true;
    $("#markBtn").textContent = "Re-mark my revised essay (free)";
    $("#essay").scrollIntoView({behavior:"smooth", block:"center"}); $("#essay").focus();
  };
  $("#waSpecialist").href = "#specialist"; $("#waSpecialist").removeAttribute("target");
  { const wk = (r.criteria || []).slice().sort((a,b) => (a.score/a.max) - (b.score/b.max))[0];
    const wkTxt = wk ? ` My weakest area from the marker: ${wk.name}.` : "";
    $("#waGroup").href = "/api/wa?text=" + encodeURIComponent(`Hi, please add me to the early list for your online ${(PAPERS.find(x => x.id === last.paper) || PAPERS[0]).name} group class.` + wkTxt);
    const mc = mcFor(last.paper);
    $("#mcRecName").textContent = `${mc.name} Masterclass (${mc.sessions} Sessions)`;
    $("#mcRecBlurb").textContent = mc.blurb;
    $("#mcRecBtn").href = mcWa(mc);
    if(mc.pay){ $("#mcRecPay").href = mcPay(mc); $("#mcRecPay").hidden = false; } }
  $("#cardBtn").onclick = () => saveCard(last);
  $("#pdfBtn").onclick = () => savePdf(last);
  $("#waParent").href = "https://wa.me/?text=" + encodeURIComponent(parentText(last));
  $("#copyParent").onclick = async () => {
    const t = parentText(last);
    try{ await navigator.clipboard.writeText(t); toast("Copied. Paste it into WhatsApp."); }
    catch{ toast("Copy didn't work here. Select the text on the page instead."); }
  };
  $("#shareBtn").onclick = async () => {
    const data = {title:"EssayLabsg™", text:SHARE_TEXT, url: shareLink()};
    try{ if(navigator.share){ await navigator.share(data); return; } await navigator.clipboard.writeText(data.text + " " + data.url); toast("Link copied. Send it to a friend."); }
    catch(e){ if(e && e.name !== "AbortError") toast("Copy this link: " + shareLink()); }
  };
}

function parentText(r){
  return summaryText(r, false) + `\n\nMarked by EssayLabsg™ · our Exam Preparation Specialists™: ${shareLink()}\nEnquiries about our Masterclasses or classes: reply here.\n\n© 2026 Christine Sebastian. EssayLabsg™, Thinking Hack™ and Exam Preparation Specialists™. For personal study only.`;
}
function summaryText(r, full){
  const p = PAPERS.find(x => x.id === r.paper) || PAPERS[0];
  let t = (r.prev ? `After rewrite: ${r.prev.total} → ${r.total}/${r.max}\n` : "") + `EssayLabsg™\n${p.name}: ${r.total}/${r.max} (${r.band}, est. ${r.grade})\n${r.verdict}\n\n`;
  const nFix = (!unlocked && !r.example) ? 1 : 3;  // free marking shows one improvement
  t += (r.criteria||[]).map(c => `${c.name}: ${c.score}/${c.max}`).join("\n") + (nFix === 1 ? "\n\nTop fix:\n" : "\n\nTop 3 fixes:\n");
  t += (r.fixes||[]).slice(0,nFix).map((f,i) => `${i+1}. ${f.title}${full ? `\n   "${f.quote}"\n   ${f.why}\n   Try: ${f.try}` : ""}`).join("\n");
  t += `\n\nNext target: ${r.next_target || ""}\n\n${r.note}`;
  if(full) t += `\n\nModel paragraph:\n${r.model?.rewrite}\n\nWhy: ${r.model?.why}`;
  return t;
}

let toastT;
function toast(msg){
  let el = document.querySelector(".toast"); if(!el){ el = document.createElement("div"); el.className = "toast"; el.setAttribute("role","status"); document.body.append(el); }
  el.textContent = msg; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, 2600);
}

$("#codeBtn").addEventListener("click", async () => {
  const raw = $("#code").value.trim(); const code = raw.startsWith("cs_") ? raw : raw.toUpperCase(); if(!code) return;
  let ok = false, r = null;
  try{ r = await fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({check:true, code, uid})}).then(x => x.json()).catch(() => ({}));
    ok = !!r.ok; }catch{}
  if(ok){ unlocked = true; try{ localStorage.setItem("ec_code", code); }catch{} $("#unlockBox").hidden = true; renderPapers(); updFree(); toast("Unlocked. Every subject is open."); }
  else toast(r && r.reason === "devices" ? "This code is already in use on 2 devices. WhatsApp us if it's yours." : "That code isn't active. WhatsApp us if it should be.");
});

// Set this to the Stripe Payment Link (card + PayNow) once it exists; the Subscribe button appears automatically.
// In Stripe, set the link's success URL to https://<this site>/?paid={CHECKOUT_SESSION_ID}


// Weekly essay challenge (also the lead form: name, parent's WhatsApp, consent).
const CH_PAPERS = ["psle", "olang", "gp"], CH_LABEL = {psle:"PSLE", olang:"O-Level", gp:"GP"};
let chData = null, chTab = "gp", chOn = false;
const chMe = (() => { try{ return JSON.parse(localStorage.getItem("ec_ch") || "{}"); }catch{ return {}; } })();
if(chMe.name) $("#chName").value = chMe.name;
if(chMe.phone) $("#chPhone").value = chMe.phone;
if(chMe.consent && chMe.cv === "ch1") $("#chConsent").checked = true;  // only a consent given to the current wording is remembered
const chPhoneOk = v => /^[3689]\d{7}$/.test(String(v).replace(/\D/g, "").replace(/^65(?=\d{8}$)/, ""));
function renderCh(){
  $("#chTabs").innerHTML = CH_PAPERS.map(id => `<button type="button" class="paper-opt" aria-pressed="${id === chTab}" data-ch="${id}"><b>${CH_LABEL[id]}</b><small>${{psle:"Composition",olang:"Continuous Writing",gp:"Paper 1 Essay"}[id]}</small></button>`).join("");
  $("#chQ").textContent = chData && chData.challenge ? chData.challenge[chTab] : "Loading this week's question…";
  const b = chData && chData.boards && chData.boards[chTab];
  const list = (arr, fmt) => arr && arr.length ? `<ol style="margin:4px 0 0;padding-left:20px">${arr.map(x => `<li>${esc(x.name)} <span class="counter">${fmt(x.pct)}</span></li>`).join("")}</ol>` : `<p class="hint" style="margin:4px 0 0">Be the first this week!</p>`;
  $("#chBoard").innerHTML = `<div><b>Top scores</b>${list(b && b.top, v => v + "%")}</div><div><b>Most improved</b>${list(b && b.improved, v => "+" + v + "%")}</div>`;
  $("#chShare").href = "https://wa.me/?text=" + encodeURIComponent(`This week's ${CH_LABEL[chTab]} essay challenge: ${chData && chData.challenge ? chData.challenge[chTab] : ""}\nWrite it and get it marked free, then see if you can beat my score: ` + SITE_URL + "/?challenge=" + chTab + refQ("&"));
}
$("#chTabs").addEventListener("click", e => { const b = e.target.closest("[data-ch]"); if(!b) return; chTab = b.dataset.ch; renderCh(); });
async function loadCh(){
  try{ chData = await fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({board: true})}).then(x => x.json()); }catch{}
  const cm = $("#community"); if(cm && chData && chData.marked >= 20){ cm.textContent = `${chData.marked} students marked essays with us this week`; cm.hidden = false; }
  const cw = $("#chWeek"); if(cw && chData && chData.wk) cw.textContent = "Week of " + new Date(chData.wk + "T00:00:00+08:00").toLocaleDateString("en-SG", {day:"numeric", month:"short", timeZone:"Asia/Singapore"});
  renderCh();
}
$("#chGo").addEventListener("click", async () => {
  const name = $("#chName").value.trim(), phone = $("#chPhone").value.trim(), consent = $("#chConsent").checked;
  if(!name){ toast("Add your first name for the leaderboard."); $("#chName").focus(); return; }
  if(!chPhoneOk(phone)){ toast("Add a Singapore WhatsApp number (8 digits)."); $("#chPhone").focus(); return; }
  if(!consent){ toast("Tick the box so we can send your rank."); return; }
  try{ localStorage.setItem("ec_ch", JSON.stringify({name, phone, consent, cv: "ch1"})); }catch{}
  Object.assign(chMe, {name, phone, consent, cv: "ch1"});
  fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({lead: true, uid, nickname: name, phone, consent, cv: "ch1", paper: chTab})}).then(x => x.json()).then(r => { if(r && r.ok) store("ec_lead", "1"); }).catch(() => {});
  chOn = true; paperId = chTab; store("ec_paper", paperId); renderPapers();
  $("#question").value = chData && chData.challenge ? chData.challenge[chTab] : "";
  $("#essay").scrollIntoView({behavior:"smooth", block:"center"}); $("#essay").focus();
  toast("You're in! Write your essay below. Try timed exam mode for the real feel.");
});
function chPayload(){ return chOn && CH_PAPERS.includes(paperId) ? {challenge: true, nickname: chMe.name, phone: chMe.phone, consent: !!chMe.consent, cv: "ch1"} : {}; }


// Story card and parent report: drawn on a canvas in the browser, no server or library cost.
const BRAND = {ink:"#1B2440", soft:"#56607A", pen:"#C4122F", penSoft:"#FBE7EA", good:"#1F7A4D", paper:"#F7F9FC", rule:"#D4DEEC", purple:"#111111", orange:"#E0703C", blue:"#2C3557", orb:["#6F8FD0","#8B6FD6","#E0703C"], sheet:"#FAFAF9", track:"#ECEAE7", box:"#F5F3F1"};
const SERIF = "'Manrope', Arial, sans-serif", SANS = "'Inter', Arial, sans-serif";
function wrap(ctx, text, x, y, maxW, lh, maxLines){
  const words = String(text || "").split(/\s+/); let line = "", n = 0;
  for(let i = 0; i < words.length; i++){
    const t = line ? line + " " + words[i] : words[i];
    if(ctx.measureText(t).width > maxW && line){
      if(maxLines && n === maxLines - 1){ ctx.fillText(line + "…", x, y); return y + lh; }
      ctx.fillText(line, x, y); y += lh; n++; line = words[i];
    } else line = t;
  }
  if(line){ ctx.fillText(line, x, y); y += lh; }
  return y;
}
const paperName = id => (PAPERS.find(x => x.id === id) || PAPERS[0]).name;

// One line of text shrunk until it fits the width (long site addresses).
function fitText(g, text, x, y, maxW, size, weight){ let s = size; do{ g.font = `${weight || 400} ${s}px ${SANS}`; s -= 2; }while(g.measureText(text).width > maxW && s > 14); g.fillText(text, x, y); }
function signOff(g, W, y, color){ g.save(); g.textAlign = "center"; g.textBaseline = "alphabetic"; g.fillStyle = color; g.font = `17px ${SANS}`;
  // Story cards (1080 wide) carry a short notice; reports and PDF pages carry the owner and personal-study licence.
  if(W === 1080){ g.fillText("© 2026 EssayLabsg™ by Thinking Hack™ and Exam Preparation Specialists™. All rights reserved.", W / 2, y); g.restore(); return; }
  const who = (typeof chMe === "object" && chMe.name) ? String(chMe.name).split(" ")[0] : "the student";
  fitText(g, "© 2026 Christine Sebastian. All rights reserved. EssayLabsg™, Thinking Hack™ and Exam Preparation Specialists™ are trade marks of Christine Sebastian.", W / 2, y - 22, W - 80, 17);
  fitText(g, `Licensed for the personal study of ${who} only. Do not copy, share or use for teaching or tutoring.`, W / 2, y, W - 80, 17); g.restore(); }
// Brand guide v1: Inter Tight 400 wordmark (never caps or bold) with the conic orb and a small raised ™;
// IBM Plex Mono capitals descriptor where the name stands alone; Caveat for the hand-written score and sign-off.
const DISPLAY = "'Inter Tight', 'Inter', Arial, sans-serif", MONO = "'IBM Plex Mono', monospace", HAND = "Caveat, cursive";
const loadFonts = async () => { try{ await Promise.all(["400 40px 'Inter Tight'", "300 40px 'Inter Tight'", "400 20px 'IBM Plex Mono'", "700 40px Caveat", "400 30px Inter", "600 30px Inter"].map(f => document.fonts.load(f))); await document.fonts.ready; }catch{} };
const LOGO_MARK = new Image(); LOGO_MARK.src = "/logo-b.png";
function drawBrand(g, x, y, size, color, align, desc){
  // One lockup: the circle matches the wordmark's height; "sg" is small; TM is small and raised.
  g.save(); g.textBaseline = "alphabetic"; g.textAlign = "left";
  const sg = Math.round(size * .4), tm = Math.round(size * .23), d = size * .95, gap = d * .26;
  g.font = `300 ${size}px ${DISPLAY}`; const w = g.measureText("EssayLab").width;
  g.font = `400 ${sg}px ${DISPLAY}`; const sw = g.measureText("sg").width; g.font = `400 ${tm}px ${DISPLAY}`; const tw = g.measureText("™").width;
  const sgGap = sg * .1, total = d + gap + w + sgGap + sw + 1 + tw, x0 = align === "center" ? x - total / 2 : x, top = y - size * .255 - d / 2;
  if(LOGO_MARK.complete && LOGO_MARK.naturalWidth) g.drawImage(LOGO_MARK, x0, top, d, d);
  else { g.fillStyle = BRAND.orb[1]; g.beginPath(); g.arc(x0 + d / 2, top + d / 2, d / 2, 0, Math.PI * 2); g.fill(); }
  let cx = x0 + d + gap; g.fillStyle = color; g.font = `300 ${size}px ${DISPLAY}`; g.fillText("EssayLab", cx, y); cx += w + sgGap;
  g.font = `400 ${sg}px ${DISPLAY}`; g.fillText("sg", cx, y); cx += sw + 1;
  g.font = `400 ${tm}px ${DISPLAY}`; g.fillText("™", cx, y - size * .58);
  g.restore();
}
function signHand(g, x, y, align, size){ g.save(); g.textAlign = align || "left"; g.fillStyle = BRAND.ink; const t = "Marked by EssayLabsg™ · our Exam Preparation Specialists™"; let s = size || 44; do{ g.font = `700 ${s}px ${HAND}`; s -= 2; }while(g.measureText(t).width > (g.canvas.width - 140) && s > 20); g.fillText(t, x, y); g.restore(); }
function pill(g, x, y, w, h, text, size){ g.save(); g.fillStyle = "#000000"; g.beginPath(); g.roundRect(x, y, w, h, h / 2); g.fill(); g.fillStyle = "#FFFFFF"; g.textAlign = "center"; g.textBaseline = "middle"; fitText(g, text, x + w / 2, y + h / 2 + 2, w - 60, size, 700); g.restore(); }
const PRINT_HOST = "essaylab-sg.vercel.app";  // the printed link on cards and reports
function pageHead(g, W, title){
  g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, W, 1754);
  drawBrand(g, 80, 90, 36, BRAND.ink, "left", true);
  g.textAlign = "left"; g.fillStyle = BRAND.ink; g.font = `300 52px ${DISPLAY}`; g.fillText(title, 80, 212);
}
function storyCard(r){
  const W = 1080, H = 1920, c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
  g.fillStyle = BRAND.sheet; g.fillRect(0, 0, W, H);
  drawBrand(g, W / 2, 190, 66, BRAND.ink, "center", true);
  g.textAlign = "center"; g.fillStyle = BRAND.ink; g.font = `300 60px ${DISPLAY}`; g.fillText(paperName(r.paper), W / 2, 380);
  // The one purple panel: the score, hand-written in red on a white marked sheet.
  g.fillStyle = BRAND.purple; g.beginPath(); g.roundRect(120, 440, 840, 600, 56); g.fill();
  g.fillStyle = "#FFFFFF"; g.beginPath(); g.roundRect(190, 510, 700, 460, 36); g.fill();
  g.fillStyle = BRAND.pen; g.font = `700 290px ${HAND}`; const big = String(r.total), bw = g.measureText(big).width;
  g.font = `700 120px ${HAND}`; const small = "/" + r.max, sw = g.measureText(small).width, x0 = W / 2 - (bw + sw) / 2;
  g.textAlign = "left"; g.font = `700 290px ${HAND}`; g.fillText(big, x0, 810); g.font = `700 120px ${HAND}`; g.fillText(small, x0 + bw + 8, 810);
  g.textAlign = "center"; g.fillStyle = BRAND.ink; fitText(g, [r.grade ? "Est. " + r.grade : "", r.band && r.band !== r.grade ? r.band : ""].filter(Boolean).join(" · "), W / 2, 905, 620, 40);
  let y = 1130;
  if(r.prev && typeof r.prev.total === "number"){ const d = r.total - r.prev.total;
    pill(g, 240, y - 60, 600, 100, `${r.prev.total} → ${r.total}  (${d >= 0 ? "+" : ""}${d} marks)`, 50); y += 120; }
  if(r.challenge && r.challenge.rank){ g.fillStyle = BRAND.ink; g.font = `600 46px ${SANS}`; g.fillText(`#${r.challenge.rank} in this week's challenge`, W / 2, y); y += 90; }
  const f0 = (r.fixes || [])[0];
  if(f0 && y < 1300){
    g.fillStyle = BRAND.box; g.beginPath(); g.roundRect(110, y - 40, 860, 300, 36); g.fill();
    g.fillStyle = BRAND.pen; g.font = `700 56px ${HAND}`; g.fillText("Working on next", W / 2, y + 40);
    g.fillStyle = BRAND.ink; g.font = `600 42px ${SANS}`; wrap(g, f0.title, W / 2, y + 120, 780, 54, 3); }
  signHand(g, W / 2, 1600, "center", 50);
  pill(g, 240, 1650, 600, 110, "Mark yours free", 48);
  g.textAlign = "center"; g.fillStyle = BRAND.soft; fitText(g, PRINT_HOST, W / 2, 1822, 900, 36);
  signOff(g, W, 1880, BRAND.soft);
  return c;
}
function reportCanvas(r){
  const W = 1240, H = 1754, c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
  g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, W, H);
  drawBrand(g, 80, 96, 40, BRAND.ink, "left", true);
  g.textAlign = "left"; g.fillStyle = BRAND.ink; g.font = `300 56px ${DISPLAY}`; g.fillText("Essay Progress Report", 80, 228);
  const who = (typeof chMe === "object" && chMe.name) ? chMe.name : "";
  g.fillStyle = BRAND.soft; g.font = `26px ${SANS}`;
  g.fillText(`${who ? "Student: " + who + "   ·   " : ""}${paperName(r.paper)}   ·   ${new Date().toLocaleDateString("en-SG", {day:"numeric", month:"long", year:"numeric", timeZone:"Asia/Singapore"})}`, 80, 276);
  g.fillStyle = BRAND.pen; g.font = `700 150px ${HAND}`; g.fillText(`${r.total}/${r.max}`, 80, 440);
  g.fillStyle = BRAND.ink; g.font = `34px ${SANS}`; wrap(g, [r.grade ? "Estimated " + r.grade : "", r.band && r.band !== r.grade ? r.band : ""].filter(Boolean).join(" · "), 520, 385, 640, 44, 2);
  let y = 530; g.font = `300 38px ${DISPLAY}`; g.fillText("Score by criterion", 80, y); y += 24;
  (r.criteria || []).slice(0, 5).forEach(cr => {
    y += 50; g.font = `28px ${SANS}`; g.fillStyle = BRAND.ink; g.fillText(String(cr.name).split(" (")[0], 80, y);
    g.textAlign = "right"; g.fillText(`${cr.score}/${cr.max}`, W - 80, y); g.textAlign = "left";
    y += 16; g.fillStyle = BRAND.track; g.fillRect(80, y, W - 160, 14);
    g.fillStyle = BRAND.ink; g.fillRect(80, y, (W - 160) * Math.max(0, Math.min(1, cr.score / (cr.max || 1))), 14); y += 20;
  });
  y += 60; g.fillStyle = BRAND.ink; g.font = `300 38px ${DISPLAY}`; g.fillText("3 things to work on next", 80, y); y += 16;
  (r.fixes || []).slice(0, 3).forEach((f, i) => {
    y += 50; g.font = `700 44px ${HAND}`; g.fillStyle = BRAND.pen; g.fillText(`${i + 1}.`, 80, y);
    g.font = `600 29px ${SANS}`; g.fillStyle = BRAND.ink; y = wrap(g, f.title, 124, y, W - 204, 38, 2);
    g.font = `26px ${SANS}`; g.fillStyle = BRAND.soft; y = wrap(g, f.why, 124, y, W - 204, 34, 3);
  });
  const hist = getHist().filter(e => e.paper === r.paper).slice(-8);
  if(hist.length > 1 && y < H - 470){
    y += 46; g.fillStyle = BRAND.ink; g.font = `300 38px ${DISPLAY}`; g.fillText("Progress so far", 80, y);
    y += 48; g.font = `30px ${SANS}`; g.fillText(hist.map(e => e.total).join("  →  ") + `   (out of ${r.max})`, 80, y);
  }
  const mc = mcFor(r.paper);
  g.fillStyle = BRAND.box; g.beginPath(); g.roundRect(60, H - 400, W - 120, 260, 28); g.fill();
  g.fillStyle = BRAND.ink; g.font = `300 40px ${DISPLAY}`; g.fillText("Want to see this score climb?", 100, H - 330);
  g.font = `27px ${SANS}`; g.fillStyle = BRAND.soft; wrap(g, `Recommended: ${mc.name} Masterclass (${mc.sessions} Sessions). Our Exam Preparation Specialists™ also run 1-to-1 classes, at home or online.`, 100, H - 284, W - 200, 36, 2);
  pill(g, 100, H - 218, W - 200, 62, "Book a trial lesson: tap Message us at " + PRINT_HOST, 28);
  signHand(g, 80, H - 92, "left", 40);
  signOff(g, W, H - 22, BRAND.soft);
  return c;
}
function criteriaCanvas(r){
  const lite = !unlocked && !r.example, crit = (r.criteria || []).slice(0, 6);
  if(!crit.some(c => evidenceIn(c.evidence, r.essay || "") || nextBandOf(c) || (!lite && c.descriptor))) return null;
  const W = 1240, H = 1754, c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
  pageHead(g, W, "How each mark was decided");
  const lines = crit.length > 3 ? 2 : 3;
  let y = 290;
  crit.forEach(cr => {
    if(y > H - 220) return;
    g.fillStyle = BRAND.ink; g.font = `700 32px ${SANS}`; g.fillText(String(cr.name).split(" (")[0], 80, y);
    g.textAlign = "right"; g.fillStyle = BRAND.pen; g.fillText(`${cr.score}/${cr.max}`, W - 80, y); g.textAlign = "left"; y += 42;
    if(cr.band){ g.fillStyle = BRAND.soft; g.font = `700 24px ${SANS}`; g.fillText(String(cr.band).toUpperCase(), 80, y); y += 40; }
    const part = (label, text, italic) => { if(!text) return;
      g.fillStyle = BRAND.ink; g.font = `700 25px ${SANS}`; g.fillText(label, 80, y); y += 34;
      g.fillStyle = BRAND.soft; g.font = `${italic ? "italic " : ""}26px ${SANS}`; y = wrap(g, text, 80, y, W - 160, 34, lines) + 8; };
    const ev = evidenceIn(cr.evidence, r.essay || ""), nb = nextBandOf(cr);
    part("Evidence from the essay", ev ? `“${ev}”` : "", true);
    if(!lite) part("What this band means", cr.descriptor);
    part(+cr.max > 0 && +cr.score >= +cr.max ? "Staying in the top band" : "To reach the next band", nb);
    y += 16; g.fillStyle = BRAND.rule; g.fillRect(80, y, W - 160, 2); y += 56;
  });
  g.fillStyle = BRAND.soft; g.font = `24px ${SANS}`; g.fillText("Evidence is quoted word for word from the essay.", 80, H - 84);
  signOff(g, W, H - 22, BRAND.soft);
  return c;
}
function teamCanvas(){
  const W = 1240, H = 1754, c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
  pageHead(g, W, "Our Exam Preparation Specialists™");
  let y = 290; g.fillStyle = BRAND.ink; g.font = `30px ${SANS}`;
  y = wrap(g, "Led by a full-time Exam Preparation Specialist holding an LL.B (Hons) Second Upper and a TESOL Higher Distinction. We've worked with students from schools including RI, HCI, NYGH, RGS, ACS (I), MGS, SCGS, Tao Nan, Nanyang Primary and Henry Park.", 80, y, W - 160, 42);
  y += 80; g.font = `700 34px ${SANS}`; g.fillText("Masterclasses", 80, y); y += 10;
  MASTERCLASSES.forEach(m => {
    y += 52; g.fillStyle = BRAND.ink; g.font = `700 30px ${SANS}`; g.fillText(`${m.name}  (${m.sessions} Sessions)`, 80, y);
    y += 6; g.fillStyle = BRAND.soft; g.font = `26px ${SANS}`; y = wrap(g, m.blurb, 80, y + 34, W - 160, 34, 2) - 20;
  });
  g.fillStyle = BRAND.soft; g.font = `24px ${SANS}`; g.fillText("Certificates shown at the first lesson.", 80, H - 150);
  pill(g, 80, H - 132, W - 160, 62, "Sign up or book a trial: tap Message us at " + PRINT_HOST, 28);
  signOff(g, W, H - 22, BRAND.soft);
  return c;
}
// Minimal PDF holding one JPEG per A4 page, so no PDF library is needed.
function jpegToPdf(pages){
  const enc = new TextEncoder(), parts = [], offs = []; let len = 0;
  const push = x => { const b = typeof x === "string" ? enc.encode(x) : x; parts.push(b); len += b.length; };
  const obj = (n, body) => { offs[n] = len; push(`${n} 0 obj\n`); body(); push("\nendobj\n"); };
  const content = "q 595 0 0 842 0 0 cm /Im0 Do Q", N = pages.length, total = 2 + N * 3;
  push("%PDF-1.4\n");
  obj(1, () => push("<< /Type /Catalog /Pages 2 0 R >>"));
  obj(2, () => push(`<< /Type /Pages /Kids [${pages.map((_, i) => (3 + i * 3) + " 0 R").join(" ")}] /Count ${N} >>`));
  pages.forEach((pg, i) => {
    const a = 3 + i * 3;
    obj(a, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${a + 1} 0 R >> >> /Contents ${a + 2} 0 R >>`));
    obj(a + 1, () => { push(`<< /Type /XObject /Subtype /Image /Width ${pg.w} /Height ${pg.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pg.bytes.length} >>\nstream\n`); push(pg.bytes); push("\nendstream"); });
    obj(a + 2, () => push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
  });
  const xref = len;
  let x = `xref\n0 ${total + 1}\n0000000000 65535 f \n`; for(let n = 1; n <= total; n++) x += String(offs[n]).padStart(10, "0") + " 00000 n \n";
  push(x + `trailer\n<< /Size ${total + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(parts, {type: "application/pdf"});
}
async function shareFile(blob, name, text){
  const file = new File([blob], name, {type: blob.type});
  try{ if(matchMedia("(pointer: coarse)").matches && navigator.canShare && navigator.canShare({files: [file]})){ await navigator.share({files: [file], text}); return; } }catch(e){ if(e && e.name === "AbortError") return; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove();
  toast("Saved to your downloads.");
}
async function saveCard(r){
  await loadFonts();
  const c = storyCard(r); const blob = await new Promise(res => c.toBlob(res, "image/png"));
  await shareFile(blob, "essay-score.png", "Mark yours free: " + shareLink());
}
async function savePdf(r){
  await loadFonts();
  const pages = [];
  for(const c of [reportCanvas(r), criteriaCanvas(r), teamCanvas()].filter(Boolean)){ const jb = await new Promise(res => c.toBlob(res, "image/jpeg", 0.88)); pages.push({bytes: new Uint8Array(await jb.arrayBuffer()), w: c.width, h: c.height}); }
  const pdf = jpegToPdf(pages);
  await shareFile(pdf, "essay-report.pdf", "Essay progress report");
}


// Contact form: every "message us" button opens this instead of exposing a phone number.
function openMsg(text){
  const me = (typeof chMe === "object" && chMe) || {};
  if(!$("#msgName").value && me.name) $("#msgName").value = me.name;
  if(!$("#msgPhone").value && me.phone) $("#msgPhone").value = me.phone;
  $("#msgText").value = text || "";
  $("#msgBox").hidden = false; ($("#msgName").value ? $("#msgText") : $("#msgName")).focus();
}
document.addEventListener("click", e => {
  const a = e.target.closest && e.target.closest('a[href^="#msg"]'); if(!a) return;
  e.preventDefault(); const q = a.getAttribute("href").split("text=")[1] || "";
  let t = ""; try{ t = decodeURIComponent(q); }catch{} window.open(t ? "/api/wa?text=" + encodeURIComponent(t) : "/api/wa", "_blank", "noopener");
});
$("#msgCancel").onclick = () => { $("#msgBox").hidden = true; };
$("#msgForm").addEventListener("submit", async e => {
  e.preventDefault();
  const name = $("#msgName").value.trim(), phone = $("#msgPhone").value.trim(), text = $("#msgText").value.trim();
  if(!name){ toast("Add your name."); return; }
  if(!/^[3689]\d{7}$/.test(phone.replace(/\D/g, "").replace(/^65(?=\d{8}$)/, ""))){ toast("Add a Singapore WhatsApp number (8 digits)."); return; }
  if(!text){ toast("Write a short message."); return; }
  if(!$("#msgConsent").checked){ toast("Tick the box so we can reply on WhatsApp."); return; }
  $("#msgSend").disabled = true;
  try{
    const r = await fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({contact: true, uid, nickname: name, phone, text, consent: true})}).then(x => x.json());
    if(!r.ok) throw 0;
    $("#msgBox").hidden = true; store("ec_msg", "1"); toast("Sent. We'll reply on WhatsApp soon.");
  }catch{ toast("That didn't send. Please try again in a minute."); }
  finally{ $("#msgSend").disabled = false; }
});

// Timed exam mode: suggested writing time per paper, auto-marks when time is up.
const EXAM_MIN = {psle:50, pslesw:20, gp:90, gpaq:40, olang:70, olsw:40, olit:45, ss:35, hist:35, geog:25, ib1:75, ib2:105, igcse:60};
const timer = {end:0, start:0, min:0, id:0};
function fmt(ms){ const s = Math.max(0, Math.ceil(ms/1000)); return Math.floor(s/60) + ":" + String(s%60).padStart(2,"0"); }
function stopTimer(){ clearInterval(timer.id); timer.end = 0; $("#timerBtn").lastChild.textContent = "Timed mode"; $("#timerOut").textContent = ""; }
$("#timerBtn").addEventListener("click", () => {
  if(timer.end){ stopTimer(); return; }
  const cur = PAPERS.find(x => x.id === paperId) || PAPERS[0];
  timer.min = EXAM_MIN[paperId] || 45; timer.start = Date.now(); timer.end = timer.start + timer.min * 60000;
  $("#timerBtn").lastChild.textContent = "Stop timer";
  const tickT = () => {
    const ms = timer.end - Date.now();
    $("#timerOut").textContent = `${fmt(ms)} left · ${cur.name}, ${timer.min} min`;
    if(ms <= 0){ stopTimer(); $("#timerOut").textContent = "Time's up. Pens down!";
      if(words($("#essay").value) >= 80 || photo){ timer.end = 1; timer.start = Date.now() - timer.min * 60000; $("#markBtn").click(); } }
  };
  tickT(); timer.id = setInterval(tickT, 1000);
  $("#essay").focus();
});

// Progress profile: every marked essay is kept on this device.
function getHist(){ try{ return JSON.parse(localStorage.getItem("ec_hist") || "[]"); }catch{ return []; } }
function addHist(r){
  if(!r || !r.criteria || r === EXAMPLE) return;
  const h = getHist();
  h.push({t: Date.now(), paper: r.paper, total: r.total, max: r.max, timed: r.timedMin || 0,
    crit: (r.criteria || []).map(c => ({name: c.name, score: c.score, max: c.max})), fixes: (r.fixes || []).slice(0,3).map(f => f.title), tags: (r.fixes || []).slice(0,3).map(f => f.tag || f.title), grade: r.grade || ""});
  try{ localStorage.setItem("ec_hist", JSON.stringify(h.slice(-60))); }catch{}
}
function weakSpots(h){
  const n = {};
  h.forEach(e => (e.crit || []).forEach(c => { if(c.max && c.score / c.max < 0.6){ const k = c.name.split(" (")[0]; n[k] = (n[k] || 0) + 1; } }));
  return Object.entries(n).sort((a,b) => b[1] - a[1]).slice(0,3);
}
function renderForm(all, h){
  const lastE = h[h.length - 1]; if(!lastE){ $("#histForm").innerHTML = ""; return; }
  const p = PAPERS.find(x => x.id === lastE.paper) || {name: lastE.paper};
  const tgt = (typeof last === "object" && last && last.paper === lastE.paper && last.next_target) ? last.next_target : "";
  let html = `<div class="tlog-form"><b>Latest score:</b><span>${esc(p.name)}: ${lastE.grade ? "Est. " + esc(lastE.grade) + " " : ""}(${esc(lastE.total)}/${esc(lastE.max)})</span>${tgt ? `<span>→ <b>Target:</b> ${esc(tgt)}</span>` : ""}</div>`;
  const es = h.filter(e => e.paper === lastE.paper && e.tags);
  if(es.length > 1){
    const now = new Set(lastE.tags || []), before = new Set(es.slice(0, -1).flatMap(e => e.tags));
    const items = [...before].filter(t => !now.has(t)).slice(0, 3).map(t => `<li>✅ <b>${esc(t)}</b>: fixed since your earlier drafts</li>`)
      .concat([...now].filter(t => before.has(t)).map(t => `<li>⚠️ <b>${esc(t)}</b>: still to work on</li>`))
      .concat([...now].filter(t => !before.has(t)).map(t => `<li>❌ <b>${esc(t)}</b>: new area to work on</li>`));
    if(items.length) html += `<b>What to work on</b><ul class="tlog-leaks">${items.join("")}</ul>`;
  }
  if(!unlocked && all.length > 1) html += `<p class="hint" style="margin:10px 0 0;font-size:13.5px">Showing your latest script.</p>`;
  $("#histForm").innerHTML = html;
}
function renderHist(){
  const all = getHist(), h = unlocked ? all : all.slice(-1); const box = $("#histBox");
  if(!h.length){ box.hidden = true; return; }
  box.hidden = false;
  const by = {}; h.forEach(e => (by[e.paper] = by[e.paper] || []).push(e));
  $("#histPapers").innerHTML = Object.entries(by).map(([pid, es]) => {
    const p = PAPERS.find(x => x.id === pid) || {name: pid}; const recent = es.slice(-8);
    const bars = recent.map(e => `<i title="${e.total}/${e.max}" style="display:block;width:100%;height:${Math.max(6, Math.round(e.total / e.max * 48))}px;background:${e.timed ? "var(--pen)" : "var(--ink-soft)"};border-radius:4px 4px 0 0"></i>`).join("");
    const first = recent[0], lastE = recent[recent.length - 1];
    const d = recent.length > 1 ? Math.round((lastE.total / lastE.max - first.total / first.max) * 100) : 0;
    return `<div><div style="display:flex;justify-content:space-between;gap:8px"><strong>${esc(p.name)}</strong><span class="counter">${recent.map(e => e.total).join(" → ")} / ${lastE.max}${recent.length > 1 ? ` (${d >= 0 ? "+" : ""}${d}%)` : ""}</span></div>
      <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:4px;align-items:end;height:50px;margin-top:6px">${bars}</div></div>`;
  }).join("") + `<span class="hint" style="font-size:13px">Red bars were written in timed exam mode.</span>`;
  renderForm(all, h);
  const w = weakSpots(h);
  $("#histWeak").innerHTML = w.length ? `<b>Your repeat weak spots</b><ol style="margin:6px 0 0;padding-left:20px">${w.map(([k, c]) => `<li>${esc(k)} <span class="hint">(below 60% in ${c} essay${c > 1 ? "s" : ""})</span></li>`).join("")}</ol>` : `<b>No repeat weak spots yet.</b> <span class="hint">Keep going!</span>`;
  const wk = all.filter(e => Date.now() - e.t < 7 * 864e5), wby = {}; wk.forEach(e => (wby[e.paper] = wby[e.paper] || []).push(e));
  const txt = (wk.length ? `Completed ${wk.length} revision essay${wk.length > 1 ? "s" : ""} this week on EssayLabsg™.\n` : "My essay progress on EssayLabsg™:\n")
    + Object.entries(wk.length ? wby : by).map(([pid, es]) => { const p = PAPERS.find(x => x.id === pid) || {name: pid}; const a = es[0], b = es[es.length - 1];
      return `${p.name}: ${es.length > 1 ? `${a.total} → ` : ""}${b.total}/${b.max}${a.grade && b.grade && es.length > 1 && a.grade !== b.grade ? ` (Est. ${a.grade} → ${b.grade})` : b.grade ? ` (Est. ${b.grade})` : ""}`; }).join("\n")
    + (w.length ? "\nWorking on: " + w.map(x => x[0]).join(", ") : "") + "\n" + SITE_URL + "/";
  $("#histWa").href = "https://wa.me/?text=" + encodeURIComponent(txt);
}
const SUBSCRIBE_URL = "";
// Paste the WhatsApp Channel invite link here once it exists (followers never see the owner's number).
const COMMUNITY_URL = "";
if(COMMUNITY_URL){ $("#joinLink").href = COMMUNITY_URL; $("#joinLink").hidden = false; }
// Masterclasses (from the tutor profile). Every card has an "Enquire" button that opens the on-site
// message form (never a phone number). Paste a Stripe Payment Link into "pay" to also show "Reserve a seat".
// "outcome" and "topics" are drawn from the blurb; no dates, times or prices are shown.
const MASTERCLASSES = [
  {id:"comp", name:"Comprehension Mastery", sessions:4, blurb:"Comprehension practice by question type, language-use questions and timed practice.", papers:["psle","pslesw"], outcome:"Answer comprehension questions with confidence, under time pressure.", topics:["Question types", "Language-use questions", "Timed practice"], pay:""},
  {id:"essay", name:"Argumentative Essay Writing", sessions:8, blurb:"PEEL paragraphs, counter-arguments, PAC/PACT for Situational Writing and timed essays.", papers:["gp","olang","olsw","igcse"], outcome:"Plan and write well-structured argumentative essays.", topics:["PEEL paragraphs", "Counter-arguments", "PAC/PACT", "Timed essays"], pay:""},
  {id:"aq", name:"GP AQ Clinic", sessions:4, blurb:"The R-E-A-L framework: relate, evaluate, apply to Singapore and link back to the question.", papers:["gpaq"], outcome:"Improve your Paper 2 Application Question answer.", topics:["R-E-A-L framework", "Evaluation", "Applying to Singapore"], pay:""},
  {id:"lit", name:"Unseen Literature Clinic", sessions:4, blurb:"Close reading and PEEL-L analysis.", papers:["olit","ib1","ib2"], outcome:"Read an unseen text closely and write clear analysis.", topics:["Close reading", "PEEL-L analysis"], pay:""},
  {id:"sbcs", name:"Social Studies and History Source Analysis", sessions:4, blurb:"LORMS levels and C-A-P-P source analysis for inference, comparison, reliability and assertion questions.", papers:["ss","hist"], outcome:"Handle each source-based question type in Social Studies and History.", topics:["LORMS levels", "C-A-P-P source analysis", "Reliability", "Assertion questions"], pay:""},
  {id:"case", name:"Humanities Essay and Case Study Bootcamp", sessions:8, blurb:"LORMS-structured essays, case studies and answering to the marking criteria.", papers:["geog","hist","ss"], outcome:"Write structured humanities essays and case-study answers.", topics:["LORMS essay structure", "Case studies", "Answering to the marking criteria"], pay:""},
];
// Holiday masterclasses on the timetable (Nov to Dec 2026). The recommender prefers these, then the skill masterclasses.
const HOLIDAY_MC = [
  {id:"h-pc", name:"PSLE Composition", sessions:4, blurb:"Holiday class for P5 to P6: Saturdays, 7.30 to 9pm, from 21 Nov. Online, up to 6 students, every draft marked.", outcome:"Plan and write PSLE compositions that show, not tell.", topics:[], papers:["psle"], pay:""},
  {id:"h-pe", name:"PSLE English", sessions:4, blurb:"Holiday class for P5 to P6: Tuesdays, 10 to 11.30am, from 24 Nov. Online, up to 6 students.", outcome:"Situational Writing, comprehension and language for PSLE English.", topics:[], papers:["pslesw"], pay:""},
  {id:"h-oe", name:"O-Level English", sessions:4, blurb:"Holiday class for Sec 3 to 4: Tuesdays, 2 to 3.30pm, from 24 Nov. Online, up to 6 students.", outcome:"Continuous and Situational Writing for O-Level English.", topics:[], papers:["olang","olsw"], pay:""},
  {id:"h-sh", name:"Secondary Humanities (Social Studies and History SBQ)", sessions:4, blurb:"Holiday class: Sundays, 7 to 8.30pm, from 22 Nov. Online, up to 6 students.", outcome:"Source-based questions for Social Studies and History.", topics:[], papers:["ss","hist"], pay:""},
  {id:"h-gp", name:"JC General Paper", sessions:4, blurb:"Holiday class for JC1 to JC2: Tuesdays, 4 to 5.30pm, from 24 Nov. Online, up to 6 students.", outcome:"GP essays and the Paper 2 AQ.", topics:[], papers:["gp","gpaq"], pay:""},
];
function mcFor(paper){ return HOLIDAY_MC.find(m => m.papers.includes(paper)) || MASTERCLASSES.find(m => m.papers.includes(paper)) || MASTERCLASSES[1]; }
function mcPay(m){ return m.pay ? m.pay + (m.pay.includes("?") ? "&" : "?") + "client_reference_id=" + encodeURIComponent(uid) : ""; }
function mcWa(m){ return "/api/wa?topic=" + encodeURIComponent(m.name); }
function mcHref(m, extra){
  return "/api/wa?text=" + encodeURIComponent(`Hi, I'd like to check schedule and availability for the ${m.name} Masterclass (${m.sessions} Sessions).` + (extra || ""));
}
const GROUP_TEXT = "Hi, please add me to the early list for your online group classes.";
function renderMasterclasses(){
  $("#mcList").innerHTML = MASTERCLASSES.map(m => `<div class="mc">
    <h3 class="mc-title"><strong>${esc(m.name)}</strong></h3>
    <p class="mc-out"><span class="mc-lbl">What you will work on</span>${esc(m.outcome || m.blurb)}</p>
    <div class="mc-sess"><span class="mc-lbl">Sessions</span><span class="mc-count">${m.sessions} Sessions</span>
      <ul>${(m.topics || []).map(t => `<li>${esc(t)}</li>`).join("")}</ul></div>
    <div class="mc-cta"><a class="btn dark" href="${mcWa(m)}" target="_blank" rel="noopener" style="text-decoration:none">Ask on WhatsApp</a>${m.pay ? `<a class="btn ghost" href="${mcPay(m)}" target="_blank" rel="noopener" style="text-decoration:none">Reserve a seat</a>` : ""}</div></div>`).join("");
  $("#waGroupTop").href = "/api/wa?text=" + encodeURIComponent(GROUP_TEXT);
}

updPassLink();

// Detailed feedback plan: subscribers see their reports left, a form to send an essay, and Manage or cancel.
let plan = {active: false};
const fmtDate = s => s ? new Date(s * 1000).toLocaleDateString("en-SG", {day: "numeric", month: "short", year: "numeric"}) : "";
function renderPlan(){
  const box = $("#planBox"); if(!box) return;
  const me = (typeof chMe === "object" && chMe) || {};
  // Free detailed reports earned by sharing with 7 people, for anyone without an active plan.
  const free = !plan.active && plan.dc > 0;
  if(!plan.active && !free){ box.innerHTML = (plan.once && plan.end ? `<p>Your 31-day pass ended on ${esc(fmtDate(plan.end))}.</p>` : "") + `<div class="row"><button class="btn primary" type="button" data-passbuy>Subscribe by card: S$39 for 4 reports</button><button class="btn ghost" type="button" data-paynow>31-day pass: PayNow, GrabPay or Card — S$39</button></div>` + reportsHTML(); return; }
  box.innerHTML = `<div class="plan-on">
    ${free ? `<p><b>You have ${plan.dc} free detailed report${plan.dc === 1 ? "" : "s"} from sharing.</b></p>` : `<p><b>Your plan is active.</b> ${plan.left} of ${plan.reports} reports left${plan.once ? "" : " this billing month"}. ${plan.once ? "Your 31-day pass ends (no auto-renewal)" : plan.cancelling ? "Your plan ends" : "It renews"} on ${esc(fmtDate(plan.end))}.</p>`}
    ${free || plan.left > 0 ? `<form id="detForm" style="display:flex;flex-direction:column;gap:10px">
      <input type="text" id="detName" placeholder="Your name (optional)" maxlength="40" value="${esc(me.name || "")}" style="border:1.5px solid var(--rule);border-radius:10px;background:var(--sheet);color:var(--ink);padding:10px 12px">
      <select id="detPaper" aria-label="Paper" style="border:1.5px solid var(--rule);border-radius:10px;background:var(--sheet);color:var(--ink);padding:10px 12px">${PAPERS.map(x => `<option value="${x.id}">${esc(x.name)} · ${esc(x.sub)}</option>`).join("")}</select>
      <input type="text" id="detQ" placeholder="The question (optional)" maxlength="600" style="border:1.5px solid var(--rule);border-radius:10px;background:var(--sheet);color:var(--ink);padding:10px 12px">
      <textarea id="detEssay" rows="8" placeholder="Paste your essay here" style="border:1.5px solid var(--rule);border-radius:10px;background:var(--sheet);color:var(--ink);padding:10px 12px;font:inherit"></textarea>
      <div class="row"><button class="btn primary" type="submit" id="detSend">Get my detailed report</button></div>
    </form>` : (plan.once ? `<p>You've used your 4 reports. Get another 31-day pass for 4 more.</p>` : `<p>You've used this month's reports. New reports start on ${esc(fmtDate(plan.end))}.</p>`)}
    <div class="row" style="margin-top:10px">${free ? `<button class="btn ghost" type="button" data-passbuy>Subscribe by card: S$39 for 4 reports</button><button class="btn ghost" type="button" data-paynow>31-day pass: PayNow, GrabPay or Card — S$39</button>` : plan.once ? `<button class="btn ghost" type="button" data-paynow>31-day pass: PayNow, GrabPay or Card — S$39</button>` : `<button class="btn ghost" type="button" id="planManage">Manage or cancel my plan</button>`}</div></div>` + reportsHTML();
  const f = $("#detForm");
  if(f) f.onsubmit = async e => {
    e.preventDefault();
    const essay = $("#detEssay").value.trim();
    if(words(essay) < 80){ toast("Paste at least a full paragraph (80+ words)."); return; }
    $("#detSend").disabled = true; $("#detSend").textContent = "Preparing your report…";
    const r = await fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({detailed: true, teach: !!document.getElementById("teachOk")?.checked, uid, nickname: $("#detName").value, paper: $("#detPaper").value, question: $("#detQ").value, essay})}).then(x => x.json()).catch(() => ({}));
    if(r.ok && r.report){ if(free) plan.dc = r.left; else plan.left = r.left; myReports.unshift(r.report); openRep = r.report.id; renderPlan(); toast("Sent. Your detailed report will be marked by Exam Preparation Specialists™ and ready within 48 hours."); const el = $("#rep-" + r.report.id); if(el) el.scrollIntoView({block: "start"}); return; }
    $("#detSend").disabled = false; $("#detSend").textContent = "Get my detailed report";
    toast({fields: "Choose a paper and paste at least 80 words.", used: "You've used this month's reports.", plan: "Your plan isn't active. Tap Message us and we'll sort it out.", busy: "The report couldn't be written just now, and it hasn't used up a report. Please try again in a minute."}[r.error] || "That didn't go through, and it hasn't used up a report. Please try again.");
  };
  if($("#planManage")) $("#planManage").onclick = async () => {
    const r = await fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({portal: true, uid})}).then(x => x.json()).catch(() => ({}));
    if(r.url) location.href = r.url;
    else location.hash = "msg?text=" + encodeURIComponent("Hi, I'd like to change or cancel my Detailed feedback plan.");
  };
}
// Detailed reports: kept on the student's account and shown here, newest first.
let myReports = [], openRep = "";
function repBody(r){
  const st = {ok: "✓", weak: "~", missing: "✗"};
  return `<p class="rep-score"><b>Estimated score: ${r.total}/${r.max}</b>${r.grade ? ` · ${esc(r.grade)}` : ""}${r.band ? ` · ${esc(r.band)}` : ""}</p>
    ${r.verdict ? `<p>${esc(r.verdict)}</p>` : ""}
    <h4>Each Criterion</h4>${r.criteria.map(c => `<div class="rep-crit"><p><b>${esc(tcase(c.name))}: ${c.score}/${c.max}</b>${c.band ? ` (${esc(c.band)})` : ""}</p><p>${esc(c.comment)}</p>${whyMark(c, null, false)}${c.strength ? `<p><i>Keep:</i> ${esc(c.strength)}</p>` : ""}${c.gap && !nextBandOf(c) ? `<p><i>To lift it:</i> ${esc(c.gap)}</p>` : ""}</div>`).join("")}
    ${r.paras && r.paras.rows.length ? `<h4>Paragraph by Paragraph</h4>${r.paras.summary ? `<p>${esc(r.paras.summary)}</p>` : ""}${r.paras.rows.map(x => `<div class="rep-para"><p><b>${esc(x.label)}</b></p><ul>${x.checks.map(c => `<li><span class="rep-${c.status}">${st[c.status]}</span> ${esc(c.k)}${c.note ? `: ${esc(c.note)}` : ""}</li>`).join("")}</ul></div>`).join("")}` : ""}
    ${r.fixes.length ? `<h4>Three Improvements Worth the Most Marks</h4><ol>${r.fixes.map(f => `<li><p><b>${esc(f.title)}</b></p>${f.quote ? `<p class="rep-q">“${esc(f.quote)}”</p>` : ""}<p>${esc(f.why)}</p>${f.rewrite ? `<p><i>Stronger:</i> ${esc(f.rewrite)}</p>` : ""}${f.try ? `<p><i>Try:</i> ${esc(f.try)}</p>` : ""}</li>`).join("")}</ol>` : ""}
    ${r.model ? `<h4>A Paragraph Rewritten at Top Band</h4><p class="rep-q">${esc(r.model.rewrite)}</p>${r.model.why ? `<p>${esc(r.model.why)}</p>` : ""}` : ""}
    ${r.note ? `<h4>Summary</h4><p>${esc(r.note)}</p>` : ""}
    ${r.next ? `<p><b>Next target:</b> ${esc(r.next)}</p>` : ""}
    ${fbHTML(r)}
    ${shareBlockHTML()}`;
}
function reportsHTML(){
  if(!myReports.length) return "";
  const notes = emailCapHTML("notes", "Thinking Hack™ notes for your level are coming. Join the list for the launch price.", "Join the list");
  return `<div class="rep-list"><h3>Your detailed reports</h3>${myReports.map(r => r.status === "review" ? `<div class="rep rep-wait" id="rep-${esc(r.id)}" style="padding:14px 16px;border:1px solid #ECEAE7;border-radius:14px;background:#fff;color:#111;margin:8px 0"><b>${esc(r.paper)}</b> · ${esc(r.sub || "")}<br><span style="color:#3B3B3B">Being marked by Exam Preparation Specialists™. Ready within 48 hours of sending (${new Date(r.t).toLocaleDateString("en-SG", {day: "numeric", month: "short"})}).</span></div>` : `<details class="rep" id="rep-${esc(r.id)}" data-rep="${esc(r.id)}"${r.id === openRep ? " open" : ""}><summary>${esc(new Date(r.t).toLocaleDateString("en-SG", {day: "numeric", month: "short"}))} · ${esc(r.paper)} · ${r.total}/${r.max}</summary>${repBody(r)}</details>`).join("")}</div>${notes}`;
}
async function loadReports(){
  const r = await fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({myreports: true, uid})}).then(x => x.json()).catch(() => null);
  if(r && Array.isArray(r.reports)) myReports = r.reports;
}
async function loadPlan(){
  await loadReports();
  let r = await fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({plan: true, uid})}).then(x => x.json()).catch(() => null);
  // A PayNow payment that hadn't cleared when they came back: check it again.
  const pend = store("el_once");
  if(!(r && r.active) && pend){ const c = await confirmPlan(pend); if(c.ok) r = c; }
  if(r && (r.active || r.once || r.dc > 0)){ plan = r; renderPlan(); }
  else if(myReports.length){ renderPlan(); }
}
const confirmPlan = cs => fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({subconfirm: cs, uid})}).then(x => x.json()).catch(() => ({}));
// PayNow one-off: S$39 for 4 reports within 31 days, no auto-renewal.
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-paynow]"); if(!b) return;
  e.preventDefault(); const t = b.textContent; b.textContent = "Opening secure payment…";
  const r = stripeOn ? await fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({checkout: true, once: true, uid, ref})}).then(x => x.json()).catch(() => ({})) : {};
  if(r.url){ location.href = r.url; return; }
  b.textContent = t; openMsg("Hi, I'd like the 31-day pass for Detailed feedback (4 reports for S$39).");
});
loadPlan();
// Returning from Stripe after subscribing (card) or paying once (PayNow): save the plan to this device.
(async () => {
  const q = new URLSearchParams(location.search), once = q.get("once"), sid = q.get("sub") || once; if(!sid) return;
  history.replaceState(null, "", location.pathname + "#specialist");
  if(once) store("el_once", once);
  const r = await confirmPlan(sid);
  if(r.pending){ toast("Waiting for your PayNow or GrabPay payment to clear. Refresh this page in a minute."); return; }
  if(r.ok && r.active){ if(once) try{ localStorage.removeItem("el_once"); }catch{} plan = r; renderPlan(); toast(once ? "Payment received. Send your first essay for detailed feedback below." : "You're subscribed. Send your first essay for detailed feedback below."); $("#specialist").scrollIntoView({block: "start"}); }
  else toast("We couldn't confirm your subscription yet. Tap Message us and we'll sort it out.");
})();
// Returning from Stripe after buying an older one-off pass: unlock straight away.
(async () => {
  const sid = new URLSearchParams(location.search).get("paid"); if(!sid) return;
  history.replaceState(null, "", location.pathname);
  const r = await fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({check:true, code: sid, uid})}).then(x => x.json()).catch(() => ({}));
  if(r.ok){ unlocked = true; try{ localStorage.setItem("ec_code", sid); }catch{} renderPapers(); updFree();
    toast("Payment received. Every subject is unlocked" + (r.until ? " until " + new Date(r.until).toLocaleDateString("en-SG", {day:"numeric", month:"short"}) : "") + "."); }
  else toast("We couldn't confirm the payment yet. WhatsApp us and we'll sort it out.");
})();

const SHARE_TEXT = "Found EssayLabsg™ by Thinking Hack™: free instant marking for PSLE English, O-Level English and A-Level GP, marked the way examiners mark, with guidance from a Singapore team of Exam Preparation Specialists™. You get an estimated score, a mark for each criterion and your most important improvement in about a minute. Detailed feedback also covers Literature, Humanities, IB and IGCSE:";
const shareMsg = () => `${SHARE_TEXT} ${shareLink()}`;

// Share-7 progress bar and the "you've hit 7" celebration.
function shareProgHTML(){ return `<div class="sb-prog"><div class="sb-bar" role="progressbar" aria-valuemin="0" aria-valuemax="7" aria-valuenow="${invited}"><i style="width:${invited / 7 * 100}%"></i></div><p class="sb-count">${invited} of 7 shares towards your next free detailed report</p></div>`; }
function celebrate7(){
  if(document.getElementById("cele7")) return;
  const d = document.createElement("div"); d.id = "cele7"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "Free detailed report unlocked");
  d.innerHTML = `<div class="c7-card"><svg class="c7-tick" viewBox="0 0 52 52" aria-hidden="true"><path d="M14 27 l8 8 l16 -18"/></svg><b>You've hit 7! Your free detailed report is unlocked</b><p>Thank you for sharing EssayLabsg™. The bar starts again for your next 7.</p><div class="c7-row"><a class="c7-go" href="#planBox">Use my free report</a><button type="button" class="c7-x">Later</button></div>${Array.from({length: 18}, (_, i) => `<i class="c7-dot" style="--x:${(i * 37) % 100}%;--d:${(i % 6) * 0.12}s;--c:${["#C4122F","#4C3A9A","#E0703C","#6F8FD0"][i % 4]}"></i>`).join("")}</div>`;
  d.querySelector(".c7-x").onclick = () => d.remove(); d.querySelector(".c7-go").addEventListener("click", () => d.remove());
  document.body.append(d);
}
function renderInvites(){
  $("#invCount").textContent = `${invited} of 7`;
  $("#invBar").style.width = (invited / 7 * 100) + "%";
  $("#invHint").textContent = `${invited} of 7 shares towards your next free detailed report.` + (earned ? ` You've earned ${earned} so far.` : "") + " A person counts when they open your link on their own device and haven't used EssayLabsg™ before.";
  document.querySelectorAll(".sb-prog").forEach(el => { el.outerHTML = shareProgHTML(); });
  // Celebrate each newly earned report once per device, even if it landed while they were away.
  let seen = 0; try{ seen = +localStorage.getItem("el_earned_seen") || 0; }catch{}
  if(earned > seen){ try{ localStorage.setItem("el_earned_seen", String(earned)); }catch{} celebrate7(); }
  $("#waShare").href = "https://wa.me/?text=" + encodeURIComponent(shareMsg());
}
$("#moreShare").addEventListener("click", async () => {
  try{ if(navigator.share){ await navigator.share({text: SHARE_TEXT, url: shareLink()}); return; } await navigator.clipboard.writeText(shareMsg()); toast("Link copied. Paste it into any chat."); }
  catch(e){ if(e && e.name !== "AbortError") toast("Your link: " + shareLink()); }
});
async function applyCode(code){
  code = String(code || "").trim().toUpperCase(); if(!code) return;
  const r = await fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({redeem: code, uid})}).then(x => x.json()).catch(() => ({ok:false, message:"Couldn't check the code. Try again."}));
  toast(r.message || (r.ok ? "Applied." : "That code isn't valid.")); if(r.ok){ $("#unlockBox").hidden = true; refreshStatus(); }
}
$("#promoBtn").addEventListener("click", () => applyCode($("#promo").value));
(() => { const c = new URLSearchParams(location.search).get("code"); if(c){ history.replaceState(null, "", location.pathname); setTimeout(() => applyCode(c), 400); } })();

// Student access request: a WhatsApp message to Chrissy with a one-tap approve link for this device.
function updStuLink(){
  const name = $("#stuName").value.trim() || "a current student";
  const link = SITE_URL + "/?approve=" + uid + "&n=" + encodeURIComponent(name);
  $("#stuReq").href = "/api/wa?text=" + encodeURIComponent(`Hi, this is ${name}. Please approve my EssayLabsg™ access: ${link}`);
}
$("#stuName").addEventListener("input", updStuLink); updStuLink();

// Chrissy's approve page, opened from the student's WhatsApp link.
(async () => {
  const q = new URLSearchParams(location.search), target = q.get("approve"), name = q.get("n") || "Student";
  if(!target && !q.has("students") && !q.has("admin")) return;
  $("#adminBox").hidden = false;
  let key = ""; try{ key = localStorage.getItem("ec_admin") || ""; }catch{}
  const call = async (admin, extra) => fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({admin, key, ...extra})}).then(x => x.json()).catch(() => ({}));
  const showPromos = list => { $("#promoList").innerHTML = (list || []).map(pc => `<li><b>${esc(pc.code)}</b>: ${esc(pc.essays)} essay${pc.essays === 1 ? "" : "s"} each, ${esc(pc.left)} uses left</li>`).join(""); };
  const show = list => { $("#adminList").innerHTML = (list || []).map(st => `<li>${esc(st.name)} <button class="btn ghost" data-revoke="${esc(st.id)}" type="button" style="padding:4px 10px">Remove</button></li>`).join("") || "<li>No students approved yet.</li>"; };
  // Leads and funnel: stage counts, a filterable lead list with a suggested message per lead, and CSV export.
  // Suggested messages open in WhatsApp or the email app with the text filled in; nothing is sent from here.
  let leads = [], funnel = [];
  const PN = id => (PAPERS.find(x => x.id === id) || {name: id || ""}).name;
  const STG = {visit: "Visited", mark: "Free mark done", remark: "Re-mark done", lead: "Lead captured", pricing: "Viewed pricing", checkout: "Started checkout", paid: "Paid (plan active)", classes: "Interested in classes or tuition"};
  const SRC = {result: "Free result", challenge: "Weekly challenge", class: "Masterclass or group class", tuition: "Tuition", pricing: "Pricing", message: "Message Us"};
  const day = t => t ? new Date(t).toLocaleDateString("en-SG", {day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Singapore"}) : "";
  { const h = $("#leadCount").closest("h3"); if(h && h.firstChild) h.firstChild.textContent = "Leads and funnel ";
    const hint = h && h.nextElementSibling; if(hint && hint.classList.contains("hint")) hint.textContent = "People who left their details and ticked the consent box. Each suggested message opens in WhatsApp or your email app with the text filled in. Nothing is sent until you press send there.";
    const csvRow = $("#leadCsv").closest(".row");
    csvRow.insertAdjacentHTML("beforebegin", `<div id="funnelBox" style="overflow-x:auto"></div>
      <div class="row" id="leadFilters" style="gap:8px">
        <select id="lfStage" aria-label="Filter by stage" style="flex:1 1 150px;min-width:0;border:1.5px solid var(--rule);border-radius:10px;background:var(--sheet);color:var(--ink);padding:8px 10px"><option value="">All stages</option>${Object.entries(STG).filter(([k]) => k !== "visit").map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select>
        <select id="lfSource" aria-label="Filter by source" style="flex:1 1 150px;min-width:0;border:1.5px solid var(--rule);border-radius:10px;background:var(--sheet);color:var(--ink);padding:8px 10px"><option value="">All sources</option>${Object.entries(SRC).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select>
        <select id="lfStatus" aria-label="Filter by contact status" style="flex:1 1 150px;min-width:0;border:1.5px solid var(--rule);border-radius:10px;background:var(--sheet);color:var(--ink);padding:8px 10px"><option value="">Everyone</option><option value="todo">Not contacted yet</option><option value="done">Contacted</option><option value="ok">Can be contacted</option><option value="reply">Reply only</option><option value="out">Opted out</option></select>
        <input type="search" id="lfText" aria-label="Search leads" placeholder="Search name, number, email" style="flex:2 1 180px;min-width:0;border:1.5px solid var(--rule);border-radius:10px;background:var(--sheet);color:var(--ink);padding:8px 10px">
      </div>`);
    $("#leadCsv").textContent = "Download shown leads (CSV)"; }
  const showFunnel = f => { funnel = f || []; if(!funnel.length){ $("#funnelBox").innerHTML = ""; return; }
    const cell = (n, c, of) => `<td><b>${esc(n)}</b>${c === null || c === undefined ? "" : `<small>${esc(c)}% of ${of}</small>`}</td>`;
    $("#funnelBox").innerHTML = `<table class="fn-t"><caption>Devices reaching each stage for the first time. Percentages compare with the row above.</caption><thead><tr><th scope="col">Stage</th><th scope="col">Last 7 days</th><th scope="col">Last 30 days</th></tr></thead><tbody>${funnel.map(s => { const of = s.id === "classes" ? "visitors" : "the row above"; return `<tr><th scope="row">${esc(s.label)}</th>${cell(s.d7, s.c7, of)}${cell(s.d30, s.c30, of)}</tr>`; }).join("")}</tbody></table>`; };
  const shown = () => { const st = $("#lfStage").value, so = $("#lfSource").value, ss = $("#lfStatus").value, q = $("#lfText").value.trim().toLowerCase();
    return leads.filter(l => (!st || (st === "classes" ? l.stages && l.stages.classes : l.stage === st)) && (!so || (l.sources || [l.source]).includes(so))
      && (!ss || (ss === "out" ? !!l.optout : ss === "reply" ? l.consent && l.consent.scope === "reply" && !l.optout : ss === "ok" ? !l.optout && l.consent && l.consent.scope !== "reply" : ss === "todo" ? !l.contacted && !l.optout : !!l.contacted))
      && (!q || [l.name, l.phone, l.email].join(" ").toLowerCase().includes(q))); };
  const consentTxt = l => l.optout ? `Opted out ${day(l.optout)}` : !l.consent ? "No" : l.consent.scope === "reply" ? `Reply only (${day(l.consent.t)})` : `Yes, ${esc(l.consent.v)} (${day(l.consent.t)})`;
  const renderLeads = () => { const list = shown(); $("#leadCount").textContent = leads.length ? `(${list.length === leads.length ? leads.length : list.length + " of " + leads.length})` : "";
    $("#leadList").innerHTML = list.map(l => { const n = l.next || {};
      return `<li class="ld"><div><b>${esc(l.name)}</b>${l.level ? " · " + esc(l.level) : ""} <span class="chip">${esc(STG[l.stage] || "Lead captured")}</span>${l.stages && l.stages.classes ? ` <span class="chip">Classes</span>` : ""}${l.optout ? ` <span class="chip">Opted out</span>` : ""}</div>
        <div class="ld-meta">${[(l.sources || [l.source]).map(x => SRC[x] || x).join(", "), PN(l.paper), l.score, l.weak ? "Weakest: " + l.weak.split(" (")[0] : ""].filter(Boolean).map(esc).join(" · ")}</div>
        <div class="ld-meta">${[l.phone ? "+65 " + l.phone : "", l.email].filter(Boolean).map(esc).join(" · ")} · Consent: ${consentTxt(l)}</div>
        <div class="ld-meta">Last activity ${esc(day(l.last))} · Last contact ${l.contacted ? esc(day(l.contacted)) + (l.contacts > 1 ? ` (${esc(l.contacts)} times)` : "") : "never"}</div>
        <div><b>Next step:</b> ${esc(n.step || "")}</div>
        ${n.text ? `<details><summary style="cursor:pointer;font-size:13px">Suggested message</summary><p class="ld-msg">${esc(n.text)}</p></details>` : ""}
        <div class="row">${n.wa ? `<a class="btn primary" href="${esc(n.wa)}" target="_blank" rel="noopener">Open in WhatsApp</a>` : ""}${n.mail ? `<a class="btn ghost" href="${esc(n.mail)}">Open in email</a>` : ""}
          ${l.optout ? "" : `<button class="btn ghost" type="button" data-lc="${esc(l.id)}">Mark contacted</button><button class="btn ghost" type="button" data-lo="${esc(l.id)}">Opt out</button>`}<button class="btn ghost" type="button" data-lead="${esc(l.id)}">Delete</button></div></li>`; }).join("") || `<li class="ld">${leads.length ? "No leads match these filters." : "No leads yet."}</li>`; };
  const showLeads = list => { leads = list || []; renderLeads(); };
  ["#lfStage", "#lfSource", "#lfStatus", "#lfText"].forEach(s => $(s).addEventListener("input", renderLeads));
  $("#leadList").onclick = async e => { const d = (e.target.closest && e.target.closest("button") || {}).dataset || {};
    if(d.lc){ const r = await call("contacted", {target: d.lc}); if(r.ok){ showLeads(r.leads); showFunnel(r.funnel); toast("Marked as contacted."); } return; }
    if(d.lo){ if(!confirm("Opt this person out? They won't get any more suggested messages.")) return; const r = await call("optout", {target: d.lo}); if(r.ok){ showLeads(r.leads); toast("Opted out."); } return; }
    if(d.lead){ if(!confirm("Delete this lead and their details?")) return; await call("chremove", {target: d.lead}); const r = await call("leadremove", {target: d.lead}); if(r.ok){ showLeads(r.leads); toast("Deleted."); } } };
  $("#leadCsv").onclick = async () => {
    const r = await call("leadcsv", {ids: shown().map(l => l.id)}); if(!r.ok || typeof r.csv !== "string"){ toast("Save your admin key first."); return; }
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + r.csv], {type: "text/csv"})); a.download = "essaylab-leads.csv"; a.click();
  };
  const linkify = t => esc(t).replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');
  const showMsgs = list => { $("#msgCount").textContent = (list || []).length ? "(" + list.length + ")" : "";
    $("#msgList").innerHTML = (list || []).map(m => `<li><b>${esc(m.name)}</b> · ${new Date(m.t).toLocaleString("en-SG", {timeZone:"Asia/Singapore", day:"numeric", month:"short", hour:"numeric", minute:"2-digit"})}<br><span style="white-space:pre-wrap">${linkify(m.text)}</span><br><a href="https://wa.me/65${esc(m.phone)}" target="_blank" rel="noopener">Reply on WhatsApp (${esc(m.phone)})</a> ${m.uid ? `<button class="btn ghost" data-unlock="${esc(m.uid)}" data-name="${esc(m.name)}" type="button" style="padding:4px 10px">Unlock this device</button> ` : ""}<button class="btn ghost" data-msg="${esc(m.id)}" type="button" style="padding:4px 10px">Done</button></li>`).join("") || "<li>No messages yet.</li>"; };
  $("#msgList").onclick = async e => {
    const u = e.target.dataset && e.target.dataset.unlock;
    if(u){ const nm = e.target.dataset.name || "Student"; const r = await call("approve", {target: u, name: nm}); if(r.ok){ show(r.students); toast(nm + " unlocked"); } else toast("Save your admin key first."); return; }
    const id = e.target.dataset && e.target.dataset.msg; if(!id) return; const r = await call("msgdone", {target: id}); if(r.ok) showMsgs(r.messages); };
  // Testimonials: each has an On/Off switch (new ones start Off); two master switches hide a whole tab from the site.
  let tsMaster = {};
  const sw = (on, attrs, label) => `<button type="button" role="switch" aria-checked="${on}" ${attrs} style="display:inline-flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:5px 12px 5px 6px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;background:${on ? "#1E7F4F" : "#6B6B6B"};color:#fff"><i style="width:18px;height:18px;border-radius:50%;background:#fff;display:inline-block;pointer-events:none"></i>${label ? label + ": " : ""}${on ? "On" : "Off"}</button>`;
  const showTestis = (list, m) => { if(m) tsMaster = m; list = list || []; $("#tsCount").textContent = list.length ? "(" + list.length + ")" : "";
    if(!$("#tsMaster")) $("#tsList").insertAdjacentHTML("beforebegin", '<div id="tsMaster" style="display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 10px"></div>');
    $("#tsMaster").innerHTML = sw(tsMaster.essaylab !== false, 'data-tmaster="essaylab"', "Show EssayLabsg™ testimonials") + sw(tsMaster.masterclass !== false, 'data-tmaster="masterclass"', "Show Masterclass testimonials");
    $("#tsList").innerHTML = list.map(t => `<li${t.hidden ? ' style="opacity:.75"' : ""}><b>${esc(t.who)}</b> · ${t.g === "masterclass" ? "Masterclasses" : "EssayLabsg™"}${t.feature ? " · featured" : ""}${t.src === "review" ? ` · ${t.pending ? "Pending · " : ""}${"★".repeat(t.stars || 0)}${t.course ? " · " + esc(t.course) : ""} · ${new Date(t.t).toLocaleDateString("en-SG")} · ${t.consent ? "consent given" : "no consent (can't be shown)"}` : ""}<br><span style="white-space:pre-wrap">${esc(String(t.quote).slice(0, 180))}${String(t.quote).length > 180 ? "…" : ""}</span><br>${t.permission === false ? "" : sw(!t.hidden, `data-thide="${esc(t.id)}"`)} <button class="btn ghost" data-tdel="${esc(t.id)}" type="button" style="padding:4px 10px">Delete</button></li>`).join("") || "<li>None yet.</li>"; };
  $("#adminBox").addEventListener("click", async e => { const b = e.target.closest && e.target.closest("[data-tmaster]"); if(!b) return;
    const g = b.dataset.tmaster, r = await call("testimaster", {g, on: tsMaster[g] === false}); if(r.ok){ showTestis(r.testis, r.tmaster); toast("Saved."); } else toast("Save your admin key first."); });
  $("#tsForm").onsubmit = async e => { e.preventDefault();
    if(!$("#tsPerm").checked){ toast("Tick the permission box first."); return; }
    const r = await call("testiadd", {testi: {g: $("#tsG").value, who: $("#tsWho").value, role: $("#tsRole").value, course: $("#tsCourse").value, result: $("#tsResult").value, quote: $("#tsQuote").value, feature: $("#tsFeature").checked, permission: true}});
    if(r.ok){ showTestis(r.testis, r.tmaster); $("#tsForm").reset(); toast("Saved as Off. Switch it On when you're happy with it."); } else toast("Not saved. Check the name, quote and permission box, and your admin key."); };
  $("#tsList").onclick = async e => { const d = (e.target.closest && e.target.closest("[data-thide],[data-tdel]") || {}).dataset || {}; const id = d.thide || d.tdel; if(!id) return;
    if(d.tdel && !confirm("Delete this testimonial?")) return;
    const r = await call(d.tdel ? "testidel" : "testihide", {target: id}); if(r.ok) showTestis(r.testis, r.tmaster); };
  // Share kit for the owner: ready-to-paste texts for a WhatsApp broadcast, a DM, a Facebook post and an Instagram caption.
  { const L = "https://essaylab-sg.vercel.app", kit = [
      ["WhatsApp broadcast to parents", `EssayLabsg™ marks PSLE, O-Level, A-Level GP, IB and IGCSE essays in minutes, like the real exam. 3 free instant markings. Detailed feedback is S$39 for 4 reports, marked by Exam Preparation Specialists™ and ready within 48 hours. Built by our Exam Preparation Specialists™.

Share with 7 people. Get a free detailed report.

${L}`],
      ["Facebook / Instagram DM to a friend", `Saw this and thought of you: EssayLabsg™ gives free instant marking for PSLE, O-Level and GP essays (3 free instant markings). Detailed reports are S$39 for 4, marked by Exam Preparation Specialists™ and ready within 48 hours. Built by our Exam Preparation Specialists™.

Share with 7 people. Get a free detailed report.

${L}`],
      ["Facebook post", `EssayLabsg™: essay marking for PSLE English, O-Level English, A-Level GP, IB and IGCSE, like the real exam. Free to try (3 free instant markings). Detailed feedback is S$39 for 4 reports, marked by Exam Preparation Specialists™ and ready within 48 hours. From Thinking Hack™ and our Exam Preparation Specialists™.

Share with 7 people. Get a free detailed report.

${L}`],
      ["Instagram caption", `EssayLabsg™ marks your essay in minutes. PSLE, O-Level, GP, IB, IGCSE. Free instant marking (3 free instant markings). Detailed reports S$39 for 4. Built by our Exam Preparation Specialists™.

Share with 7 people. Get a free detailed report.

Link in bio: essaylab-sg.vercel.app

#EssayLabSG #ThinkingHack #ExamPreparationSpecialists #PSLE #OLevel`]];
    $("#adminBox .sheet-inner").insertAdjacentHTML("beforeend", `<h3 style="font-size:18px;margin-top:8px">Share Kit</h3><div id="kitList" style="display:flex;flex-direction:column;gap:12px">${kit.map(([h, t], i) => `<div><b>${esc(h)}</b><textarea readonly rows="5" style="width:100%;margin-top:6px;border:1.5px solid var(--rule);border-radius:10px;background:#fff;color:#111;padding:10px 12px;font:inherit">${esc(t)}</textarea><button class="btn ghost" type="button" data-kit="${i}" style="padding:6px 12px">Copy</button></div>`).join("")}</div>`);
    $("#kitList").onclick = async e => { const i = e.target.dataset && e.target.dataset.kit; if(i == null) return; try{ await navigator.clipboard.writeText(kit[+i][1]); toast("Copied."); }catch{ toast("Select the text and copy it."); } }; }
  // Student names: the example names on the landing page; edits save to the store and show on the site at once.
  const EX_SLOTS = [["chart", "Progress graph (landing page)", "Mei Ling", "JC1"], ["parent", "Parent report card (landing page)", "Ryan", "JC2"]];
  $("#adminBox .sheet-inner").insertAdjacentHTML("beforeend", `<h3 style="font-size:18px;margin-top:8px">Student Names</h3><p class="hint">Change a name and level, then Save. It shows on the site at once.</p><div id="exList" style="display:flex;flex-direction:column;gap:10px"></div><div class="row"><button class="btn primary" type="button" id="exSave">Save names</button></div>`);
  const showEx = m => { m = m || {}; $("#exList").innerHTML = EX_SLOTS.map(([id, where, dn, dl]) => { const v = m[id] || {name: dn, level: dl};
    return `<div data-slot="${id}" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center"><b style="min-width:220px">${esc(where)}</b><input class="exn" value="${esc(v.name)}" placeholder="Name" style="flex:1 1 140px;min-width:0"><input class="exl" value="${esc(v.level)}" placeholder="Level" style="flex:0 1 90px;min-width:0"></div>`; }).join(""); };
  $("#exSave").onclick = async () => { const names = {}; document.querySelectorAll("#exList [data-slot]").forEach(r => { names[r.dataset.slot] = {name: r.querySelector(".exn").value, level: r.querySelector(".exl").value}; });
    const r = await call("exnames", {names}); if(r.ok){ showEx(r.exnames); toast("Saved. It's on the site now."); } else toast("Save your admin key first."); };
  // Reports to check: each detailed report waits here until Chrissy approves it (promised within 48 hours).
  $("#adminBox .sheet-inner").insertAdjacentHTML("beforeend", `<h3 style="font-size:18px;margin-top:8px">Reports to Check <span class="counter" id="vetCount"></span></h3><div id="vetList" style="display:flex;flex-direction:column;gap:10px"></div>`);
  const showVets = list => { list = list || []; $("#vetCount").textContent = list.length ? "(" + list.length + ")" : "";
    $("#vetList").innerHTML = list.length ? list.map(r => { const due = r.t + 48 * 3600e3, late = Date.now() > due - 6 * 3600e3;
      return `<details style="border:1px solid #ECEAE7;border-radius:12px;padding:10px 12px;background:#fff"><summary><b>${esc(r.who || "Student")}</b> · ${esc(r.paper)} · ${r.total}/${r.max} · due ${new Date(due).toLocaleString("en-SG", {day: "numeric", month: "short", hour: "numeric", minute: "2-digit"})}${late ? ' <b style="color:#C4122F">soon</b>' : ""}</summary>
        <p><b>Verdict:</b> ${esc(r.verdict || "")}</p><p><b>Criteria:</b> ${(r.criteria || []).map(c => esc(c.name) + " " + c.score + "/" + c.max).join(" · ")}</p>
        <p><b>Fixes:</b></p><ol>${(r.fixes || []).map(f => `<li>${esc(f.title)}: ${esc(f.why || "")}</li>`).join("")}</ol>
        <button class="btn primary" type="button" data-vetok="${esc(r.id)}">Approve and send to student</button></details>`; }).join("") : "<p>Nothing waiting.</p>"; };
  $("#vetList").onclick = async e => { const id = e.target.dataset && e.target.dataset.vetok; if(!id) return; const r = await call("vetok", {target: id}); if(r.ok){ showVets(r.vets); toast("Approved. The student can open it now."); } };
  // Leads: every email given on the site, newest first, with a CSV export. Marketing goes only to consent = yes.
  const showSubs = list => { list = list || []; $("#subCount").textContent = list.length ? "(" + list.length + ")" : "";
    $("#subList").innerHTML = list.length ? `<table style="width:100%;border-collapse:collapse;font-size:14px"><tr><th align="left">Email</th><th align="left">Consent</th><th align="left">Paper</th><th align="left">Score band</th><th align="left">Source</th><th align="left">Time</th></tr>${list.map(s => `<tr><td>${esc(s.email)}</td><td>${s.consent ? "yes" : "no"}</td><td>${esc(s.paper || "")}</td><td>${esc(s.band || "")}</td><td>${esc((s.sources || [s.source]).join(", "))}</td><td>${new Date(s.t).toLocaleString("en-SG", {timeZone: "Asia/Singapore"})}</td></tr>`).join("")}</table>` : `<p>No leads yet.</p>`;
    $("#subCsv").onclick = () => { const q = v => '"' + String(v ?? "").replace(/"/g, '""') + '"'; const csv = ["email,consent,paper,score_band,source,time,consent_version"].concat(list.map(s => [s.email, s.consent ? "yes" : "no", s.paper, s.band, (s.sources || [s.source]).join(" "), new Date(s.t).toISOString(), s.consent_text_version].map(q).join(","))).join("\n");
      const el = document.createElement("a"); el.href = URL.createObjectURL(new Blob([csv], {type: "text/csv"})); el.download = "essaylab-leads.csv"; el.click(); }; };
  $("#adminBox .sheet-inner").insertAdjacentHTML("beforeend", `<h3 style="font-size:18px;margin-top:8px">Leads <span class="counter" id="subCount"></span></h3><div class="row"><button class="btn ghost" type="button" id="subCsv">Export CSV</button></div><div id="subList" style="overflow-x:auto"></div>`);
  const load = async () => { const r = await call("list", {}); if(r.ok){ call("freereset", {target: uid}).catch(() => {}); $("#adminLogin").hidden = true; show(r.students); showPromos(r.promos); showLeads(r.leads); showFunnel(r.funnel); showMsgs(r.messages); showTestis(r.testis, r.tmaster); showSubs(r.subs); showEx(r.exnames); showVets(r.vets); return true; } return false; };
  $("#pcAdd").onclick = async () => { const r = await call("promo", {promo: $("#pcCode").value, essays: +$("#pcEssays").value, uses: +$("#pcUses").value}); if(r.ok){ showPromos(r.promos); toast("Promo code created."); } else toast("Save your admin key first."); };
  $("#adminWho").textContent = target ? `${name} is asking for free student access on their device.` : "Your approved students, promo codes and leads.";
  if(target){ $("#adminApprove").hidden = false; $("#adminApprove").textContent = "Approve " + name; }
  $("#adminSave").onclick = async () => { key = $("#adminKey").value.trim(); try{ localStorage.setItem("ec_admin", key); }catch{} if(!(await load())) toast("That key didn't work."); };
  $("#adminApprove").onclick = async () => { const r = await call("approve", {target, name}); if(r.ok){ show(r.students); $("#adminApprove").hidden = true; toast(name + " approved."); } else toast("Save your admin key first."); };
  $("#adminList").onclick = async e => { const id = e.target.dataset && e.target.dataset.revoke; if(!id) return; const r = await call("revoke", {target: id}); if(r.ok){ show(r.students); toast("Removed."); } };
  if(key) await load();
})();

// Optional lead form: "Get your next steps and practice questions" after a free result, and class, tuition or pricing interest.
// Consent is a separate, unticked box; nothing is stored without it. The server keeps the exact wording below (version c1).
const CONSENT_V = "c1", CONSENT_TEXT = "I agree that EssayLabsg™ may contact me by WhatsApp or email about my child's progress, classes and offers. I can opt out at any time.";
const LEAD_LEVELS = ["P5", "P6", "Sec 1", "Sec 2", "Sec 3", "Sec 4", "Sec 5", "JC1", "JC2", "IB", "IGCSE", "Other"];
const CAPTURE = {
  result: ["Get your next steps and practice questions", "Leave a WhatsApp number or email and we'll send practice questions for your weakest area and what to work on next.", "Send me my next steps"],
  class: ["Get Class Dates and Updates", "Leave a WhatsApp number or email and we'll send masterclass and group class dates as they open.", "Send me class dates"],
  tuition: ["Ask about 1-to-1 classes", "Leave a WhatsApp number or email with the student's level, and we'll suggest a specialist for their subjects.", "Ask about 1-to-1 classes"],
  pricing: ["Not ready to decide yet?", "Leave a WhatsApp number or email and we'll send practice questions and news about detailed feedback.", "Send me updates"],
};
let leadSrc = "result";
{ const st = document.createElement("style");
  st.textContent = ".lf{display:flex;flex-direction:column;gap:4px;font-size:13.5px;font-weight:600;color:var(--ink)}.lf input,.lf select{width:100%;box-sizing:border-box;border:1.5px solid var(--rule);border-radius:10px;background:var(--sheet);color:var(--ink);padding:10px 12px;font:inherit;font-weight:400}"
    + ".linkish{background:none;border:0;padding:0;font:inherit;font-weight:700;color:inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer}.lead-line{margin:12px 0 0;font-size:14.5px}"
    + ".fn-t{width:100%;border-collapse:collapse;font-size:14px}.fn-t caption{text-align:left;font-size:13px;color:var(--ink-soft);padding-bottom:6px}.fn-t th,.fn-t td{padding:6px 8px;border-bottom:1px solid var(--rule);text-align:left;vertical-align:top}.fn-t td small{display:block;color:var(--ink-soft);font-size:12px}"
    + "#leadList .ld{list-style:none;border:1px solid var(--rule);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:4px;font-size:14px;min-width:0;overflow-wrap:anywhere}#leadList .ld .row{gap:6px;margin-top:4px}#leadList .ld .btn{padding:5px 10px;font-size:13px;text-decoration:none}.ld-meta{color:var(--ink-soft);font-size:13px}.ld-msg{white-space:pre-wrap;font-size:13px;margin:6px 0 0}";
  document.head.append(st); }
function weakOf(r){ const c = ((r && r.criteria) || []).filter(x => +x.max > 0).slice().sort((a, b) => a.score / a.max - b.score / b.max)[0]; return c ? String(c.name) : ""; }
function leadCtx(){ const r = last && !last.example && last.criteria ? last : null; return r ? {paper: r.paper, score: `${+r.total || 0}/${+r.max || 0}`, weak: weakOf(r)} : {paper: paperId}; }
function leadCtaHTML(r){
  if(isLead()) return "";
  const w = weakOf(r).split(" (")[0];
  return `<div class="sheet" style="margin-top:20px;border:1.5px solid var(--pen)"><div class="sheet-inner">
    <div class="sec-title"><h2>Get Your Next Steps and Practice Questions</h2></div>
    <p>We can send you practice questions for ${w ? `${esc(w)}, your weakest area in this essay,` : "your weakest area"} and what to work on next, by WhatsApp or email. It's optional.</p>
    <div class="row"><button class="btn primary" type="button" data-capture="result">Get my next steps</button></div>
  </div></div>`;
}
function leadBox(){
  let box = $("#leadBox"); if(box) return box;
  box = document.createElement("div"); box.id = "leadBox"; box.hidden = true;
  box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", "t-lead");
  box.style.cssText = "position:fixed;inset:0;z-index:40;background:rgba(10,14,25,.6);overflow:auto;padding:16px";
  box.innerHTML = `<form id="leadForm" class="sheet" style="max-width:520px;margin:6vh auto 0" novalidate><div class="sheet-inner" style="display:flex;flex-direction:column;gap:10px">
    <h2 id="t-lead" style="font-size:24px"></h2>
    <span class="hint" id="leadIntro"></span>
    <label class="lf">Parent or student name<input type="text" id="leadName" autocomplete="name" maxlength="40"></label>
    <div class="row" style="gap:10px"><label class="lf" style="flex:1 1 180px">WhatsApp number<input type="tel" id="leadPhone" autocomplete="tel" inputmode="tel" placeholder="8 digits"></label>
      <label class="lf" style="flex:1 1 180px">Email<input type="email" id="leadEmail" autocomplete="email"></label></div>
    <label class="lf">Student level<select id="leadLevel"><option value="">Choose a level</option>${LEAD_LEVELS.map(l => `<option>${l}</option>`).join("")}</select></label>
    <p class="hint" id="leadCtx" style="margin:0;font-size:13px"></p>
    <label style="display:flex;gap:8px;align-items:flex-start;font-size:13.5px;color:var(--ink)"><input type="checkbox" id="leadConsent" style="margin-top:3px"> <span>${CONSENT_TEXT}</span></label>
    <p class="hint" style="margin:0;font-size:12.5px">Give a WhatsApp number, an email or both. Under 18? Please use a parent's number or email. We keep your details for up to 2 years after our last contact, and you can ask us to delete them at any time. Reply STOP to any message to opt out.</p>
    <div class="row"><button class="btn primary" type="submit" id="leadSend"></button><button class="btn ghost" type="button" id="leadCancel">Not now</button></div>
  </div></form>`;
  document.body.append(box);
  $("#leadCancel").onclick = () => { box.hidden = true; };
  box.addEventListener("keydown", e => { if(e.key === "Escape") box.hidden = true; });
  $("#leadForm").addEventListener("submit", async e => {
    e.preventDefault();
    const name = $("#leadName").value.trim(), phone = $("#leadPhone").value.trim(), email = $("#leadEmail").value.trim(), level = $("#leadLevel").value;
    if(!name){ toast("Add a name."); $("#leadName").focus(); return; }
    if(!phone && !email){ toast("Add a WhatsApp number or an email."); $("#leadPhone").focus(); return; }
    if(phone && !chPhoneOk(phone)){ toast("Add a Singapore WhatsApp number (8 digits)."); $("#leadPhone").focus(); return; }
    if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){ toast("Check the email address."); $("#leadEmail").focus(); return; }
    if(!$("#leadConsent").checked){ toast("Tick the box so we can contact you."); return; }
    $("#leadSend").disabled = true;
    try{
      const r = await fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({capture: true, uid, source: leadSrc, name, phone, email, level, consent: true, cv: CONSENT_V, ...leadCtx()})}).then(x => x.json());
      if(!r.ok) throw r;
      store("ec_lead", "1"); box.hidden = true;
      document.querySelectorAll('[data-capture="result"]').forEach(b => { const s = b.closest(".sheet"); if(s) s.remove(); });
      toast("Thanks. We'll be in touch soon with your next steps.");
    }catch(err){ toast(err && err.error === "rate" ? "Please try again in an hour." : "That didn't send. Please try again in a minute."); }
    finally{ $("#leadSend").disabled = false; }
  });
  return box;
}
function openCapture(src){
  leadSrc = CAPTURE[src] ? src : "result"; const box = leadBox(), [h, intro, go] = CAPTURE[leadSrc];
  $("#t-lead").textContent = h; $("#leadIntro").textContent = intro; $("#leadSend").textContent = go;
  const me = (typeof chMe === "object" && chMe) || {};
  if(!$("#leadName").value && me.name) $("#leadName").value = me.name;
  if(!$("#leadPhone").value && me.phone) $("#leadPhone").value = me.phone;
  const c = leadCtx(), pn = c.paper ? (PAPERS.find(x => x.id === c.paper) || {}).name : "";
  $("#leadCtx").textContent = c.score ? `We'll include your latest result: ${pn}, ${c.score}${c.weak ? ", weakest area " + c.weak.split(" (")[0] : ""}.` : "";
  $("#leadCtx").hidden = !c.score;
  $("#leadConsent").checked = false;  // consent is never pre-ticked
  box.hidden = false; $("#leadName").focus();
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-capture]"); if(b){ e.preventDefault(); openCapture(b.dataset.capture); return; }
  if(e.target.closest && e.target.closest("[data-passbuy], [data-paynow]")) fnOnce("pricing");
  const a = e.target.closest && e.target.closest('a[href^="#msg"]');
  if(a){ let t = ""; try{ t = decodeURIComponent(a.getAttribute("href").split("text=")[1] || ""); }catch{} if(/masterclass|group class|tuition|class updates/i.test(t)) fnOnce("classes"); }
});
// Pricing viewed: the first time the pricing cards or terms are on screen.
if("IntersectionObserver" in window && !fnSent.includes("pricing")){
  const io = new IntersectionObserver(es => { if(es.some(x => x.isIntersecting)){ fnOnce("pricing"); io.disconnect(); } }, {threshold: 0.4});
  document.querySelectorAll("#specialist, .offer-paid").forEach(el => io.observe(el));
}
// Entry points for class, tuition and pricing interest.
{ const mc = $("#mcList"); if(mc) mc.insertAdjacentHTML("afterend", `<p class="lead-line">Want the dates first? <button type="button" class="linkish" data-capture="class">Get Class Dates and Updates</button></p>`);
  const cl = document.querySelector(".clinic .row"); if(cl) cl.insertAdjacentHTML("beforeend", `<button class="btn" type="button" data-capture="tuition" style="background:transparent;color:inherit;border:1.5px solid currentColor">Leave your details</button>`);
  const pb = $("#planBox"); if(pb) pb.insertAdjacentHTML("afterend", `<p class="lead-line">Not ready to decide yet? <button type="button" class="linkish" data-capture="pricing">Leave your details</button> and we'll send practice questions and news about detailed feedback.</p>`); }

// Enquiry desk chat.
const chat = [];
function addMsg(role, text){ const d = document.createElement("div"); d.className = "msg " + (role === "user" ? "me" : "bot"); d.textContent = text; $("#chatLog").append(d); $("#chatLog").scrollTop = $("#chatLog").scrollHeight; return d; }
$("#chatForm").addEventListener("submit", async e => {
  e.preventDefault(); const text = $("#chatIn").value.trim(); if(!text) return;
  $("#chatIn").value = ""; addMsg("user", text); chat.push({role:"user", content:text});
  const wait = addMsg("assistant", "Typing…"); $("#chatSend").disabled = true;
  try{
    const r = await fetch("/api/ask", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({messages: chat})}).then(x => x.json());
    if(!r.reply) throw 0;
    wait.textContent = r.reply; chat.push({role:"assistant", content:r.reply});
    if(r.ready && r.summary){ $("#chatWa").href = "/api/wa?text=" + encodeURIComponent(r.summary); $("#chatWa").hidden = false; }
  }catch{ wait.textContent = "Sorry, we couldn't answer just now. Please tap Message us at the bottom of the page."; chat.pop(); }
  finally{ $("#chatSend").disabled = false; }
});

// boot
paperId = store("ec_paper") || "gp";
// ?paper=<id> (from the per-paper guide pages) preselects that paper.
{ const qp = new URLSearchParams(location.search).get("paper"); if(qp && PAPERS.some(p => p.id === qp)){ paperId = qp; store("ec_paper", paperId); } }
const draft = store("ec_draft"); if(draft) $("#essay").value = draft;
renderPapers(); renderMasterclasses(); updCount(); updFree(); render(EXAMPLE); renderHist(); refreshStatus(); loadCh();
{ const cq = new URLSearchParams(location.search).get("challenge"); if(cq){ if(CH_PAPERS.includes(cq)) chTab = cq; setTimeout(() => $("#chBox").scrollIntoView({block:"start"}), 300); } }
try{ const saved = JSON.parse(localStorage.getItem("ec_last") || "null"); if(saved && saved.criteria){ last = saved; render(saved); } }catch{}
$("#photoBox").hidden = false;
