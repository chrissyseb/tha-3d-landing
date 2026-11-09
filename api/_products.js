import { RESOURCES, resourceFiles } from './_catalogue.js';

// Which catalogue resources can actually be delivered: every PDF they list must exist in the private store.
// Cached briefly per function instance so the homepage config call stays cheap.
let cache = { at: 0, paths: null };

export async function uploadedPaths({ listFn, now = Date.now(), maxAgeMs = 60000 } = {}) {
  if (cache.paths && now - cache.at < maxAgeMs && !listFn) return cache.paths;
  const list = listFn || (await import('@vercel/blob')).list;
  const paths = new Set();
  let cursor;
  do {
    const page = await list({ prefix: 'products/', cursor, limit: 1000 });
    page.blobs.forEach(b => paths.add(b.pathname));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  if (!listFn) cache = { at: now, paths };
  return paths;
}

export function deliverable(resource, paths) {
  const files = resourceFiles(resource);
  return files.length > 0 && files.every(f => paths.has(f.path));
}

export async function availableResourceIds(opts) {
  const paths = await uploadedPaths(opts);
  return RESOURCES.filter(r => deliverable(r, paths)).map(r => r.id);
}
