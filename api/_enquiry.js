// Enquiry status rules for the admin (pure, shared by api/admin.js, api/_overview.js and the tests).
// Stored records are never rewritten on read: an old status is shown as its nearest new status, and
// the original value is kept in `legacyStatus` on the returned view only.
export const ENQUIRY_STATUSES = [
  'new', 'contacted', 'matching-in-progress', 'specialist-proposed',
  'match-accepted', 'match-declined', 'follow-up-required', 'closed',
];
export const ENQUIRY_STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  'matching-in-progress': 'Matching in progress',
  'specialist-proposed': 'Specialist proposed',
  'match-accepted': 'Match accepted',
  'match-declined': 'Match declined',
  'follow-up-required': 'Follow-up required',
  closed: 'Closed',
};
// Statuses used by earlier versions of the admin, mapped to the nearest current one.
export const LEGACY_ENQUIRY_STATUS = {
  matching: 'matching-in-progress',
  placed: 'match-accepted',
  'matched-self': 'match-accepted',
  referred: 'match-accepted',
};
export const MAX_HISTORY = 200;

const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);

export function mapEnquiryStatus(s) {
  if (ENQUIRY_STATUSES.includes(s)) return s;
  if (typeof s === 'string' && LEGACY_ENQUIRY_STATUS[s]) return LEGACY_ENQUIRY_STATUS[s];
  return 'new';
}

// Returns a normalised copy for display/editing. The input object is not changed.
export function normaliseEnquiry(input) {
  const doc = { ...(input && typeof input === 'object' ? input : {}) };
  const stored = doc.status;
  doc.status = mapEnquiryStatus(stored);
  if (stored !== undefined && stored !== doc.status && doc.legacyStatus === undefined) doc.legacyStatus = String(stored);
  const a = { ...(doc.admin && typeof doc.admin === 'object' ? doc.admin : {}) };
  doc.admin = a;
  if (typeof a.notes !== 'string') a.notes = '';
  if (typeof a.handledBy !== 'string') a.handledBy = '';
  const legacy = [];
  if (a.referredTo) legacy.push('Referred to: ' + a.referredTo);
  if (a.referralFee) legacy.push('Referral fee: ' + a.referralFee);
  if (legacy.length) {
    const line = '[Earlier record] ' + legacy.join('; ');
    if (!a.notes.includes(line)) a.notes = a.notes ? line + '\n' + a.notes : line;
  }
  doc.statusHistory = (Array.isArray(doc.statusHistory) ? doc.statusHistory : [])
    .filter(h => h && typeof h === 'object')
    .map(h => ({ at: String(h.at || ''), from: String(h.from || ''), to: String(h.to || ''), by: String(h.by || ''), note: String(h.note || '') }));
  return doc;
}

// Adds a timestamped history entry and sets the status. `from` is the status shown before the change.
export function recordStatusChange(doc, to, { by = '', note = '', now = new Date() } = {}) {
  const from = doc.status;
  doc.statusHistory = Array.isArray(doc.statusHistory) ? doc.statusHistory : [];
  doc.statusHistory.push({ at: now.toISOString(), from: String(from || ''), to, by: String(by || '').slice(0, 160), note: String(note || '').slice(0, 500) });
  if (doc.statusHistory.length > MAX_HISTORY) doc.statusHistory = doc.statusHistory.slice(-MAX_HISTORY);
  doc.status = to;
  delete doc.legacyStatus;
  return doc;
}

// Applies an operator's edit. Only whitelisted statuses are accepted. Returns { doc } or { error }.
export function applyEnquiryUpdate(current, body, now = new Date()) {
  const b = body && typeof body === 'object' ? body : {};
  const doc = normaliseEnquiry(JSON.parse(JSON.stringify(current || {})));
  const by = text(b.handledBy, 160);
  if (b.status !== undefined) {
    if (typeof b.status !== 'string' || !ENQUIRY_STATUSES.includes(b.status)) return { error: 'Unknown enquiry status.' };
    if (b.status !== doc.status) {
      recordStatusChange(doc, b.status, { by: by !== undefined ? by : doc.admin.handledBy, note: text(b.statusNote, 500) || '', now });
    }
  }
  const notes = text(b.notes, 3000); if (notes !== undefined) doc.admin.notes = notes;
  if (by !== undefined) doc.admin.handledBy = by;
  return { doc };
}

// A waitlist sign-up is stored as an ordinary enquiry whose interest (or type) mentions a waitlist.
export function isWaitlist(e) {
  if (!e || typeof e !== 'object') return false;
  if (e.type === 'waitlist') return true;
  return /waitlist/i.test(String(e.interest || ''));
}
