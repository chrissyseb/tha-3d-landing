
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
  example:true, paper:"gp", question:SAMPLE_Q, essay:SAMPLE,
  total:28, max:50, grade:"C (borderline B)", band:"Mid Band",
  verdict:"A clear, well-organised stand, but the argument asserts more than it proves and dismisses the other side instead of weighing it.",
  criteria:[
    {name:"Content (relevance, argument, evaluation, examples)",score:16,max:30,band:"Middle band",
     comment:"Every paragraph stays on the question and the stand is consistent. The reasoning stops one step short: each point names a harm but never shows how much harm, to whom, or why it outweighs the benefits.",
     strength:"Clear stand in the introduction that the conclusion keeps.",
     gap:"Evidence is vague ('many studies') and the counter-argument is dismissed in one line."},
    {name:"Language (clarity, range, accuracy, organisation)",score:12,max:20,band:"Middle band",
     comment:"Accurate and easy to follow, with sound paragraphing. The register is plain and repetitive ('young people' appears nine times) and linking is mechanical (Firstly, Secondly, Lastly).",
     strength:"Very few grammatical errors; paragraphs each carry one idea.",
     gap:"Limited range of vocabulary and sentence structures for A-Level."}
  ],
  fixes:[
    {title:"Replace vague evidence with one specific, checkable example",quote:"Many studies have shown that teenagers who use social media more are more unhappy.",
     why:"Examiners reward evidence they can verify. 'Many studies' earns nothing and caps Content in the middle band.",
     try:"Name one source and localise it, e.g. the 2023 US Surgeon General's advisory on social media and youth mental health, then ask whether Singapore's exam culture makes the comparison effect stronger here."},
    {title:"Weigh the other side instead of dismissing it",quote:"But this benefit is small compared to the harms.",
     why:"This is the single biggest loss of marks. A one-line dismissal is assertion, not evaluation, and 'How far' questions are marked on the weighing.",
     try:"Concede the benefit properly, then set a yardstick (e.g. 'harm that lasts outweighs convenience that can be replaced') and show why your side wins on it."},
    {title:"Define the terms and set your yardstick in the introduction",quote:"In today's modern world, social media is everywhere.",
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
const SITE = "https://essaylab-sg.vercel.app", SITE_HOST = "essaylab-sg.vercel.app";
// Share links carry the random referral code from the server, never the private uid (same as app.js).
const refQ = (pre) => { const c = store("ec_refcode"); return c && /^[a-z0-9]{8,32}$/.test(c) ? pre + "ref=" + c : ""; };
const shareLink = () => SITE + "/" + refQ("?");
const updWaTop = () => { const w = document.getElementById("waShareTop"); if(w) w.href = "https://wa.me/?text=" + encodeURIComponent("EssayLabsg™ by Thinking Hack™ marks PSLE, O-Level and GP essays like the real exam. Try one free: " + shareLink()); };
async function refreshStatus(){
  const r = await fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({status:true, uid, ref, code: myCode()})}).then(x => x.json()).catch(() => null);
  if(r && typeof r.left === "number"){ left = r.left; if(r.unlocked) unlocked = true; passUntilTs = r.until || 0; invited = r.invited || 0; earned = r.earned || 0; if(r.refcode) store("ec_refcode", r.refcode); renderInvites(); updWaTop(); updFree(); }
}
function showUnlock(why){ $("#upgradeWhy").textContent = why; $("#upgradeBox").hidden = false; }
function updFree(){
  $("#freeLeft").textContent = unlocked ? "Unlimited marking is on for this device."
    : left > 3 ? `${left} free markings left` : left > 0 ? `${left} of 3 free markings left` : "No free markings left";
}
function renderPapers(){
  $("#marksRow").hidden = !(PAPERS.find(x => x.id === paperId) || {}).lorms;
  $("#papers").innerHTML = PAPERS.map(p => `<button type="button" class="paper-opt" data-id="${p.id}" aria-pressed="${p.id===paperId}"><b>${esc(p.name)}</b><small>${esc(p.sub)}</small></button>`).join("");
}
$("#papers").addEventListener("click", e => {
  const b = e.target.closest(".paper-opt"); if(!b) return;
  paperId = b.dataset.id; store("ec_paper", paperId); renderPapers();
  $("#upgradeBox").hidden = true;
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
  if(!unlocked && left <= 0 && !(remarkOf && remarkOf.token)){ showUnlock("You've used your 3 free instant markings. Get 4 detailed reports for S$39, or share your link with 7 new people to earn a detailed report."); return; }
  if(!photo && words(essay) < 80){ notice("Your essay is too short to mark. Paste at least 80 words, or upload a photo of the script."); return; }
  notice(""); $("#markBtn").disabled = true; $("#stopBtn").hidden = false; $("#progress").hidden = false;
  ctl = new AbortController();
  setStage("up"); const tick = null;  // real steps: Uploading while the essay is prepared and sent, Marking while we wait, Done on results
  try{
    const image = photo ? await shrink(photo) : null;
    setStage("mark");
    const res = await fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, signal: ctl.signal,
      body: JSON.stringify({code: myCode(), teach: !!document.getElementById("teachOk")?.checked, uid, ref, lead_email: window.leadEmail ? leadEmail() : undefined, remark_token: remarkOf ? remarkOf.token : undefined, prev: remarkOf ? remarkOf.prev : undefined, paper: paperId, marks: +$("#marks").value || 10, question, essay: photo ? "" : essay, image, ...chPayload()})});
    const r = await res.json().catch(() => ({error:"bad_response"}));
    if(r.error === "needemail"){ if(window.showEmailGate) showEmailGate(r.left); return; }
    if(r.error === "weekly" || r.error === "freeused" || r.error === "ipweekly"){ left = 0; updFree(); showUnlock("You've used your 3 free instant markings. Get 4 detailed reports for S$39, or share your link with 7 new people to earn a detailed report.");  return; }
    if(!res.ok || r.error) throw {code: r.error || "server", message: r.message};
    if(!unlocked && typeof r.left === "number"){ left = r.left; updFree(); }
    if(false){ left = typeof r.left === "number" ? r.left : Math.max(0, left - 1); updFree(); }
    if(remarkOf){ r.prev = remarkOf.prev; remarkOf = null; $("#markBtn").textContent = "Mark My Essay"; }
    r.paper = paperId; r.question = question; r.essay = (r.transcript && r.transcript.trim()) || essay;
    if(timer.end){ r.timedMin = Math.round((Date.now() - timer.start) / 60000); r.timedOf = timer.min; stopTimer(); }
    last = r; try{ localStorage.setItem("ec_last", JSON.stringify(r)); }catch{}
    setStage("done"); addHist(r); render(r); renderHist(); if(r.challenge) loadCh();
    $("#result").scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"start"});
  }catch(e){
    if(e && e.name === "AbortError"){ notice(""); }
    else notice({busy:"Lots of students are marking right now. Please try again in a few minutes.",
      too_long:"That essay is too long for the free marker. Paste up to about 2,000 words.",
      image:"That photo couldn't be read. Try a clearer photo taken flat in good light.",
      full:"Free marking is full for this month. It reopens on the 1st. Tap Message us at the bottom of the page and we'll let you know when it reopens.",
      ipweekly:"Several people on this network have already used their free essay this week. Try on mobile data, or come back on Monday.",
      freeused:"You've used your 3 free instant markings. Get 4 detailed reports for S$39, or share your link with 7 new people to earn a detailed report.",
      weekly:"You've used your 3 free instant markings. Share with 7 people to get a detailed report free, or get Detailed feedback.",
      locked:"Free marking covers PSLE English, O-Level English and GP. Other subjects are for subscribers.",
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

function render(r){
  const p = PAPERS.find(x => x.id === r.paper) || PAPERS[0];
  const pct = Math.max(0, Math.min(1, (+r.total || 0) / (+r.max || 1)));
  const C = 2*Math.PI*50;
  $("#result").innerHTML = `
  <div class="sheet"><div class="sheet-inner">
    ${r.example ? `<span class="result-tag">Example: a JC1 GP essay, marked</span>` : `<span class="result-tag">Marked · ${esc(p.name)}</span>`}
    <div class="scorehead">
      <div class="ring" role="img" aria-label="Score ${esc(r.total)} out of ${esc(r.max)}">
        <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="var(--rule)" stroke-width="9"/>
        <circle cx="60" cy="60" r="50" fill="none" stroke="var(--red)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(C*pct).toFixed(1)} ${C.toFixed(1)}"/></svg>
        <div class="num"><b>${esc(r.total)}</b><small>${r.prev ? `was ${esc(r.prev.total)} · ` : ""}/ ${esc(r.max)}</small></div>
      </div>
      <div style="min-width:0">
        <div class="grade">${r.prev ? `<span class="chip" style="background:var(--good-soft);color:var(--good)">${(r.total - r.prev.total) >= 0 ? "+" : ""}${esc(r.total - r.prev.total)} marks after rewrite</span>` : ""}<span class="chip">Est. ${esc(r.grade)}</span>${r.challenge ? `<span class="chip" style="background:var(--good-soft);color:var(--good)">Challenge: ${esc(r.challenge.pct)}%${r.challenge.rank ? ` · #${esc(r.challenge.rank)} of ${esc(r.challenge.entries)}` : ""}</span>` : ""}</div>
        <h2 style="margin-top:24px">${esc(p.name)} · ${esc(p.sub.split(" /")[0]).replace(" Essay"," essay").replace(/-/g,"‑")}</h2>
        <p>${esc(r.verdict)}</p>
      </div>
    </div>
    ${r.question ? `<p class="hint" style="color:var(--ink-soft);font-size:14px"><b>Question:</b> ${esc(r.question)}</p>` : ""}
  </div></div>

  <div class="sheet" style="margin-top:20px"><div class="sheet-inner">
    <div class="sec-title"><h2>Criterion by criterion</h2></div>
    <div class="crit">${(r.criteria||[]).map(c => `
      <div class="crit-item">
        <div class="crit-top"><h3>${esc(tcase(c.name))}</h3><span class="mk">${(() => { const pc = r.prev && (r.prev.criteria || []).find(x => x.name === c.name); return pc ? `${esc(pc.score)} → ` : ""; })()}${esc(c.score)} / ${esc(c.max)}</span></div>
        <div class="bar"><i style="width:${Math.round(100*Math.max(0,Math.min(1,(+c.score||0)/(+c.max||1))))}%"></i></div>
        <span class="band">${esc(c.band)}</span>
        <p>${esc(c.comment)}</p>
        <div class="sg">${c.strength ? `<div class="s"><b>Keep:</b> ${esc(c.strength)}</div>` : ""}${c.gap ? `<div class="g"><b>Lift:</b> ${esc(c.gap)}</div>` : ""}</div>
      </div>`).join("")}</div>
  </div></div>

  <div class="sheet" style="margin-top:20px"><div class="sheet-inner">
    <div class="sec-title"><h2>Three fixes worth the most marks</h2></div>
    <ol class="fixes">${(r.fixes||[]).slice(0,3).map((f,i) => `
      <li class="fix"><span class="n" aria-hidden="true">${i+1}</span><div class="body">
        <h3>${esc(f.title)}</h3>${f.quote ? `<q>${esc(f.quote)}</q>` : ""}<p>${esc(f.why)}</p>
        <p class="try"><b>Try:</b> ${esc(f.try)}</p></div></li>`).join("")}</ol>
  </div></div>

  ${!r.prev && !r.example ? `<div class="sheet" style="margin-top:20px;background:var(--good-soft)"><div class="sheet-inner">
    <div class="sec-title"><h2>Fix it, then re-mark for free</h2></div>
    <p>Make the 3 fixes in your essay and mark it again. The re-mark is free and shows exactly how many marks you gained.</p>
    <div class="row"><button class="btn primary" id="remarkBtn" type="button" >Edit my essay and re-mark</button><a class="btn ghost" href="/app.html#planBox">Get detailed feedback · S$39</a></div>
  </div></div>` : ""}
  <div class="sheet" style="margin-top:20px"><div class="sheet-inner">
    <div class="sec-title"><h2>Your idea, rewritten at top band</h2><span class="hint" style="color:var(--ink-soft);font-size:13px">Model paragraph</span></div>
    <div class="model">
      <p class="before">${esc(r.model?.source_quote)}</p>
      <p class="after">${esc(r.model?.rewrite)}</p>
      <p class="why">${esc(r.model?.why)}</p>
    </div>
  </div></div>

  <div class="sheet" style="margin-top:20px"><div class="sheet-inner">
    <span class="kicker">A note from your specialist</span>
    <p class="note">${esc(r.note)}<span class="sign">Marked by EssayLabsg™ · our Exam Preparation Specialists™</span></p>
    ${r.next_target ? `<p class="target"><b>Next target:</b> <span>${esc(r.next_target)}</span></p>` : ""}
  </div></div>

  <div class="sheet" style="margin-top:20px"><div class="sheet-inner">
    <div class="sec-title"><h2>Your script, marked</h2><span class="hint" style="color:var(--ink-soft);font-size:13px">Numbers match the fixes</span></div>
    <div class="script">${annotate(r.essay || "", r.fixes)}</div>
    ${r.example ? "" : fbHTML(r) + shareBlockHTML(true) + emailCapHTML("result", "Get exam tips and the Nov–Dec class dates by email", "Keep me posted")}
  </div></div>

  <div class="row" style="margin-top:20px">
    <a class="btn primary" id="waSpecialist" href="#" target="_blank" rel="noopener" style="text-decoration:none;background:var(--ink);color:var(--sheet)">Have a specialist check this essay</a>
    <a class="btn ghost" id="waParent" href="#" target="_blank" rel="noopener" style="text-decoration:none">Send report to my parent</a>
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
      <a class="btn primary" id="mcRecBtn" href="#" target="_blank" rel="noopener" style="text-decoration:none">Sign up</a>
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
  $("#waSpecialist").href = "/api/wa?text=" + encodeURIComponent(`Hi, I'd like a specialist to check my ${(PAPERS.find(x => x.id === last.paper) || PAPERS[0]).name} essay. The free marker gave it ${last.total}/${last.max}.`);
  { const wk = (r.criteria || []).slice().sort((a,b) => (a.score/a.max) - (b.score/b.max))[0];
    const wkTxt = wk ? ` My weakest area from the marker: ${wk.name}.` : "";
    $("#waGroup").href = "/api/wa?text=" + encodeURIComponent(`Hi, please add me to the early list for your online ${(PAPERS.find(x => x.id === last.paper) || PAPERS[0]).name} group class.` + wkTxt);
    const mc = mcFor(last.paper);
    $("#mcRecName").textContent = `${mc.name} Masterclass (${mc.sessions} Sessions)`;
    $("#mcRecBlurb").textContent = mc.blurb;
    $("#mcRecBtn").href = mcHref(mc, wkTxt); }
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
  return summaryText(r, false) + `\n\nMarked by EssayLabsg™ · our Exam Preparation Specialists™: ${shareLink()}\nEnquiries about our Masterclasses or classes: reply here.\n\nEssayLabsg™ is a product of Thinking Hack™. © 2026 Christine Sebastian.`;
}
function summaryText(r, full){
  const p = PAPERS.find(x => x.id === r.paper) || PAPERS[0];
  let t = (r.prev ? `After rewrite: ${r.prev.total} → ${r.total}/${r.max}\n` : "") + `EssayLabsg™\n${p.name}: ${r.total}/${r.max} (${r.band}, est. ${r.grade})\n${r.verdict}\n\n`;
  t += (r.criteria||[]).map(c => `${c.name}: ${c.score}/${c.max}`).join("\n") + "\n\nTop 3 fixes:\n";
  t += (r.fixes||[]).slice(0,3).map((f,i) => `${i+1}. ${f.title}${full ? `\n   "${f.quote}"\n   ${f.why}\n   Try: ${f.try}` : ""}`).join("\n");
  t += `\n\nNext target: ${r.next_target || ""}\n\n${r.note}\nMarked by EssayLabsg™ · our Exam Preparation Specialists™`;
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
  if(ok){ unlocked = true; try{ localStorage.setItem("ec_code", code); }catch{} $("#upgradeBox").hidden = true; renderPapers(); updFree(); toast("Unlocked. Every subject is open."); }
  else toast(r && r.reason === "devices" ? "This code is already in use on 2 devices. WhatsApp us if it's yours." : "That code isn't active. Your pass may have ended, so top up or WhatsApp us.");
});

// Set this to the Stripe Payment Link (card + PayNow) once it exists; the Subscribe button appears automatically.
// In Stripe, set the link's success URL to https://<this site>/?paid={CHECKOUT_SESSION_ID}


// Weekly essay challenge (also the lead form: name, parent's WhatsApp, consent).
const CH_PAPERS = ["psle", "olang", "gp"], CH_LABEL = {psle:"PSLE", olang:"O-Level", gp:"GP"};
let chData = null, chTab = "gp", chOn = false;
const chMe = (() => { try{ return JSON.parse(localStorage.getItem("ec_ch") || "{}"); }catch{ return {}; } })();
if(chMe.name) $("#chName").value = chMe.name;
if(chMe.phone) $("#chPhone").value = chMe.phone;
if(chMe.consent) $("#chConsent").checked = true;
const chPhoneOk = v => /^[3689]\d{7}$/.test(String(v).replace(/\D/g, "").replace(/^65(?=\d{8}$)/, ""));
function renderCh(){
  $("#chTabs").innerHTML = CH_PAPERS.map(id => `<button type="button" class="paper-opt" aria-pressed="${id === chTab}" data-ch="${id}"><b>${CH_LABEL[id]}</b><small>${{psle:"Composition",olang:"Continuous Writing",gp:"Paper 1 Essay"}[id]}</small></button>`).join("");
  $("#chQ").textContent = chData && chData.challenge ? chData.challenge[chTab] : "Loading this week's question…";
  const b = chData && chData.boards && chData.boards[chTab];
  const list = (arr, fmt) => arr && arr.length ? `<ol class="lb">${arr.map((x, i) => `<li><i>${i+1}</i><span class="lb-n">${esc(x.name)}${x.lvl ? ` <small>${esc(x.lvl)}</small>` : ""}</span><em>${fmt(x.pct)}</em></li>`).join("")}</ol>` : `<p class="hint" style="margin:4px 0 0">Be the first this week!</p>`;
  $("#chBoard").innerHTML = `<div class="lb-head"><b>This week's leaderboard</b><span>Students show as first name and initial.</span></div><div><b class="lb-k">Top scores</b>${list(b && b.top, v => v + "%")}</div><div><b class="lb-k">Most improved</b>${list(b && b.improved, v => "+" + v + " pts")}</div>`;
  $("#chShare").href = "https://wa.me/?text=" + encodeURIComponent(`This week's ${CH_LABEL[chTab]} essay challenge: ${chData && chData.challenge ? chData.challenge[chTab] : ""}\nWrite it and get it marked free, then see if you can beat my score: ` + SITE + "/?challenge=" + chTab + refQ("&"));
}
$("#chTabs").addEventListener("click", e => { const b = e.target.closest("[data-ch]"); if(!b) return; chTab = b.dataset.ch; renderCh(); });
async function loadCh(){
  try{ chData = await fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({board: true})}).then(x => x.json()); }catch{}
  if(chData && chData.marked >= 20){ $("#community").textContent = `${chData.marked} students marked essays with us this week`; $("#community").hidden = false; }
  if(chData && chData.wk) $("#chWeek").textContent = "Week of " + new Date(chData.wk + "T00:00:00+08:00").toLocaleDateString("en-SG", {day:"numeric", month:"short", timeZone:"Asia/Singapore"});
  renderCh();
}
$("#chGo").addEventListener("click", async () => {
  const name = $("#chName").value.trim(), phone = $("#chPhone").value.trim(), consent = $("#chConsent").checked;
  if(!name){ toast("Add your first name for the leaderboard."); $("#chName").focus(); return; }
  if(!chPhoneOk(phone)){ toast("Add a Singapore WhatsApp number (8 digits)."); $("#chPhone").focus(); return; }
  if(!consent){ toast("Tick the box so we can send your rank."); return; }
  try{ localStorage.setItem("ec_ch", JSON.stringify({name, phone, consent})); }catch{}
  Object.assign(chMe, {name, phone, consent});
  fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({lead: true, uid, nickname: name, phone, consent, paper: chTab})}).catch(() => {});
  chOn = true; paperId = chTab; store("ec_paper", paperId); renderPapers();
  $("#question").value = chData && chData.challenge ? chData.challenge[chTab] : "";
  $("#essay").scrollIntoView({behavior:"smooth", block:"center"}); $("#essay").focus();
  toast("You're in! Write your essay below. Try timed exam mode for the real feel.");
});
function chPayload(){ return chOn && CH_PAPERS.includes(paperId) ? {challenge: true, nickname: chMe.name, phone: chMe.phone, consent: !!chMe.consent} : {}; }


