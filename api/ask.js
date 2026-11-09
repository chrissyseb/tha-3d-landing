/* © 2026 Christine Sebastian. All rights reserved. EssayLabsg™ website and marking engine. Unauthorised copying, reproduction or reuse is prohibited. */
// Enquiry desk: answers parents' questions and collects what the team needs, then hands over on WhatsApp.
const MODELS = ["google/gemini-2.5-flash", "openai/gpt-5-mini", "google/gemini-2.5-flash-lite"];
const hits = new Map();
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
// Overall cost cap: at most ASK_DAILY_CAP enquiry replies a day (SGT) across everyone.
const ASK_DAILY_CAP = +process.env.ASK_DAILY_CAP || 500;
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

const BRIEF = `You are the enquiry desk for EssayLabsg™, a product of Thinking Hack™, and its Singapore team of full-time Exam Preparation Specialists™, who run Masterclasses and classes. Call them Masterclasses or classes, never tuition, except when comparing. Reply to parents and students in warm, clear, concise Singapore English (2 to 4 short sentences). Speak as "we" (the team).

FACTS YOU MAY USE (do not invent anything beyond these):
- Home lessons islandwide or online on Zoom; small groups available.
- Subjects: PSLE English, Maths, Science (P3 to P6); O-Level English, Literature, History (Pure and Elective), Geography (Pure and Elective), Social Studies; A-Level General Paper; IB, IGCSE, AEIS, SPERS, IELTS and international bridging.
- Methods: PSLE English Story Arc + Show, Don't Tell and PAC/PACT for situational writing; PSLE Maths model drawing and heuristics; PSLE Science Claim-Evidence-Reasoning; O-Level PEEL essays; History and Social Studies SBCS toolkit; Literature PEEL-L; GP AQ Localisation and Macro-Argumentation; IB/IGCSE strict rubric alignment.
- EssayLabsg™ on this site offers free instant marking (1 essay a week for PSLE English, O-Level English or A-Level GP; an estimated score, a mark for each criterion and the most important improvement, in about a minute) and Detailed feedback: 4 reports per billing period on any of the 13 papers, with comments on each paragraph and up to three improvements with rewrites, ready in a few minutes. Pay S$39 a month by card (renews monthly until cancelled; cancel any time and keep access for the period paid) or S$39 once by PayNow for 31 days (no auto-renewal). Unused reports don't carry over; a failed report doesn't use a credit. Subscribe on the site in the Detailed feedback section.
- Online group classes (small, live, run by our specialists) are starting soon. Anyone interested can join the early list; their summary should say "online group class early list" with level and subject. No dates, sizes or prices yet.
- Testimonials available upon request; certificates shown at the first lesson.
- EssayLabsg™ feedback is prepared to our Exam Preparation Specialists™' marking criteria, frameworks and guidance. Never mention AI, automation, software or language models.

RULES:
- You may state the EssayLabsg™ prices above exactly as written. NEVER quote tuition or class prices, rates, fees, discounts, specific lesson times or availability. Say a specialist will confirm these personally on WhatsApp.
- Never promise grades. Never quote results, pass rates, percentages, years of experience or student numbers. Never say or imply that a specialist personally reads, marks or reviews EssayLabsg™ essays. Never collect NRIC, addresses beyond the general area, or payment details.
- Your goal is to collect: the student's level, subjects, general area (or online), preferred days/times, and a contact name. Ask for missing items naturally, one or two at a time.
- When you have level, subjects, area and preferred days/times, set "ready" to true and write "summary" as a short WhatsApp message from the parent to the team, e.g. "Hi, I'm Mrs Tan. Looking for Sec 3 English and Literature, Bishan area, Tue or Thu after 5pm."

Reply with ONLY JSON: {"reply": string, "ready": boolean, "summary": string|null}`;

function parseJSON(t){
  try{ return JSON.parse(t); }catch{}
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if(a >= 0 && b > a){ try{ return JSON.parse(t.slice(a, b+1)); }catch{} }
  return null;
}

module.exports = async (req, res) => {
  if(req.method !== "POST") return res.status(405).json({error:"method"});
  if(!originOk(req)) return res.status(403).json({error:"origin"});
  const token = req.headers["x-vercel-oidc-token"] || process.env.VERCEL_OIDC_TOKEN || process.env.AI_GATEWAY_API_KEY;
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
  const now = Date.now(), recent = (hits.get(ip) || []).filter(t => now - t < 3600e3);
  // 10 questions a minute and 60 an hour per network address on this instance.
  if(recent.filter(t => now - t < 60e3).length >= 10 || recent.length >= 60) return res.status(429).json({error:"rate", message:"Lots of questions at once. Please wait a minute and try again."});
  recent.push(now); hits.set(ip, recent);

  let body = req.body; if(typeof body === "string"){ try{ body = JSON.parse(body); }catch{ body = {}; } }
  const msgs = (Array.isArray(body && body.messages) ? body.messages : []).slice(-12)
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map(m => ({role: m.role, content: m.content.slice(0, 1000)}));
  while(msgs.length && msgs[0].role !== "user") msgs.shift();
  if(!msgs.length || msgs[msgs.length - 1].role !== "user") return res.status(400).json({error:"empty"});
  if(!token) return res.status(500).json({error:"server"});
  if(KV_URL){
    // Counted before the model call, so parallel requests can't pass the cap together.
    try{
      const dk = "askcap:" + new Date(Date.now() + 8*3600e3).toISOString().slice(0, 10), n = await kv("INCR", dk);
      if(n === 1) await kv("EXPIRE", dk, 172800);
      if(+n > ASK_DAILY_CAP) return res.status(503).json({error:"busy"});
    }catch(e){ console.error("askcap", e.message); }
  }

  for(const model of MODELS){
    try{
      const r = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {method:"POST",
        headers:{"Authorization":"Bearer " + token, "Content-Type":"application/json"},
        body: JSON.stringify({model, max_tokens: 1500, messages: [{role:"system", content: BRIEF}, ...msgs]})});
      const j = await r.json().catch(() => ({}));
      if(!r.ok){ console.error(model, r.status, JSON.stringify(j).slice(0, 200)); if(r.status === 429) return res.status(503).json({error:"busy"}); continue; }
      const text = String((((j.choices || [])[0] || {}).message || {}).content || "");
      const out = parseJSON(text) || {reply: text.slice(0, 800), ready: false, summary: null};
      return res.status(200).json({reply: String(out.reply || ""), ready: !!out.ready, summary: out.summary ? String(out.summary).slice(0, 600) : null});
    }catch(e){ console.error(model, e.message); }
  }
  return res.status(502).json({error:"server"});
};
