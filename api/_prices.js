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
// Cosmetic prices (keep in step with SHOP / GEARPRICE / GFIN / ACC / PBG in index.html). Unknown items are not priced here.
export const COS = {
  av: { '#ff4b4b': 300, '#36c95f': 400, '#ff7ac6': 700, '#8b5cf6': 900, '#111111': 1200, '#ffd23f': 60000, '#3a6fd8': 500, '#e8e8e8': 800, cap: 3000, beanie: 4500, phones: 22000, tophat: 30000, horns: 55000, crown: 85000 },
  gear: { boots: 2500, gloves: 2500, belt: 3000, scarf: 3500, goggles: 4500, helmet: 17000, backpack: 18000, shield: 22000, cape: 28000, trail: 34000 },
  fin: { starter: 0, silver: 12000, gold: 50000, rainbow: 55000 },
  acc: { 'collar|#ef4f5f': 2500, 'collar|#2f80ed': 2500, 'collar|#ffd23f': 55000, 'scarf|#3ddc84': 3000, 'scarf|#ff7ac6': 3500, 'scarf|rainbow': 65000, 'hat|party': 5000, 'hat|bow': 4500, 'hat|crown': 80000 },
  pbg: { sky: 28000, sunset: 5000, ocean: 3500, forest: 2500, candy: 20000, galaxy: 35000, gold: 85000 },
  treat: { berry: 200, cookie: 800, star: 2500 }
};
const arr = v => Array.isArray(v) ? v.map(String) : [];
// Minimum coins spent on cosmetics newly owned between prev and next (pink pants share a colour with the pink shirt: priced at the cheaper)
export function cosmeticSpend(prev, next) {
  prev = prev || {}; next = next || {};
  const nw = (a, b) => { const o = new Set(arr(a)); return arr(b).filter(x => !o.has(x)); };
  let s = 0;
  for (const v of nw(prev.av && prev.av.own, next.av && next.av.own)) s += COS.av[v] || 0;
  for (const id of nw(prev.gearOwn, next.gearOwn)) { const [p, t] = id.split('|'); if (COS.gear[p] != null) s += COS.gear[p] + (COS.fin[t] || 0); }
  for (const id of nw(prev.accOwn, next.accOwn)) s += COS.acc[id] || 0;
  for (const id of nw(prev.pbgOwn, next.pbgOwn)) s += COS.pbg[id] || 0;
  return s;
}
export function checkSpend(prev, next, maxCoins) {
  const e = checkEggSpend(prev, next, maxCoins); if (!e.ok) return e;
  const c = cosmeticSpend(prev, next), tot = (e.spend || 0) + c;
  if (c && Number(next.coins) > maxCoins - tot) return { ok: false, error: 'Item price mismatch' };
  return { ok: true, spend: tot };
}
