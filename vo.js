// VocaBobby site layer: accounts, cloud saves, leaderboard API and PSLE Edition paywall.
(function () {
  const K = 'p6vq3';
  const api = (p, o = {}) => fetch(p, { ...o, credentials: 'same-origin', headers: { 'x-vo': '1', 'Content-Type': 'application/json', ...(o.headers || {}) } })
    .then(async r => ({ ok: r.ok, status: r.status, j: await r.json().catch(() => ({})) }))
    .catch(() => ({ ok: false, status: 0, j: {} }));
  const LS = { get: k => { try { return localStorage.getItem(k) } catch { return null } }, set: (k, v) => { try { localStorage.setItem(k, v) } catch { } }, del: k => { try { localStorage.removeItem(k) } catch { } } };
  const VO = window.VO = { me: null };
  let pushT = null;
  function push(keep) {
    const v = LS.get(K); if (!v || !VO.me || VO.me.type !== 'kid') return;
    const up = Date.now(); origSet.call(localStorage, 'vo_up', String(up));
    let state; try { state = JSON.parse(v) } catch { return }
    api('/api/progress', { method: 'PUT', keepalive: !!keep, body: JSON.stringify({ state, updated: up }) });
  }
  const origSet = Storage.prototype.setItem;
  window.VO_READY = (async () => {
    // One-time move of a guest's saved game from the old address (vocab-obby.vercel.app).
    try {
      const m = /[#&]vbcarry=([^&]*)/.exec(location.hash);
      if (m) { const d = JSON.parse(decodeURIComponent(m[1])); if (!LS.get(K)) for (const k of ['p6vq3', 'p6vq3s', 'p6vq3s_sec', 'vq_ed', 'vo_quests', 'vo_region']) if (typeof d[k] === 'string') LS.set(k, d[k]); }
      if (m || /[?&]carried=1/.test(location.search)) { LS.set('vb_carried', '1'); history.replaceState(null, '', location.pathname); }
      else if (location.host === 'vocabobby.vercel.app' && /[?&]from=old/.test(location.search) && !LS.get(K) && !LS.get('vb_carried')) { LS.set('vb_carried', '1'); location.replace('https://vocab-obby.vercel.app/carry.html'); return; }
    } catch { }
    try { VO.me = (await api('/api/auth')).j.user || null } catch { }
    const me = VO.me;
    if (me && me.type === 'kid') {
      const r = await api('/api/progress');
      const owner = LS.get('vo_owner');
      if (r.ok && r.j.state) { LS.set(K, JSON.stringify(r.j.state)); LS.set('vo_up', String(r.j.updated || 0)); }
      else if (owner && owner !== me.childId) { LS.del(K); LS.del(K + 's'); }
      LS.set('vo_owner', me.childId);
      try { const s = JSON.parse(LS.get(K) || '{}'); if (s.nick !== me.nick) { s.nick = me.nick; LS.set(K, JSON.stringify(s)); } } catch { }
      Storage.prototype.setItem = function (k, v) { origSet.call(this, k, v); if (this === localStorage && k === K) { clearTimeout(pushT); pushT = setTimeout(push, 2500); } };
      addEventListener('pagehide', () => push(true));
      document.addEventListener('visibilitychange', () => { if (document.hidden) push(true) });
    }
    bar();
  })().catch(() => { });

  // Data layer the game uses for the shared leaderboard (replaces the old Claude-only one).
  window.VOC = { use: async n => {
    await window.VO_READY; const me = VO.me;
    if (n === 'user') return me && me.type === 'kid' ? { id: async () => me.childId } : null;
    if (n === 'db') {
      if (!(me && me.type === 'kid')) return null;
      return {
        collection: () => ({ onSnapshot(cb, err) {
          const go = async () => { const r = await api('/api/board'); if (r.ok) cb({ docs: (r.j.rows || []).map(v => ({ id: v.id, data: () => v })) }); else if (err) err(); };
          go(); const iv = setInterval(go, 30000); return () => clearInterval(iv);
        } }),
        doc: () => ({ set: async d => { const r = await api('/api/board', { method: 'POST', body: JSON.stringify(d) }); if (!r.ok) throw new Error('save failed'); } })
      };
    }
    return null;
  } };

  // Paywall: the whole game is free (all six worlds, pets, bosses, mini-games, leaderboard). PSLE Edition = the PSLE Kingdom world, first run free.
  window.VO_GATE = function (kind, arg, tier, home) {
    const needs = kind === 'challenge' ? 'pack' : null;
    if (!needs) return true;
    if (VO.me && VO.me.paid) return true;
    let d = {}; try { d = JSON.parse(LS.get('vo_demo') || '{}') } catch { }
    if (!d[needs]) { d[needs] = 1; LS.set('vo_demo', JSON.stringify(d)); toast('Free demo: your first PSLE Kingdom run is on us!'); return true; }
    lock(home); return false;
  };
  function lock(home) {
    const m = document.getElementById('main'); if (!m) return;
    const kid = VO.me && VO.me.type === 'kid', parent = VO.me && VO.me.type === 'parent';
    m.innerHTML = `<div class="card"><span class="tag">PSLE Edition</span><div class="word" style="font-size:clamp(28px,6vw,40px)">Unlock the PSLE Edition</div>
      <p>PSLE Kingdom is the PSLE Edition world: words from real PSLE papers, exam-style runs, the Exam King boss and a parent progress report. Your free demo run is used up. Every other world in VocaBobby stays free.</p>
      <p><b>S$29.90</b> per player for a full year, or <b>S$59.90</b> for a Family Pass (up to 3 players). Includes a parent progress report.</p>
      <p class="vo-pn">Pay by <b>PayNow to +65 9003 0002</b>${VO.me && VO.me.code ? ' with family code <b>' + String(VO.me.code).replace(/[^\w-]/g, '') + '</b> as the reference' : ''}, then WhatsApp us. We unlock it the same day.</p>
      ${kid ? '<p>The account owner can unlock it at <b>vocabobby.vercel.app/account</b>.</p>' : `<a class="go" style="display:block;text-align:center;text-decoration:none" href="/account.html#unlock">${parent ? 'Unlock now' : 'Create a parent account to unlock'}</a>`}
      <button class="go" id="vo-back" style="background:var(--soft)">Back to the free game</button></div>`;
    const b = document.getElementById('vo-back'); if (b) b.onclick = () => home ? home() : location.reload();
  }
  function toast(t) { const d = document.createElement('div'); d.className = 'vo-toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 3200); }

  // Account strip (guest / player / parent).
  function bar() {
    const me = VO.me, d = document.createElement('div'); d.className = 'vo-bar';
    if (!me) d.innerHTML = `<span>Guest: progress saved on this device only.</span><a href="/account.html">Log in to save</a>`;
    else if (me.type === 'kid') d.innerHTML = `<span>Player: <b></b>${me.paid ? ' · PSLE Kingdom unlocked' : ''}</span><a href="#" id="vo-out">Log out</a>`;
    else d.innerHTML = `<span>Parent account. Pick a player to save progress.</span><a href="/account.html">Parent dashboard</a>`;
    if (me && me.type === 'kid') d.querySelector('b').textContent = me.nick;
    document.body.appendChild(d);
    const fit = () => { if (d.isConnected) document.body.style.paddingBottom = (d.offsetHeight + 12) + 'px'; };
    fit(); addEventListener('resize', fit, { passive: true });
    const o = d.querySelector('#vo-out'); if (o) o.onclick = async e => { e.preventDefault(); push(true); await api('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'logout' }) }); location.reload(); };
  }

  // Install button (PWA).
  let deferred = null;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; const b = document.createElement('button'); b.className = 'vo-install'; b.textContent = 'Install VocaBobby'; b.onclick = async () => { b.remove(); deferred.prompt(); deferred = null; }; document.body.appendChild(b); });
  if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => { }));
})();
