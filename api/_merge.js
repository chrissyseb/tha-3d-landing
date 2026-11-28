// Merge a guest's on-device save into a signed-in player's save, once.
// Coins: keep the larger balance, but guest coins (never checked by the server) are capped by the same ledger pace
// /api/progress uses: a daily allowance per day actually played, plus the usual 1,200 slack, with a hard ceiling.
export const COIN_PER_DAY = 8000, COIN_CEIL = 150000;
const SKIP = new Set(['nick', 'sup', 'supThx', '_lp', 'coins']);
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
function union(a, b) {
  const seen = new Set(), out = [];
  for (const v of [...a, ...b]) { const k = typeof v === 'object' ? JSON.stringify(v) : typeof v + ':' + v; if (!seen.has(k)) { seen.add(k); out.push(v); } }
  return out;
}
function deep(acc, g, depth = 0) {
  if (acc === undefined || acc === null) return g;
  if (g === undefined || g === null || depth > 8) return acc;
  if (typeof acc === 'number' && typeof g === 'number') return Number.isFinite(g) ? Math.max(acc, g) : acc; // furthest progress
  if (typeof acc === 'boolean' && typeof g === 'boolean') return acc || g;
  if (Array.isArray(acc) && Array.isArray(g)) return union(acc, g).slice(0, 2000);
  if (isObj(acc) && isObj(g)) { const o = { ...acc }; for (const k of Object.keys(g)) if (!SKIP.has(k) || depth) o[k] = deep(acc[k], g[k], depth + 1); return o; }
  return acc; // strings and mismatched types: the account's value wins
}
export function guestCoinCap(g) {
  const days = Array.isArray(g && g.days) ? Math.min(new Set(g.days.map(String)).size, 60) : 0;
  return Math.min(COIN_CEIL, 1200 + days * COIN_PER_DAY);
}
export function mergeStates(acc, guest) {
  acc = isObj(acc) ? acc : {}; guest = isObj(guest) ? guest : {};
  const out = deep(acc, guest);
  const gc = Math.max(0, Math.min(Number(guest.coins) || 0, guestCoinCap(guest)));
  out.coins = Math.max(Number(acc.coins) || 0, Math.floor(gc));
  if (acc.nick) out.nick = acc.nick;
  if (out.cr && Array.isArray(out.cr.eggs)) out.cr.eggs = out.cr.eggs.slice(0, Math.max(30, ((acc.cr && acc.cr.eggs) || []).length)); // no egg flooding
  if (out.cr && acc.cr && acc.cr.act) out.cr.act = acc.cr.act;
  if (Array.isArray(out.ridPaid)) out.ridPaid = out.ridPaid.slice(-60);
  return out;
}
