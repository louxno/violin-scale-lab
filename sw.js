// Violin Scale Lab - service worker: works offline after the first visit.
const V = 'vsl-v1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const store = (req, res) => { const cp = res.clone(); caches.open(V).then(c => c.put(req, cp)); return res; };
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const same = new URL(r.url).origin === location.origin;
  e.respondWith(same
    // Own files: network first (so updates show), cache as fallback (offline)
    ? fetch(r).then(res => store(r, res)).catch(() => caches.match(r).then(h => h || caches.match('index.html')))
    // Fonts, piano samples: cache first
    : caches.match(r).then(h => h || fetch(r).then(res => store(r, res))));
});
