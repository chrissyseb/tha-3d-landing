/* © 2026 Christine Sebastian. All rights reserved. EssayLabsg™ website and marking engine. Unauthorised copying, reproduction or reuse is prohibited. */
const {analyse, promptBlock} = require("./_analyze.js");
const PAPERS = [
  {id:"psle", free:true, name:"PSLE English", sub:"Continuous Writing /36", level:"PSLE English Language (Primary 6), Paper 1 Continuous Writing (composition based on a topic and pictures)",
   criteria:[["Content",18],["Language and Organisation",18]],
   grades:"PSLE Achievement Level AL1 to AL8 (estimate for the composition only)",
   method:"Story-arc planning (hook, problem, climax, resolution and reflection), show-not-tell with the five senses and feelings, a clear link to the topic and at least one picture, and accurate, varied Primary-level sentences. Use only PSLE terms; never mention O-Level, GP or IB."},
  {id:"pslesw", free:true, name:"PSLE Situational", sub:"Situational Writing /14", level:"PSLE English Language (Primary 6), Paper 1 Situational Writing (letter, email or speech for a given purpose and audience)",
   criteria:[["Task Fulfilment",6],["Language and Organisation",8]],
   grades:"PSLE Achievement Level AL1 to AL8 (estimate for this section only)",
   method:"Purpose, Audience, Context (PAC) check, every required content point covered, correct format and register for the reader, and clear paragraphing. Use only PSLE terms; never mention O-Level, GP or IB."},
  {id:"gp", free:true, name:"GP Paper 1", sub:"A-Level essay /50", level:"A-Level (JC) General Paper 8881, Paper 1 essay",
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
   method:"For argumentative and expository essays, PEEL essay architecture (Point, Evidence, Explain, Link); for narrative and descriptive essays, pacing, showing not telling and a reflective ending. Always vivid but controlled vocabulary, varied sentence structures, and editing for accuracy."},
  {id:"olsw", free:true, name:"O-Level Situational", sub:"Situational Writing /30", level:"GCE O-Level English Language 1184, Paper 1 Situational Writing (email, letter, report, speech or proposal based on a visual text)",
   criteria:[["Task Fulfilment",10],["Language and Organisation",20]],
   grades:"O-Level grade A1 to F9 (estimate for this section)",
   method:"Purpose, Audience, Context (PAC) analysis, every task point addressed and developed with details from the visual stimulus, the correct format and tone for the reader, persuasive organisation, and accurate, varied language."},
  {id:"olit", name:"O-Level Literature", sub:"Prose/Drama/Poetry /20", level:"GCE O-Level Literature in English (Pure or Elective) essay question",
   criteria:[["Knowledge and understanding of the text",5],["Response to the question (argument)",5],["Analysis of language, form and structure",5],["Personal response and evaluation",5]],
   grades:"O-Level grade A1 to F9",
   method:"PEEL-L (Point, Evidence, Explain, Link, Language focus), close reading of word choice and form, character and conflict matrices, aligned to the Cambridge/SEAB band descriptors."},
  {id:"ss", name:"Social Studies", sub:"SBQ / SRQ, by levels", lorms:true, level:"GCE O-Level Social Studies (Combined Humanities), Source-Based Case Study question or Structured-Response Question",
   criteria:[["Level of Response (LORMS)",10]], grades:"O-Level grade A1 to F9 (estimate for this answer)",
   method:"SBCS toolkit (Comparison, Cross-Referencing, Surprise, Purpose, Utility) with inference supported by source evidence and provenance, and for SRQs the Strategy > Impact > Outcome chain with a balanced, evaluated conclusion."},
  {id:"hist", name:"History", sub:"SBCS / SRQ / essay, by levels", lorms:true, level:"GCE O-Level History (Pure or Elective), Source-Based Case Study, Structured-Response Question or essay",
   criteria:[["Level of Response (LORMS)",10]], grades:"O-Level grade A1 to F9 (estimate for this answer)",
   method:"SBCS toolkit (Comparison, Cross-Referencing, Surprise, Purpose, Utility) and Causal Factor Mapping: explained factors with specific historical detail, links between factors, and a reasoned judgement on the most important factor."},
  {id:"geog", name:"Geography", sub:"Structured / data response, by levels", lorms:true, level:"GCE O-Level Geography (Pure or Elective), structured, data-response or extended answer",
   criteria:[["Level of Response (LORMS)",10]], grades:"O-Level grade A1 to F9 (estimate for this answer)",
   method:"Data and graphic decoding (quote figures with units from the resource), process flowcharts for explanations, and named case studies with specific place detail; evaluate where the question asks 'to what extent'."},
  {id:"ib1", name:"IB Lang & Lit P1", sub:"Guided analysis /20", level:"IB DP Language A: Language and Literature, Paper 1 guided textual analysis",
   criteria:[["A: Understanding and interpretation",5],["B: Analysis and evaluation",5],["C: Focus and organisation",5],["D: Language",5]],
   grades:"IB grade 1 to 7 (estimate)",
   method:"Strict alignment with IB Criteria A to D: a clear interpretive thesis answering the guiding question, analysis of how authorial choices create meaning, and controlled academic register."},
  {id:"ib2", name:"IB Lang & Lit P2", sub:"Comparative essay /30", level:"IB DP Language A: Language and Literature, Paper 2 comparative essay",
   criteria:[["A: Knowledge, understanding and interpretation",10],["B: Analysis and evaluation",10],["C: Focus and organisation",5],["D: Language",5]],
   grades:"IB grade 1 to 7 (estimate)",
   method:"Comparative essay architecture: a thesis that compares from the first line, integrated point-by-point comparison, and evaluation of how each author's choices answer the question."},
  {id:"igcse", name:"IGCSE English", sub:"Composition /40", level:"Cambridge IGCSE First Language English 0500, Paper 2 composition",
   criteria:[["Content and Structure",16],["Style and Accuracy",24]],
   grades:"IGCSE grade A* to G",
   method:"Cambridge IGCSE marking scheme: purposeful structure, sustained register, precise and ambitious vocabulary, and accurate sentence control."}
];


// The framework each paper is audited against (the frameworks Singapore schools teach and mark schemes reward).
const PEEL = "PEEL audit: for each body paragraph check Point (a clear claim answering the question), Evidence (named and specific, or generic? say which), Explanation (causal depth: does it show how and why?) and Link (tied back to the question's key words).";
const STORY = "Decide the essay type first. Argumentative, discursive or expository: " + PEEL + " Narrative or descriptive: Show, Don't Tell audit plus 5-Stage Story Arc pacing (Exposition, Rising action, Climax, Falling action, Resolution): for each stage check it exists, is paced in proportion (the climax gets the most space), and shows feelings through actions, senses and dialogue instead of telling them.";
const FRAMEWORKS = {
  gp: ["PEEL", PEEL],
  psle: ["Story Arc + Show, Don't Tell", STORY],
  olang: ["PEEL or Story Arc", STORY],
  igcse: ["PEEL or Story Arc", STORY],
  pslesw: ["PAC/PACT", "PAC/PACT audit: rate Purpose (is the purpose clear and every required point covered?), Audience (is the register right for this reader?), Context and Format (correct format for the task) and Tone (consistent from start to end)."],
  olsw: ["PAC/PACT", "PAC/PACT audit: rate Purpose (is the purpose clear and every task point from the visual text covered and developed?), Audience (is the register right for this reader?), Context and Format (correct format for the task) and Tone (consistent from start to end)."],
  gpaq: ["R-E-A-L", "R-E-A-L audit: Relate (picks the author's views that fit and states a clear stand on each), Evaluate (weighs how far each view holds, with reasons), Apply to Singapore (names specific local policies, cultural traits or demographic realities, not generic 'in Singapore' statements) and Link (ties each point back to the author and the question)."],
  ss: ["LORMS + C-A-P-P", "LORMS audit: state which level hurdle the answer reached and what locks it there (e.g. 'Locked at L3 because the provenance is never tested'). Then check C-A-P-P on the source: Content (inference supported by source detail), Audience, Purpose (why the source was made) and Provenance (who, when, and does that affect reliability)."],
  hist: ["LORMS + C-A-P-P", "LORMS audit: state which level hurdle the answer reached and what locks it there (e.g. 'Locked at L3 because there is no cross-referencing or provenance testing'). Then check C-A-P-P on the sources: Content (inference supported by source detail, cross-referenced against other sources), Audience, Purpose (why the source was made) and Provenance (who, when, and does that affect reliability)."],
  geog: ["LORMS", "LORMS audit: state which level hurdle the answer reached and what locks it there. For each point check it is identified, explained with process or cause, and supported with a named example or data with units."],
  olit: ["PEEL-L", "PEEL-L audit: for each paragraph check Point, Evidence (a precise, well-chosen quotation), Explanation (analysis of word choice and its effect, not retelling), Link (to the question) and Language focus."],
  ib1: ["PEEL (IB Criteria A-D)", PEEL + " Relate each paragraph to IB Criteria A to D."],
  ib2: ["PEEL (comparative)", PEEL + " Also check that each paragraph compares both works rather than treating them one after the other."],
};
const fwBlock = p => { const f = FRAMEWORKS[p.id]; return f ? `FRAMEWORK AUDIT (${f[0]}): ${f[1]}\n` : ""; };
const fwName = p => (FRAMEWORKS[p.id] || ["Criteria"])[0];

