// Team Up: turn-based co-op boss battles. Room state lives in one private Blob JSON per code.
// The server picks every question and keeps the answer; damage is computed here, never trusted from clients.
import { createHash, randomBytes } from 'node:crypto';
import { body, send, csrfOk, rateOk, getSession, getJson, putJson, famPath, paidFor, nickOk, safe } from './_lib.js';
import W from './_words.js';

const TTL = 30 * 60000, TURN_MS = 30000, POWER_MS = 15000, MAX = 4;
const BOSSES = [['Bramble Brute', 'fire'], ['Sand Sphinx', 'water'], ['Jungle Titan', 'zap'], ['Lava Golem', 'water'], ['Ice Kraken', 'fire'], ['Space Overlord', 'zap'], ['Exam King', 'water'], ['King Kongo', 'fire']];
const ELEMS = ['fire', 'water', 'zap'];
const EMOTES = ['👍', '🔥', 'Nice!', 'Your turn!', 'GG'];
const COMBO = { 'fire+water': ['Steam Burst', '#b48cff'], 'fire+zap': ['Plasma Blast', '#ff4fd8'], 'water+zap': ['Storm Surge', '#38e1ff'] };
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const roomPath = c => `rooms/${safe(String(c).toUpperCase()).slice(0, 4)}.json`;
const tok = () => randomBytes(18).toString('base64url');
const pub = () => randomBytes(6).toString('base64url');
// Deterministic RNG: two pollers that both resolve a timeout write the same next state.
function rng(seed) { let h = createHash('sha256').update(seed).digest(); let i = 0; return () => { if (i >= 28) { h = createHash('sha256').update(h).digest(); i = 0; } const v = h.readUInt32BE(i) / 4294967296; i += 4; return v; }; }
const shuf = (a, r) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const worldOf = v => Math.max(0, Math.min(5, Math.floor(Number(v) || 0)));

