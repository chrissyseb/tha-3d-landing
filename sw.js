const C = 'vb-v19';
const SHELL = ['/', '/index.html', '/vo.js', '/vo.css', '/vb-light.css', '/creatures.css', '/bobby.js', '/creatures-art.js', '/creatures.js', '/fonts/fonts.css', '/fonts/fredoka-latin-700.woff2', '/fonts/nunito-latin-800.woff2', '/fonts/atkinson-hyperlegible-latin-400.woff2', '/icons/wordmark-v6-sticker.svg', '/team.html', '/lists.html', '/words.json', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  // network first (fresh updates), cache fallback for offline play
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('/index.html'))));
});
