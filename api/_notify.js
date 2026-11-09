// Owner notifications through Resend (free tier) over fetch. Skips quietly unless RESEND_API_KEY and NOTIFY_EMAIL are set.
// Messages carry minimal personal data: the type, a reference id and the admin link. Never throws.

const ADMIN_URL = 'https://thinking-hack.vercel.app/admin';
const LABELS = {
  enquiry: 'New enquiry',
  application: 'New Specialist application',
  'order-paid': 'Order paid',
  'placement-fee-paid': 'Placement fee paid',
};

export async function notify({ type, id, detail } = {}, { env = process.env, fetchImpl = fetch } = {}) {
  const key = env.RESEND_API_KEY;
  const to = String(env.NOTIFY_EMAIL || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!key || !to.length) return { skipped: true };
  const label = LABELS[type] || 'Thinking Hack update';
  const lines = [label, 'Reference: ' + String(id || '-')];
  if (detail) lines.push(String(detail).slice(0, 200));
  lines.push('', 'Open the admin: ' + ADMIN_URL);
  try {
    const res = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.NOTIFY_FROM || 'Thinking Hack <onboarding@resend.dev>',
        to,
        subject: `${label}: ${String(id || '').slice(0, 60)}`,
        text: lines.join('\n'),
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error('notify failed', res.status);
    return { ok: res.ok };
  } catch (e) {
    console.error('notify failed', e && e.message);
    return { ok: false };
  }
}
