import { createHmac, timingSafeEqual } from 'node:crypto';
import { getJson, putJson, famPath } from './_lib.js';
export const config = { api: { bodyParser: false } };
export default async function handler(req, res) {
  let raw = ''; for await (const c of req) raw += c;
  const secret = process.env.STRIPE_WEBHOOK_SECRET; const sig = String(req.headers['stripe-signature'] || '');
  if (!secret) { res.statusCode = 503; return res.end('not configured'); }
  const t = /t=(\d+)/.exec(sig), v1s = [...sig.matchAll(/v1=([0-9a-f]+)/g)].map(m => m[1]);
  const exp = t && createHmac('sha256', secret).update(`${t[1]}.${raw}`).digest('hex');
  const good = exp && v1s.some(v => v.length === exp.length && timingSafeEqual(Buffer.from(v), Buffer.from(exp)));
  if (!good || Math.abs(Date.now() / 1000 - Number(t[1])) > 600) { res.statusCode = 400; return res.end('bad signature'); }
  const ev = JSON.parse(raw);
  if (ev.type === 'checkout.session.completed' || ev.type === 'checkout.session.async_payment_succeeded') {
    const cs = ev.data.object; if (cs.payment_status !== 'paid') { res.statusCode = 200; return res.end('pending'); }
    const fam = await getJson(famPath(cs.metadata.fid));
    if (fam) {
      const p = fam.paid && fam.paid.until > Date.now() ? fam.paid : { children: [] };
      const until = Date.now() + 365 * 864e5;
      if (cs.metadata.plan === 'family') fam.paid = { plan: 'family', until, children: p.children || [] };
      else fam.paid = { plan: p.plan === 'family' ? 'family' : 'child', until: Math.max(until, p.until || 0), children: [...new Set([...(p.children || []), cs.metadata.childId])] };
      (fam.payments = fam.payments || []).push({ id: cs.id, plan: cs.metadata.plan, amount: cs.amount_total, at: Date.now() });
      await putJson(famPath(fam.id), fam);
    }
  }
  res.statusCode = 200; res.end('ok');
}
