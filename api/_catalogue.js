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
// Pack-only bundles are off the shop page and cost more than their packs bought one by one at launch prices,
// so they are kept for the record but not sold (notForSale). Remove the flag to sell one again.
const bundle = (id, title, exam, price, regularPrice, members, tagline) => ({
  id, title, exam, price, regularPrice, tagline, bundle: true, notForSale: true,
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

// Full Sets (18 Nov 2026): a whole subject in one purchase. Files are the numbered PDFs of the set, uploaded to the
// private store as products/<set id>-00.pdf (Start Here) and products/<set id>-NN.pdf for each part that is not a pack.
// Each launch price is above the launch prices of the packs inside it added together (a test checks this).
const fullSet = (id, title, exam, price, regularPrice, members, fileTitles, tagline) => ({
  id, title, exam, price, regularPrice, tagline, bundle: true, fullSet: true, items: members, fileTitles,
  // Part 00 is Start Here; parts 1..members.length are the packs themselves, delivered from the packs' own files.
  files: fileTitles.map((_, i) => (i >= 1 && i <= members.length ? pdf(members[i - 1]) : `products/${id}-${String(i).padStart(2, '0')}.pdf`)),
});

const FULL_SETS = [
  fullSet('bundle-set-psle-english', 'PSLE English Full Set', 'PSLE', 69, 89, ['res-psle-comprehension'],
    ['Start Here','PSLE Comprehension Pack','PSLE Composition: The Writing Method','PSLE Comprehension Mastery Workbook','PSLE English Summary Notes'],
    'PSLE English in one set: the Comprehension pack, the composition guide, a comprehension workbook with answer key, summary notes and a week-by-week Start Here plan. 133 pages.'),
  fullSet('bundle-set-psle-maths', 'PSLE Maths Full Set', 'PSLE', 69, 89, ['res-psle-maths'],
    ['Start Here','PSLE Maths Pack','PSLE Maths Heuristics Workbook','PSLE Maths Summary Notes'],
    'PSLE Maths in one set: the Maths pack, a heuristics workbook with answer key, summary notes and a week-by-week Start Here plan. 102 pages.'),
  fullSet('bundle-set-psle-science', 'PSLE Science Full Set', 'PSLE', 89, 109, ['res-psle-science'],
    ['Start Here','PSLE Science Pack','PSLE Science Complete Notes','PSLE Science Open-Ended Answers Workbook'],
    'PSLE Science in one set: the Science pack, complete notes for all five themes, an open-ended answers workbook with answer key and a week-by-week Start Here plan. 270 pages.'),
  fullSet('bundle-set-o-english', 'O-Level English Full Set', 'O-Level', 129, 159, ['res-o-comprehension','res-o-writing','res-o-oral'],
    ['Start Here','O-Level Comprehension Pack','O-Level Writing Pack','O-Level Oral Pack','O-Level Argumentative Essays: The Writing Method','Argumentative Essay Workbook','Comprehension Mastery Workbook','O-Level English Summary Notes'],
    'O-Level English in one set: the Comprehension, Writing and Oral packs, the argumentative essay guide, two workbooks with answer keys, summary notes and a week-by-week Start Here plan. 294 pages.'),
  fullSet('bundle-set-o-humanities', 'O-Level Humanities Full Set', 'O-Level', 79, 99, ['res-o-ss'],
    ['Start Here','O-Level Social Studies Pack','Source-Based Questions Workbook','Humanities Essay and Case Study Workbook','Social Studies Summary Notes','History Summary Notes','Geography Summary Notes'],
    'O-Level Humanities in one set: the Social Studies pack, source-skills and essay workbooks with answer keys, summary notes for Social Studies, History and Geography, and a week-by-week Start Here plan. 149 pages.'),
  fullSet('bundle-set-sec-literature', 'Secondary Literature Full Set', 'Secondary', 79, 99, ['res-sec-literature'],
    ['Start Here','Secondary Literature Pack','Unseen Poetry and Prose Workbook','Macbeth Study Guide','The Merchant of Venice Study Guide','Literature Summary Notes'],
    'For school Literature exams on Macbeth or The Merchant of Venice, and for unseen poetry and prose: the Literature pack, an unseen workbook with answer key, two play guides, summary notes and a Start Here plan. 165 pages.'),
  fullSet('bundle-set-gp', 'A-Level GP Full Set', 'A-Level', 119, 149, ['res-gp-comprehension','res-gp-essay'],
    ['Start Here','GP Comprehension Pack','GP Essay Pack','GP Essays: The Writing Method','GP Reading','Application Question Workbook','Macro-Argumentation Workbook','GP Summary Notes'],
    'GP 8881 in one set: the Comprehension and Essay packs, the essay and reading guides, two workbooks with answer keys, summary notes and a week-by-week Start Here plan. 221 pages.'),
];

export const RESOURCES = [...PACKS, ...BUNDLES, ...FULL_SETS];

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
const sellableResource = r => r && !r.notForSale && /^(res|bundle)-[\w-]+$/.test(r.id) && Number(r.price) > 0 && resourceFiles(r).length > 0;

// Returns { kind, ...item } for a sellable item id, or null.
export function findItem(id, cat = defaultCatalogue) {
  const key = String(id || '');
  const mc = (cat.masterclasses || []).find(m => m.id === key);
  if (mc) return { kind: 'masterclass', ...mc };
  const rs = (cat.resources || []).find(r => r.id === key);
  if (sellableResource(rs)) return { kind: 'resource', ...rs };
  return null;
}
