import { put, list, get, del } from '@vercel/blob';

// Collections live as one JSON blob per record under <collection>/<id>.json in the private store.
export const COLLECTIONS = ['enquiries', 'applications', 'placements'];
const safeId = id => String(id || '').replace(/[^\w-]/g, '');

async function putJson(path, doc) {
  await put(path, JSON.stringify(doc), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function getJson(path) {
  try {
    const res = await get(path, { access: 'private', useCache: false });
    if (!res || !res.stream) return null;
    return JSON.parse(await new Response(res.stream).text());
  } catch (e) {
    if (e && /not.?found/i.test(String(e.name) + String(e.message))) return null;
    throw e;
  }
}

export async function saveDoc(collection, doc) {
  await putJson(`${collection}/${safeId(doc.id)}.json`, doc);
  return doc;
}

export function readDoc(collection, id) {
  return getJson(`${collection}/${safeId(id)}.json`);
}

export async function deleteDoc(collection, id) {
  const path = `${collection}/${safeId(id)}.json`;
  const page = await list({ prefix: path, limit: 1 });
  const blob = page.blobs.find(b => b.pathname === path);
  if (!blob) return false;
  await del(blob.url);
  return true;
}

export async function listDocs(collection, limit = 300) {
  const prefix = collection + '/';
  const paths = [];
  let cursor;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    page.blobs.forEach(b => paths.push(b.pathname));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor && paths.length < 5000);
  paths.sort().reverse(); // ids start with a timestamp, so newest first
  const ids = paths.slice(0, limit).map(p => p.slice(prefix.length, -5));
  const docs = await Promise.all(ids.map(id => readDoc(collection, id).catch(() => null)));
  return docs.filter(Boolean);
}

// Duplicate-submission markers: dedupe/<hash>.json holds the id of the record first saved.
export function readDedupe(hash) {
  return getJson(`dedupe/${safeId(hash)}.json`);
}
export function saveDedupe(hash, id) {
  return putJson(`dedupe/${safeId(hash)}.json`, { id, at: new Date().toISOString() });
}

// Kept for the original enquiry endpoints.
export const saveEnquiry = doc => saveDoc('enquiries', doc);
export const readEnquiry = id => readDoc('enquiries', id);
export const listEnquiries = limit => listDocs('enquiries', limit);