function makeQuestion(room, p) {
  const r = rng(room.code + ':' + room.n + ':' + p.pid);
  const pool = room.pack ? W.filter(w => w[6]) : W.filter(w => w[1] === p.world);
  const used = new Set(room.used || []);
  const fresh = pool.filter(w => !used.has(w[0]));
  const w = (fresh.length ? fresh : pool)[Math.floor(r() * (fresh.length ? fresh.length : pool.length))];
  room.used = [...(room.used || []).slice(-120), w[0]];
  const qid = pub(), meaning = r() < 0.5;
  let prompt, opts, ans;
  if (meaning) {
    const others = shuf(W.filter(x => x[1] === w[1] && x[0] !== w[0]), r).slice(0, 3).map(x => x[2]);
    ans = w[2]; opts = shuf([ans, ...others], r); prompt = { kind: 'meaning', word: w[0] };
  } else {
    ans = w[5]; opts = shuf([ans, ...w[4]].slice(0, 4), r); prompt = { kind: 'blank', sentence: w[3] };
  }
  room.q = { id: qid, pid: p.pid, prompt, opts, ans, word: w[0], meaning: w[2], golden: r() < 0.14, deadline: Date.now() + TURN_MS };
  room.phase = 'question';
}
function nextTurn(room) {
  const live = room.players.filter(p => !p.left);
  if (!live.length) { room.phase = 'lobby'; return; }
  let i = room.players.findIndex(p => p.pid === room.turn);
  for (let k = 0; k < room.players.length; k++) { i = (i + 1) % room.players.length; if (!room.players[i].left) break; }
  room.turn = room.players[i].pid; room.n++;
  makeQuestion(room, room.players[i]);
}
function feed(room, t) { room.feed = [...(room.feed || []).slice(-7), { t, at: Date.now() }]; }
function bossHits(room, missed) {
  room.hearts = Math.max(0, room.hearts - 1); room.combo = null;
  room.fx = { seq: (room.fx?.seq || 0) + 1, kind: 'attack', by: room.turn, missed: !!missed };
  if (room.hearts <= 0) { room.phase = 'lost'; feed(room, 'The team got knocked out!'); return true; }
  return false;
}
// Resolve expired turns (deterministic, so concurrent pollers agree).
function tick(room) {
  let changed = false;
  for (let guard = 0; guard < 6 && (room.phase === 'question' || room.phase === 'power') && Date.now() > room.q.deadline; guard++) {
    const p = room.players.find(x => x.pid === room.turn);
    if (room.phase === 'power') { applyPower(room, 'fire', true); }
    else { feed(room, `${p ? p.nick : 'A player'} ran out of time. The boss attacks!`); if (!bossHits(room, true)) nextTurn(room); }
    changed = true;
  }
  return changed;
}
function applyPower(room, elem, auto) {
  const p = room.players.find(x => x.pid === room.turn), q = room.q;
  const star = elem === 'star';
  let dmg = star ? 25 : (elem === room.boss.weak ? 15 : 10), name = null, color = null;
  const prev = room.combo;
  if (!star && prev && prev.by !== room.turn && prev.elem !== elem && prev.n === room.n - 1) {
    const key = [prev.elem, elem].sort().join('+'); [name, color] = COMBO[key] || ['Team combo', '#ffd23f'];
    dmg = Math.round(dmg * 1.5);
  }
  room.boss.hp = Math.max(0, room.boss.hp - dmg);
  room.combo = star ? null : { by: room.turn, elem, n: room.n };
  room.fx = { seq: (room.fx?.seq || 0) + 1, kind: 'shot', by: room.turn, elem, dmg, combo: name, color, super: !star && elem === room.boss.weak };
  feed(room, `${p ? p.nick : 'Someone'} ${auto ? 'auto-fired' : 'fired'} ${star ? 'a Star' : elem === 'zap' ? 'Electric' : elem[0].toUpperCase() + elem.slice(1)} for ${dmg}${name ? ` · Team combo: ${name}!` : ''}`);
  if (room.boss.hp <= 0) { room.phase = 'won'; room.wins = (room.wins || 0) + 1; feed(room, `${room.boss.name} is defeated! Team Saviours!`); return; }
  nextTurn(room);
}
function setupBattle(room) {
  const np = room.players.filter(p => !p.left).length;
  const bi = room.pack ? 6 : (room.giant ? 7 : room.world);
  room.boss = { i: bi, name: BOSSES[bi][0], weak: BOSSES[bi][1], max: 50 * np * (room.giant ? 2 : 1) };
  room.boss.hp = room.boss.max; room.hearts = room.maxHearts = 3 + Math.max(0, np - 1);
  room.combo = null; room.n = (room.n || 0) + 1; room.turn = room.players.find(p => !p.left).pid;
  makeQuestion(room, room.players.find(p => p.pid === room.turn));
  feed(room, `${room.boss.name} appears! ${room.boss.max} HP. Weak to ${room.boss.weak === 'zap' ? 'Electric' : room.boss.weak[0].toUpperCase() + room.boss.weak.slice(1)}.`);
}
// What clients may see: never the answer or other players' tokens.
function view(room, me) {
  const q = room.q && { id: room.q.id, pid: room.q.pid, prompt: room.q.prompt, opts: room.q.opts, golden: room.q.golden, deadline: room.q.deadline };
  return { code: room.code, v: room.v, phase: room.phase, host: room.host, world: room.world, pack: room.pack, giant: room.giant,
    players: room.players.map(p => ({ pid: p.pid, nick: p.nick, world: p.world, av: p.av, pet: p.pet, left: !!p.left })),
    turn: room.turn, q, boss: room.boss || null, hearts: room.hearts, maxHearts: room.maxHearts, fx: room.fx || null,
    feed: room.feed || [], emotes: room.emotes || [], last: me ? room.last?.[me] || null : null, now: Date.now() };
}
async function load(code) {
  const r = await getJson(roomPath(code));
  if (!r || Date.now() - r.touched > TTL) return null;
  return r;
}
async function save(room) { room.v++; room.touched = Date.now(); await putJson(roomPath(room.code), room); }
async function sessionKid(req) {
  const s = getSession(req); if (!s || s.t !== 'k') return null;
  const fam = await getJson(famPath(s.fid)); const kid = fam && fam.children.find(c => c.id === s.cid);
  return kid ? { nick: kid.nick, paid: paidFor(fam, kid.id), cid: kid.id } : null;
}
const COLR = /^(#[0-9a-f]{6}|f:(gold|silver|galaxy|rainbow)|f:neon#[0-9a-f]{6})$/i;
const cleanAv = a => ({ shirt: COLR.test(a?.shirt || '') ? a.shirt : '#2f80ed', pants: COLR.test(a?.pants || '') ? a.pants : '#2b2b2b', hat: String(a?.hat || 'none').replace(/[^\w-]/g, '').slice(0, 20) });
function uniqueNick(room, nick) { let n = nick, k = 2; while (room.players.some(p => !p.left && p.nick.toLowerCase() === n.toLowerCase())) n = nick.slice(0, 12) + k++; return n; }

export default async function handler(req, res) {
  if (!csrfOk(req)) return send(res, 403, { error: 'Bad request' });
  if (req.method === 'GET') {
    const u = new URL(req.url, 'http://x'), code = String(u.searchParams.get('code') || '').toUpperCase();
    if (!/^[A-Z]{4}$/.test(code)) return send(res, 400, { error: 'Bad code' });
    const room = await load(code); if (!room) return send(res, 404, { error: 'Room not found or expired.' });
    if (tick(room)) await save(room);
    const me = room.players.find(p => p.tok === String(u.searchParams.get('t') || ''));
    const out = view(room, me && me.pid); if (process.env.VO_DEBUG === '1' && !process.env.VERCEL && room.q) out.dbgAns = room.q.ans;
    return send(res, 200, out);
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  if (!rateOk(req, 'room', 240)) return send(res, 429, { error: 'Slow down a little.' });
  const b = await body(req), act = String(b.action || '');

  if (act === 'create' || act === 'join') {
    const kid = await sessionKid(req);
    const nick = kid ? kid.nick : String(b.nick || '').trim();
    if (!kid && !nickOk(nick)) return send(res, 400, { error: 'Pick a nickname: 2–14 letters or numbers, nothing rude.' });
    const player = { pid: pub(), tok: tok(), nick, world: worldOf(b.world), av: cleanAv(b.av), pet: Number.isInteger(b.pet) ? Math.max(-1, Math.min(40, b.pet)) : -1, cid: kid?.cid || null };
    if (act === 'create') {
      const pack = !!b.pack && !!kid?.paid;
      if (b.pack && !pack) return send(res, 402, { error: 'PSLE Kingdom rooms need the PSLE Edition. Host a free world instead.' });
      let code = null;
      for (let i = 0; i < 12; i++) { let c = ''; for (const x of randomBytes(4)) c += ALPHA[x % ALPHA.length]; if (!(await load(c))) { code = c; break; } }
      if (!code) return send(res, 503, { error: 'Busy, try again.' });
      const room = { code, v: 0, created: Date.now(), touched: Date.now(), host: player.pid, world: player.world, pack, giant: !!b.giant, phase: 'lobby', n: 0, players: [player], feed: [], emotes: [] };
      feed(room, `${nick} opened the room.`); await save(room);
      return send(res, 200, { token: player.tok, pid: player.pid, state: view(room, player.pid) });
    }
    const code = String(b.code || '').toUpperCase(); if (!/^[A-Z]{4}$/.test(code)) return send(res, 400, { error: 'Room codes are 4 letters.' });
    const room = await load(code); if (!room) return send(res, 404, { error: 'No room with that code. Check the letters.' });
    if (room.players.filter(p => !p.left).length >= MAX) return send(res, 409, { error: 'That room is full (4 players).' });
    if (room.phase !== 'lobby') return send(res, 409, { error: 'That battle has already started. Ask the host to open a new room.' });
    player.nick = uniqueNick(room, nick); room.players.push(player); feed(room, `${player.nick} joined!`); await save(room);
    return send(res, 200, { token: player.tok, pid: player.pid, state: view(room, player.pid) });
  }

  const code = String(b.code || '').toUpperCase(); if (!/^[A-Z]{4}$/.test(code)) return send(res, 400, { error: 'Bad code' });
  const room = await load(code); if (!room) return send(res, 404, { error: 'Room expired.' });
  const me = room.players.find(p => p.tok === String(b.token || '') && !p.left); if (!me) return send(res, 403, { error: 'You are not in this room.' });
  const ticked = tick(room);
  if (!ticked && Number(b.v) !== room.v && act !== 'emote' && act !== 'leave') return send(res, 409, { error: 'stale', state: view(room, me.pid) });

  if (act === 'emote') {
    const i = Number(b.e); if (!(i >= 0 && i < EMOTES.length)) return send(res, 400, { error: 'Bad emote' });
    room.emotes = [...(room.emotes || []).slice(-5), { nick: me.nick, e: EMOTES[i], at: Date.now() }];
  } else if (act === 'leave') {
    me.left = true; feed(room, `${me.nick} left.`);
    if (room.host === me.pid) { const h = room.players.find(p => !p.left); if (h) room.host = h.pid; }
    if (room.turn === me.pid && (room.phase === 'question' || room.phase === 'power')) nextTurn(room);
  } else if (act === 'start' || act === 'retry') {
    if (act === 'start' && (room.host !== me.pid || room.phase !== 'lobby')) return send(res, 403, { error: 'Only the host can start.' });
    if (act === 'retry' && room.phase !== 'lost' && room.phase !== 'won') return send(res, 409, { error: 'Battle still going.' });
    if (act === 'start' && room.players.filter(p => !p.left).length < 2) return send(res, 409, { error: 'Wait for at least one friend to join.' });
    if (act === 'retry' && typeof b.giant === 'boolean' && room.host === me.pid) room.giant = b.giant && !room.pack;
    setupBattle(room);
  } else if (act === 'answer') {
    if (room.phase !== 'question' || room.turn !== me.pid) return send(res, 409, { error: 'Not your turn.', state: view(room, me.pid) });
    if (String(b.qid) !== room.q.id) return send(res, 409, { error: 'stale', state: view(room, me.pid) });
    const ok = String(b.choice) === room.q.ans;
    room.last = { ...(room.last || {}), [me.pid]: { qid: room.q.id, ok, word: room.q.word, meaning: room.q.meaning, ans: room.q.ans } };
    if (ok) { room.phase = 'power'; room.q.deadline = Date.now() + POWER_MS; feed(room, `${me.nick} got it right! Choose a power…`); }
    else { feed(room, `${me.nick} missed. "${room.q.word}" means ${room.q.meaning}. The boss attacks!`); if (!bossHits(room)) nextTurn(room); }
  } else if (act === 'power') {
    if (room.phase !== 'power' || room.turn !== me.pid) return send(res, 409, { error: 'Not your turn.', state: view(room, me.pid) });
    const elem = String(b.elem);
    if (!(ELEMS.includes(elem) || (elem === 'star' && room.q.golden))) return send(res, 400, { error: 'Bad power' });
    applyPower(room, elem);
  } else return send(res, 400, { error: 'Unknown action' });

  await save(room);
  return send(res, 200, { ok: true, state: view(room, me.pid) });
}
