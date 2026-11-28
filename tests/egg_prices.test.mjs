// Egg price rebalance: client prices, copy and server validation agree. Run: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EGGP, checkEggSpend } from '../api/_prices.js';
const root = new URL('..', import.meta.url);
const cre = readFileSync(new URL('creatures.js', root), 'utf8');
const idx = readFileSync(new URL('index.html', root), 'utf8');

test('prices are the agreed table', () => assert.deepEqual(EGGP, [1500, 12000, 35000, 90000]));
test('client prices match server prices', () => {
  const m = cre.match(/EGG_PRICE=(\d+),EGGP=\[([\d,]+)\]/);
  assert.equal(+m[1], EGGP[0]); assert.deepEqual(m[2].split(',').map(Number), EGGP);
});
test('egg info copy shows the new prices', () => {
  for (const p of ['1,500', '12,000', '35,000', '90,000']) assert.ok(idx.includes(`Buy with ${p} coins`), p);
  assert.ok(!/Buy with (6,000|60,000|145,000|350,000) coins/.test(idx));
});
test('cheap cosmetics stay below a Rare egg, nothing above a Legendary egg', () => {
  const nums = [...idx.matchAll(/'(?:[^']+)',(\d{4,6})\]/g)].map(m => +m[1]);
  assert.ok(nums.length > 20);
  assert.ok(Math.max(...nums) <= EGGP[3], 'item dearer than Legendary egg');
  assert.ok(Math.min(...nums.filter(n => n > 0)) < EGGP[1]);
});

const st = (coins, bought, eggs) => ({ coins, cr: { log: { bought }, eggs } });
for (const [r, price] of EGGP.entries()) {
  test(`buying a rarity-${r} egg at ${price} is accepted`, () => {
    const prev = st(100000, [0, 0, 0, 0], []);
    const b = [0, 0, 0, 0]; b[r] = 1;
    const next = st(100000 - price, b, [{ r, src: 'shop', t: 1 }]);
    assert.deepEqual(checkEggSpend(prev, next, 100000 + 1200), { ok: true, spend: price });
  });
}
test('tampered price (egg for 1 coin) is rejected', () => {
  const r = checkEggSpend(st(100000, [0, 0, 0, 0], []), st(99999, [0, 0, 0, 1], [{ r: 3, src: 'shop', t: 1 }]), 101200);
  assert.equal(r.ok, false); assert.match(r.error, /price/);
});
test('old cheap price for Rare (paid 1,500) is rejected', () => {
  assert.equal(checkEggSpend(st(20000, [0, 0, 0, 0], []), st(18500, [0, 1, 0, 0], [{ r: 1, src: 'shop', t: 1 }]), 21200).ok, false);
});
test('shop egg injected without the purchase counter is rejected', () => {
  assert.equal(checkEggSpend(st(5000, [0, 0, 0, 0], []), st(5000, [0, 0, 0, 0], [{ r: 3, src: 'shop', t: 9 }]), 6200).ok, false);
});
test('purchase counter cannot go backwards', () => {
  assert.equal(checkEggSpend(st(5000, [2, 0, 0, 0], []), st(5000, [0, 0, 0, 0], []), 6200).ok, false);
});
test('earned eggs and hatching need no coins', () => {
  const prev = st(500, [1, 0, 0, 0], [{ r: 0, src: 'shop', t: 1 }]);
  assert.equal(checkEggSpend(prev, st(600, [1, 0, 0, 0], [{ r: 1, src: 'giant', t: 2 }, { r: 0, src: 'boss', t: 3 }]), 1700).ok, true);
});
test('King Kongo: Common every time, Rare once per week', () => {
  assert.match(cre, /give\(0,'boss'\);\s*if\(o\.giant\)\{const wk=weekKey\(\);if\(c\.log\.kongoW!==wk\)/);
});