// Story card and parent report: drawn on a canvas in the browser, no server or library cost.
const BRAND = {ink:"#1B2440", soft:"#56607A", pen:"#C4122F", penSoft:"#FBE7EA", good:"#2C3557", paper:"#F7F9FC", rule:"#D4DEEC", purple:"#111111", orange:"#E0703C", blue:"#2C3557", orb:["#6F8FD0","#8B6FD6","#E0703C"], sheet:"#FAFAF9", track:"#ECEAE7", box:"#F5F3F1"};
const SERIF = "'Inter Tight', Arial, sans-serif", SANS = "'Inter', Arial, sans-serif";
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
function signOff(g, W, y, color){ g.save(); g.textAlign = "center"; g.textBaseline = "alphabetic"; g.fillStyle = color; g.font = `22px ${SANS}`; g.fillText("EssayLabsg™ is a product of Thinking Hack™. © 2026 Christine Sebastian.", W / 2, y); g.restore(); }
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
const PRINT_HOST = SITE_HOST;  // the printed link on cards and reports
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
  g.font = `27px ${SANS}`; g.fillStyle = BRAND.soft; wrap(g, `Recommended: ${mc.name} Masterclass (${mc.sessions} Sessions). Small online groups, up to 6 students. Message us on WhatsApp to book.`, 100, H - 284, W - 200, 36, 2);
  pill(g, 100, H - 218, W - 200, 62, "Mark your next essay free at " + PRINT_HOST, 28);
  signHand(g, 80, H - 66, "left", 40);
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
  for(const c of [reportCanvas(r)]){ const jb = await new Promise(res => c.toBlob(res, "image/jpeg", 0.88)); pages.push({bytes: new Uint8Array(await jb.arrayBuffer()), w: c.width, h: c.height}); }
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
    $("#msgBox").hidden = true; toast("Sent. We'll reply on WhatsApp soon.");
  }catch{ toast("That didn't send. Please try again in a minute."); }
  finally{ $("#msgSend").disabled = false; }
});

