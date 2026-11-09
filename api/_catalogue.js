// Server-side catalogue: the ONLY source of prices for Stripe Checkout. The client sends an item id, never an amount.
// Masterclass titles, levels, sessions and prices mirror MASTERCLASSES in index.html (a test checks they match).

export const MASTERCLASSES = [
  { id: 'mc-01', title: 'BUG Comprehension™', level: 'P5 – Sec 2 English', sessions: 4, price: 250 },
  { id: 'mc-02', title: 'Argument Essays™', level: 'Sec 3–4 English', sessions: 8, price: 480 },
  { id: 'mc-03', title: 'Unseen Lit™', level: 'Sec 3–4 Literature', sessions: 4, price: 250 },
  { id: 'mc-04', title: 'Science CER™', level: 'P5–6 Science', sessions: 4, price: 250 },
  { id: 'mc-05', title: 'Maths Heuristics™', level: 'P5–6 Maths', sessions: 8, price: 480 },
  { id: 'mc-06', title: 'Source Skills™', level: 'Sec 3–4 History & SS', sessions: 4, price: 250 },
  { id: 'mc-07', title: 'Humanities Essays™', level: 'Sec 3–4 Humanities', sessions: 8, price: 480 },
  { id: 'mc-08', title: 'GP AQ™', level: 'JC1–2 GP', sessions: 4, price: 300 },
  { id: 'mc-09', title: 'GP Essays™', level: 'JC1–2 GP', sessions: 8, price: 560 },
  { id: 'mc-10', title: 'Bridge Bootcamp™', level: 'AEIS, S-AEIS, SPERS, IB, IGCSE', sessions: 4, price: 300 },
];

// Digital resources: Thinking Hack Exam Notes™ (source: notes-packages/README.md, 2026-10-17).
// `price` is the LAUNCH price and is what Checkout charges; `regularPrice` is for reference only.
// The Literature pack is sold as 'Secondary Literature' for school exams only: Macbeth and The Merchant of Venice
// are NOT current O-Level / SEC set texts, so it must never be marketed as O-Level, and it is in no bundle.
// Delivery: the final customer PDF for each pack is uploaded to the PRIVATE blob store at products/<pack id>.pdf.
// A bundle lists its packs' PDFs in `files`. The .md drafts are never served.
// To add a pack: { id: 'res-…', kind is implied, title, exam, tagline, price, regularPrice, file: 'products/res-….pdf' },
// upload the PDF to that path, redeploy. An entry without a positive price and a products/*.pdf file is not sellable.
const pdf = id => `products/${id}.pdf`;
const pack = (id, title, exam, price, regularPrice, tagline) => ({ id, title, exam, price, regularPrice, tagline, file: pdf(id) });

const PACKS = [
  pack('res-psle-comprehension', 'PSLE Comprehension', 'PSLE', 29, 39, 'PSLE English Paper 2 open-ended comprehension: 5 original passages, 50 questions with full answer keys and mark rationale, and a timed mock.'),
  pack('res-psle-science', 'PSLE Science', 'PSLE', 39, 49, 'PSLE Science Booklets A & B: 43 open-ended and 30 MCQ questions with full answer keys and mark rationale, and a timed mock.'),
  pack('res-psle-maths', 'PSLE Maths', 'PSLE', 35, 45, 'PSLE Maths Paper 2 word problems: 12 heuristics, 60 fully solved questions with mark rationale, and a timed mock.'),
  pack('res-o-comprehension', 'O-Level Comprehension', 'O-Level', 29, 35, 'O-Level English Paper 2 in the current SEAB format: 4 full original papers, 89 questions with full answer keys and mark rationale.'),
  pack('res-o-writing', 'O-Level Writing', 'O-Level', 29, 39, 'O-Level English Paper 1: 7 formats and 98 original prompts, with annotated model answers, an error checklist and a timed mock.'),
  pack('res-o-oral', 'O-Level Oral', 'O-Level', 29, 35, 'O-Level English Paper 4 in the current Planned Response + Spoken Interaction format: 9 sets, 32 model answers and a timed mock.'),
  pack('res-o-ss', 'O-Level Social Studies', 'O-Level', 29, 39, 'Combined Humanities Social Studies: 3 original SBCS sets, 4 SRQ, 19 model answers with mark rationale, and a timed mock.'),
  pack('res-gp-comprehension', 'GP Comprehension', 'A-Level', 35, 45, 'GP 8881 Paper 2 in the current three-passage, 12-mark AQ format: 3 full original papers, 30 questions and 2 model AQs.'),
  pack('res-sec-literature', 'Secondary Literature', 'Secondary', 39, 49, 'Macbeth and The Merchant of Venice for school Literature exams: original notes, annotated model answers and a timed mock.'),
  pack('res-gp-essay', 'GP Essay', 'A-Level', 45, 55, 'GP 8881 Paper 1: 57 questions and 61 verified 2023–26 examples, with annotated model essays, an error checklist and a timed mock.'),
];
const byId = id => PACKS.find(p => p.id === id);
const bundle = (id, title, exam, price, regularPrice, members, tagline) => ({
  id, title, exam, price, regularPrice, tagline, bundle: true,
  items: members, files: members.map(pdf), fileTitles: members.map(m => byId(m).title),
});

