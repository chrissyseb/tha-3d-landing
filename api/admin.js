import { timingSafeEqual } from 'node:crypto';
import { listDocs, readDoc, saveDoc, deleteDoc } from './_store.js';
import { newId } from './_validate.js';
import { RESOURCES, resourceFiles } from './_catalogue.js';
import { PLACEMENT_STATUSES, emptyPlacement, computePlacement, applyPlacementUpdate, summarise, normalisePlacement, feeLinkAmount, recordFeeLink } from './_placement.js';
import { ENQUIRY_STATUSES, normaliseEnquiry, applyEnquiryUpdate, recordStatusChange } from './_enquiry.js';
import { buildOverview } from './_overview.js';

const APPLICATION_STATUSES = ['new', 'under-review', 'approved', 'rejected', 'inactive'];
const KINDS = { enquiries: ENQUIRY_STATUSES, applications: APPLICATION_STATUSES, placements: PLACEMENT_STATUSES };
const SINGULAR = { enquiries: 'enquiry', applications: 'application', placements: 'placement' };

const safeId = id => String(id || '').replace(/[^\w-]/g, '').slice(0, 80);
const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);

function authorised(req) {
  const key = process.env.ADMIN_KEY || '';
  const given = String(req.headers['x-admin-key'] || '');
  if (!key || given.length !== key.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(key));
}

function bodyOf(req) {
  const b = req.body;
  if (b && typeof b === 'object') return b;
  if (typeof b === 'string') { try { return JSON.parse(b) || {}; } catch (e) { return {}; } }
  return {};
}

// Enquiry status rules (whitelist, legacy mapping on read, status history) live in _enquiry.js.

function normaliseApplication(doc) {
  if (!APPLICATION_STATUSES.includes(doc.status)) doc.status = 'new';
  const v = doc.verification && typeof doc.verification === 'object' ? doc.verification : {};
  doc.verification = {
    identity: v.identity === true,
    qualifications: v.qualifications === true,
    notes: typeof v.notes === 'string' ? v.notes : '',
    verifiedBy: typeof v.verifiedBy === 'string' ? v.verifiedBy : '',
    verifiedAt: typeof v.verifiedAt === 'string' ? v.verifiedAt : '',
  };
  doc.admin = doc.admin && typeof doc.admin === 'object' ? doc.admin : {};
  if (typeof doc.admin.notes !== 'string') doc.admin.notes = '';
  return doc;
}

function normalise(kind, doc) {
  if (kind === 'enquiries') return normaliseEnquiry(doc);
  if (kind === 'applications') return normaliseApplication(doc);
  if (kind === 'placements') return normalisePlacement(doc);
  return doc;
}

const withComputed = p => ({ ...p, computed: computePlacement(p) });

function countBy(list, statuses) {
  const counts = { all: list.length };
  statuses.forEach(s => { counts[s] = 0; });
  list.forEach(d => { if (counts[d.status] !== undefined) counts[d.status]++; });
  return counts;
}

// Products tab: every catalogue resource with whether its PDF(s) exist in the private blob store.
// `blobs` is [{ pathname, size, uploadedAt }]. A bundle is ready only when all of its packs' files exist.
export function productsView(resources, blobs) {
  const have = new Map((blobs || []).map(b => [b.pathname, b]));
  return (resources || []).map(r => {
    const files = resourceFiles(r).map(f => {
      const b = have.get(f.path);
      return { path: f.path, title: f.title, exists: !!b, size: b ? Number(b.size) || 0 : 0, uploadedAt: b && b.uploadedAt ? new Date(b.uploadedAt).toISOString() : '' };
    });
    return {
      id: r.id, title: r.title, exam: r.exam, price: r.price, regularPrice: r.regularPrice,
      kind: r.bundle ? 'bundle' : 'pack', items: r.bundle ? r.items || [] : undefined,
      files, ready: files.length > 0 && files.every(f => f.exists),
    };
  });
}