// Timed exam mode: suggested writing time per paper, auto-marks when time is up.
const EXAM_MIN = {psle:50, pslesw:20, gp:90, gpaq:40, olang:70, olsw:40, olit:45, ss:35, hist:35, geog:25, ib1:75, ib2:105, igcse:60};
const timer = {end:0, start:0, min:0, id:0};
function fmt(ms){ const s = Math.max(0, Math.ceil(ms/1000)); return Math.floor(s/60) + ":" + String(s%60).padStart(2,"0"); }
function stopTimer(){ clearInterval(timer.id); timer.end = 0; $("#timerBtn").textContent = "Start timed exam mode"; $("#timerOut").textContent = ""; }
$("#timerBtn").addEventListener("click", () => {
  if(timer.end){ stopTimer(); return; }
  const cur = PAPERS.find(x => x.id === paperId) || PAPERS[0];
  timer.min = EXAM_MIN[paperId] || 45; timer.start = Date.now(); timer.end = timer.start + timer.min * 60000;
  $("#timerBtn").textContent = "Stop timer";
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
    crit: (r.criteria || []).map(c => ({name: c.name, score: c.score, max: c.max})), fixes: (r.fixes || []).slice(0,3).map(f => f.title)});
  try{ localStorage.setItem("ec_hist", JSON.stringify(h.slice(-60))); }catch{}
}
function weakSpots(h){
  const n = {};
  h.forEach(e => (e.crit || []).forEach(c => { if(c.max && c.score / c.max < 0.6){ const k = c.name.split(" (")[0]; n[k] = (n[k] || 0) + 1; } }));
  return Object.entries(n).sort((a,b) => b[1] - a[1]).slice(0,3);
}
function renderHist(){
  const h = getHist(); const box = $("#histBox");
  if(!h.length){ box.hidden = true; return; }
  box.hidden = false;
  const by = {}; h.forEach(e => (by[e.paper] = by[e.paper] || []).push(e));
  $("#histPapers").innerHTML = Object.entries(by).map(([pid, es]) => {
    const p = PAPERS.find(x => x.id === pid) || {name: pid}; const recent = es.slice(-8);
    const bars = recent.map(e => `<i title="${e.total}/${e.max}" style="display:block;width:100%;height:${Math.max(6, Math.round(e.total / e.max * 48))}px;background:${e.timed ? "var(--red)" : "var(--ink-soft)"};border-radius:4px 4px 0 0"></i>`).join("");
    const first = recent[0], lastE = recent[recent.length - 1];
    const d = recent.length > 1 ? Math.round((lastE.total / lastE.max - first.total / first.max) * 100) : 0;
    return `<div><div style="display:flex;justify-content:space-between;gap:8px"><strong>${esc(p.name)}</strong><span class="counter">${recent.map(e => e.total).join(" → ")} / ${lastE.max}${recent.length > 1 ? ` (${d >= 0 ? "+" : ""}${d}%)` : ""}</span></div>
      <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:4px;align-items:end;height:50px;margin-top:6px">${bars}</div></div>`;
  }).join("") + `<span class="hint" style="font-size:13px">Red bars were written in timed exam mode.</span>`;
  const w = weakSpots(h);
  $("#histWeak").innerHTML = w.length ? `<b>Your repeat weak spots</b><ol style="margin:6px 0 0;padding-left:20px">${w.map(([k, c]) => `<li>${esc(k)} <span class="hint">(below 60% in ${c} essay${c > 1 ? "s" : ""})</span></li>`).join("")}</ol>` : `<b>No repeat weak spots yet.</b> <span class="hint">Keep going!</span>`;
  const txt = "Essay progress from EssayLabsg™:\n" + Object.entries(by).map(([pid, es]) => { const p = PAPERS.find(x => x.id === pid) || {name: pid}; const r8 = es.slice(-8); return `${p.name}: ${r8.map(e => e.total).join(" → ")} / ${r8[r8.length-1].max}`; }).join("\n")
    + (w.length ? "\nWeak spots to work on: " + w.map(x => x[0]).join(", ") : "") + "\n" + SITE + "/";
  $("#histWa").href = "https://wa.me/?text=" + encodeURIComponent(txt);
}
const SUBSCRIBE_URL = "";
// Paste the WhatsApp Channel invite link here once it exists (followers never see the owner's number).
const COMMUNITY_URL = "";
if(COMMUNITY_URL){ $("#joinLink").href = COMMUNITY_URL; $("#joinLink").hidden = false; }
// Masterclasses (from the tutor profile). Paste a Stripe Payment Link into "pay" to take payment;
// while it's empty, "Sign up" sends a WhatsApp registration instead.
const MASTERCLASSES = [
  {id:"comp", name:"Comprehension Mastery", sessions:4, blurb:"Answer comprehension questions with confidence, under time pressure.", tags:["Question types","Language-use questions","Timed practice"], papers:["psle","pslesw"], pay:""},
  {id:"essay", name:"Argumentative Essay Writing", sessions:8, blurb:"Plan and write well-structured argumentative essays.", tags:["PEEL paragraphs","Counter-arguments","PAC/PACT","Timed essays"], papers:["gp","olang","olsw","igcse"], pay:""},
  {id:"aq", name:"GP AQ Clinic", sessions:4, blurb:"Improve your Paper 2 Application Question answer.", tags:["R-E-A-L framework","Evaluation","Applying to Singapore"], papers:["gpaq"], pay:""},
  {id:"lit", name:"Unseen Literature Clinic", sessions:4, blurb:"Read an unseen text closely and write clear analysis.", tags:["Close reading","PEEL-L analysis"], papers:["olit","ib1","ib2"], pay:""},
  {id:"sbcs", name:"Social Studies and History Source Analysis", sessions:4, blurb:"Handle each source-based question type in Social Studies and History.", tags:["LORMS levels","C-A-P-P source analysis","Reliability","Assertion questions"], papers:["ss","hist"], pay:""},
  {id:"case", name:"Humanities Essay and Case Study Bootcamp", sessions:8, blurb:"Write structured humanities essays and case-study answers.", tags:["LORMS essay structure","Case studies","Answering to the marking criteria"], papers:["geog","hist","ss"], pay:""},
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
function mcHref(m, extra){
  if(m.pay) return m.pay + (m.pay.includes("?") ? "&" : "?") + "client_reference_id=" + encodeURIComponent(uid);
  return "/api/wa?text=" + encodeURIComponent(`Hi, I'd like to ask about availability for the ${m.name} Masterclass (${m.sessions} Sessions).` + (extra || ""));
}
const GROUP_TEXT = "Hi, please add me to the early list for your online group classes.";
function renderMasterclasses(){
  $("#mcList").innerHTML = MASTERCLASSES.map(m => `<div style="border:1.5px solid var(--rule);border-radius:12px;padding:12px 14px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between">
    <span class="mc-orb" aria-hidden="true"></span><div style="flex:1 1 220px;min-width:0"><strong>${m.name}</strong> <span class="chip" style="white-space:nowrap">${m.sessions} Sessions</span><div style="color:var(--ink-soft);font-size:15px;margin-top:4px">${m.blurb}</div><div class="mc-tags">${(m.tags||[]).map(t => `<span>${t}</span>`).join("")}</div></div>
    <a class="btn ghost" href="${mcHref(m)}" style="text-decoration:none">Ask About Availability</a></div>`).join("");
  $("#waGroupTop").href = "/api/wa?text=" + encodeURIComponent(GROUP_TEXT);
}

if(SUBSCRIBE_URL){ $("#subLink").href = SUBSCRIBE_URL + (SUBSCRIBE_URL.includes("?") ? "&" : "?") + "client_reference_id=" + encodeURIComponent(ref); $("#subLink").hidden = false; }

// Returning from Stripe after paying: unlock straight away.
(async () => {
  const sid = new URLSearchParams(location.search).get("paid"); if(!sid) return;
  history.replaceState(null, "", location.pathname);
  const r = await fetch("/api/mark", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({check:true, code: sid, uid})}).then(x => x.json()).catch(() => ({}));
  if(r.ok){ unlocked = true; try{ localStorage.setItem("ec_code", sid); }catch{} renderPapers(); updFree();
    toast("Payment received. Every subject is unlocked" + (r.until ? " until " + new Date(r.until).toLocaleDateString("en-SG", {day:"numeric", month:"short"}) : "") + "."); }
  else toast("We couldn't confirm the payment yet. WhatsApp us and we'll sort it out.");
})();

