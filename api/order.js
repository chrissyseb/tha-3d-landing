import { publicView } from './_orders.js';
import { findItem, resourceFiles, defaultCatalogue } from './_catalogue.js';

// GET /api/order?id=<orderId> -> public-safe status { id, status, kind, title, amount, currency, mode } (no personal data).
// A PAID resource order also gets its download link(s): `download` for a single pack, `downloads: [{title, url}]` for a bundle.
// The order id (96 random bits) plus the per-order token act as the bearer secret.

export function downloadLinks(order, catalogue = defaultCatalogue) {
  if (order.kind !== 'resource' || order.status !== 'paid' || !order.downloadToken) return {};
  const item = findItem(order.itemId, catalogue);
  const files = item && item.kind === 'resource' ? resourceFiles(item) : [];
  const base = `/api/download?order=${encodeURIComponent(order.id)}&token=${encodeURIComponent(order.downloadToken)}`;
  if (!files.length) return {};
  if (item.bundle || files.length > 1) return { downloads: files.map((f, i) => ({ title: f.title, url: `${base}&file=${i}` })) };
  return { download: base };
}

export function createOrderHandler({ getDeps, catalogue = defaultCatalogue } = {}) {
  const load = getDeps || (async () => { const s = await import('./_store.js'); return { readDoc: s.readDoc }; });
  return async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET.' });
    const q = req.query || {};
    const id = String(q.id || '').replace(/[^\w-]/g, '').slice(0, 80);
    if (!id) return res.status(400).json({ error: 'Missing order id.' });
    try {
      const { readDoc } = await load();
      const order = await readDoc('orders', id);
      if (!order) return res.status(404).json({ error: 'Order not found.' });
      return res.status(200).json({ ...publicView(order), ...downloadLinks(order, catalogue) });
    } catch (e) {
      console.error('order lookup failed', e && e.message);
      return res.status(500).json({ error: 'Could not check the order just now.' });
    }
  };
}

export default createOrderHandler();
