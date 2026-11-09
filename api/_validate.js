import { randomBytes, createHash } from 'node:crypto';

// Pure validation and record building, shared by the public endpoints and the tests.
export const str = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export const arr = (v, max = 12, len = 80) => (Array.isArray(v) ? v.slice(0, max).map(x => str(x, len)).filter(Boolean) : []);
export const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
export const validPhone = p => p.replace(/\D/g, '').length >= 8;

export function newId(now = new Date()) {
  return now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14) + '-' + randomBytes(4).toString('hex');
}

// A client submission id wins; otherwise the same contact and content inside a 10-minute window counts as a repeat.
export function dedupeKey(kind, b, contact, now = new Date()) {
  const sub = str(b.submissionId, 80);
  const basis = sub
    ? `${kind}|sub|${sub}`
    : `${kind}|${contact.name.toLowerCase()}|${contact.email.toLowerCase()}|${contact.whatsapp.replace(/\D/g, '')}|${str(b.type, 20)}|${str(b.message, 2000)}|${Math.floor(now.getTime() / 600000)}`;
  return createHash('sha256').update(basis).digest('hex').slice(0, 40);
}

function contactOf(b) {
  return {
    name: str(b.name, 120),
    email: str(b.email, 160),
    whatsapp: str(b.whatsapp, 40),
    role: str(b.role, 40),
  };
}

function checkContact(contact, b) {
  if (!contact.name) return 'Please add your name.';
  if (!validEmail(contact.email) && !validPhone(contact.whatsapp)) return 'Please add a valid email or WhatsApp number so we can reply.';
  if (b.consent !== true) return 'Please agree to be contacted about your enquiry.';
  return null;
}

export const ENQUIRY_TYPES = ['match', 'consultation', 'programme', 'resource'];

export function buildEnquiry(b, now = new Date()) {
  const contact = contactOf(b);
  const error = checkContact(contact, b);
  if (error) return { error };
  return {
    doc: {
      id: newId(now),
      createdAt: now.toISOString(),
      type: ENQUIRY_TYPES.includes(b.type) ? b.type : 'consultation',
      status: 'new',
      contact,
      student: {
        level: str(b.level, 60),
        school: str(b.school, 120),
        subjects: arr(b.subjects),
        currentGrade: str(b.currentGrade, 40),
        targetGrade: str(b.targetGrade, 40),
        examYear: str(b.examYear, 10),
      },
      goals: arr(b.goals),
      difficulties: str(b.difficulties, 1500),
      schedule: {
        format: str(b.format, 40),
        area: str(b.area, 60),
        days: arr(b.days, 7),
        times: arr(b.times, 4),
        start: str(b.start, 40),
        budget: str(b.budget, 40),
      },
      interest: str(b.interest, 160),
      message: str(b.message, 2000),
      recommendation: str(b.recommendation, 600),
      admin: { notes: '', handledBy: '' },
    },
  };
}

export const TERMS_VERSION = '2026-10-17 draft';
export const FORMATS = ['Online', 'At the student\'s home', 'At my own venue', 'Small groups'];

export function buildApplication(b, now = new Date()) {
  const contact = contactOf(b);
  if (!contact.name) return { error: 'Please add your full name.' };
  if (!validEmail(contact.email)) return { error: 'Please add a valid email address.' };
  if (!validPhone(contact.whatsapp)) return { error: 'Please add a WhatsApp or mobile number.' };
  const subjects = arr(b.subjects, 20);
  const levels = arr(b.levels, 12);
  if (!subjects.length) return { error: 'Please choose at least one subject.' };
  if (!levels.length) return { error: 'Please choose at least one exam level.' };
  const qualifications = str(b.qualifications, 2000);
  const experience = str(b.experience, 3000);
  if (qualifications.length < 10) return { error: 'Please describe your qualifications.' };
  if (experience.length < 30) return { error: 'Please tell us about your teaching experience in a few sentences.' };
  const formats = arr(b.formats, 6).filter(f => FORMATS.includes(f));
  if (!formats.length) return { error: 'Please choose at least one teaching format.' };
  const rates = str(b.rates, 300);
  if (!rates) return { error: 'Please tell us your usual hourly rate.' };
  if (b.agreeTerms !== true) return { error: 'Please confirm you have read and agree to the Specialist terms.' };
  if (b.consent !== true) return { error: 'Please agree to the privacy notice so we can review your application.' };
  return {
    doc: {
      id: newId(now),
      createdAt: now.toISOString(),
      status: 'new',
      contact: { name: contact.name, email: contact.email, whatsapp: contact.whatsapp },
      subjects,
      levels,
      qualifications,
      experience,
      formats,
      areas: arr(b.areas, 8),
      availability: str(b.availability, 600),
      rates,
      credentials: str(b.credentials, 1000),
      about: str(b.about, 2000),
      termsVersion: TERMS_VERSION,
      agreedTermsAt: now.toISOString(),
      // Set by the operator only, after documents have actually been checked.
      verification: { identity: false, qualifications: false, notes: '', verifiedBy: '', verifiedAt: '' },
      admin: { notes: '' },
    },
  };
}