const SHARE_TEXT = "EssayLabsg™ by Thinking Hack™, the free essay marking tool made in Singapore, for PSLE, O-Level, GP, IB and IGCSE. Paste your essay or snap a photo and get your band score, 3 fixes and a model paragraph in a minute. Get your essay marked like the real exam, free:";
const shareMsg = () => `${SHARE_TEXT} ${shareLink()}`;

// Share-7 progress bar and the "you've hit 7" celebration.
function shareProgHTML(){ return `<div class="sb-prog"><div class="sb-bar" role="progressbar" aria-valuemin="0" aria-valuemax="7" aria-valuenow="${invited}"><i style="width:${invited / 7 * 100}%"></i></div><p class="sb-count">${invited} of 7 shares towards your next free detailed report</p></div>`; }
function celebrate7(){
  if(document.getElementById("cele7")) return;
  const d = document.createElement("div"); d.id = "cele7"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "Free detailed report unlocked");
  d.innerHTML = `<div class="c7-card"><svg class="c7-tick" viewBox="0 0 52 52" aria-hidden="true"><path d="M14 27 l8 8 l16 -18"/></svg><b>You've hit 7! Your free detailed report is unlocked</b><p>Thank you for sharing EssayLabsg™. The bar starts again for your next 7.</p><div class="c7-row"><a class="c7-go" href="/app.html#planBox">Use my free report</a><button type="button" class="c7-x">Later</button></div>${Array.from({length: 18}, (_, i) => `<i class="c7-dot" style="--x:${(i * 37) % 100}%;--d:${(i % 6) * 0.12}s;--c:${["#C4122F","#4C3A9A","#E0703C","#6F8FD0"][i % 4]}"></i>`).join("")}</div>`;
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
  toast(r.message || (r.ok ? "Applied." : "That code isn't valid.")); if(r.ok){ $("#upgradeBox").hidden = true; refreshStatus(); }
}
$("#promoBtn").addEventListener("click", () => applyCode($("#promo").value));
(() => { const c = new URLSearchParams(location.search).get("code"); if(c){ history.replaceState(null, "", location.pathname); setTimeout(() => applyCode(c), 400); } })();

