import { buildEnquiry, dedupeKey } from './_validate.js';
import { saveDoc, readDedupe, saveDedupe } from './_store.js';
import { notify } from './_notify.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  const b = req.body && typeof req.body === 'object' ? req.body : {};

  // Honeypot: real people never fill this hidden field.
  if (typeof b.website === 'string' && b.website.trim()) return res.status(200).json({ ok: true });

  const { doc, error } = buildEnquiry(b);
  if (error) return res.status(400).json({ error });

  try {
    const hash = dedupeKey('enquiry', b, doc.contact);
    const seen = await readDedupe(hash);
    if (seen && seen.id) return res.status(200).json({ ok: true, id: seen.id, duplicate: true });
    await saveDoc('enquiries', doc);
    await saveDedupe(hash, doc.id).catch(e => console.error('saveDedupe failed', e));
    await notify({ type: 'enquiry', id: doc.id }).catch(() => {});
    return res.status(200).json({ ok: true, id: doc.id });
  } catch (e) {
    console.error('saveEnquiry failed', e);
    return res.status(500).json({ error: 'We could not save your request just now. Please try again in a minute.' });
  }
}
