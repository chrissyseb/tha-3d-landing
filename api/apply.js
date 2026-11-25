import { buildApplication, dedupeKey, str } from './_validate.js';
import { saveDoc, readDedupe, saveDedupe, allow } from './_store.js';
import { notify } from './_notify.js';

// Specialist applications from /join. Validation and the record shape live in _validate.js.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  const b = req.body && typeof req.body === 'object' ? req.body : {};

  // Honeypot: real people never fill this hidden field.
  if (str(b.website)) return res.status(200).json({ ok: true });

  const { doc, error } = buildApplication(b);
  if (error) return res.status(400).json({ error });
  // After validation, so an applicant correcting the form does not use up the allowance.
  if (!(await allow(req, 'apply'))) return res.status(429).json({ error: 'Too many requests. Please try again later.' });

  try {
    const hash = dedupeKey('application', b, doc.contact);
    const existing = await readDedupe(hash);
    if (existing && existing.id) return res.status(200).json({ ok: true, id: existing.id, duplicate: true });
    await saveDoc('applications', doc);
    await saveDedupe(hash, doc.id).catch(e => console.error('saveDedupe failed', e));
    await notify({ type: 'application', id: doc.id }).catch(() => {});
    return res.status(200).json({ ok: true, id: doc.id });
  } catch (e) {
    console.error('save application failed', e);
    return res.status(500).json({ error: 'We could not save your application just now. Please try again in a minute, or message us on WhatsApp at +65 9003 0002.' });
  }
}