// Student access request: a WhatsApp message to Chrissy with a one-tap approve link for this device.
function updStuLink(){
  const name = $("#stuName").value.trim() || "a current student";
  const link = SITE + "/?approve=" + uid + "&n=" + encodeURIComponent(name);
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
  let leads = [];
  const PN = id => (PAPERS.find(x => x.id === id) || {name: id || ""}).name;
  const showLeads = list => { leads = list || []; $("#leadCount").textContent = leads.length ? "(" + leads.length + ")" : "";
    $("#leadList").innerHTML = leads.map(l => `<li><b>${esc(l.name)}</b> · ${esc(PN(l.paper))}${l.best ? " · best " + esc(l.best) + "%" : ""} · <a href="https://wa.me/65${esc(l.phone)}" target="_blank" rel="noopener">${esc(l.phone)}</a> <button class="btn ghost" data-lead="${esc(l.id)}" type="button" style="padding:4px 10px">Remove</button></li>`).join("") || "<li>No leads yet.</li>"; };
  $("#leadList").onclick = async e => { const id = e.target.dataset && e.target.dataset.lead; if(!id) return; await call("chremove", {target: id}); const r = await call("leadremove", {target: id}); if(r.ok){ showLeads(r.leads); toast("Removed."); } };
  $("#leadCsv").onclick = () => {
    const rows = [["Name","WhatsApp","Paper","Best %","Date"], ...leads.map(l => [l.name, "+65 " + l.phone, PN(l.paper), l.best || "", new Date(l.t).toLocaleDateString("en-SG")])];
    const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv"})); a.download = "essay-marker-leads.csv"; a.click();
  };
  const linkify = t => esc(t).replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');
  const showMsgs = list => { $("#msgCount").textContent = (list || []).length ? "(" + list.length + ")" : "";
    $("#msgList").innerHTML = (list || []).map(m => `<li><b>${esc(m.name)}</b> · ${new Date(m.t).toLocaleString("en-SG", {timeZone:"Asia/Singapore", day:"numeric", month:"short", hour:"numeric", minute:"2-digit"})}<br>${linkify(m.text)}<br><a href="https://wa.me/65${esc(m.phone)}" target="_blank" rel="noopener">Reply on WhatsApp (${esc(m.phone)})</a> <button class="btn ghost" data-msg="${esc(m.id)}" type="button" style="padding:4px 10px">Marked</button></li>`).join("") || "<li>No messages yet.</li>"; };
  $("#msgList").onclick = async e => { const id = e.target.dataset && e.target.dataset.msg; if(!id) return; const r = await call("msgdone", {target: id}); if(r.ok) showMsgs(r.messages); };
  const load = async () => { const r = await call("list", {}); if(r.ok){ $("#adminLogin").hidden = true; show(r.students); showPromos(r.promos); showLeads(r.leads); showMsgs(r.messages); return true; } return false; };
  $("#pcAdd").onclick = async () => { const r = await call("promo", {promo: $("#pcCode").value, essays: +$("#pcEssays").value, uses: +$("#pcUses").value}); if(r.ok){ showPromos(r.promos); toast("Promo code created."); } else toast("Save your admin key first."); };
  $("#adminWho").textContent = target ? `${name} is asking for free student access on their device.` : "Your approved students, promo codes and leads.";
  if(target){ $("#adminApprove").hidden = false; $("#adminApprove").textContent = "Approve " + name; }
  $("#adminSave").onclick = async () => { key = $("#adminKey").value.trim(); try{ localStorage.setItem("ec_admin", key); }catch{} if(!(await load())) toast("That key didn't work."); };
  $("#adminApprove").onclick = async () => { const r = await call("approve", {target, name}); if(r.ok){ show(r.students); $("#adminApprove").hidden = true; toast(name + " approved."); } else toast("Save your admin key first."); };
  $("#adminList").onclick = async e => { const id = e.target.dataset && e.target.dataset.revoke; if(!id) return; const r = await call("revoke", {target: id}); if(r.ok){ show(r.students); toast("Removed."); } };
  if(key) await load();
})();

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
const draft = store("ec_draft"); if(draft) $("#essay").value = draft;
renderPapers(); renderMasterclasses(); updCount(); updFree(); renderHist();

