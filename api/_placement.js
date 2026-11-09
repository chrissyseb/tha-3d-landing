// Placement fee model (decided 2026-10-17): the family pays the Specialist directly for lessons.
// Thinking Hack invoices the Specialist a placement fee = feePercent (default 50) x the agreed first-month lesson value.
// Amounts are stored in S$ with 2 decimals and computed in cents. No payouts, escrow or splitting.
export const PLACEMENT_STATUSES = ['proposed', 'agreed', 'first-month-active', 'first-month-complete', 'cancelled'];
export const INVOICE_STATUSES = ['not-sent', 'sent', 'paid', 'void'];
export const DEFAULT_FEE_PERCENT = 50;
// Dispute about the placement fee (informational). 'lost' means the collected fee (or dispute.amount of it) was taken back.
export const DISPUTE_STATUSES = ['none', 'open', 'resolved', 'lost'];
// Nothing in this module moves money. Invoices, collections, refunds and Specialist payouts are records of what the operator saw happen.

const cents = v => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
};
const dollars = c => Math.round(c) / 100;
const money = v => dollars(cents(v));
const isDay = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));
const text = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);
const obj = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const str = v => (typeof v === 'string' ? v : '');

export function emptyInvoice() {
  return { status: 'not-sent', amount: 0, link: '', orderId: '', sentAt: '', paidAmount: 0, paidAt: '', source: '', reference: '' };
}

export function emptyPlacement() {
  return {
    status: 'proposed',
    enquiryId: '', specialistId: '',
    studentLabel: '', specialistName: '', subject: '', exam: '', matchDate: '',
    firstMonth: { lessons: 0, ratePerLesson: 0, value: 0 },
    feePercent: DEFAULT_FEE_PERCENT,
    feeException: '',
    feeInvoice: emptyInvoice(),
    refund: { amount: 0, date: '', reason: '' },
    laterMonths: '',
    notes: '',
    lessonFrequency: '',
    // Informational only: never triggers or implies a transfer. Recorded by hand with its own confirmation.
    specialistPayout: emptyPayout(),
    dispute: { status: 'none', amount: 0, note: '', updatedAt: '' },
    cancellation: { date: '', reason: '' },
    statusHistory: [],
  };
}

export function emptyPayout() {
  return { recorded: false, amount: 0, date: '', reference: '', note: '', recordedAt: '' };
}