async function listProductBlobs() {
  const { list } = await import('@vercel/blob');
  const out = [];
  let cursor;
  do {
    const page = await list({ prefix: 'products/', cursor, limit: 1000 });
    for (const b of page.blobs || []) out.push({ pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt });
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out;
}

async function handleGet(req, res) {
  const kind = String((req.query && req.query.kind) || 'enquiries');
  if (kind === 'products') {
    return res.status(200).json({ products: productsView(RESOURCES, await listProductBlobs()) });
  }
  if (kind === 'overview') {
    // Owner dashboard. Orders are optional so a store problem there does not hide the rest.
    const [enquiries, placements, applications] = await Promise.all(['enquiries', 'placements', 'applications'].map(k => listDocs(k)));
    let orders = [], ordersError = '';
    try { orders = await listDocs('orders'); } catch (e) { ordersError = e && e.message ? e.message : 'Orders could not be read.'; }
    return res.status(200).json({ overview: buildOverview({ enquiries, placements, orders, applications }), ordersError });
  }
  if (kind === 'summary') {
    const out = {};
    for (const k of Object.keys(KINDS)) out[k] = countBy((await listDocs(k)).map(d => normalise(k, d)), KINDS[k]);
    return res.status(200).json({ summary: out });
  }
  if (kind === 'orders') {
    // Read-only: orders are created by checkout and updated only by the verified Stripe webhook.
    const orders = (await listDocs('orders')).filter(o => o && typeof o === 'object');
    orders.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return res.status(200).json({ orders });
  }
  if (!KINDS[kind]) return res.status(400).json({ error: 'Unknown kind.' });
  const list = (await listDocs(kind)).map(d => normalise(kind, d));
  if (kind === 'placements') {
    return res.status(200).json({ placements: list.map(withComputed), summary: summarise(list), counts: countBy(list, PLACEMENT_STATUSES) });
  }
  return res.status(200).json({ [kind]: list, counts: countBy(list, KINDS[kind]) });
}

const patchEnquiry = (doc, b) => applyEnquiryUpdate(doc, b);

// Verification is only ever set by the operator, and only with a name against it.
function patchApplication(doc, b) {
  if (b.status !== undefined) {
    if (!APPLICATION_STATUSES.includes(b.status)) return { error: 'Unknown application status.' };
    doc.status = b.status;
  }
  const notes = text(b.notes, 3000); if (notes !== undefined) doc.admin.notes = notes;
  const v = b.verification;
  if (v && typeof v === 'object') {
    const cur = doc.verification;
    const next = { ...cur };
    for (const k of ['identity', 'qualifications']) if (typeof v[k] === 'boolean') next[k] = v[k];
    const vNotes = text(v.notes, 2000); if (vNotes !== undefined) next.notes = vNotes;
    const by = text(v.verifiedBy, 120); if (by !== undefined) next.verifiedBy = by;
    const anyTrue = next.identity || next.qualifications;
    const newlyTrue = (next.identity && !cur.identity) || (next.qualifications && !cur.qualifications);
    if (anyTrue && !next.verifiedBy) return { error: 'Enter who checked the documents before recording verification.' };
    if (newlyTrue || (anyTrue && next.verifiedBy !== cur.verifiedBy)) next.verifiedAt = new Date().toISOString();
    if (!anyTrue) next.verifiedAt = '';
    doc.verification = next;
  }
  return { doc };
}

async function checkSpecialist(specialistId) {
  const app = await readDoc('applications', safeId(specialistId));
  if (!app || app.status !== 'approved') return 'Only approved Specialists can be placed';
  return null;
}

async function handlePatch(req, res) {
  const b = { ...bodyOf(req) };
  const kind = String(b.kind || 'enquiries');
  if (!KINDS[kind]) return res.status(400).json({ error: 'Unknown kind.' });
  const id = safeId(b.id);
  const current = id ? await readDoc(kind, id) : null;
  if (!current) return res.status(404).json({ error: 'Record not found.' });
  const doc = normalise(kind, current);

  let result;
  if (kind === 'enquiries') result = patchEnquiry(doc, b);
  else if (kind === 'applications') result = patchApplication(doc, b);
  else {
    for (const k of ['enquiryId', 'specialistId']) if (b[k] !== undefined) b[k] = safeId(b[k]);
    // Only a change of Specialist is checked, so an existing placement stays editable if the Specialist later goes inactive.
    if (b.specialistId && b.specialistId !== doc.specialistId) {
      const err = await checkSpecialist(b.specialistId);
      if (err) return res.status(400).json({ error: err });
    }
    result = applyPlacementUpdate(doc, b);
  }
  if (result.error) return res.status(400).json({ error: result.error });
  const out = result.doc;
  out.id = doc.id;
  out.updatedAt = new Date().toISOString();
  await saveDoc(kind, out);
  return res.status(200).json({ [SINGULAR[kind]]: kind === 'placements' ? withComputed(out) : out });
}

function requestHost(req) {
  const h = req.headers || {};
  const raw = String(h['x-forwarded-host'] || h.host || '').split(',')[0].trim();
  return /^[\w.-]+(:\d+)?$/.test(raw) ? raw : '';
}

// Creates a Stripe Checkout link for the placement fee. Stripe code is imported lazily so the rest of admin works without it.
async function createFeeLink(req, res, b) {
  const id = safeId(b.id);
  const current = id ? await readDoc('placements', id) : null;
  if (!current) return res.status(404).json({ error: 'Placement not found.' });
  const p = normalisePlacement(current);
  const check = feeLinkAmount(p);
  if (check.error) return res.status(400).json({ error: check.error });
  let email = '';
  if (p.specialistId) {
    const app = await readDoc('applications', safeId(p.specialistId));
    email = app && app.contact && typeof app.contact.email === 'string' ? app.contact.email.trim() : '';
  }
  const description = 'Thinking Hack™ placement fee: ' + [p.studentLabel || 'Placement', p.subject].filter(Boolean).join(' · ');
  let session;
  try {
    const mod = await import('./checkout.js');
    if (typeof mod.createPlacementFeeSession !== 'function') throw new Error('Stripe checkout is not available yet.');
    session = await mod.createPlacementFeeSession({ placementId: p.id || id, amount: check.amount, description, email, host: requestHost(req) });
  } catch (e) {
    console.error('placement-fee-link', e);
    const code = e && e.status === 400 ? 400 : 503;
    return res.status(code).json({ error: 'Could not create a Stripe payment link: ' + (e && e.message ? e.message : 'Stripe is not configured.') });
  }
  if (!session || typeof session.url !== 'string' || !/^https:\/\//.test(session.url)) {
    return res.status(503).json({ error: 'Could not create a Stripe payment link: Stripe did not return a link.' });
  }
  const now = new Date().toISOString();
  const doc = recordFeeLink(p, { amount: check.amount, link: session.url, orderId: session.orderId || '', sentAt: now });
  doc.id = p.id || id;
  doc.updatedAt = now;
  await saveDoc('placements', doc);
  return res.status(200).json({ link: session.url, orderId: session.orderId || '', placement: withComputed(doc) });
}

async function handlePost(req, res) {
  const b = bodyOf(req);
  if (b.kind === 'placement-fee-link') return createFeeLink(req, res, b);
  if (b.kind !== 'placements') return res.status(400).json({ error: 'Only placements can be created here.' });
  const input = {
    enquiryId: safeId(b.enquiryId),
    specialistId: safeId(b.specialistId),
    studentLabel: b.studentLabel, specialistName: b.specialistName, subject: b.subject,
    exam: b.exam, matchDate: b.matchDate, feePercent: b.feePercent, feeException: b.feeException,
    firstMonth: b.firstMonth && typeof b.firstMonth === 'object' ? b.firstMonth : undefined,
    notes: b.notes, laterMonths: b.laterMonths, status: b.status, lessonFrequency: b.lessonFrequency,
  };
  if (input.specialistId) {
    const err = await checkSpecialist(input.specialistId);
    if (err) return res.status(400).json({ error: err });
  }
  // A fee is never marked paid at creation; only PATCH with confirmFeeReceived, or the verified Stripe webhook, can do that.
  const result = applyPlacementUpdate(emptyPlacement(), input);
  if (result.error) return res.status(400).json({ error: result.error });
  const now = new Date();
  const doc = { id: newId(now), createdAt: now.toISOString(), ...result.doc, updatedAt: now.toISOString() };

  let enquiry = null;
  if (doc.enquiryId) {
    const e = await readDoc('enquiries', doc.enquiryId);
    if (e) {
      enquiry = normaliseEnquiry(e);
      if (enquiry.status === 'new' || enquiry.status === 'contacted') {
        recordStatusChange(enquiry, 'matching-in-progress', { by: 'admin (placement created)', note: 'Placement ' + doc.id + ' created', now });
        enquiry.updatedAt = now.toISOString();
        await saveDoc('enquiries', enquiry);
      }
    }
  }
  await saveDoc('placements', doc);
  return res.status(201).json({ placement: withComputed(doc), enquiry });
}

async function handleDelete(req, res) {
  const b = bodyOf(req);
  const kind = String(b.kind || '');
  if (!KINDS[kind]) return res.status(400).json({ error: 'Unknown kind.' });
  if (b.confirm !== true) return res.status(400).json({ error: 'Deleting needs confirm: true.' });
  const id = safeId(b.id);
  if (!id || !(await deleteDoc(kind, id))) return res.status(404).json({ error: 'Record not found.' });
  return res.status(200).json({ deleted: { kind, id } });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!authorised(req)) return res.status(401).json({ error: 'Wrong admin key.' });
  try {
    if (req.method === 'GET') return await handleGet(req, res);
    if (req.method === 'PATCH') return await handlePatch(req, res);
    if (req.method === 'POST') return await handlePost(req, res);
    if (req.method === 'DELETE') return await handleDelete(req, res);
  } catch (e) {
    console.error('admin', e);
    return res.status(500).json({ error: 'Server error: ' + (e && e.message ? e.message : 'please try again.') });
  }
  res.setHeader('Allow', 'GET, PATCH, POST, DELETE');
  return res.status(405).json({ error: 'Use GET, PATCH, POST or DELETE.' });
}