// Share EssayLabsg™: one-tap buttons after each result and in the footer. Links carry the referral code (shareLink).
const SHARE_WRITE = "Get your essay marked like the real exam, free. EssayLabsg™ by Thinking Hack™ marks PSLE, O-Level, GP, IB and IGCSE essays against the published criteria in minutes. Built by our Exam Preparation Specialists™. Try it:";
const SB_ICON = {ms: "M12 3C7 3 3 6.7 3 11.3c0 2.6 1.3 4.9 3.4 6.4V21l3.1-1.7c.8.2 1.6.3 2.5.3 5 0 9-3.7 9-8.3S17 3 12 3zM7 13l3.5-3.7 2 2 3.5-3.7", story: "M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM12 9v6M9 12h6", wa: "M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z", tg: "M21 4 3 11l5 2 2 6 3-4 5 4z", fb: "M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v7h4v-7h3l1-4h-4V8z", x: "M4 4l16 16M20 4 4 20", li: "M5 9h3v11H5zM6.5 4a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zM10 9h3v1.6c.5-1 1.8-1.8 3.4-1.8 3 0 3.6 2 3.6 4.6V20h-3v-5.6c0-1.4-.3-2.6-1.8-2.6s-2.2 1.1-2.2 2.6V20h-3z", copy: "M8 8h11v11H8zM5 5h11v2H7v9H5z", native: "M12 3v12M7 8l5-5 5 5M5 14v6h14v-6"};
// waOnly: after a free result the share stays WhatsApp only (it's the share-with-7 referral).
function shareBlockHTML(waOnly){
  const pill = (k, label) => `<button type="button" class="sb-btn${k === "wa" ? " sb-main" : ""}" data-sb="${k}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${SB_ICON[k]}"/></svg>${label}</button>`;
  if(waOnly) return `<div class="sb"><b class="sb-h">Share your link. When 7 new people open it, each on their own device and network, you get a free detailed report.</b>${shareProgHTML()}<div class="sb-row">${pill("wa", "Share on WhatsApp")}</div></div>`;
  return `<div class="sb"><b class="sb-h">Share EssayLabsg™</b><div class="sb-row">${pill("wa", "WhatsApp")}${pill("tg", "Telegram")}${pill("ms", "Messenger")}${pill("fb", "Facebook")}${pill("x", "X")}${pill("li", "LinkedIn")}${pill("story", "Instagram / TikTok Story")}${pill("copy", "Copy Link and Text")}${navigator.share ? pill("native", "More") : ""}</div></div>`;
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
  else { g.fillStyle = BRAND.ink; g.font = `400 48px ${SANS}`; wrap(g, "PSLE, O-Level, A-Level GP, IB and IGCSE, against the published criteria, in minutes.", W / 2, 1000, 820, 66, 3); }
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
updWaTop(); refreshStatus(); loadCh();
{ const cq = new URLSearchParams(location.search).get("challenge"); if(cq){ if(CH_PAPERS.includes(cq)) chTab = cq; setTimeout(() => $("#chBox").scrollIntoView({block:"start"}), 300); } }
try{ const saved = JSON.parse(localStorage.getItem("ec_last") || "null"); if(saved && saved.criteria){ last = saved; render(saved); } }catch{}
$("#photoBox").hidden = false;