// Brings any stored placement (including ones written under the old "parent pays Thinking Hack" model) to the current shape.
// Old payment / payout / refund figures are never reinterpreted as fee payments; they are kept as a note.
export function normalisePlacement(doc) {
  const d = doc && typeof doc === 'object' ? doc : {};
  const e = emptyPlacement();
  const legacy = [];
  const fm0 = obj(d.firstMonth);
  const pay = d.payment && typeof d.payment === 'object' ? d.payment : null;
  const out = d.payout && typeof d.payout === 'object' ? d.payout : null;
  const isOld = !!(pay || out || fm0.feeAgreed !== undefined) && d.feeInvoice === undefined;
  if (fm0.feeAgreed !== undefined && Number(fm0.feeAgreed) > 0) legacy.push('first-month fee agreed S$' + money(fm0.feeAgreed).toFixed(2));
  if (pay && (Number(pay.amount) > 0 || pay.confirmed)) {
    legacy.push('parent payment S$' + money(pay.amount).toFixed(2) + (pay.confirmed ? ' confirmed' : ' not confirmed')
      + (pay.date ? ' on ' + pay.date : '') + (pay.method ? ' via ' + pay.method : '') + (pay.reference ? ' ref ' + pay.reference : ''));
  }
  const r0 = obj(d.refund);
  if (isOld && Number(r0.amount) > 0) legacy.push('parent refund S$' + money(r0.amount).toFixed(2) + (r0.date ? ' on ' + r0.date : '') + (r0.reason ? ' (' + r0.reason + ')' : ''));
  if (out && (Number(out.amount) > 0 || out.confirmed)) {
    legacy.push('Specialist payout S$' + money(out.amount).toFixed(2) + (out.confirmed ? ' confirmed' : ' not confirmed')
      + (out.date ? ' on ' + out.date : '') + (out.reference ? ' ref ' + out.reference : ''));
  }

  const p = { ...d };
  delete p.payment; delete p.payout; delete p.computed;
  p.status = PLACEMENT_STATUSES.includes(d.status) ? d.status : 'proposed';
  for (const k of ['enquiryId', 'specialistId', 'studentLabel', 'specialistName', 'subject', 'exam', 'matchDate', 'laterMonths', 'notes', 'feeException', 'lessonFrequency']) p[k] = str(d[k]);
  const lessons = Math.max(0, Math.round(Number(fm0.lessons) || 0));
  const rate = money(fm0.ratePerLesson);
  const value = fm0.value !== undefined ? money(fm0.value) : fm0.feeAgreed !== undefined ? money(fm0.feeAgreed) : money(lessons * rate);
  p.firstMonth = { lessons, ratePerLesson: rate, value };
  const fp = Number(d.feePercent);
  p.feePercent = d.feePercent !== undefined && d.feePercent !== null && d.feePercent !== '' && Number.isFinite(fp) && fp >= 0 && fp <= 100
    ? Math.round(fp * 100) / 100 : DEFAULT_FEE_PERCENT;
  const inv = obj(d.feeInvoice);
  p.feeInvoice = {
    ...e.feeInvoice,
    status: INVOICE_STATUSES.includes(inv.status) ? inv.status : 'not-sent',
    amount: money(inv.amount), link: str(inv.link), orderId: str(inv.orderId), sentAt: str(inv.sentAt),
    paidAmount: money(inv.paidAmount), paidAt: str(inv.paidAt),
    source: inv.source === 'stripe' || inv.source === 'manual' ? inv.source : '',
    reference: str(inv.reference),
  };
  p.refund = isOld ? { ...e.refund } : { amount: money(r0.amount), date: str(r0.date), reason: str(r0.reason) };
  const sp = obj(d.specialistPayout);
  p.specialistPayout = sp.recorded === true
    ? { recorded: true, amount: money(sp.amount), date: str(sp.date), reference: str(sp.reference), note: str(sp.note), recordedAt: str(sp.recordedAt) }
    : { ...emptyPayout(), reference: str(sp.reference), note: str(sp.note) };
  const dp = obj(d.dispute);
  p.dispute = { status: DISPUTE_STATUSES.includes(dp.status) ? dp.status : 'none', amount: money(dp.amount), note: str(dp.note), updatedAt: str(dp.updatedAt) };
  const cn = obj(d.cancellation);
  p.cancellation = { date: str(cn.date), reason: str(cn.reason) };
  p.statusHistory = Array.isArray(d.statusHistory) ? d.statusHistory.filter(h => h && typeof h === 'object') : [];

  if (legacy.length) {
    const line = '[Earlier model, before 2026-10-17] ' + legacy.join('; ');
    if (!p.notes.includes(line)) p.notes = p.notes ? line + '\n' + p.notes : line;
  }
  return p;
}

// Only a fee invoice with status 'paid' counts as money received. A refund (credit to the Specialist) is reported separately.
export function computePlacement(doc) {
  const p = normalisePlacement(doc);
  const value = cents(p.firstMonth.value);
  const pct = p.feePercent;
  const due = Math.round(value * pct / 100);
  const inv = p.feeInvoice;
  const paid = inv.status === 'paid' ? cents(inv.paidAmount) : 0;
  const refunded = Math.min(cents(p.refund.amount), paid);
  const cancelled = p.status === 'cancelled';
  // Disputed amount: dispute.amount if given, otherwise everything collected net of refunds.
  const net0 = paid - refunded;
  const dAmt = Math.min(cents(p.dispute.amount) || net0, net0);
  const atRisk = p.dispute.status === 'open' ? dAmt : 0;
  const reversed = p.dispute.status === 'lost' ? dAmt : 0;
  // A lost dispute means that money was not kept, so it counts as unpaid again; a refund is a deliberate credit and does not.
  const outstanding = cancelled ? 0 : Math.max(due - (paid - reversed), 0);
  const invoiced = inv.status === 'sent' ? cents(inv.amount) : inv.status === 'paid' ? Math.max(cents(inv.amount), paid) : 0;
  const payout = p.specialistPayout.recorded ? cents(p.specialistPayout.amount) : 0;

  let invoiceStatus = inv.status;
  if (inv.status === 'paid') {
    if (refunded && refunded === paid) invoiceStatus = 'refunded';
    else if (refunded) invoiceStatus = 'part-refunded';
    else if (paid < due) invoiceStatus = 'part-paid';
  } else if (cancelled && inv.status === 'not-sent') invoiceStatus = 'none-due';

  return {
    firstMonthValue: dollars(value),
    feePercent: pct,
    feeDue: dollars(due),
    feePaid: dollars(paid),
    feeRefunded: dollars(refunded),
    feeOutstanding: dollars(outstanding),
    invoiceStatus,
    commissionAmount: dollars(due),
    invoiced: dollars(invoiced),
    collected: dollars(paid),
    netCollected: dollars(net0 - reversed),
    feeAtRisk: dollars(atRisk),
    feeReversed: dollars(reversed),
    disputeStatus: p.dispute.status,
    payoutRecorded: dollars(payout),
  };
}

