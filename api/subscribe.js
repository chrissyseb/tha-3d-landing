/* © 2026 Christine Sebastian. All rights reserved. EssayLabsg™ website and marking engine. Unauthorised copying, reproduction or reuse is prohibited. */
// Email capture: validates and stores subscribers for the admin "Subscribers" tab. Marketing consent is only ever what was ticked.
// Email sending (Brevo) is not wired yet: BREVO_API_KEY will be read from the environment later, never from the page.
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
// Test links keep their own data: every key gets this prefix unless this is the live site.
const KV_PREFIX = process.env.VERCEL_ENV === "production" ? "" : "preview:";
const kvCmd = c => !KV_PREFIX || c.length < 2 ? c : c[0] === "MGET" ? [c[0], ...c.slice(1).map(k => KV_PREFIX + k)] : [c[0], KV_PREFIX + c[1], ...c.slice(2)];
async function kv(...cmd){
  if(!KV_URL) return null;
  const r = await fetch(KV_URL, {method: "POST", headers: {"Authorization": "Bearer " + KV_TOKEN, "Content-Type": "application/json"}, body: JSON.stringify(kvCmd(cmd))});
  return (await r.json()).result;
}
const ROLES = ["parent", "student"], LEVELS = ["psle", "olevel", "gp", "ib", "igcse"], SOURCES = ["result", "share", "checklist", "masterclass", "notes", "pdf", "gate"];
const clean = (t, n) => String(t || "").replace(/<[^>]*>/g, "").replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, n);
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if(req.method !== "POST") return res.status(405).json({ok: false});
  // Same-site only (this site, its Vercel previews, localhost).
  const o = String(req.headers.origin || ""), host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim().toLowerCase();
  if(o && o.toLowerCase() !== "https://" + host && !/^https:\/\/(essay-marker(-[a-z0-9-]+)?|essaylab-sg)\.vercel\.app$/i.test(o) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(o)) return res.status(403).json({ok: false});
  let b = req.body || {}; if(typeof b === "string"){ try{ b = JSON.parse(b); }catch{ b = {}; } }
  const email = clean(b.email, 120).toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return res.status(200).json({ok: false, error: "email"});
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "x";
  const item = {email, role: ROLES.includes(b.role) ? b.role : "", level: LEVELS.includes(b.level) ? b.level : "", consent: b.marketing_consent === true,
    consent_text_version: clean(b.consent_text_version, 40), source: SOURCES.includes(b.source) ? b.source : "result", page: clean(b.page, 60), paper: clean(b.paper, 30), band: clean(b.band, 30), t: Date.now()};
  if(!KV_URL) return res.status(200).json({ok: true});
  try{
    const hk = "subip:" + ip + ":" + new Date().toISOString().slice(0, 13), n = await kv("INCR", hk); if(n === 1) await kv("EXPIRE", hk, 3600);
    if(n > 60) return res.status(200).json({ok: false, error: "rate"});  // high enough for a class on one school network
    // One record per email: a later sign-up updates it (consent can be given later, never removed silently here).
    const id = require("crypto").createHash("sha256").update(email).digest("hex").slice(0, 16);
    const old = JSON.parse((await kv("GET", "sub:" + id)) || "null");
    if(old){ item.paper = item.paper || old.paper || ""; item.band = item.band || old.band || ""; item.consent = old.consent || item.consent; item.first = old.first || old.t; item.sources = [...new Set([...(old.sources || [old.source]), item.source])]; }
    else { item.first = item.t; item.sources = [item.source]; }
    await kv("SET", "sub:" + id, JSON.stringify({id, ...item})); await kv("ZADD", "subs", item.t, id);
    return res.status(200).json({ok: true});
  }catch(e){ console.error("subscribe", e.message); return res.status(200).json({ok: false, error: "busy"}); }
};
