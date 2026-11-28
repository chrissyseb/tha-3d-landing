// Coin prices for creature eggs (Common, Rare, Epic, Legendary). Keep in step with EGGP in creatures.js.
export const EGGP = [1500, 12000, 35000, 90000];
const bought = st => { const k = st && st.cr && st.cr.log && st.cr.log.bought; return [0, 1, 2, 3].map(r => Math.max(0, Number(Array.isArray(k) ? k[r] : 0) || 0)); };
// prev/next: saved and incoming game state. maxCoins: the most coins the player could hold now before any spending.
export function checkEggSpend(prev, next, maxCoins) {
  const a = bought(prev), b = bought(next);
  if (b.some((n, r) => n < a[r])) return { ok: false, error: 'Egg purchase count went backwards' };
  const old = new Set(((prev && prev.cr && prev.cr.eggs) || []).map(e => String(e && e.t)));
  const fresh = [0, 0, 0, 0];
  for (const e of ((next && next.cr && next.cr.eggs) || [])) {
    if (!e || e.src !== 'shop' || old.has(String(e.t))) continue;
    const r = Number(e.r); if (!(r >= 0 && r <= 3)) return { ok: false, error: 'Unknown egg' };
    fresh[r]++;
  }
  if (fresh.some((n, r) => n > b[r] - a[r])) return { ok: false, error: 'Egg not paid for' };
  const spend = b.reduce((s, n, r) => s + (n - a[r]) * EGGP[r], 0);
  if (spend && Number(next.coins) > maxCoins - spend) return { ok: false, error: 'Egg price mismatch' };
  return { ok: true, spend };
}
