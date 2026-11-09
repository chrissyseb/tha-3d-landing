// Owner dashboard figures (pure). Counts only what is stored; nothing is estimated.
import { ENQUIRY_STATUSES, normaliseEnquiry, isWaitlist } from './_enquiry.js';
import { summarise } from './_placement.js';
import { ORDER_STATUSES } from './_orders.js';

const WEEK_MS = 7 * 24 * 3600 * 1000;
const PAID_ORDER = ['paid', 'part-refunded', 'disputed'];
const EVER_PAID_ORDER = ['paid', 'part-refunded', 'refunded', 'disputed'];
const cents = v => { const n = Number(v); return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0; };
const arr = v => (Array.isArray(v) ? v.filter(x => x && typeof x === 'object') : []);
const zero = keys => Object.fromEntries(keys.map(k => [k, 0]));

export function buildOverview({ enquiries, placements, orders, applications } = {}, now = new Date()) {
  const since = now.getTime() - WEEK_MS;
  const recent = d => { const t = Date.parse(d && d.createdAt); return Number.isFinite(t) && t >= since && t <= now.getTime() + 60000; };

  const enq = arr(enquiries).map(normaliseEnquiry);
  const byStatus = zero(ENQUIRY_STATUSES);
  enq.forEach(e => { byStatus[e.status]++; });
  const byType = {};
  enq.forEach(e => { const t = String(e.type || 'other'); byType[t] = (byType[t] || 0) + 1; });
  const waitlist = enq.filter(isWaitlist);

  const pl = summarise(arr(placements));

  const ord = arr(orders);
  const ordersBy = mode => {
    const list = mode ? ord.filter(o => (o.mode === 'live') === (mode === 'live')) : ord;
    const st = zero(ORDER_STATUSES);
    list.forEach(o => { if (st[o.status] !== undefined) st[o.status]++; });
    return {
      created: list.length,
      paid: list.filter(o => PAID_ORDER.includes(o.status)).length,
      everPaid: list.filter(o => EVER_PAID_ORDER.includes(o.status)).length,
      paidNet: list.filter(o => EVER_PAID_ORDER.includes(o.status)).reduce((t, o) => t + Math.max(cents(o.amount) - cents(o.refundedAmount), 0), 0) / 100,
      byStatus: st,
    };
  };

  const apps = arr(applications);
  return {
    generatedAt: now.toISOString(),
    enquiries: {
      total: enq.length,
      newThisWeek: enq.filter(recent).length,
      byStatus,
      byType,
      waitlist: waitlist.length,
      waitlistThisWeek: waitlist.filter(recent).length,
    },
    placements: {
      total: pl.count,
      active: pl.active,
      byStatus: pl.byStatus,
      disputesOpen: pl.disputesOpen,
      commission: {
        due: pl.feeDue,
        invoiced: pl.invoiced,
        collected: pl.collected,
        refunded: pl.feeRefunded,
        netCollected: pl.netCollected,
        outstanding: pl.feeOutstanding,
        atRisk: pl.feeAtRisk,
      },
      payoutsRecorded: pl.payoutsRecorded,
    },
    orders: { all: ordersBy(), live: ordersBy('live'), test: ordersBy('test') },
    specialists: {
      total: apps.length,
      approved: apps.filter(a => a.status === 'approved').length,
      awaitingReview: apps.filter(a => a.status === 'new' || a.status === 'under-review').length,
    },
  };
}