// Amount a new Stripe payment link should be for: fee due less anything already paid. Returns { amount } or { error }.
export function feeLinkAmount(doc) {
  const p = normalisePlacement(doc);
  if (p.status === 'cancelled') return { error: 'This placement is cancelled, so no placement fee is due.' };
  if (p.feeInvoice.status === 'paid') return { error: 'The placement fee is already recorded as paid.' };
  if (p.feePercent !== DEFAULT_FEE_PERCENT && !p.feeException) return { error: 'Add the agreed exception note for a fee other than 50%.' };
  const m = computePlacement(p);
  const c = cents(m.feeDue) - cents(m.feePaid);
  if (!(c > 0)) return { error: 'Enter the first-month lessons and rate (and fee %) so there is a fee to invoice.' };
  return { amount: dollars(c) };
}

// Records a freshly created payment link. Only the server calls this, never a PATCH body.
export function recordFeeLink(doc, { amount, link, orderId, sentAt } = {}) {
  const p = normalisePlacement(doc);
  p.feeInvoice = { ...p.feeInvoice, status: 'sent', amount: money(amount), link: str(link), orderId: str(orderId), sentAt: str(sentAt) || new Date().toISOString() };
  return p;
}

// Optional helper for the verified Stripe webhook: marks the fee paid with source 'stripe'.
export function recordStripeFeePaid(doc, { paidAmount, paidAt, reference, orderId } = {}) {
  const p = normalisePlacement(doc);
  p.feeInvoice = { ...p.feeInvoice, status: 'paid', paidAmount: money(paidAmount), paidAt: str(paidAt) || new Date().toISOString(), source: 'stripe',
    reference: str(reference) || p.feeInvoice.reference, orderId: str(orderId) || p.feeInvoice.orderId };
  return p;
}

