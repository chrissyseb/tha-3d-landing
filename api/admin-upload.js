import { timingSafeEqual, createHash } from 'node:crypto';
import { defaultCatalogue } from './_catalogue.js';

// POST   /api/admin-upload?id=<pack id>  body: the raw PDF (Content-Type: application/pdf)
// DELETE /api/admin-upload?id=<pack id>
// Stores one customer PDF in the PRIVATE blob store at products/<id>.pdf, which is what api/download.js streams
// after a verified payment. <id> is a pack id, or the file name (without .pdf) of one part of a Full Set.
// Only paths the catalogue lists are accepted; bundles made of packs reuse the packs' files.
// Vercel caps a function request body at about 4.5 MB, so anything over MAX_BYTES is refused with 413.

export const MAX_BYTES = 4_400_000; // 4.4 MB (decimal), safely under Vercel's 4.5 MB body limit
const TOO_BIG = 'This PDF is over 4.4 MB, the upload limit. Compress the PDF (for example with your PDF app\'s "Reduce file size" or "Optimise" option) and try again.';
const PDF_MAGIC = Buffer.from('%PDF-');

function authorised(req, env) {
  const key = env.ADMIN_KEY || '';
  const given = String((req.headers && req.headers['x-admin-key']) || '');
  const digest = s => createHash('sha256').update(s).digest();
  return !!key && timingSafeEqual(digest(given), digest(key));
}

// A single pack (not a bundle) whose file is exactly products/<id>.pdf.
export function findPack(id, catalogue = defaultCatalogue) {
  const key = String(id || '');
  if (!/^res-[\w-]+$/.test(key)) return null;
  const r = (catalogue.resources || []).find(x => x && x.id === key);
  if (!r || r.bundle || Array.isArray(r.files)) return null;
  return r.file === `products/${key}.pdf` ? r : null;
}

// A pack, or one part of a Full Set: any products/<id>.pdf path that some catalogue resource delivers.
export function findUpload(id, catalogue = defaultCatalogue) {
  const key = String(id || '');
  const pack = findPack(key, catalogue);
  if (pack) return pack;
  if (!/^bundle-set-[\w-]+-\d\d$/.test(key)) return null;
  const path = `products/${key}.pdf`;
  const owner = (catalogue.resources || []).find(r => r && Array.isArray(r.files) && r.files.includes(path));
  return owner ? { id: key, title: (owner.fileTitles || [])[owner.files.indexOf(path)] || key } : null;
}

// Reads the raw request stream (never req.body). Over the limit, it keeps draining but stops storing.
export async function readLimited(req, max) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    const b = typeof c === 'string' ? Buffer.from(c) : c;
    size += b.length;
    if (size <= max) chunks.push(b);
  }
  return size > max ? { tooBig: true, size } : { buffer: Buffer.concat(chunks), size };
}

async function realDeps() {
  const blob = await import('@vercel/blob');
  return {
    put: (path, body, opts) => blob.put(path, body, opts),
    remove: async path => {
      const page = await blob.list({ prefix: path, limit: 1 });
      const found = (page.blobs || []).find(b => b.pathname === path);
      if (!found) return false;
      await blob.del(found.url);
      return true;
    },
  };
}

export function createUploadHandler({ getDeps = realDeps, catalogue = defaultCatalogue, env = process.env, maxBytes = MAX_BYTES } = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (!authorised(req, env)) return res.status(401).json({ error: 'Wrong admin key.' });
    if (req.method !== 'POST' && req.method !== 'DELETE') {
      res.setHeader('Allow', 'POST, DELETE');
      return res.status(405).json({ error: 'Use POST or DELETE.' });
    }
    const q = req.query || {};
    const pack = findUpload(q.id, catalogue);
    if (!pack) return res.status(404).json({ error: 'Unknown file. The name must be a pack id, or a Full Set part such as bundle-set-psle-maths-02.' });
    const path = `products/${pack.id}.pdf`;
    try {
      if (req.method === 'DELETE') {
        const deps = await getDeps();
        const removed = await deps.remove(path);
        if (!removed) return res.status(404).json({ error: 'There is no uploaded PDF for this pack.' });
        return res.status(200).json({ ok: true, id: pack.id, deleted: true });
      }

      const declared = Number((req.headers || {})['content-length']);
      if (Number.isFinite(declared) && declared > maxBytes) return res.status(413).json({ error: TOO_BIG });
      const type = String((req.headers || {})['content-type'] || '').split(';')[0].trim().toLowerCase();
      if (type && type !== 'application/pdf' && type !== 'application/octet-stream') {
        return res.status(415).json({ error: 'Send the PDF itself with Content-Type application/pdf.' });
      }
      const body = await readLimited(req, maxBytes);
      if (body.tooBig) return res.status(413).json({ error: TOO_BIG });
      if (!body.size) return res.status(400).json({ error: 'The file is empty.' });
      if (body.buffer.length < PDF_MAGIC.length || !body.buffer.subarray(0, PDF_MAGIC.length).equals(PDF_MAGIC)) {
        return res.status(400).json({ error: 'That file is not a PDF (it does not start with %PDF-). Export the pack as PDF and try again.' });
      }
      const deps = await getDeps();
      await deps.put(path, body.buffer, { access: 'private', contentType: 'application/pdf', addRandomSuffix: false, allowOverwrite: true });
      return res.status(200).json({ ok: true, id: pack.id, size: body.size });
    } catch (e) {
      console.error('admin-upload', req.method, pack.id, e && e.message);
      return res.status(500).json({ error: 'Upload failed: ' + (e && e.message ? e.message : 'please try again.') });
    }
  };
}

export default createUploadHandler();
