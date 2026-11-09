import { timingSafeEqual } from 'node:crypto';
import { Readable } from 'node:stream';
import { findItem, resourceFiles, defaultCatalogue } from './_catalogue.js';

// GET /api/download?order=<id>&token=<token>[&file=<n>]: streams a paid resource PDF from the PRIVATE blob store.
// Single pack: no `file` needed. Bundle: `file` is the 0-based index; without it the response is a JSON index
// { files: [{ title, url }] }. 403 unless the order is a paid resource order and the token matches.
// Only products/*.pdf paths from the catalogue are ever served (never the .md drafts).

const PREPARING = 'Your file is being prepared, we\'ll email it to you shortly.';

const same = (a, b) => {
  const x = Buffer.from(String(a || '')); const y = Buffer.from(String(b || ''));
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y);
};

async function realDeps() {
  const s = await import('./_store.js');
  const blob = await import('@vercel/blob');
  return {
    readDoc: s.readDoc,
    getFile: async path => {
      try {
        const r = await blob.get(path, { access: 'private', useCache: false });
        return r && r.stream ? { stream: r.stream } : null;
      } catch (e) {
        if (e && /not.?found/i.test(String(e.name) + String(e.message))) return null;
        throw e;
      }
    },
  };
}

export function createDownloadHandler({ getDeps = realDeps, catalogue = defaultCatalogue } = {}) {
  return async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET.' });
    const q = req.query || {};
    const id = String(q.order || '').replace(/[^\w-]/g, '').slice(0, 80);
    const deny = () => res.status(403).json({ error: 'This download link is not valid.' });
    if (!id || !q.token) return deny();
    try {
      const deps = await getDeps();
      const order = await deps.readDoc('orders', id);
      if (!order || order.kind !== 'resource' || order.status !== 'paid' || !same(q.token, order.downloadToken)) return deny();
      const item = findItem(order.itemId, catalogue);
      const files = item && item.kind === 'resource' ? resourceFiles(item) : [];
      if (!files.length) { console.error('download: no files for', order.itemId, order.id); return res.status(404).json({ error: PREPARING }); }

      const multi = item.bundle || files.length > 1;
      if (multi && (q.file === undefined || q.file === '')) {
        const base = `/api/download?order=${encodeURIComponent(order.id)}&token=${encodeURIComponent(order.downloadToken)}`;
        return res.status(200).json({ files: files.map((f, i) => ({ title: f.title, url: `${base}&file=${i}` })) });
      }
      const n = multi ? Number(q.file) : 0;
      if (!Number.isInteger(n) || n < 0 || n >= files.length) return res.status(404).json({ error: 'No such file in this order.' });
      const f = files[n];

      const file = await deps.getFile(f.path);
      if (!file) { console.error('download: blob missing', f.path, 'order', order.id); return res.status(404).json({ error: PREPARING }); }
      const name = ('Thinking-Hack-' + f.title).replace(/[^\w-]+/g, '-').replace(/-+/g, '-') + '.pdf';
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
      res.setHeader('Cache-Control', 'private, no-store');
      res.status(200);
      const body = file.stream instanceof Readable ? file.stream : Readable.fromWeb(file.stream);
      await new Promise((resolve, reject) => { body.on('error', reject); res.on('finish', resolve); res.on('error', reject); body.pipe(res); });
    } catch (e) {
      console.error('download failed', e && e.message);
      if (!res.headersSent) return res.status(500).json({ error: 'Download failed. Please try again.' });
      res.end();
    }
  };
}

export default createDownloadHandler();