// Applies an operator's edit. Returns { doc } or { error }.
// Marking a fee paid by hand needs confirmFeeReceived === true, an amount and a date. Paid amounts are locked until un-confirmed.
export function applyPlacementUpdate(current, body, now = new Date()) {
  const b = obj(body);
  const p = normalisePlacement(JSON.parse(JSON.stringify(current || {})));
  if (b.status !== undefined) {
    if (!PLACEMENT_STATUSES.includes(b.status)) return { error: 'Unknown placement status.' };
    if (b.status !== p.status) {
      p.statusHistory.push({ at: now.toISOString(), from: p.status, to: b.status });
      if (p.statusHistory.length > 200) p.statusHistory = p.statusHistory.slice(-200);
      if (b.status === 'cancelled' && !p.cancellation.date && !(b.cancellation && b.cancellation.date)) p.cancellation.date = now.toISOString().slice(0, 10);
    }
    p.status = b.status;
  }
  { const v = text(b.lessonFrequency, 160); if (v !== undefined) p.lessonFrequency = v; }
  if (b.cancellation && typeof b.cancellation === 'object') {
    const c = b.cancellation;
    if (c.date !== undefined) {
      const v = text(c.date, 10) || '';
      if (v && !isDay(v)) return { error: 'Enter the cancellation date as a date.' };
      p.cancellation.date = v;
    }
    { const v = text(c.reason, 500); if (v !== undefined) p.cancellation.reason = v; }
  }
  for (const k of ['studentLabel', 'specialistName', 'subject', 'enquiryId', 'specialistId']) {
    const v = text(b[k], 160); if (v !== undefined) p[k] = v;
  }
  { const v = text(b.exam, 80); if (v !== undefined) p.exam = v; }
  if (b.matchDate !== undefined) {
    const v = text(b.matchDate, 10) || '';
    if (v && !isDay(v)) return { error: 'Enter the match date as a date.' };
    p.matchDate = v;
  }
  for (const k of ['notes', 'laterMonths']) {
    const v = text(b[k], 3000); if (v !== undefined) p[k] = v;
  }
  { const v = text(b.feeException, 500); if (v !== undefined) p.feeException = v; }

  if (b.firstMonth && typeof b.firstMonth === 'object') {
    const f = b.firstMonth;
    if (f.lessons !== undefined) p.firstMonth.lessons = Math.max(0, Math.min(60, Math.round(Number(f.lessons) || 0)));
    if (f.ratePerLesson !== undefined) p.firstMonth.ratePerLesson = money(f.ratePerLesson);
    if (f.value !== undefined && f.value !== '' && f.value !== null) p.firstMonth.value = money(f.value);
    else if (f.lessons !== undefined || f.ratePerLesson !== undefined) p.firstMonth.value = money(p.firstMonth.lessons * p.firstMonth.ratePerLesson);
  }
  if (b.feePercent !== undefined && b.feePercent !== '' && b.feePercent !== null) {
    const n = Number(b.feePercent);
    if (!Number.isFinite(n) || n < 0 || n > 100) return { error: 'The fee % must be between 0 and 100.' };
    p.feePercent = Math.round(n * 100) / 100;
  }
  if (p.feePercent !== DEFAULT_FEE_PERCENT && !p.feeException) return { error: 'A fee other than 50% needs the agreed exception note.' };

  const inv = p.feeInvoice;
  const wasPaid = inv.status === 'paid';
  const fi = b.feeInvoice && typeof b.feeInvoice === 'object' ? b.feeInvoice : null;
  if (fi) {
    { const v = text(fi.reference, 120); if (v !== undefined) inv.reference = v; }
    if (!wasPaid && fi.amount !== undefined && fi.amount !== '' && fi.amount !== null) inv.amount = money(fi.amount);
    if (wasPaid) {
      if (fi.paidAmount !== undefined && cents(fi.paidAmount) !== cents(inv.paidAmount)) return { error: 'The paid amount is locked. Undo the payment record first to change it.' };
      if (fi.paidAt !== undefined && String(fi.paidAt).slice(0, 10) !== inv.paidAt.slice(0, 10)) return { error: 'The paid date is locked. Undo the payment record first to change it.' };
    } else {
      if (fi.paidAmount !== undefined) inv.paidAmount = money(fi.paidAmount);
      if (fi.paidAt !== undefined) inv.paidAt = text(fi.paidAt, 10) || '';
    }
    const s = fi.status;
    if (s !== undefined && s !== inv.status) {
      if (!INVOICE_STATUSES.includes(s)) return { error: 'Unknown fee invoice status.' };
      if (s === 'paid') {
        if (b.confirmFeeReceived !== true) return { error: 'Tick the confirmation that the placement fee has arrived in the account.' };
        if (!(cents(inv.paidAmount) > 0)) return { error: 'Enter the amount received before recording the fee as paid.' };
        if (!isDay(inv.paidAt)) return { error: 'Enter the date the fee arrived before recording it as paid.' };
        inv.status = 'paid'; inv.source = 'manual';
      } else if (wasPaid) {
        if (s === 'void') return { error: 'A paid fee cannot be voided. Record a refund instead.' };
        if (inv.source === 'stripe') return { error: 'This fee was paid through Stripe. Record a refund instead of undoing it.' };
        if (cents(p.refund.amount) > 0) return { error: 'Remove the refund before undoing the payment record.' };
        inv.status = s; inv.paidAmount = 0; inv.paidAt = ''; inv.source = '';
      } else {
        inv.status = s;
      }
    }
    if (inv.status === 'sent' && !(cents(inv.amount) > 0)) {
      const m = computePlacement(p);
      inv.amount = dollars(Math.max(cents(m.feeDue) - cents(m.feePaid), 0));
    }
    if ((fi.amount !== undefined || fi.status !== undefined) && inv.status !== 'paid' && cents(inv.amount) > cents(computePlacement(p).feeDue)) return { error: 'The amount invoiced cannot be more than the commission due.' };
  }

  if (b.refund && typeof b.refund === 'object') {
    const r = b.refund;
    if (r.amount !== undefined) p.refund.amount = money(r.amount);
    if (r.date !== undefined) p.refund.date = text(r.date, 10) || '';
    if (r.reason !== undefined) p.refund.reason = text(r.reason, 500) || '';
  }
  if (cents(p.refund.amount) > 0) {
    if (inv.status !== 'paid') return { error: 'A refund can only be recorded against a paid placement fee.' };
    if (cents(p.refund.amount) > cents(inv.paidAmount)) return { error: 'The refund cannot be more than the fee paid.' };
    if (!isDay(p.refund.date)) return { error: 'Enter the date the refund or credit was made.' };
  }

  // Specialist payout: a record only. It needs its own explicit confirmation and is locked once recorded.
  const sp = b.specialistPayout && typeof b.specialistPayout === 'object' ? b.specialistPayout : null;
  if (sp) {
    const cur = p.specialistPayout;
    { const v = text(sp.reference, 120); if (v !== undefined) cur.reference = v; }
    { const v = text(sp.note, 500); if (v !== undefined) cur.note = v; }
    if (sp.undo === true) {
      p.specialistPayout = { ...emptyPayout(), reference: cur.reference, note: cur.note };
    } else if (cur.recorded) {
      if (sp.amount !== undefined && cents(sp.amount) !== cents(cur.amount)) return { error: 'The recorded payout amount is locked. Undo the payout record first to change it.' };
      if (sp.date !== undefined && String(sp.date).slice(0, 10) !== cur.date) return { error: 'The recorded payout date is locked. Undo the payout record first to change it.' };
    } else if (sp.record === true || sp.amount !== undefined || sp.date !== undefined) {
      const amount = money(sp.amount), date = text(sp.date, 10) || '';
      if (sp.record === true || cents(amount) > 0 || date) {
        if (b.confirmSpecialistPayout !== true) return { error: 'Tick the confirmation that this Specialist payout was made outside this system.' };
        if (!(cents(amount) > 0)) return { error: 'Enter the payout amount before recording it.' };
        if (!isDay(date)) return { error: 'Enter the payout date before recording it.' };
        p.specialistPayout = { ...cur, recorded: true, amount, date, recordedAt: now.toISOString() };
      }
    }
  }

  // Dispute about the fee: status plus a note explaining it.
  const dp = b.dispute && typeof b.dispute === 'object' ? b.dispute : null;
  if (dp) {
    const d = p.dispute;
    const before = JSON.stringify(d);
    if (dp.status !== undefined) {
      if (!DISPUTE_STATUSES.includes(dp.status)) return { error: 'Unknown dispute status.' };
      d.status = dp.status;
    }
    { const v = text(dp.note, 1000); if (v !== undefined) d.note = v; }
    if (dp.amount !== undefined) d.amount = money(dp.amount);
    if (d.status !== 'none' && !d.note) return { error: 'Add a note explaining the dispute.' };
    if (cents(d.amount) > 0) {
      const m = computePlacement({ ...p, dispute: { status: 'none' } });
      if (cents(d.amount) > cents(m.collected) - cents(m.feeRefunded)) return { error: 'The disputed amount cannot be more than the fee collected (less refunds).' };
    }
    if (JSON.stringify(d) !== before) d.updatedAt = now.toISOString();
  }
  return { doc: p };
}