function buildPrompt(p, question, essay, hasImage, marks, prev, facts){
  if(p.lorms){ const m = Math.max(2, Math.min(25, Math.round(+marks) || 10)); p = {...p, criteria:[["Level of Response (LORMS)", m]],
    method: p.method + ` This answer is marked by Levels of Response for ${m} marks: name the level reached (e.g. L3) in the criterion band, and say exactly what moves it to the next level in next_band.`}; }
  const crit = p.criteria.map(([n,m]) => `- ${n}: /${m}`).join("\n");
  const max = p.criteria.reduce((a,[,m]) => a+m, 0);
  return `You are the marking engine for EssayLabsg™, built to the marking criteria of a Singapore team of Exam Preparation Specialists™.

PAPER: ${p.level}
QUESTION: ${question || "(not given: infer it from the essay and say so in the verdict)"}
CRITERIA (total /${max}):
${crit}
GRADE SCALE: ${p.grades}
THE TEAM'S METHOD FOR THIS PAPER: ${p.method}
${fwBlock(p)}
HOW TO MARK
- Mark like a senior examiner for this exact paper, using its published band descriptors. Be calibrated and honest: no grade inflation, no harshness for show.
- Match every piece of advice to the essay type (narrative, descriptive, argumentative, expository): never suggest an argumentative structure for a story, or the reverse.
- The grade is an estimate of the standard this one piece shows, not a prediction of the whole exam.
- Use only this paper's level terms (no GP terms for O-Level, no O-Level terms for IB, and so on).
- Every "quote", "source_quote" and "evidence" must be copied character for character from the student's essay so it can be highlighted and checked.
- Explain every criterion mark: "evidence" is the short stretch of the essay that best shows the band reached, "descriptor" says in plain words what this paper's published descriptor for that band requires, and "next_band" says why it is not in the band above and the one change that would lift it.
- In all text the student sees: never use the words AI, automated, language model or marking system; never say or imply that a teacher, tutor or specialist personally read or marked this essay; use no em-dashes.
- If the essay is far too short, off-topic or not an essay, still return the JSON, mark it accordingly and say why in the verdict.
${hasImage ? "- The essay is in the attached photo(s) of a handwritten script. First transcribe it exactly (keep the student's spelling and paragraph breaks) into \"transcript\", then mark the transcript. If words are illegible write [illegible]." : "- No photo: set \"transcript\" to null."}

- Write as a teacher talking to the student. Never mention measured facts, measurements, analysis, flags or checks, and never put a phrase in quotation marks unless it is copied from the student's essay.
${prev ? `- This is the student's REVISED version of an essay you marked before. Previous marks: ${prev}. Mark it fresh at exactly the same standard (do not inflate). If it improved, the verdict must say exactly what improved and which marks it earned.\n` : ""}${facts ? facts + "- Your criterion marks and comments must be consistent with the measured facts, and your 3 fixes should target the most costly red or amber findings unless something in the essay costs more.\n\n" : ""}STUDENT'S ESSAY:
"""
${essay || "(see photo)"}
"""

Reply with ONLY one JSON object in this shape:
{"transcript": string|null,
 "total": number, "max": ${max}, "grade": string (estimated grade on the scale above), "band": string (short band name),
 "verdict": string (one sentence: the main reason for this mark),
 "criteria": [{"name": string (exactly as listed above), "score": number, "max": number, "band": string (the band or level reached), "descriptor": string (that band's descriptor for this criterion, under 25 words), "evidence": string (5 to 25 exact words from the essay that show this band), "comment": string (2 sentences), "strength": string (1 sentence), "next_band": string (one sentence under 30 words: why it is not in the next band up and what would lift it; if already in the top band, what keeps it there)}],
 "framework": {"name": "${fwName(p)}", "summary": string (one sentence naming the level or band hurdle the script reached and exactly what locks it there, e.g. "Locked at L3: no provenance testing"), "rows": [up to 6 objects, one per paragraph, story stage or PACT element as the framework requires: {"label": string (e.g. "Para 2", "Climax", "Tone"), "checks": [{"k": string (the framework element, e.g. Point, Evidence, Explanation, Link), "status": "ok"|"weak"|"missing", "note": string (under 18 words; for Evidence say named or generic)}]}]},
 "fixes": [exactly 3 objects, the changes worth the most marks first (fix 1 is the single biggest leak): {"tag": string (2-3 word name of the weakness in the framework's terms, e.g. "Weak Elaboration", "Generic Example", "Casual Register", "Missing Provenance"), "title": string (imperative, under 12 words), "quote": string (the student's exact words this fix targets, one sentence), "why": string (the examiner's verdict, direct like a red-pen margin note: why it costs marks, under 35 words), "rewrite": string (that same sentence rewritten at top-band standard, keeping the student's idea; for narrative, show instead of tell), "try": string (exactly what to do instead, under 45 words)}],
 "model": {"source_quote": string (the exact first sentence of the paragraph containing the biggest leak), "rewrite": string (that paragraph rewritten at top-band standard, keeping the student's ideas and stand, 90-140 words), "why": string (what makes the rewrite top band, naming the framework elements it fixes, under 45 words)},
 "note": string (60-90 words to the student in EssayLabsg™'s voice: warm, direct and specific, starts with a genuine strength, names the one habit to change, ends with one concrete task for this week; no emoji, no greeting, no sign-off; never say or imply that a teacher, tutor or specialist personally read, marked or reviewed this essay, and never mention years of experience, results or credentials),
 "next_target": string (one measurable target for the next essay)}`;
}


const CODES = (process.env.STUDENT_CODES || "").split(",").map(x => x.trim().toUpperCase()).filter(Boolean);
// Test links only: comma-separated network addresses that skip the free limit. Not set on Production, so it does nothing on the live site.
// Test links only for now: same essay, same settings, to steady the free marking score.
const STEADY_MARKS = process.env.VERCEL_ENV === "preview" ? {temperature: 0, seed: 7} : {};
function stripMachine(t){
  const FLAG = "[‘'\"“](?:No|Few|Little|Limited|Wide|Narrow|Precise|Good|Low|High|Some)\\s[^’'\"”]{2,70}[’'\"”]";
  return t
    .replace(/(?:^|(?<=[.!?]\s))[^.!?]*\b(?:measured (?:facts?|evidence|analysis)|the analytics|automated (?:check|analysis))\b[^.!?]*[.!?]\s*/gi, "")
    .replace(new RegExp("[,;]?\\s*(?:as\\s+)?(?:noted|indicated|shown|supported|flagged|evidenced|highlighted)\\s+by\\s+" + FLAG, "gi"), "")
    .replace(new RegExp("[,;]?\\s*(?:showing|such as|including)\\s+" + FLAG + "(?:\\s+and\\s+" + FLAG + ")?", "gi"), "")
    .replace(new RegExp("\\s*\\(?" + FLAG + "\\)?", "g"), "")
    .replace(/\s+([.,;:])/g, "$1").replace(/\s{2,}/g, " ").trim();
}
const FREE_LIMIT_BYPASS_IPS = (process.env.FREE_LIMIT_BYPASS_IPS || "").split(",").map(x => x.trim()).filter(Boolean);
const ADMIN_KEY = process.env.ADMIN_KEY || "";  // no fallback: admin is disabled unless ADMIN_KEY is set in Vercel
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";
// Test or live is decided by the key prefix alone (sk_test_/rk_test_ or sk_live_/rk_live_), the same on production and preview.
const STRIPE_MODE = /^(sk|rk)_test_/.test(STRIPE_KEY) ? "test" : /^(sk|rk)_live_/.test(STRIPE_KEY) ? "live" : "unset";
// "plink_abc:31,plink_def:93" maps each Stripe Payment Link to the days of access it sells.
const PASSES = Object.fromEntries((process.env.STRIPE_PASSES || "").split(",").filter(Boolean).map(x => { const [k, d] = x.split(":"); return [k.trim(), +d || 31]; }));
const passCache = new Map();
// The site creates each Checkout itself, so no Payment Link is needed: just STRIPE_SECRET_KEY in Vercel.
const PASS_CENTS = +process.env.PASS_PRICE_CENTS || 3900, PASS_DAYS = +process.env.PASS_DAYS || 31;
// Detailed feedback plan: a monthly card subscription, or the same 4 reports for 31 days paid once by PayNow (no auto-renewal).
const PLAN_CENTS = +process.env.PLAN_PRICE_CENTS || 3900, PLAN_REPORTS = +process.env.PLAN_REPORTS || 4, ONCE_DAYS = 31;
async function stripe(path, form){
  const r = await fetch("https://api.stripe.com/v1/" + path, form ? {method: "POST", body: form,
    headers: {"Authorization": "Bearer " + STRIPE_KEY, "Content-Type": "application/x-www-form-urlencoded"}} : {headers: {"Authorization": "Bearer " + STRIPE_KEY}});
  return r.json();
}
// Payment methods come from the Stripe Dashboard (this account rejects payment_method_types): switch on card, Apple Pay,
// Google Pay, PayNow and GrabPay there. Stripe offers only the methods that fit each mode, so a subscription shows card
// and the wallets that run on card, and the one-off pass also shows PayNow and GrabPay.
async function session(f, tag){
  const j = await stripe("checkout/sessions", f);
  if(!j.url) console.error("checkout " + tag, STRIPE_MODE, (j.error && j.error.message) || "no url");
  return j.url || "";
}
async function checkout(host, uid, ref, once){
  if(once){
    // 31-Day Pass, one-off: PayNow, GrabPay, card, Google Pay and Apple Pay (as switched on in the Dashboard).
    const f = new URLSearchParams({mode: "payment", "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "sgd", "line_items[0][price_data][unit_amount]": String(PLAN_CENTS),
      "line_items[0][price_data][product_data][name]": `EssayLabsg™ Detailed feedback (${PLAN_REPORTS} reports, ${ONCE_DAYS} days, one-off)`,
      success_url: `https://${host}/thanks.html?once={CHECKOUT_SESSION_ID}`, cancel_url: `https://${host}/#specialist`, "metadata[uid]": uid, "metadata[plan]": "once"});
    if(ref) f.set("client_reference_id", ref);
    return session(f, "once");
  }
  // Monthly Plan: card, Apple Pay and Google Pay; Stripe leaves out PayNow and GrabPay because they can't renew.
  const f = new URLSearchParams({mode: "subscription", "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "sgd", "line_items[0][price_data][unit_amount]": String(PLAN_CENTS),
    "line_items[0][price_data][recurring][interval]": "month",
    "line_items[0][price_data][product_data][name]": `EssayLabsg™ Detailed feedback (${PLAN_REPORTS} reports a month)`,
    success_url: `https://${host}/thanks.html?sub={CHECKOUT_SESSION_ID}`, cancel_url: `https://${host}/#specialist`,
    "metadata[uid]": uid, "subscription_data[metadata][uid]": uid});
  if(ref) f.set("client_reference_id", ref);
  return session(f, "sub");
}
// The subscription saved for this device: active or not, this billing month's window and reports used.
async function planInfo(uid){
  if(!STRIPE_KEY || !KV_URL || !uid) return {active: false};
  const sid = await kv("GET", "plan:" + uid);
  if(!sid){
    // PayNow one-off: 31 days from purchase, no renewal.
    const o = JSON.parse((await kv("GET", "once:" + uid)) || "null");
    if(!o || !(o.end * 1000 > Date.now())) return {active: false, once: !!o, end: o ? o.end : 0};
    const used = +(await kv("GET", `rep:${o.cs}:${o.start}`)) || 0;
    return {active: true, once: true, sid: o.cs, customer: "", start: o.start, end: o.end, used, left: Math.max(0, PLAN_REPORTS - used), reports: PLAN_REPORTS, cancelling: true};
  }
  const s = await stripe("subscriptions/" + encodeURIComponent(sid));
  const it = (s.items && s.items.data && s.items.data[0]) || {};
  const start = s.current_period_start || it.current_period_start || 0, end = s.current_period_end || it.current_period_end || 0;
  const active = s.status === "active" || s.status === "trialing";
  const used = start ? (+(await kv("GET", `rep:${sid}:${start}`)) || 0) : 0;
  return {active, sid, customer: s.customer || "", start, end, used, left: Math.max(0, PLAN_REPORTS - used), reports: PLAN_REPORTS, cancelling: !!s.cancel_at_period_end};
}

// A paid Stripe Checkout session (card or PayNow) is the subscriber's key until its pass runs out.
async function passInfo(key){
  if(!STRIPE_KEY || !/^cs_(live|test)_[A-Za-z0-9]+$/.test(key)) return {until: 0};
  const hit = passCache.get(key); if(hit && Date.now() - hit.t < 3600e3) return hit;
  let info = {until: 0, referrer: ""};
  try{
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions/" + key, {headers:{"Authorization":"Bearer " + STRIPE_KEY}});
    const j = await r.json();
    // Only the legacy pass counts: a one-off payment Checkout with no plan metadata, bought through a pass Payment Link or at the pass price.
    // PayNow-plan ("once") and subscription sessions are a different product and never unlock the pass.
    const md = j.metadata || {};
    const legacy = j.mode === "payment" && !md.plan && !j.subscription && (!!PASSES[j.payment_link] || (+j.amount_total === PASS_CENTS && (!j.currency || j.currency === "sgd")));
    if(j.payment_status === "paid" && legacy){ const days = PASSES[j.payment_link] || PASS_DAYS; info = {until: (j.created * 1000) + days * 86400e3, referrer: j.client_reference_id || ""}; }
  }catch(e){ console.error("stripe", e.message); }
  info.t = Date.now(); if(info.until) passCache.set(key, info);  // unpaid isn't cached, so a PayNow payment unlocks as soon as it clears
  return info;
}

// Constant-time string compare (hash both sides so the buffers are always the same length).
const sameKey = (a, b) => { const c = require("crypto"), h = x => c.createHash("sha256").update(String(x)).digest(); return c.timingSafeEqual(h(a), h(b)); };
// Browsers send Origin on cross-site POSTs: accept only this site, its own Vercel previews and localhost.
function originOk(req){
  // Only this site's own pages may call the API: Origin (or, failing that, Referer) must be this host, a vercel preview or localhost.
  let o = String(req.headers.origin || "");
  if(!o){ try{ o = new URL(String(req.headers.referer || "")).origin; }catch{ o = ""; } }
  if(!o) return false;
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim().toLowerCase();
  if(host && o.toLowerCase() === "https://" + host) return true;
  return /^https:\/\/(essay-marker(-[a-z0-9-]+)?|essaylab-sg)\.vercel\.app$/i.test(o) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(o);
}
// Leaderboard percentage from the paper's own criteria: each criterion score clamped to its known maximum, never the model's total or max.
function scorePct(p, criteria, marks){
  const crit = p.lorms ? [["Level of Response (LORMS)", Math.max(2, Math.min(25, Math.round(+marks) || 10))]] : p.criteria;
  const list = Array.isArray(criteria) ? criteria : [], norm = x => String(x || "").trim().toLowerCase();
  let got = 0, max = 0;
  crit.forEach(([n, m], i) => {
    const c = list.find(x => x && norm(x.name) === norm(n)) || list[i] || {};
    const sc = +c.score; got += Math.max(0, Math.min(m, isFinite(sc) ? sc : 0)); max += m;
  });
  return max > 0 ? Math.max(0, Math.min(100, Math.round(got / max * 100))) : 0;
}
// Share links carry a random referral code, not the uid (the uid is the private account id).
async function refCodeOf(uid){
  let c = await kv("GET", "refof:" + uid); if(c) return c;
  const crypto = require("crypto"), A = "abcdefghijklmnopqrstuvwxyz0123456789";
  for(let tries = 0; tries < 5; tries++){
    const code = "r" + Array.from(crypto.randomBytes(11), b => A[b % 36]).join("");
    if(!(await kv("SET", "refby:" + code, uid, "NX"))) continue;
    if(await kv("SET", "refof:" + uid, code, "NX")) return code;
    await kv("DEL", "refby:" + code); return (await kv("GET", "refof:" + uid)) || "";  // a parallel request made one first
  }
  return "";
}
// Old links used the uid itself as ?ref=, so an unknown code is still read as a uid and keeps crediting its referrer.
async function refOwner(ref){ if(!ref) return ""; return (await kv("GET", "refby:" + ref)) || ref; }

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

// Test links keep their own data: every key gets this prefix unless this is the live site.
const KV_PREFIX = process.env.VERCEL_ENV === "production" ? "" : "preview:";
const kvCmd = c => !KV_PREFIX || c.length < 2 ? c : c[0] === "MGET" ? [c[0], ...c.slice(1).map(k => KV_PREFIX + k)] : [c[0], KV_PREFIX + c[1], ...c.slice(2)];
async function kv(...cmd){
  if(!KV_URL) return null;
  const r = await fetch(KV_URL, {method:"POST", headers:{"Authorization":"Bearer " + KV_TOKEN, "Content-Type":"application/json"}, body: JSON.stringify(kvCmd(cmd))});
  return (await r.json()).result;
}
async function bindDevice(key, uid){
  if(!KV_URL) return true;
  if(!uid) return false;
  if(await kv("SISMEMBER", key, uid)) return true;
  if((+(await kv("SCARD", key)) || 0) >= 2) return false;
  await kv("SADD", key, uid); return true;
}
const INV_ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
// Every user gets 7 single-use invite codes for new people (the friend gets nothing extra);
// when all 7 are used the owner gets 1 bonus essay and a new set of 7.
async function invites(uid){
  let list = await kv("LRANGE", "invlist:" + uid, 0, 6);
  if(!list || list.length < 7){
    list = [];
    for(let i = 0; i < 7; i++){
      let code = "";
      for(let tries = 0; tries < 5; tries++){
        code = "EM-" + Array.from(require("crypto").randomBytes(5), b => INV_ALPHA[b % 32]).join("");
        if(await kv("SET", "inv:" + code, uid, "NX")) break;
      }
      list.push(code);
    }
    await kv("DEL", "invlist:" + uid); await kv("RPUSH", "invlist:" + uid, ...list);
  }
  const used = await Promise.all(list.map(c => kv("GET", "invused:" + c)));
  return list.map((code, i) => ({code, used: !!used[i]}));
}
async function redeem(code, uid){
  code = String(code || "").trim().toUpperCase();
  const owner = await kv("GET", "inv:" + code);
  if(owner){
    if(owner === uid) return {ok: false, message: "That's your own invite code. Send it to a friend."};
    // Only new people count: someone who has already marked an essay can't use an invite.
    if(await kv("GET", "seen:" + uid)) return {ok: false, message: "Invites are for people new to EssayLabsg™, but you can still mark your free essay this week."};
    if(!(await kv("SET", "redeemed:" + uid, code, "NX"))) return {ok: false, message: "You've already used an invite code."};
    if(!(await kv("SET", "invused:" + code, uid, "NX"))){ await kv("DEL", "redeemed:" + uid); return {ok: false, message: "That invite code has already been used."}; }
    const n = await kv("INCR", "invcount:" + owner);
    // All 7 used: the owner earns 1 bonus essay and gets a fresh set of 7.
    if(n >= 7){ await kv("INCR", "dc:" + owner); await kv("SET", "invcount:" + owner, 0); await kv("DEL", "invlist:" + owner); }
    return {ok: true, message: "Welcome! Your friend gets credit for inviting you. Share your own 7 links to earn a free detailed report too."};
  }
  const promo = await kv("GET", "promo:" + code);
  if(promo){
    const pr = JSON.parse(promo);
    if(!(await kv("SET", "promoused:" + code + ":" + uid, "1", "NX"))) return {ok: false, message: "You've already used this promo code."};
    const left = await kv("DECR", "promoleft:" + code);
    if(left < 0) return {ok: false, message: "This promo code has run out."};
    await kv("INCRBY", "c:" + uid, pr.essays || 1);
    return {ok: true, message: `Promo applied. You've got ${pr.essays || 1} bonus essay${(pr.essays || 1) === 1 ? "" : "s"}.`};
  }
  return {ok: false, message: "That code isn't valid."};
}
function weekKey(){ const d = new Date(Date.now() + 8*3600e3); const day = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - day); return d.toISOString().slice(0, 10); }
const okId = x => typeof x === "string" && /^[a-z0-9]{8,32}$/.test(x);
async function allowance(uid){
  const wk = weekKey();
  // Free instant marking: FREE_TOTAL per device in total (not per week), plus any bonus credits.
  const [used, credits, refs] = await Promise.all([kv("GET", `fu:${uid}`), kv("GET", `c:${uid}`), kv("GET", `r:${uid}`)]);
  return {used: +used || 0, credits: +credits || 0, refs: +refs || 0, wk, left: Math.max(0, FREE_TOTAL - (+used || 0)) + (+credits || 0)};
}

// Hard cap on free marks per month (SGT), so the AI bill for free users can't grow past budget.
// About US$0.03 per essay (estimate): a 2000-a-month safety cap is roughly US$60. Paying users and approved students aren't capped.
const FREE_MONTHLY_CAP = +process.env.FREE_MONTHLY_CAP || 2000;
// Chrissy (31 Oct): 3 free instant markings per person in total, counted by device id and by network address (either reaching 3 blocks).
const FREE_TOTAL = 3;
const FREE_NETWORK_DAILY = 20;  // free markings a day on one network address, once emails are given (shared school Wi-Fi)
const MEM = {day: "", n: 0};
const monthKey = () => new Date(Date.now() + 8*3600e3).toISOString().slice(0, 7);
// Models covered by the free monthly AI Gateway credit, best first.
const MODELS = ["google/gemini-2.5-flash", "openai/gpt-5-mini", "google/gemini-2.5-flash-lite"];
const hits = new Map();

// Detailed feedback: the marking engine writes the full report, which the student reads on the site straight away.
async function fullReport(p, question, essay, token){
  if(!token) return null;
  let analytics = null; try{ analytics = analyse(essay, p, question); }catch{}
  const prompt = buildPrompt(p, question, essay, false, 10, "", promptBlock(analytics));
  const str = (v, n) => String(v ?? "").slice(0, n);
  for(const model of MODELS){
    try{
      const r = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {method:"POST",
        headers:{"Authorization":"Bearer " + token, "Content-Type":"application/json"},
        body: JSON.stringify({model, max_tokens: 8000, response_format:{type:"json_object"}, messages:[{role:"user", content: prompt}]})});
      if(!r.ok) continue;
      const j = await r.json().catch(() => ({}));
      const o = parseJSON(String((((j.choices || [])[0] || {}).message || {}).content || ""));
      if(!o || !Array.isArray(o.criteria) || !o.criteria.length) continue;
      const fw = o.framework || {};
      return {
        total: +o.total || 0, max: +o.max || 0, grade: str(o.grade, 20), band: str(o.band, 60), verdict: str(o.verdict, 400),
        criteria: o.criteria.slice(0, 8).map(c => ({name: str(c.name, 80), score: +c.score || 0, max: +c.max || 0, band: str(c.band, 60), comment: str(c.comment, 600), strength: str(c.strength, 300), gap: str(c.gap, 300),
          descriptor: str(c.descriptor, 300), evidence: inEssay(str(c.evidence, 300), essay), next_band: str(c.next_band, 300)})),
        paras: {summary: str(fw.summary, 300), rows: (Array.isArray(fw.rows) ? fw.rows : []).slice(0, 6).map(x => ({label: str(x.label, 40), checks: (Array.isArray(x.checks) ? x.checks : []).slice(0, 6).map(c => ({k: str(c.k, 40), status: ["ok", "weak", "missing"].includes(c.status) ? c.status : "weak", note: str(c.note, 200)}))}))},
        fixes: (Array.isArray(o.fixes) ? o.fixes : []).slice(0, 3).map(f => ({title: str(f.title, 120), quote: inEssay(str(f.quote, 400), essay), why: str(f.why, 400), rewrite: str(f.rewrite, 600), try: str(f.try, 400)})),
        model: o.model && o.model.rewrite ? {rewrite: str(o.model.rewrite, 1500), why: str(o.model.why, 400)} : null,
        note: str(o.note, 900), next: str(o.next_target, 300)
      };
    }catch(e){ console.error("report", e.message); }
  }
  return null;
}
// Evidence is shown as the student's own words, so keep it only if it really is in the essay.
const normQ = s => String(s || "").replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\s+/g, " ").trim();
function inEssay(q, essay){
  const t = String(q || "").trim().replace(/^["\u201C]+|["\u201D]+$/g, "").trim(), n = normQ(t);
  return n.length >= 6 && normQ(essay).includes(n) ? t : "";
}
function parseJSON(t){
  try{ return JSON.parse(t); }catch{}
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if(a >= 0 && b > a){ try{ return JSON.parse(t.slice(a, b+1)); }catch{} }
  return null;
}


// Weekly essay challenge: one question per level each week (SGT Monday), rotating through this list.
const CHALLENGES = [
  {psle:"Write a composition about a time you had to make a difficult choice.", olang:"'Young people today have too many choices.' Do you agree?", gp:"'Technology has made us more connected but less close.' Discuss."},
  {psle:"Write a composition about a time someone's kindness surprised you.", olang:"Write about an occasion when you had to take responsibility for a mistake.", gp:"How far should governments decide what is good for their citizens?"},
  {psle:"Write a composition about an unexpected visitor.", olang:"'Sport teaches more important lessons than the classroom.' What are your views?", gp:"'Success is measured too narrowly in today's world.' Discuss."},
  {psle:"Write a composition about a time you were very proud of yourself.", olang:"Describe a place in Singapore that changes completely between day and night.", gp:"To what extent is it possible to protect the environment without slowing economic growth?"},
  {psle:"Write a composition about a mistake that taught you an important lesson.", olang:"'We should always tell the truth, even when it hurts.' Do you agree?", gp:"'The arts are a luxury that society cannot afford.' Is this true in your society?"},
  {psle:"Write a composition about a time you helped someone in need.", olang:"Write a story that ends with the words: 'I finally understood why she had kept the secret.'", gp:"Should social media companies be held responsible for the content on their platforms?"},
  {psle:"Write a composition about a competition you took part in.", olang:"'Older people have little to teach the young in a fast-changing world.' What do you think?", gp:"'Tradition has no place in a modern society.' Discuss with reference to your society."},
  {psle:"Write a composition about getting lost.", olang:"Write about a time when you had to adapt to something new.", gp:"How far is it true that science can solve the world's problems?"},
];
const CH_PAPERS = ["psle", "olang", "gp"];
function challengeOf(wk){ const i = Math.floor(Date.parse(wk + "T00:00:00Z") / (7 * 86400e3)); return CHALLENGES[((i % CHALLENGES.length) + CHALLENGES.length) % CHALLENGES.length]; }
const cleanPhone = n => { const d = String(n || "").replace(/\D/g, "").replace(/^65(?=\d{8}$)/, ""); return /^[3689]\d{7}$/.test(d) ? d : ""; };
const cleanName = n => String(n || "").replace(/[^A-Za-z .'-]/g, "").replace(/\s+/g, " ").trim().slice(0, 16);

// ---- Leads and funnel ----
// Singapore PDPA: contact details are kept for up to 2 years after the last contact or activity, then the KV TTL deletes them.
// Every write to a lead (capture, activity, "mark contacted", opt-out) sets the TTL again. Site messages and log lines get the same TTL.
const LEAD_TTL = 2 * 365 * 86400;
// The exact consent wording each form shows, by version. The server stores this text (never text sent by the browser).
const CONSENTS = {
  c1: {scope: "all", text: "I agree that EssayLabsg™ may contact me by WhatsApp or email about my child's progress, classes and offers. I can opt out at any time."},
  ch1: {scope: "all", text: "Send my rank and next week's question. I agree that EssayLabsg™ may contact me by WhatsApp or email about my child's progress, classes and offers. I can opt out at any time. Under 18? Please use a parent's number."},
  // Challenge entrants before October 2026 agreed to this narrower wording: the challenge and classes only.
  ch0: {scope: "classes", text: "Send my rank and next week's question on WhatsApp. We use this number only for the challenge and our classes, never share it, and stop when you reply STOP. Under 18? Please use a parent's number."},
  // The Message us form: consent to a reply about that message only, never offers.
  msg1: {scope: "reply", text: "You can contact me on WhatsApp about this. Under 18? Please use a parent's number."},
};
// Funnel stages, in order. Each is a sorted set fs:<id> of uid -> the first time that device reached the stage (ZADD NX: one write).
const STAGES = [["visit", "Visited"], ["mark", "Free mark done"], ["remark", "Re-mark done"], ["lead", "Lead captured"], ["pricing", "Viewed pricing"],
  ["checkout", "Started checkout"], ["paid", "Paid (plan active)"], ["classes", "Interested in classes or tuition"]];
const LEAD_LEVELS = ["P5", "P6", "Sec 1", "Sec 2", "Sec 3", "Sec 4", "Sec 5", "JC1", "JC2", "IB", "IGCSE", "Other"];
const LEAD_SOURCES = ["result", "challenge", "class", "tuition", "pricing", "message"];
const SOURCE_LABEL = {result: "Free result", challenge: "Weekly challenge", class: "Masterclass or group class", tuition: "Tuition", pricing: "Pricing", message: "Message us"};
const CLASS_WORDS = /masterclass|group class|tuition|lesson|trial|class updates/i;
const cleanEmail = e => { const s = String(e || "").trim().toLowerCase().slice(0, 120); return /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(s) ? s : ""; };
const cleanFull = n => String(n || "").replace(/[^A-Za-z .'-]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
const cleanWeak = w => String(w || "").replace(/[^A-Za-z0-9 ,:()&'-]/g, "").replace(/\s+/g, " ").trim().slice(0, 80);
// A newly active paid plan lands in admin Messages (and on the phone when NTFY_TOPIC is set), so a payment is never missed.
async function paidAlert(uid, i){
  try{
    if(!(await kv("SET", "paidalert:" + uid + ":" + (i.start || 0), "1", "NX", "EX", 40 * 86400))) return;  // once per plan period
    const id = require("crypto").randomBytes(8).toString("hex");
    const text = `[Payment] Detailed feedback ${i.once ? "PayNow 31-day plan" : "card subscription"} is active for device ${uid}: ${i.reports} reports, ends ${new Date((i.end || 0) * 1000).toISOString().slice(0, 10)}.`;
    await kv("SET", "msg:" + id, JSON.stringify({name: "Payment", phone: "", text, uid, t: Date.now()}), "EX", LEAD_TTL);
    await kv("ZADD", "msgs", Date.now(), id);
    if(process.env.NTFY_TOPIC){ try{ await fetch("https://ntfy.sh/" + encodeURIComponent(process.env.NTFY_TOPIC), {method: "POST", headers: {"Title": "EssayLab: new payment"}, body: text}); }catch{} }
  }catch(e){ console.error("paidAlert", e.message); }
}
// Testimonials: text only (tags and control characters stripped), kept until deleted.
const cleanText = (t, n) => String(t || "").replace(/<[^>]*>/g, "").replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, n);
// One-off cleanup (31 Oct): remove the six testimonials that were seeded on 31 Oct; Chrissy adds her own in ?admin.
const SEEDED_IDS = [1, 2, 3, 4, 5, 6].map(n => "b" + String(n).padStart(15, "0"));
async function unseedTestis(){ if(!(await kv("GET", "testiseed"))) return; for(const id of SEEDED_IDS){ await kv("DEL", "testi:" + id); await kv("ZREM", "testis", id); } await kv("DEL", "testiseed"); }
// A detailed report waiting for Chrissy's check: the student sees only that it's coming (no marks or comments yet).
const stubOf = r => ({id: r.id, t: r.t, n: r.n, of: r.of, free: r.free, paper: r.paper, sub: r.sub, question: r.question, words: r.words, status: "review"});
async function testiList(all){
  try{ await unseedTestis(); }catch(e){ console.error("unseed", e.message); }
  const ids = (await kv("ZRANGE", "testis", 0, 199, "REV")) || [];
  const raw = ids.length ? (await kv("MGET", ...ids.map(id => "testi:" + id))) || [] : [];
  return ids.map((id, i) => raw[i] ? JSON.parse(raw[i]) : null).filter(t => t && (all || !t.hidden));
}
async function stage(uid, s){ if(!KV_URL || !okId(uid)) return; try{ await kv("ZADD", "fs:" + s, "NX", Date.now(), uid); }catch(e){ console.error("funnel", e.message); } }
// A device that has left its details comes back: its lead (and the 2-year clock) is refreshed. Two writes, only for leads.
async function touchLead(uid){ if(!KV_URL || !okId(uid)) return; try{ if(await kv("EXPIRE", "lead:" + uid, LEAD_TTL)) await kv("ZADD", "leads", "XX", Date.now(), uid); }catch{} }
// Challenge entrants, Message us senders and the optional "next steps" form all become leads for the admin funnel view.
async function saveLead(uid, b, extra){
  const phone = cleanPhone(b.phone), email = cleanEmail(b.email), name = cleanFull(b.name || b.nickname);
  const cv = b.contact ? "msg1" : CONSENTS[b.cv] ? b.cv : "ch0", c = CONSENTS[cv];
  if(!okId(uid) || b.consent !== true || !(phone || email)) return false;
  const now = Date.now(), old = JSON.parse((await kv("GET", "lead:" + uid)) || "{}");
  const src = b.contact ? "message" : LEAD_SOURCES.includes(b.source) ? b.source : "challenge";
  // A reply-only consent never narrows a wider consent given earlier (unless they opted out since).
  const keep = old.consent && c.scope === "reply" && old.consent.scope !== "reply" && !old.optout;
  const lead = {...old, name: name || old.name || "Student", phone: phone || old.phone || "", email: email || old.email || "",
    level: LEAD_LEVELS.includes(b.level) ? b.level : (old.level || ""), paper: PAPERS.some(p => p.id === b.paper) ? b.paper : (old.paper || ""),
    score: /^\d{1,3}\/\d{1,3}$/.test(String(b.score || "")) ? String(b.score) : (old.score || ""), weak: cleanWeak(b.weak) || old.weak || "",
    source: src, sources: [...new Set([...(old.sources || (old.t ? ["challenge"] : [])), src])].slice(-8),
    consent: keep ? old.consent : {v: cv, scope: c.scope, text: c.text, t: now}, t: old.t || now, ...(extra || {})};
  if(!keep && c.scope !== "reply") delete lead.optout;  // a fresh, wider consent replaces an earlier opt-out
  await kv("SET", "lead:" + uid, JSON.stringify(lead), "EX", LEAD_TTL);
  await kv("ZADD", "leads", now, uid);
  await stage(uid, "lead");
  if(src === "class" || src === "tuition" || (src === "message" && CLASS_WORDS.test(String(b.text || "")))) await stage(uid, "classes");
  return true;
}
// Unsubscribe links carry the uid encrypted (AES-GCM), so a forwarded email never reveals the device's private id and no KV write is needed.
const UNSUB_SECRET = process.env.UNSUB_SECRET || ADMIN_KEY;
function unsubKey(){ return require("crypto").createHash("sha256").update("essaylab-unsub:" + UNSUB_SECRET).digest(); }
function unsubToken(uid){
  if(!UNSUB_SECRET || !okId(uid)) return "";
  const c = require("crypto"), k = unsubKey(), iv = c.createHmac("sha256", k).update(uid).digest().subarray(0, 12);
  const ci = c.createCipheriv("aes-256-gcm", k, iv), ct = Buffer.concat([ci.update(uid, "utf8"), ci.final()]);
  return Buffer.concat([iv, ct, ci.getAuthTag()]).toString("base64url");
}
function unsubUid(tok){
  try{
    if(!UNSUB_SECRET || !/^[A-Za-z0-9_-]{40,120}$/.test(String(tok))) return "";
    const c = require("crypto"), b = Buffer.from(String(tok), "base64url"), d = c.createDecipheriv("aes-256-gcm", unsubKey(), b.subarray(0, 12));
    d.setAuthTag(b.subarray(b.length - 16));
    const uid = Buffer.concat([d.update(b.subarray(12, b.length - 16)), d.final()]).toString("utf8");
    return okId(uid) ? uid : "";
  }catch{ return ""; }
}
async function unsubPage(res, tok, del){
  const uid = unsubUid(tok); let state = uid ? "done" : "bad";
  if(uid && KV_URL){
    try{
      if(del){
        await kv("DEL", "lead:" + uid); await kv("ZREM", "leads", uid);
        for(const [s] of STAGES) await kv("ZREM", "fs:" + s, uid);
        state = "deleted";
      } else {
        const l = JSON.parse((await kv("GET", "lead:" + uid)) || "null");
        if(l && !l.optout){ l.optout = Date.now(); l.optoutBy = "link"; await kv("SET", "lead:" + uid, JSON.stringify(l), "EX", LEAD_TTL); }
      }
    }catch(e){ console.error("unsub", e.message); state = "error"; }
  }
  const body = {
    done: `<h1>You're unsubscribed</h1><p>EssayLabsg™ won't send you any more messages about progress, classes or offers.</p>
      <form method="post" action="/api/mark"><input type="hidden" name="unsubdel" value="${String(tok).replace(/[^A-Za-z0-9_-]/g, "")}"><p>We keep a note that you opted out for up to 2 years so that we don't contact you again. You can also ask us to delete your details now.</p><button type="submit">Delete my details</button></form>`,
    deleted: `<h1>Your details have been deleted</h1><p>EssayLabsg™ no longer holds your name, number or email, and won't contact you again.</p>`,
    bad: `<h1>This link isn't valid</h1><p>To stop messages from EssayLabsg™, reply STOP to any message we sent you, or tap Message us on our site.</p>`,
    error: `<h1>Something went wrong</h1><p>Please try the link again in a minute, or reply STOP to any message we sent you.</p>`}[state];
  res.setHeader("Content-Type", "text/html; charset=utf-8"); res.setHeader("Cache-Control", "no-store"); res.setHeader("X-Robots-Tag", "noindex");
  return res.status(state === "bad" ? 400 : state === "error" ? 503 : 200).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>EssayLabsg™</title>
<style>body{font:16px/1.55 system-ui,-apple-system,Segoe UI,Arial,sans-serif;margin:0;padding:40px 16px;background:#F7F9FC;color:#1B2440}main{max-width:520px;margin:0 auto;background:#fff;border:1px solid #D4DEEC;border-radius:14px;padding:24px}h1{font-size:24px;margin:0 0 10px}button{font:inherit;font-weight:700;padding:10px 16px;border-radius:10px;border:1.5px solid #1B2440;background:#fff;color:#1B2440;cursor:pointer}a{color:#1B2440}</style></head>
<body><main>${body}<p><a href="/">Back to EssayLabsg™</a></p><p style="font-size:13px;color:#56607A">EssayLabsg™ is a product of Thinking Hack™. © 2026 Christine Sebastian.</p></main></body></html>`);
}

// Practice tips by weakest criterion, for the suggested follow-up message.
function tipFor(weak, paper){
  const w = String(weak || "").toLowerCase();
  if(/task fulfil/.test(w)) return "before writing, list every point the task asks for and tick each one off in your answer. Missing one point caps the Task Fulfilment mark.";
  if(/level of response|lorms/.test(w)) return "for every point, explain how or why, then back it with a specific detail from the source or your own knowledge. Explained, supported points move an answer up a level.";
  if(/analysis/.test(w)) return "pick one key word in your quotation and explain the effect of that exact word on the reader. Analysis of word choice earns more than retelling the plot.";
  if(/language|style|accuracy/.test(w)) return "read your essay aloud and vary how each sentence starts. Swap two plain words in every paragraph for more precise ones.";
  if(/organisation|structure|focus/.test(w)) return "start each paragraph with a topic sentence that answers the question, and end it with a sentence that links back to the question.";
  if(/content|argument|knowledge|understanding|response|interpretation/.test(w)) return paper === "psle" || paper === "olang"
    ? "plan each paragraph around one clear idea and add one specific detail or example that shows it, instead of telling it."
    : "give every body paragraph one named, specific example and explain why it proves your point.";
  return "plan for five minutes before writing, then check that every paragraph answers the question.";
}
const MC_FOR = [["Comprehension Mastery", 4, ["psle", "pslesw"], "comprehension question types, language-use questions and timed practice"],
  ["GP AQ Clinic", 4, ["gpaq"], "the R-E-A-L framework for the Paper 2 Application Question"], ["Unseen Literature Clinic", 4, ["olit", "ib1", "ib2"], "close reading and PEEL-L analysis"],
  ["Social Studies and History Source Analysis", 4, ["ss", "hist"], "LORMS levels and C-A-P-P source analysis"], ["Humanities Essay and Case Study Bootcamp", 8, ["geog"], "LORMS-structured essays and case studies"],
  ["Argumentative Essay Writing", 8, ["gp", "olang", "olsw", "igcse"], "PEEL paragraphs, counter-arguments and timed essays"]];
// The next step for a lead, chosen by its furthest stage, with a ready-to-send message. Nothing is sent: the owner taps the link.
function suggestFor(l, host){
  const first = String(l.name || "").trim() || "there", pn = (PAPERS.find(p => p.id === l.paper) || {}).name || "";
  const base = `https://${host}/`, scope = (l.consent && l.consent.scope) || "classes", s = l.stages || {};
  if(l.optout) return {key: "none", step: "None: opted out", text: ""};
  let key, step, text;
  if(scope === "reply"){ key = "reply"; step = "Reply to their message"; text = `Hi ${first}, thanks for your message to EssayLabsg™. `; }
  else if(s.paid){ key = "group"; step = "Invite to online group classes";
    text = `Hi ${first}, thank you for using EssayLabsg™ detailed feedback. We're starting small online group classes${pn ? " for " + pn : ""}. Reply YES and we'll add you to the early list.`; }
  else if(s.classes){ const mc = MC_FOR.find(m => m[2].includes(l.paper)) || MC_FOR[MC_FOR.length - 1]; key = "masterclass"; step = "Invite to the " + mc[0] + " masterclass";
    text = `Hi ${first}, thanks for your interest in our classes. Our ${mc[0]} masterclass (${mc[1]} sessions) covers ${mc[3]}, in a small group of up to six students. Reply with ${l.level ? "your preferred days" : "the student's level and your preferred days"} and we'll send the schedule.`; }
  else if(s.checkout && scope === "all"){ key = "checkout"; step = "Help finish the detailed feedback sign-up";
    text = `Hi ${first}, you started signing up for detailed feedback but didn't finish. If anything got in the way, just reply and we'll help. It's S$39 for 4 reports, each marked by Exam Preparation Specialists™ and ready within 48 hours: ${base}#specialist`; }
  else if(s.pricing && scope === "all"){ key = "detailed"; step = "Offer detailed feedback (S$39)";
    text = `Hi ${first}, if you'd like comments on every paragraph${pn ? " of your " + pn + " essays" : ""}, detailed feedback is S$39 for 4 reports, each marked by Exam Preparation Specialists™ and ready within 48 hours. You can start here: ${base}#specialist`; }
  else if(s.mark && !s.remark){ key = "tip"; step = "Send a practice tip" + (l.weak ? " for " + l.weak.split(" (")[0] : "");
    text = `Hi ${first}, here's one practice tip${pn ? " for " + pn : ""}${l.weak ? ` (${l.weak.split(" (")[0]})` : ""}: ${tipFor(l.weak, l.paper)} Rewrite one paragraph this way, then re-mark it free on EssayLabsg™ to see the change: ${base}`; }
  else { const ch = ["psle", "pslesw"].includes(l.paper) ? "psle" : ["olang", "olsw"].includes(l.paper) ? "olang" : "gp"; key = "challenge"; step = "Invite to the weekly challenge";
    text = `Hi ${first}, this week's EssayLabsg™ essay challenge is open. Write one essay, get it marked free and see how your score compares: ${base}?challenge=${ch}`; }
  const days = l.contacted ? Math.floor((Date.now() - l.contacted) / 864e5) : -1;
  if(days >= 0 && days < 7) step = `Contacted ${days === 0 ? "today" : days === 1 ? "yesterday" : days + " days ago"}. Wait a week, then: ` + step.charAt(0).toLowerCase() + step.slice(1);
  const wa = l.phone ? `https://wa.me/65${l.phone}?text=` + encodeURIComponent(text + "\n\nReply STOP to opt out.") : "";
  const tok = unsubToken(l.id), unsub = tok ? `${base}api/mark?unsub=${tok}` : "";
  const mail = l.email ? `mailto:${l.email}?subject=${encodeURIComponent("EssayLabsg™: your next steps")}&body=` + encodeURIComponent(text + (unsub ? "\n\nTo stop these emails: " + unsub : "") + "\n\nReply STOP to opt out.") : "";
  return {key, step, text: text + "\n\nReply STOP to opt out.", wa, mail, unsub};
}
const STAGE_LABEL = Object.fromEntries(STAGES);
function stageOf(s){ let out = ""; for(const [k] of STAGES) if(k !== "classes" && s[k]) out = k; return out; }
const fmtDay = t => t ? new Date(+t + 8 * 3600e3).toISOString().slice(0, 10) : "";
function leadsCsv(leads){
  const cell = v => { let s = String(v ?? ""); if(/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };  // no spreadsheet formulas
  const head = ["Name", "WhatsApp (+65)", "Email", "Level", "Stage", "Classes interest", "Source", "All sources", "Paper", "Score", "Weakest criterion", "Consent", "Consent version", "Consent date", "Opted out", "First seen", "Last activity", "Last contact", "Next step", "Suggested message"];
  const rows = leads.map(l => [l.name, l.phone ? l.phone.slice(0, 4) + " " + l.phone.slice(4) : "", l.email, l.level, STAGE_LABEL[l.stage] || "", l.stages && l.stages.classes ? "Yes" : "",
    SOURCE_LABEL[l.source] || l.source || "", (l.sources || []).map(x => SOURCE_LABEL[x] || x).join("; "), (PAPERS.find(p => p.id === l.paper) || {}).name || "", l.score, l.weak,
    l.consent ? l.consent.text : "", l.consent ? l.consent.v : "", l.consent ? fmtDay(l.consent.t) : "", l.optout ? fmtDay(l.optout) : "",
    fmtDay(l.t), fmtDay(l.last), fmtDay(l.contacted), l.next ? l.next.step : "", l.next ? l.next.text : ""]);
  return [head, ...rows].map(r => r.map(cell).join(",")).join("\r\n");
}
// Stage counts for the admin funnel: devices that first reached each stage in the last 7 and 30 days.
async function funnelCounts(){
  const now = Date.now(), out = [];
  for(const [k, label] of STAGES){
    const [d7, d30] = await Promise.all([kv("ZCOUNT", "fs:" + k, now - 7 * 864e5, "+inf"), kv("ZCOUNT", "fs:" + k, now - 30 * 864e5, "+inf")]);
    out.push({id: k, label, d7: +d7 || 0, d30: +d30 || 0});
  }
  // Conversion from the stage before (classes interest is measured against visitors).
  out.forEach((s, i) => { const prev = s.id === "classes" ? out[0] : out[i - 1];
    s.c7 = prev && prev.d7 ? Math.round(s.d7 / prev.d7 * 100) : null; s.c30 = prev && prev.d30 ? Math.round(s.d30 / prev.d30 * 100) : null; });
  return out;
}
async function adminLeads(host){
  const cut = Date.now() - LEAD_TTL * 1000;
  // Keep the indexes in step with the TTL: drop members older than 2 years.
  await kv("ZREMRANGEBYSCORE", "leads", "-inf", cut); await kv("ZREMRANGEBYSCORE", "msgs", "-inf", cut);
  for(const [k] of STAGES) await kv("ZREMRANGEBYSCORE", "fs:" + k, "-inf", cut);
  const raw = (await kv("ZRANGE", "leads", 0, 299, "REV", "WITHSCORES")) || [];
  const ids = [], last = {}; for(let i = 0; i + 1 < raw.length; i += 2){ ids.push(raw[i]); last[raw[i]] = +raw[i + 1]; }
  const lraw = ids.length ? (await kv("MGET", ...ids.map(id => "lead:" + id))) || [] : [];
  const sc = {}; if(ids.length) for(const [k] of STAGES){ const r = await kv("ZMSCORE", "fs:" + k, ...ids); sc[k] = Array.isArray(r) ? r : []; }
  const gone = [], leads = [];
  ids.forEach((id, i) => {
    const v = lraw[i]; if(!v){ gone.push(id); return; }
    let l; try{ l = JSON.parse(v); }catch{ return; }
    if(!l.phone && !l.email) return;
    if(!l.consent) l.consent = {v: "ch0", scope: CONSENTS.ch0.scope, text: CONSENTS.ch0.text, t: l.t || 0};  // leads saved before consent was stored
    l.id = id; l.last = last[id] || l.t || 0; l.sources = l.sources || ["challenge"]; l.source = l.source || "challenge";
    l.stages = {}; for(const [k] of STAGES){ const x = sc[k] && sc[k][i]; if(x !== null && x !== undefined && isFinite(+x)) l.stages[k] = +x; }
    l.stages.lead = l.stages.lead || l.t || 1;
    l.stage = stageOf(l.stages); l.next = suggestFor(l, host);
    leads.push(l);
  });
  if(gone.length) await kv("ZREM", "leads", ...gone);  // expired by the TTL
  return leads;
}
// One-time: give leads and messages saved before the 2-year rule a TTL counted from when they were saved.
async function migrateTtl(){
  if(!(await kv("SET", "mig:ttl2y", "1", "NX"))) return;
  const now = Date.now();
  for(const [set, pre] of [["leads", "lead:"], ["msgs", "msg:"]]){
    const raw = (await kv("ZRANGE", set, 0, -1, "WITHSCORES")) || [];
    for(let i = 0; i + 1 < raw.length; i += 2){ const left = Math.floor((+raw[i + 1] + LEAD_TTL * 1000 - now) / 1000);
      if(left > 0) await kv("EXPIRE", pre + raw[i], left); else { await kv("DEL", pre + raw[i]); await kv("ZREM", set, raw[i]); } }
  }
}
async function boards(wk){
  const out = {};
  for(const pid of CH_PAPERS){
    const top = (await kv("ZRANGE", `chb:${wk}:${pid}`, 0, 9, "REV", "WITHSCORES")) || [];
    const imp = (await kv("ZRANGE", `chi:${wk}:${pid}`, 0, 4, "REV", "WITHSCORES")) || [];
    const pairs = a => { const r = []; for(let i = 0; i < a.length; i += 2) r.push({uid: a[i], pct: +a[i+1]}); return r; };
    const T = pairs(top), I = pairs(imp).filter(x => x.pct > 0), ids = [...new Set([...T, ...I].map(x => x.uid))];
    const names = ids.length ? await kv("HMGET", `chn:${wk}`, ...ids) : [];
    const nm = Object.fromEntries(ids.map((id, i) => [id, (names && names[i]) || "Student"]));
    out[pid] = {top: T.map(x => ({name: nm[x.uid], pct: x.pct})), improved: I.map(x => ({name: nm[x.uid], pct: x.pct})), count: +(await kv("ZCARD", `chb:${wk}:${pid}`)) || 0};
  }
  return out;
}

// Per-network rate limit on marking (free and paid): 10 a minute, 60 a day. The owner pass is exempt.
async function rateLimited(ip){
  if(!KV_URL) return false;
  try{
    const mk = "rlm:" + ip + ":" + Math.floor(Date.now() / 60000), dk = "rld:" + ip + ":" + new Date().toISOString().slice(0, 10);
    const m = await kv("INCR", mk); if(m === 1) await kv("EXPIRE", mk, 120);
    const d = await kv("INCR", dk); if(d === 1) await kv("EXPIRE", dk, 90000);
    return m > 10 || d > 60;
  }catch{ return false; }
}
const RATE_MSG = "You've marked a lot of essays in a short time. Please wait a few minutes and try again, or tap Message us.";
module.exports = async (req, res) => {
  const token = req.headers["x-vercel-oidc-token"] || process.env.VERCEL_OIDC_TOKEN || process.env.AI_GATEWAY_API_KEY;
  if(req.method === "GET"){
    // Email opt-out link: /api/mark?unsub=<token>
    let q = req.query; if(!q){ try{ q = Object.fromEntries(new URL(req.url || "/", "http://x").searchParams); }catch{ q = {}; } }
    if(q && q.unsub) return unsubPage(res, String(q.unsub), false);
    return res.status(200).json({ok:true, auth: !!token, stripe: !!STRIPE_KEY});
  }
  if(req.method !== "POST") return res.status(405).json({error:"method"});
  if(!originOk(req)) return res.status(403).json({error:"origin"});

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";

  let body = req.body;
  if(typeof body === "string"){ try{ body = JSON.parse(body); }catch{ try{ body = Object.fromEntries(new URLSearchParams(body)); }catch{ body = {}; } } }
  body = body || {};
  // "Delete my details" from the unsubscribe page (a plain form post).
  if(body.unsubdel) return unsubPage(res, String(body.unsubdel), true);
  const p = PAPERS.find(x => x.id === body.paper) || PAPERS[0];  // unknown ids fall back to a free paper
  if(body.admin){
    if(!KV_URL || !ADMIN_KEY) return res.status(403).json({error:"admin"});
    // Lockout: 10 wrong keys from one network address in an hour blocks admin from there for the rest of the hour.
    const fk = "adminfail:" + ip;
    try{ if((+(await kv("GET", fk)) || 0) >= 10) return res.status(429).json({error:"admin"}); }catch{ return res.status(503).json({error:"admin"}); }
    if(!sameKey(String(body.key || ""), ADMIN_KEY)){
      try{ const n = await kv("INCR", fk); if(n === 1) await kv("EXPIRE", fk, 3600); }catch{}
      return res.status(403).json({error:"admin"});
    }
    const t = okId(body.target) ? body.target : "";
    if(body.admin === "approve" && t){ await kv("SET", "student:" + t, String(body.name || "Student").slice(0, 60)); await kv("SADD", "students", t); }
    if(body.admin === "promo"){
      const pc = String(body.promo || "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 20);
      const essays = Math.max(1, Math.min(10, +body.essays || 1)), uses = Math.max(1, Math.min(5000, +body.uses || 100));
      if(pc){ await kv("SET", "promo:" + pc, JSON.stringify({essays})); await kv("SET", "promoleft:" + pc, uses); await kv("SADD", "promos", pc); }
    }
    if(body.admin === "msgdone" && /^[a-f0-9]{16}$/.test(String(body.target || ""))){ await kv("DEL", "msg:" + body.target); await kv("ZREM", "msgs", body.target); }
    if(body.admin === "testiadd"){
      const tv = body.testi || {}, quote = cleanText(tv.quote, 3000), who = cleanText(tv.who, 80);
      if(tv.permission !== true || !quote || !who) return res.status(200).json({ok: false, error: "testi"});
      const id = require("crypto").randomBytes(8).toString("hex");
      const item = {id, g: tv.g === "masterclass" ? "masterclass" : "essaylab", who, role: cleanText(tv.role, 120), course: cleanText(tv.course, 120), result: cleanText(tv.result, 60), title: cleanText(tv.title, 120), quote, feature: tv.feature === true, hidden: true, permission: true, t: Date.now()}  // new ones start Off so Chrissy can check them first;
      await kv("SET", "testi:" + id, JSON.stringify(item)); await kv("ZADD", "testis", item.t, id);
    }
    // Master switches: when one is off, that whole testimonials tab is hidden from the site.
    // Reset free-marking counts for the admin's own network address and a device id (owner testing).
    // Reports to check: approve a detailed report so the student can open it.
    if(body.admin === "vetok" && /^[a-f0-9]{16}$/.test(String(body.target || ""))){ const r = JSON.parse((await kv("GET", "rpt:" + body.target)) || "null"); if(r){ r.status = "ok"; r.vetted = Date.now(); await kv("SET", "rpt:" + body.target, JSON.stringify(r), "KEEPTTL"); } await kv("ZREM", "vetq", body.target); }
    if(body.admin === "exnames" && body.names && typeof body.names === "object"){
      const out = {}; for(const slot of ["chart", "parent"]){ const v = body.names[slot]; if(v) out[slot] = {name: cleanText(v.name, 40), level: cleanText(v.level, 20), real: v.real === true}; }
      await kv("SET", "exnames", JSON.stringify(out));
    }
    if(body.admin === "freereset"){ const day = new Date().toISOString().slice(0, 10); hits.delete(ip); await kv("DEL", "fip:" + ip); await kv("DEL", "fipd:" + ip + ":" + day); await kv("DEL", "rld:" + ip + ":" + day); if(t){ await kv("DEL", "fu:" + t); await kv("DEL", "fel:" + t); } }
    if(body.admin === "testimaster" && ["essaylab", "masterclass"].includes(body.g)){ const m = JSON.parse((await kv("GET", "testimaster")) || "{}"); m[body.g] = body.on === true; await kv("SET", "testimaster", JSON.stringify(m)); }
    if((body.admin === "testihide" || body.admin === "testidel") && /^[a-f0-9]{16}$/.test(String(body.target || ""))){
      if(body.admin === "testidel"){ await kv("DEL", "testi:" + body.target); await kv("ZREM", "testis", body.target); }
      else { const it = JSON.parse((await kv("GET", "testi:" + body.target)) || "null"); if(it && (it.hidden === false || it.permission !== false)){ it.hidden = !it.hidden; it.pending = false; await kv("SET", "testi:" + body.target, JSON.stringify(it)); } }  // no consent: it can never be switched On
    }
    if(body.admin === "leadremove" && t){ await kv("DEL", "lead:" + t); await kv("ZREM", "leads", t); }
    // Lead follow-up: "mark contacted" and "opt out" both count as contact, so the 2-year clock restarts.
    if((body.admin === "contacted" || body.admin === "optout") && t){
      const l = JSON.parse((await kv("GET", "lead:" + t)) || "null");
      if(l){
        if(body.admin === "contacted"){ l.contacted = Date.now(); l.contacts = (+l.contacts || 0) + 1; }
        else if(!l.optout){ l.optout = Date.now(); l.optoutBy = "admin"; }
        await kv("SET", "lead:" + t, JSON.stringify(l), "EX", LEAD_TTL); await kv("ZADD", "leads", Date.now(), t);
      }
    }
    const host = String(req.headers["x-forwarded-host"] || req.headers.host || "essaylab-sg.vercel.app").split(",")[0].trim();
    try{ await migrateTtl(); }catch(e){ console.error("migrate", e.message); }
    if(body.admin === "leadcsv"){
      // The leads shown in the admin list (after its filters), or all of them.
      let all = await adminLeads(host);
      if(Array.isArray(body.ids)){ const want = new Set(body.ids.map(String)); all = all.filter(l => want.has(l.id)); }
      return res.status(200).json({ok: true, csv: leadsCsv(all)});
    }
    if(body.admin === "chremove" && t){ const wk = weekKey(); for(const pid of CH_PAPERS){ await kv("ZREM", `chb:${wk}:${pid}`, t); await kv("ZREM", `chi:${wk}:${pid}`, t); } }
    if(body.admin === "revoke" && t){ await kv("DEL", "student:" + t); await kv("SREM", "students", t); }
    const ids = (await kv("SMEMBERS", "students")) || [];
    const names = await Promise.all(ids.map(id => kv("GET", "student:" + id)));
    const pcs = (await kv("SMEMBERS", "promos")) || [];
    const pleft = await Promise.all(pcs.map(c => kv("GET", "promoleft:" + c)));
    const pinfo = await Promise.all(pcs.map(c => kv("GET", "promo:" + c)));
    const leads = await adminLeads(host), funnel = await funnelCounts();
    const mids = ((await kv("ZRANGE", "msgs", 0, 199, "REV")) || []);
    const mraw = mids.length ? await kv("MGET", ...mids.map(id => "msg:" + id)) : [];
    const messages = mids.map((id, i) => ({id, ...JSON.parse((mraw && mraw[i]) || "{}")})).filter(m => m.text);
    const mgone = mids.filter((id, i) => !(mraw && mraw[i])); if(mgone.length) await kv("ZREM", "msgs", ...mgone);  // expired by the TTL
    const exnames = JSON.parse((await kv("GET", "exnames")) || "{}");
    const vq = (await kv("ZRANGE", "vetq", 0, 49)) || [], vraw = vq.length ? (await kv("MGET", ...vq.map(id => "rpt:" + id))) || [] : [];
    const vets = vq.map((id, i) => vraw[i] ? JSON.parse(vraw[i]) : null).filter(Boolean);
    const testis = await testiList(true), tmaster = JSON.parse((await kv("GET", "testimaster")) || "{}");
    const sids = (await kv("ZRANGE", "subs", 0, 499, "REV")) || [];
    const sraw = sids.length ? (await kv("MGET", ...sids.map(id => "sub:" + id))) || [] : [];
    const subs = sids.map((id, i) => sraw[i] ? JSON.parse(sraw[i]) : null).filter(Boolean);
    return res.status(200).json({ok: true, leads, funnel, messages, testis, tmaster, subs, exnames, vets, students: ids.map((id, i) => ({id, name: names[i] || "Student"})),
      promos: pcs.map((c, i) => ({code: c, left: Math.max(0, +pleft[i] || 0), essays: (JSON.parse(pinfo[i] || "{}").essays) || 1}))});
  }
  const rawCode = String(body.code || "").trim();
  const uid = okId(body.uid) ? body.uid : "", ref = okId(body.ref) && body.ref !== body.uid ? body.ref : "";
  if(body.review){
    // "How Was Your Marking?": stars + comment, saved as a Pending, Off testimonial. Up to 5 an hour per network address.
    if(!KV_URL) return res.status(200).json({ok: true});
    try{
      const hk = "rvip:" + ip + ":" + new Date().toISOString().slice(0, 13), n = await kv("INCR", hk); if(n === 1) await kv("EXPIRE", hk, 3600);
      if(n > 5) return res.status(200).json({ok: false, error: "rate"});
      const stars = Math.max(0, Math.min(5, Math.round(+body.stars || 0))), comment = cleanText(body.comment, 300);
      if(!stars && !comment) return res.status(200).json({ok: false, error: "empty"});
      const name = cleanText(body.name, 30), level = cleanText(body.level, 20), consent = body.consent === true;
      const pp = PAPERS.find(x => x.id === body.paper), id = require("crypto").randomBytes(8).toString("hex");
      const item = {id, g: "essaylab", who: [name, level].filter(Boolean).join(", ") || "Anonymous", role: "", course: pp ? pp.name : "", result: "", title: "", quote: comment,
        stars, consent, permission: consent, pending: true, src: "review", feature: false, hidden: true, t: Date.now()};
      await kv("SET", "testi:" + id, JSON.stringify(item)); await kv("ZADD", "testis", item.t, id);
      return res.status(200).json({ok: true});
    }catch(e){ console.error("review", e.message); return res.status(200).json({ok: false, error: "busy"}); }
  }
  if(body.exnames){
    // Public: the example student names on the landing page (set in ?admin → Student names). Read only.
    try{ return res.status(200).json({names: KV_URL ? JSON.parse((await kv("GET", "exnames")) || "{}") : {}}); }catch{ return res.status(200).json({names: {}}); }
  }
  if(body.testimonials){
    // Public: the landing page's testimonials (visible ones, newest first). Read only.
    try{ const tm = KV_URL ? JSON.parse((await kv("GET", "testimaster")) || "{}") : {}; return res.status(200).json({items: KV_URL ? (await testiList(false)).filter(t => tm[t.g] !== false).map(({permission, hidden, ...t}) => t) : []}); }catch(e){ console.error("testis", e.message); return res.status(200).json({items: []}); }
  }
  if(body.fn){
    // Funnel events only the browser sees (pricing viewed, interest in classes). The page sends each once per device; handled before the access checks so it costs one KV write.
    if(["pricing", "classes"].includes(body.fn)) await stage(uid, body.fn);
    return res.status(200).json({ok: true});
  }
  let unlocked = false, until = 0, reason = "";
  try{
    // Owner pass: a device where Chrissy has logged in to ?admin sends her admin key; checked here only, never in page code.
    // Wrong keys count towards the same 10-an-hour admin lockout.
    const ownerKey = String(req.headers["x-owner-key"] || "");
    if(ownerKey && ADMIN_KEY && KV_URL && (+(await kv("GET", "adminfail:" + ip)) || 0) < 10){
      if(sameKey(ownerKey, ADMIN_KEY)){ unlocked = true; reason = "owner"; }
      else { const n = await kv("INCR", "adminfail:" + ip); if(n === 1) await kv("EXPIRE", "adminfail:" + ip, 3600); }
    }
    // Students Chrissy approved from her phone mark free and unlimited on that device only.
    if(unlocked){}
    else if(KV_URL && uid && await kv("GET", "student:" + uid)) unlocked = true;
    else if(KV_URL && uid && +(await kv("GET", "freepass:" + uid)) > Date.now()){ unlocked = true; until = +(await kv("GET", "freepass:" + uid)); }
    else if(rawCode && CODES.includes(rawCode.toUpperCase())){
      // Each student code works on at most 2 devices, so a shared code stops working for the third.
      unlocked = await bindDevice("code:" + rawCode.toUpperCase(), uid);
      if(!unlocked) reason = "devices";
    } else if(rawCode){
      const info = await passInfo(rawCode);
      if(info.until){
        if(!(await bindDevice("pass:" + rawCode, uid))) reason = "devices";
        else {
          // A pass holder's link earns them 7 extra days for every friend who buys a pass through it.
          if(KV_URL && info.referrer && okId(info.referrer) && info.referrer !== uid && await kv("SET", "paidref:" + rawCode, "1", "NX")) await kv("INCRBY", "xdays:" + info.referrer, 7);
          const xdays = KV_URL && uid ? (+(await kv("GET", "xdays:" + uid)) || 0) : 0;
          until = info.until + xdays * 86400e3;
          unlocked = until > Date.now();
        }
      }
    }
  }catch(e){ console.error("access", e.message); }
  if(body.check) return res.status(200).json({ok: unlocked, until: until || null, expired: !unlocked && until > 0, reason});
  if(body.checkout){
    await stage(uid, "checkout");
    if(!STRIPE_KEY) return res.status(200).json({ok: false});
    try{ const url = await checkout(String(req.headers["x-forwarded-host"] || req.headers.host || "essaylab-sg.vercel.app"), uid, ref, !!body.once); return res.status(200).json({ok: !!url, url}); }
    catch(e){ console.error("checkout", e.message); return res.status(200).json({ok: false}); }
  }
  if(body.subconfirm){
    // Back from Stripe: tie the new subscription to this device.
    if(!STRIPE_KEY || !KV_URL || !uid || !/^cs_(live|test)_[A-Za-z0-9]+$/.test(String(body.subconfirm))) return res.status(200).json({ok: false});
    try{
      const j = await stripe("checkout/sessions/" + body.subconfirm);
      if(j.mode === "payment" && j.metadata && j.metadata.plan === "once"){
        if(j.payment_status !== "paid") return res.status(200).json({ok: false, pending: true});
        if(j.metadata.uid && j.metadata.uid !== uid && (await kv("GET", "oncecs:" + j.id)) !== uid) return res.status(200).json({ok: false, reason: "device"});
        if(!(await kv("SET", "oncecs:" + j.id, uid, "NX")) && (await kv("GET", "oncecs:" + j.id)) !== uid) return res.status(200).json({ok: false});
        const old = JSON.parse((await kv("GET", "once:" + uid)) || "null");
        if(!old || old.cs !== j.id){
          const start = Math.max(j.created, old && old.end * 1000 > Date.now() ? old.end : 0);  // buying again while active starts after the current 31 days
          await kv("SET", "once:" + uid, JSON.stringify({cs: j.id, start, end: start + ONCE_DAYS * 86400}));
        }
        { const i = await planInfo(uid); delete i.sid; delete i.customer; if(i.active){ await stage(uid, "paid"); await paidAlert(uid, i); } return res.status(200).json({ok: true, ...i}); }
      }
      if(j.mode !== "subscription" || j.status !== "complete" || j.payment_status !== "paid" || !j.subscription) return res.status(200).json({ok: false});
      // A subscription session belongs to the device that bought it (metadata.uid) and is locked to the first device that claims it.
      if(j.metadata && j.metadata.uid && j.metadata.uid !== uid && (await kv("GET", "subcs:" + j.id)) !== uid) return res.status(200).json({ok: false, reason: "device"});
      if(!(await kv("SET", "subcs:" + j.id, uid, "NX")) && (await kv("GET", "subcs:" + j.id)) !== uid) return res.status(200).json({ok: false, reason: "device"});
      await kv("SET", "plan:" + uid, typeof j.subscription === "string" ? j.subscription : j.subscription.id);
      { const i = await planInfo(uid); delete i.sid; delete i.customer; if(i.active){ await stage(uid, "paid"); await paidAlert(uid, i); } return res.status(200).json({ok: true, ...i}); }
    }catch(e){ console.error("subconfirm", e.message); return res.status(200).json({ok: false}); }
  }
  if(body.plan){
    let dc = 0; try{ if(KV_URL && uid) dc = Math.max(0, +(await kv("GET", "dc:" + uid)) || 0); }catch{}
    try{ const i = await planInfo(uid); delete i.sid; delete i.customer; return res.status(200).json({...i, dc}); }catch(e){ return res.status(200).json({active: false, dc}); }
  }
  if(body.portal){
    // Stripe's customer portal: update card or cancel. Needs the portal switched on in the Stripe dashboard.
    try{
      const i = await planInfo(uid); if(!i.customer) return res.status(200).json({ok: false});
      const host = String(req.headers["x-forwarded-host"] || req.headers.host || "essaylab-sg.vercel.app");
      const j = await stripe("billing_portal/sessions", new URLSearchParams({customer: i.customer, return_url: `https://${host}/#specialist`}));
      return res.status(200).json({ok: !!j.url, url: j.url || ""});
    }catch(e){ console.error("portal", e.message); return res.status(200).json({ok: false}); }
  }
  if(body.myreports){
    // The student's own detailed reports, newest first.
    if(!KV_URL || !uid) return res.status(200).json({reports: []});
    try{
      const ids = (await kv("LRANGE", "reps:" + uid, 0, 19)) || [];
      const out = [];
      for(const id of ids){ const v = await kv("GET", "rpt:" + id); if(v){ const r = JSON.parse(v); out.push(r.status === "review" ? stubOf(r) : r); } }
      return res.status(200).json({reports: out});
    }catch(e){ console.error("myreports", e.message); return res.status(200).json({reports: []}); }
  }
  if(body.detailed){
    if(reason !== "owner" && await rateLimited(ip)) return res.status(429).json({ok: false, error: "rate", message: RATE_MSG});
    // A subscriber sends an essay: the report is written straight away, saved to their device's account and shown on the site.
    // giveBack returns the reserved credit (rep: or dc:) at most once if anything fails before the report is saved; the deadline beats the 120s function cap.
    let giveBack = null;
    const refund = async () => { const g = giveBack; giveBack = null; if(g){ try{ await g(); }catch(e){ console.error("refund", e.message); } } };
    const inTime = pr => { let t; return Promise.race([pr, new Promise(r => { t = setTimeout(() => r(null), 105e3); })]).finally(() => clearTimeout(t)); };
    try{
      const i = await planInfo(uid);
      const name = cleanName(body.nickname) || "Student", essay = String(body.essay || "").trim().slice(0, 12000);
      const question = String(body.question || "").trim().slice(0, 600), dp = PAPERS.find(x => x.id === body.paper);
      // No active plan: a free detailed report earned by sharing with 7 people (dc:{uid}) can pay for this one.
      if(!i.active){
        if(!KV_URL || !uid) return res.status(200).json({ok: false, error: "plan"});
        if(!dp || essay.split(/\s+/).length < 80) return res.status(200).json({ok: false, error: "fields"});
        const dk = "dc:" + uid, dn = await kv("DECR", dk);
        if(typeof dn !== "number" || dn < 0){ if(typeof dn === "number") await kv("INCR", dk); return res.status(200).json({ok: false, error: "plan"}); }
        giveBack = () => kv("INCR", dk);
        let rep = null; try{ rep = await inTime(fullReport(dp, question, essay, token)); }catch(e){ console.error("report", e.message); }
        if(!rep){ await refund(); return res.status(200).json({ok: false, error: "busy"}); }  // a failed report doesn't use the free one up
        const id = require("crypto").randomBytes(8).toString("hex");
        const report = {id, t: Date.now(), n: 1, of: 1, free: true, paper: dp.name, sub: dp.sub, question, words: essay.split(/\s+/).length, ...rep, status: "review", who: name, teach: body.teach === true};
        await kv("ZADD", "vetq", Date.now(), id);  // waits for Chrissy's check in ?admin → Reports to check
        await kv("SET", "rpt:" + id, JSON.stringify(report), "EX", 365 * 86400); giveBack = null;  // saved: the credit is spent
        await kv("LPUSH", "reps:" + uid, id); await kv("LTRIM", "reps:" + uid, 0, 49);
        await kv("SET", "msg:" + id, JSON.stringify({name, phone: "", text: `[Detailed feedback, free referral report, waiting for your check in ?admin] ${dp.name} (${dp.sub}), ${report.words} words, ${rep.total}/${rep.max}`, uid, t: Date.now(), detailed: true}), "EX", LEAD_TTL);
        await kv("ZADD", "msgs", Date.now(), id);
        return res.status(200).json({ok: true, left: dn, free: true, report: stubOf(report)});
      }
      if(!dp || essay.split(/\s+/).length < 80) return res.status(200).json({ok: false, error: "fields"});
      const k = `rep:${i.sid}:${i.start}`, n = await kv("INCR", k);
      if(typeof n === "number") giveBack = () => kv("DECR", k);
      await kv("EXPIRE", k, 40 * 86400);
      if(n > PLAN_REPORTS){ await refund(); return res.status(200).json({ok: false, error: "used", end: i.end}); }
      let rep = null; try{ rep = await inTime(fullReport(dp, question, essay, token)); }catch(e){ console.error("report", e.message); }
      if(!rep){ await refund(); return res.status(200).json({ok: false, error: "busy"}); }  // a failed report doesn't use one up
      const id = require("crypto").randomBytes(8).toString("hex");
      const report = {id, t: Date.now(), n, of: PLAN_REPORTS, paper: dp.name, sub: dp.sub, question, words: essay.split(/\s+/).length, ...rep, status: "review", who: name, teach: body.teach === true};
        await kv("ZADD", "vetq", Date.now(), id);  // waits for Chrissy's check in ?admin → Reports to check
      await kv("SET", "rpt:" + id, JSON.stringify(report), "EX", 365 * 86400); giveBack = null;  // saved: the credit is spent
      await kv("LPUSH", "reps:" + uid, id); await kv("LTRIM", "reps:" + uid, 0, 49);
      // A log line in the admin Messages list (nothing to do there).
      await kv("SET", "msg:" + id, JSON.stringify({name, phone: "", text: `[Detailed feedback, report ${n} of ${PLAN_REPORTS}, waiting for your check in ?admin] ${dp.name} (${dp.sub}), ${report.words} words, ${rep.total}/${rep.max}`, uid, t: Date.now(), detailed: true}), "EX", LEAD_TTL);
      await kv("ZADD", "msgs", Date.now(), id);
      return res.status(200).json({ok: true, left: PLAN_REPORTS - n, end: i.end, report: stubOf(report)});
    }catch(e){ console.error("detailed", e.message); await refund(); return res.status(200).json({ok: false}); }
  }
  if(body.redeem){
    if(!KV_URL || !uid) return res.status(200).json({ok: false, message: "Codes aren't switched on yet."});
    try{ return res.status(200).json(await redeem(body.redeem, uid)); }catch(e){ return res.status(200).json({ok: false, message: "Something went wrong. Try again."}); }
  }
  if(body.contact){
    // Site messages replace WhatsApp links, so visitors never see Chrissy's number.
    if(!KV_URL) return res.status(200).json({ok: false});
    try{
      const hk = `mip:${ip}:${new Date().toISOString().slice(0, 13)}`;
      const n = await kv("INCR", hk); await kv("EXPIRE", hk, 3600);
      if(n > 6) return res.status(200).json({ok: false, message: "rate"});
      const phone = cleanPhone(body.phone), name = cleanName(body.nickname), text = String(body.text || "").trim().slice(0, body.feedback === true ? 2000 : 1200);
      // Feedback on a result ("Was this useful?") needs no phone or name, and isn't a lead.
      const fb = body.feedback === true;
      if(!text || (!fb && (!phone || !name || !body.consent))) return res.status(200).json({ok: false});
      const id = require("crypto").randomBytes(8).toString("hex");
      await kv("SET", "msg:" + id, JSON.stringify({name: name || (fb ? "Feedback" : ""), phone, text, uid, t: Date.now()}), "EX", LEAD_TTL);
      await kv("ZADD", "msgs", Date.now(), id);
      if(uid && !fb) await saveLead(uid, {contact: true, nickname: name, phone, consent: true, paper: String(body.paper || ""), text});
      if(process.env.NTFY_TOPIC){ try{ await fetch("https://ntfy.sh/" + encodeURIComponent(process.env.NTFY_TOPIC), {method: "POST", headers: {"Title": "EssayLab: message from " + name}, body: text.slice(0, 400)}); }catch{} }
      return res.status(200).json({ok: true});
    }catch(e){ console.error("contact", e.message); return res.status(200).json({ok: false}); }
  }
  if(body.lead || body.capture){
    // Weekly challenge entry (lead) or the optional "next steps" form (capture). Consent must be ticked: without it nothing is stored.
    if(!KV_URL) return res.status(200).json({ok: false});
    if(body.consent !== true) return res.status(200).json({ok: false, error: "consent"});
    if(!cleanPhone(body.phone) && !cleanEmail(body.email)) return res.status(200).json({ok: false, error: "contact"});
    try{
      if(body.capture){
        const hk = `lip:${ip}:${new Date().toISOString().slice(0, 13)}`, n = await kv("INCR", hk); if(n === 1) await kv("EXPIRE", hk, 3600);
        if(n > 8) return res.status(200).json({ok: false, error: "rate"});
      }
      const b = {...body, source: body.capture ? body.source : "challenge", contact: false};
      return res.status(200).json({ok: await saveLead(uid, b)});
    }catch(e){ console.error("lead", e.message); return res.status(200).json({ok: false}); }
  }
  if(body.board){
    const wk = weekKey(), ch = challengeOf(wk);
    let b = null; try{ if(KV_URL) b = await boards(wk); }catch(e){ console.error("board", e.message); }
    let marked = 0; try{ if(KV_URL) marked = +(await kv("SCARD", "wkusers:" + wk)) || 0; }catch{}
    return res.status(200).json({wk, challenge: ch, boards: b, marked});
  }
  if(body.status){
    // Funnel: a device's first visit (one write, sent once per device) and, for leads, refreshing the 2-year clock.
    if(body.fv) await stage(uid, "visit");
    if(body.ld) await touchLead(uid);
    // One share link: every 7 new people who open it earn another free detailed report (7, 14, 21...).
    // A newcomer counts once, and only once per network address, so one person can't fake 7 friends.
    // ?ref= is a referral code (new links) or, for links shared before codes existed, the referrer's uid; counts are kept per referrer uid as before.
    if(KV_URL && uid && ref){
      try{
        const owner = await refOwner(ref);
        if(owner && owner !== uid && !(await kv("GET", "seen:" + uid)) && await kv("SET", "joined:" + uid, owner, "NX") && await kv("SET", `refip:${owner}:${ip}`, "1", "NX", "EX", 2592000)){
          const n = await kv("INCR", "refn:" + owner);
          if(n % 7 === 0) await kv("INCR", "dc:" + owner);
        }
      }catch(e){ console.error("ref", e.message); }
    }
    // invited: progress towards the next 7; earned: free detailed reports earned by sharing so far.
    let invited = 0, earned = 0, refcode = ""; try{ if(KV_URL && uid){ const n = +(await kv("GET", "refn:" + uid)) || 0; invited = n % 7; earned = Math.floor(n / 7); refcode = await refCodeOf(uid); } }catch{}
    if(unlocked) return res.status(200).json({left: 999, unlocked: true, until: until || null, invited, earned, refcode});
    if(!KV_URL || !uid) return res.status(200).json({left: 1, invited: 0});
    try{ const a = await allowance(uid); return res.status(200).json({left: a.left, invited, earned, refcode}); }catch{ return res.status(200).json({left: 1, invited: 0, refcode}); }
  }
  // Free marking covers PSLE, O-Level English and GP only; other papers need a pass.
  // Detailed feedback plan holders (card or PayNow) instant-mark every paper. Checked only for locked papers, so free marks never call Stripe.
  if(KV_URL && uid && !unlocked && !p.free){ try{ if((await planInfo(uid)).active) unlocked = true; }catch(e){ console.error("plan unlock", e.message); } }
  if(!unlocked && !p.free) return res.status(403).json({error:"locked"});
  const now = Date.now(), recent = (hits.get(ip) || []).filter(t => now - t < 3600e3);
  const hasLead = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(body.lead_email || "").trim());
  // On a shared network, someone with no email is asked for one rather than told to wait; with an email the limit is per person.
  if(recent.length >= (unlocked ? 15 : hasLead ? 30 : 6)) return !unlocked && !hasLead && !(typeof body.remark_token === "string") ? res.status(403).json({error:"needemail"}) : res.status(429).json({error:"rate"});
  recent.push(now); hits.set(ip, recent);
  let quota = null, remark = false;
  if(KV_URL && uid && typeof body.remark_token === "string" && /^[a-f0-9]{24}$/.test(body.remark_token)){
    try{ remark = (await kv("GETDEL", "rm:" + body.remark_token)) === uid; }catch{}
  }
  if(reason !== "owner" && await rateLimited(ip)) return res.status(429).json({error: "rate", message: RATE_MSG});
  // Free limits are reserved BEFORE the marking call (INCR, then compare), and given back if the mark fails,
  // so parallel requests can't all slip past a check. If storage errors, free marking is refused (fails closed).
  const held = [];  // [key, amount] reserved for this request
  let usedCredit = false, creditsLeft = 0, memHeld = false;
  const release = async () => {
    if(memHeld){ MEM.n = Math.max(0, MEM.n - 1); memHeld = false; }
    for(const [k, d] of held.splice(0)){ try{ await kv(d > 0 ? "DECRBY" : "INCRBY", k, Math.abs(d)); }catch(e){ console.error("kv release", e.message); } }
  };
  if(!unlocked && !remark && KV_URL && !FREE_LIMIT_BYPASS_IPS.includes(ip)){
    if(!uid) return res.status(400).json({error:"server", message:"no id"});
    const wk = weekKey();
    try{
      const ipK = `fip:${ip}`, wK = `fu:${uid}`, cK = `c:${uid}`;
      const leadEm = String(body.lead_email || "").trim().toLowerCase(), leadOk = leadEm.length <= 120 && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(leadEm);
      const usedNow = +(await kv("GET", wK)) || 0, ipNow = +(await kv("GET", ipK)) || 0;
      // Only a device's first free marking needs no email, and only while the network hasn't used up its free markings.
      if(usedNow < FREE_TOTAL && !leadOk && (usedNow >= 1 || ipNow >= FREE_TOTAL)) return res.status(403).json({error:"needemail", left: FREE_TOTAL - usedNow});
      const wn = await kv("INCR", wK); held.push([wK, 1]);
      if(typeof wn !== "number") throw new Error("kv incr");
      if(wn > FREE_TOTAL){
        // The 3 free markings are used: spend a bonus credit instead, if there is one.
        await kv("DECR", wK); held.pop();
        const cn = await kv("DECR", cK); held.push([cK, -1]);
        if(typeof cn !== "number") throw new Error("kv decr");
        if(cn < 0){ await release(); return res.status(403).json({error:"freeused"}); }
        usedCredit = true; creditsLeft = cn;
      } else {
        // Only free markings count against the network address, so one household can't reset by clearing the browser.
        const ipn = await kv("INCR", ipK); held.push([ipK, 1]); if(ipn === 1) await kv("EXPIRE", ipK, 31536000);
        if(typeof ipn !== "number") throw new Error("kv incr");
        if(leadOk){
          // With an email the limit is per person, so students sharing school Wi-Fi aren't blocked by each other.
          const lid = require("crypto").createHash("sha256").update(leadEm).digest("hex").slice(0, 16), eK = `fe:${lid}`, lK = `fel:${uid}`;
          const linked = await kv("GET", lK), add = 1 + (linked ? 0 : usedNow);   // the markings this device already used count towards this person, once
          if(linked !== lid) await kv("SET", lK, lid);
          const en = await kv("INCRBY", eK, add); held.push([eK, add]);
          if(typeof en !== "number") throw new Error("kv incr");
          if(en > FREE_TOTAL){ await release(); return res.status(403).json({error:"freeused"}); }
          const dK = `fipd:${ip}:${new Date().toISOString().slice(0, 10)}`, dn = await kv("INCR", dK); held.push([dK, 1]); if(dn === 1) await kv("EXPIRE", dK, 172800);
          if(dn > FREE_NETWORK_DAILY){ await release(); return res.status(429).json({error:"rate"}); }
        } else if(ipn > FREE_TOTAL){ await release(); return res.status(403).json({error:"freeused"}); }
        creditsLeft = Math.max(0, +(await kv("GET", cK)) || 0);
      }
      quota = {wk};
    }catch(e){ console.error("kv", e.message); await release(); return res.status(503).json({error:"busy"}); }
  }
  if(!unlocked && KV_URL){
    try{
      const capK = "cap:" + monthKey(), cap = await kv("INCR", capK); held.push([capK, 1]);
      if(cap === 1) await kv("EXPIRE", capK, 3024000);
      if(typeof cap !== "number") throw new Error("kv incr");
      if(cap > FREE_MONTHLY_CAP){ await release(); return res.status(403).json({error:"full"}); }
    }catch(e){ console.error("kv", e.message); await release(); return res.status(503).json({error:"busy"}); }
  }
  // Until storage is connected, keep a small daily cap in memory so free marking can't run up a bill.
  if(!KV_URL){ const d = new Date().toISOString().slice(0, 10); if(MEM.day !== d){ MEM.day = d; MEM.n = 0; } if(MEM.n >= 15) return res.status(403).json({error:"full"}); MEM.n++; memHeld = true; }
  const essay = String(body.essay || "").slice(0, 20000);
  const inChallenge = !!body.challenge && CH_PAPERS.includes(p.id);
  const question = inChallenge ? challengeOf(weekKey())[p.id] : String(body.question || "").slice(0, 600);
  const image = typeof body.image === "string" && body.image.length < 4_000_000 ? body.image : null;
  if(essay.length > 16000){ await release(); return res.status(400).json({error:"too_long"}); }
  if(!image && essay.trim().split(/\s+/).length < 60){ await release(); return res.status(400).json({error:"short"}); }
  if(!token){ await release(); return res.status(500).json({error:"server", message:"no auth"}); }

  const prev = body.prev && Array.isArray(body.prev.criteria) ? `${+body.prev.total}/${+body.prev.max} (` + body.prev.criteria.slice(0, 6).map(c => `${String(c.name).slice(0, 80)} ${+c.score}/${+c.max}`).join("; ") + ")" : "";
  // Our own analysis runs first, so the AI marks against measured evidence rather than impressions.
  let analytics = null; try{ if(!image) analytics = analyse(essay, p, question); }catch(e){ console.error("analyse", e.message); }
  const prompt = buildPrompt(p, question, essay, !!image, body.marks, prev, promptBlock(analytics));
  const content = image ? [{type:"image_url", image_url:{url:"data:image/jpeg;base64," + image}}, {type:"text", text:prompt}] : prompt;
  let lastErr = "";
  for(const model of MODELS){
    try{
      const r = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {method:"POST",
        headers:{"Authorization":"Bearer " + token, "Content-Type":"application/json"},
        body: JSON.stringify({model, max_tokens: 8000, response_format:{type:"json_object"}, ...STEADY_MARKS, messages:[{role:"user", content}]})});
      const j = await r.json().catch(() => ({}));
      if(!r.ok){ lastErr = model + " " + r.status + " " + JSON.stringify(j).slice(0, 300); console.error(lastErr);
        if(r.status === 429){ await release(); return res.status(503).json({error:"busy"}); }
        continue; }
      const text = String((((j.choices || [])[0] || {}).message || {}).content || "");
      const out = parseJSON(text);
      if(!out || !Array.isArray(out.criteria)){ lastErr = model + " bad json"; console.error(lastErr, text.slice(0, 300)); continue; }
      out.model_used = model;
      try{ out.analytics = analytics || (out.transcript ? analyse(out.transcript, p, question) : null); }catch{ out.analytics = null; }
      // Quotes must come from the student's own text: drop quoted evidence that isn't in the essay (normalised substring check).
      { const src = essay || String(out.transcript || ""), norm = t => String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(), ns = norm(src);
        const has = q => { const n = norm(q); return !n || ns.includes(n); };
        const scrub = t => typeof t !== "string" ? t : t.replace(/[“"‘]([^“”"‘’]{3,160})[”"’]/g, (m, q) => has(q) ? m : "").replace(/\(\s*\)/g, "").replace(/\s{2,}/g, " ").trim();
        if(ns){
          (out.fixes || []).forEach(f => { if(!f) return; if(f.quote && !has(f.quote)) f.quote = ""; ["why", "try", "title"].forEach(k => f[k] = scrub(f[k])); });
          (out.criteria || []).forEach(c => { if(!c) return; if(c.evidence && !has(c.evidence)) c.evidence = ""; ["comment", "strength", "gap"].forEach(k => c[k] = scrub(c[k])); });
          if(out.model && out.model.source_quote && !has(out.model.source_quote)) out.model.source_quote = "";
          ["verdict", "note", "next_target"].forEach(k => out[k] = scrub(out[k]));
        } }
      // Teacher's voice only: remove any wording that leaks our internal measurements.
      { const each = (o, ks) => ks.forEach(k => { if(o && typeof o[k] === "string") o[k] = stripMachine(o[k]); });
        (out.fixes || []).forEach(f => each(f, ["why", "try", "title"]));
        (out.criteria || []).forEach(c => each(c, ["comment", "strength", "gap"]));
        each(out, ["verdict", "note", "next_target"]); each(out.model, ["why"]); }
      // Keep the grade consistent with the mark, using the usual percentage bands for these papers.
      const pct = +out.max > 0 ? +out.total / +out.max * 100 : NaN;
      const band = (cuts, labels) => labels[cuts.findIndex(c => pct >= c)] || labels[labels.length - 1];
      if(!isNaN(pct) && /^O-Level grade/.test(p.grades)) out.grade = band([75, 70, 65, 60, 55, 50, 45, 40, 0], ["A1","A2","B3","B4","C5","C6","D7","E8","F9"]);
      if(!isNaN(pct) && p.id === "gp") out.grade = band([70, 60, 55, 50, 45, 40, 0], ["A","B","C","D","E","S","U"]);
      // One free re-mark of the revised essay, valid for a week.
      if(KV_URL && uid && !remark){ try{ const t = require("crypto").randomBytes(12).toString("hex"); await kv("SET", "rm:" + t, uid, "EX", 604800); out.remark_token = t; }catch{} }
      held.length = 0; memHeld = false;  // the mark is delivered: the reserved quota, IP and monthly counts stay used
      await stage(uid, remark ? "remark" : "mark");
      if(quota){
        try{ await kv("SET", `seen:${uid}`, "1", "NX"); }catch(e){ console.error("kv", e.message); }
        try{ out.left = (await allowance(uid)).left; }catch{ out.left = creditsLeft; }  // free markings still unused on this device, plus bonus credits
      }
      if(KV_URL && uid){ try{ await kv("SADD", "wkusers:" + weekKey(), uid); await kv("EXPIRE", "wkusers:" + weekKey(), 1209600); }catch{} }
      if(inChallenge && KV_URL && uid){
        try{
          const wk = weekKey(), pct = scorePct(p, out.criteria, body.marks);
          const nm = cleanName(body.nickname) || "Student";
          await kv("HSET", `chn:${wk}`, uid, nm);
          await kv("HSETNX", `chf:${wk}:${p.id}`, uid, pct);
          const first = +(await kv("HGET", `chf:${wk}:${p.id}`, uid)) || pct;
          await kv("ZADD", `chb:${wk}:${p.id}`, "GT", pct, uid);
          await kv("ZADD", `chi:${wk}:${p.id}`, "GT", pct - first, uid);
          for(const k of [`chn:${wk}`, `chf:${wk}:${p.id}`, `chb:${wk}:${p.id}`, `chi:${wk}:${p.id}`]) await kv("EXPIRE", k, 2592000);
          const rank = await kv("ZREVRANK", `chb:${wk}:${p.id}`, uid);
          await saveLead(uid, {...body, paper: p.id}, {best: Math.max(pct, +(JSON.parse((await kv("GET", "lead:" + uid)) || "{}").best || 0))});
          out.challenge = {pct, improved: pct - first, rank: rank === null ? null : +rank + 1, entries: +(await kv("ZCARD", `chb:${wk}:${p.id}`)) || 0};
        }catch(e){ console.error("challenge", e.message); }
      }
      return res.status(200).json(out);
    }catch(e){ lastErr = model + " " + e.message; console.error(lastErr); }
  }
  await release();
  return res.status(502).json({error:"server", message: lastErr.slice(0, 200)});
};
