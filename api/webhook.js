/* © 2026 Christine Sebastian. All rights reserved. EssayLabsg™ website and marking engine. Unauthorised copying, reproduction or reuse is prohibited. */
// Stripe webhook (/api/webhook): credits a paid Checkout even if the buyer closes the tab before thanks.html.
// Events: checkout.session.completed (card, Apple Pay, Google Pay; PayNow/GrabPay when already paid)
// and checkout.session.async_payment_succeeded (a PayNow or GrabPay payment that cleared later).
// Writes the same KV records as the thanks.html confirm in mark.js, so either path alone is enough.
// Needs STRIPE_WEBHOOK_SECRET and KV in Vercel.
const crypto = require("crypto");
const WH_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const PLAN_REPORTS = +process.env.PLAN_REPORTS || 4, ONCE_DAYS = 31, LEAD_TTL = 2 * 365 * 86400;
const okId = x => typeof x === "string" && /^[a-z0-9]{8,32}$/.test(x);

// Test links keep their own data: every key gets this prefix unless this is the live site.
const KV_PREFIX = process.env.VERCEL_ENV === "production" ? "" : "preview:";
const kvCmd = c => !KV_PREFIX || c.length < 2 ? c : c[0] === "MGET" ? [c[0], ...c.slice(1).map(k => KV_PREFIX + k)] : [c[0], KV_PREFIX + c[1], ...c.slice(2)];
async function kv(...cmd){
  if(!KV_URL) return null;
  const r = await fetch(KV_URL, {method: "POST", headers: {"Authorization": "Bearer " + KV_TOKEN, "Content-Type": "application/json"}, body: JSON.stringify(kvCmd(cmd))});
  return (await r.json()).result;
}
// The raw bytes Stripe signed: read the stream and never touch req.body (Vercel would parse and re-serialise it).
const rawBody = req => new Promise((ok, no) => { const c = []; req.on("data", x => c.push(x)); req.on("end", () => ok(Buffer.concat(c).toString("utf8"))); req.on("error", no); });
function signed(raw, header){
  const parts = String(header || "").split(","), t = (parts.find(p => p.startsWith("t=")) || "").slice(2);
  const sigs = parts.filter(p => p.startsWith("v1=")).map(p => p.slice(3));
  if(!t || !sigs.length || Math.abs(Date.now() / 1000 - +t) > 600) return false;
  const want = Buffer.from(crypto.createHmac("sha256", WH_SECRET).update(t + "." + raw).digest("hex"));
  return sigs.some(s => { const b = Buffer.from(s); return b.length === want.length && crypto.timingSafeEqual(b, want); });
}
async function alert(uid, text){
  const id = crypto.randomBytes(8).toString("hex");
  await kv("SET", "msg:" + id, JSON.stringify({name: "Payment", phone: "", text, uid, t: Date.now()}), "EX", LEAD_TTL);
  await kv("ZADD", "msgs", Date.now(), id);
}
async function credit(s){
  const md = s.metadata || {}, uid = md.uid;
  if(!okId(uid)) return "no uid";
  if(s.mode === "payment" && md.plan === "once"){
    if(s.payment_status !== "paid") return "pending";  // PayNow/GrabPay not cleared yet: async_payment_succeeded follows
    if(!(await kv("SET", "oncecs:" + s.id, uid, "NX")) && (await kv("GET", "oncecs:" + s.id)) !== uid) return "claimed";
    const old = JSON.parse((await kv("GET", "once:" + uid)) || "null");
    if(old && old.cs === s.id) return "already";
    const start = Math.max(s.created, old && old.end * 1000 > Date.now() ? old.end : 0);
    await kv("SET", "once:" + uid, JSON.stringify({cs: s.id, start, end: start + ONCE_DAYS * 86400}));
    await kv("ZADD", "fs:paid", "NX", Date.now(), uid);
    if(await kv("SET", "paidalert:" + uid + ":" + start, "1", "NX", "EX", 40 * 86400))
      await alert(uid, `[Payment] Detailed feedback 31-day pass is active for device ${uid}: ${PLAN_REPORTS} reports, ends ${new Date((start + ONCE_DAYS * 86400) * 1000).toISOString().slice(0, 10)}. (Stripe webhook)`);
    return "once";
  }
  if(s.mode === "subscription" && s.subscription){
    if(s.payment_status !== "paid") return "pending";  // credit only a paid first invoice
    if(!(await kv("SET", "subcs:" + s.id, uid, "NX")) && (await kv("GET", "subcs:" + s.id)) !== uid) return "claimed";
    await kv("SET", "plan:" + uid, typeof s.subscription === "string" ? s.subscription : s.subscription.id);
    await kv("ZADD", "fs:paid", "NX", Date.now(), uid);
    return "sub";
  }
  return "ignored";
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if(req.method !== "POST") return res.status(405).json({error: "method"});
  if(!WH_SECRET || !KV_URL) return res.status(500).json({error: "webhook not configured"});
  let raw;
  try{ raw = await rawBody(req); }catch{ return res.status(400).json({error: "body"}); }
  if(!signed(raw, req.headers["stripe-signature"])) return res.status(400).json({error: "bad signature"});
  let ev; try{ ev = JSON.parse(raw); }catch{ return res.status(400).json({error: "json"}); }
  if(ev.type === "checkout.session.completed" || ev.type === "checkout.session.async_payment_succeeded"){
    try{ const r = await credit(ev.data.object); console.log("webhook", ev.type, r); return res.status(200).json({received: true, result: r}); }
    catch(e){ console.error("webhook", e.message); return res.status(500).json({error: "record"}); }  // 500 makes Stripe retry
  }
  if(ev.type === "checkout.session.async_payment_failed") console.log("webhook async payment failed", ev.data.object.id);
  return res.status(200).json({received: true});
};