// Totals for the admin strip. Cancelled placements add nothing to value or fee due, but money actually paid still counts.
export function summarise(placements) {
  const t = { count: 0, active: 0, cancelled: 0, disputesOpen: 0, byStatus: Object.fromEntries(PLACEMENT_STATUSES.map(s => [s, 0])) };
  const c = { firstMonthValue: 0, feeDue: 0, feePaid: 0, feeRefunded: 0, feeOutstanding: 0, invoiced: 0, collected: 0, netCollected: 0, feeAtRisk: 0, feeReversed: 0, payoutsRecorded: 0 };
  for (const p0 of placements) {
    const p = normalisePlacement(p0);
    const m = computePlacement(p);
    t.count++;
    t.byStatus[p.status]++;
    if (p.status !== 'cancelled') { t.active++; c.firstMonthValue += cents(m.firstMonthValue); c.feeDue += cents(m.feeDue); } else t.cancelled++;
    if (p.dispute.status === 'open') t.disputesOpen++;
    c.feePaid += cents(m.feePaid);
    c.feeRefunded += cents(m.feeRefunded);
    c.feeOutstanding += cents(m.feeOutstanding);
    c.invoiced += cents(m.invoiced);
    c.collected += cents(m.collected);
    c.netCollected += cents(m.netCollected);
    c.feeAtRisk += cents(m.feeAtRisk);
    c.feeReversed += cents(m.feeReversed);
    c.payoutsRecorded += cents(m.payoutRecorded);
  }
  for (const k of Object.keys(c)) t[k] = dollars(c[k]);
  return t;
}