const BUNDLES = [
  bundle('bundle-psle', 'PSLE bundle (all 3 packs)', 'PSLE', 109, 133, ['res-psle-comprehension', 'res-psle-science', 'res-psle-maths'],
    'PSLE Comprehension, Science and Maths: original material, full answer keys with mark rationale and a timed mock in every pack.'),
  bundle('bundle-o', 'O-Level bundle (4 packs)', 'O-Level', 119, 148, ['res-o-comprehension', 'res-o-writing', 'res-o-oral', 'res-o-ss'],
    'O-Level Comprehension, Writing, Oral and Social Studies in current SEAB formats, with full answer keys and timed mocks.'),
  bundle('bundle-o-english', 'O-Level English trio', 'O-Level', 89, 109, ['res-o-comprehension', 'res-o-writing', 'res-o-oral'],
    'O-Level English Papers 1, 2 and 4: Comprehension, Writing and Oral, with full answer keys and timed mocks.'),
  bundle('bundle-gp', 'GP bundle (both packs)', 'A-Level', 85, 100, ['res-gp-comprehension', 'res-gp-essay'],
    'GP 8881 Papers 1 and 2: Comprehension and Essay, with model answers, mark rationale and timed practice.'),
];

export const RESOURCES = [...PACKS, ...BUNDLES];

// Student levels for the Checkout dropdown. Stripe dropdown values must be alphanumeric.
export const STUDENT_LEVELS = [
  { value: 'p1p4', label: 'Primary (P1–P4)' },
  { value: 'p5', label: 'P5' },
  { value: 'p6', label: 'P6' },
  { value: 'sec1', label: 'Sec 1' },
  { value: 'sec2', label: 'Sec 2' },
  { value: 'sec3', label: 'Sec 3' },
  { value: 'sec4', label: 'Sec 4' },
  { value: 'sec5', label: 'Sec 5' },
  { value: 'jc1', label: 'JC1' },
  { value: 'jc2', label: 'JC2' },
  { value: 'ibigcse', label: 'IB / IGCSE' },
  { value: 'aeis', label: 'AEIS / S-AEIS' },
  { value: 'other', label: 'Other' },
];

export const defaultCatalogue = { masterclasses: MASTERCLASSES, resources: RESOURCES };

const PDF_PATH = /^products\/[\w-]+\.pdf$/;
// Files a resource delivers, in order: [{ title, path }]. Only products/*.pdf paths count.
export function resourceFiles(r) {
  if (!r) return [];
  const list = Array.isArray(r.files) ? r.files.map((path, i) => ({ path, title: (r.fileTitles && r.fileTitles[i]) || r.title }))
    : r.file ? [{ path: r.file, title: r.title }] : [];
  return list.every(f => typeof f.path === 'string' && PDF_PATH.test(f.path)) ? list : [];
}
const sellableResource = r => r && /^(res|bundle)-[\w-]+$/.test(r.id) && Number(r.price) > 0 && resourceFiles(r).length > 0;

// Returns { kind, ...item } for a sellable item id, or null.
export function findItem(id, cat = defaultCatalogue) {
  const key = String(id || '');
  const mc = (cat.masterclasses || []).find(m => m.id === key);
  if (mc) return { kind: 'masterclass', ...mc };
  const rs = (cat.resources || []).find(r => r.id === key);
  if (sellableResource(rs)) return { kind: 'resource', ...rs };
  return null;
}
