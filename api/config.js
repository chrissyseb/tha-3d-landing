import { stripeConfigured, stripeMode } from './_stripe.js';
import { availableResourceIds } from './_products.js';

// Public payment config. Never returns a key. `available` lists the notes packs and bundles whose PDFs are uploaded,
// so only those show a Buy button.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET.' });
  const stripe = stripeConfigured();
  let available = [];
  if (stripe) {
    try { available = await availableResourceIds(); } catch (e) { console.error('product list failed', e && e.message); }
  }
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ stripe, mode: stripeMode(), available });
}
