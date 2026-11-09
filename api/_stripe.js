import { createHmac, timingSafeEqual } from 'node:crypto';

// Minimal Stripe client over fetch (no SDK). Secrets come only from server env vars.
const API = 'https://api.stripe.com/v1';

export const stripeKey = (env = process.env) => String(env.STRIPE_SECRET_KEY || '').trim();
export const stripeConfigured = (env = process.env) => /^(sk|rk)_(test|live)_/.test(stripeKey(env));
// 'live' only for a live key; anything else (including no key) reports 'test'.
export const stripeMode = (env = process.env) => (/^(sk|rk)_live_/.test(stripeKey(env)) ? 'live' : 'test');

// Stripe form encoding: nested objects become a[b][c]=v, arrays a[0][b]=v. null/undefined are skipped.
export function encodeForm(params, prefix = '', out = []) {
  if (params === undefined || params === null) return out;
  if (Array.isArray(params)) {
    params.forEach((v, i) => encodeForm(v, `${prefix}[${i}]`, out));
  } else if (typeof params === 'object') {
    Object.keys(params).forEach(k => encodeForm(params[k], prefix ? `${prefix}[${k}]` : k, out));
  } else if (prefix) {
    out.push(encodeURIComponent(prefix) + '=' + encodeURIComponent(String(params)));
  }
  return prefix ? out : out.join('&');
}

export class StripeError extends Error {
  constructor(message, status, body) { super(message); this.name = 'StripeError'; this.status = status; this.body = body; }
}

export async function stripeRequest(method, path, params = {}, opts = {}) {
  const key = opts.key || stripeKey();
  if (!key) throw new StripeError('Stripe is not configured.', 503);
  const fetchImpl = opts.fetchImpl || fetch;
  const m = String(method || 'GET').toUpperCase();
  const form = encodeForm(params);
  const url = API + path + (m === 'GET' && form ? '?' + form : '');
  const headers = { Authorization: 'Bearer ' + key, 'Content-Type': 'application/x-www-form-urlencoded' };
  if (opts.idempotencyKey) headers['Idempotency-Key'] = String(opts.idempotencyKey);
  const res = await fetchImpl(url, { method: m, headers, body: m === 'GET' ? undefined : form, signal: AbortSignal.timeout(opts.timeoutMs || 15000) });
  let body = {};
  try { body = await res.json(); } catch (e) { body = {}; }
  if (!res.ok) throw new StripeError((body.error && body.error.message) || `Stripe ${m} ${path} failed (${res.status})`, res.status, body);
  return body;
}

// Verifies a Stripe-Signature header ("t=...,v1=...") against the RAW body. Returns the parsed event or throws.
export function verifyWebhook(rawBody, sigHeader, secret, toleranceSec = 300, now = Math.floor(Date.now() / 1000)) {
  if (!secret) throw new Error('No webhook secret configured.');
  const raw = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody || '');
  let t = null;
  const sigs = [];
  String(sigHeader || '').split(',').forEach(part => {
    const i = part.indexOf('=');
    if (i < 0) return;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k === 't') t = Number(v);
    if (k === 'v1') sigs.push(v);
  });
  if (!Number.isFinite(t) || !sigs.length) throw new Error('Malformed Stripe-Signature header.');
  if (Math.abs(now - t) > toleranceSec) throw new Error('Webhook timestamp outside the tolerance.');
  const expected = Buffer.from(createHmac('sha256', secret).update(`${t}.${raw}`, 'utf8').digest('hex'));
  const ok = sigs.some(s => {
    const given = Buffer.from(s);
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
  if (!ok) throw new Error('Webhook signature does not match.');
  return JSON.parse(raw);
}

// Site origin for success/cancel URLs. SITE_URL wins; otherwise the request host so previews work.
export function siteOrigin(req, env = process.env) {
  if (env.SITE_URL) return String(env.SITE_URL).replace(/\/+$/, '');
  const h = (req && req.headers) || {};
  const host = String(h['x-forwarded-host'] || h.host || '').split(',')[0].trim().toLowerCase();
  if (!/^[a-z0-9.-]+(:\d+)?$/.test(host)) return 'https://thinking-hack.vercel.app';
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  return (local ? 'http://' : 'https://') + host;
}
