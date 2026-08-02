// Pishi service worker — v2
// Strategy chosen deliberately:
//  - HTML pages: NETWORK-FIRST. Online → always the freshest version, so any update
//    pushed to prod appears immediately. Offline → fall back to cache. This is what
//    makes "every update goes straight to prod and she just sees it" true while still
//    working during a blackout.
//  - Other same-origin assets (pdf, icons): stale-while-revalidate.
const CACHE = 'pishi-v2';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './icon.svg', './icon.png',
  './games/pishi-week1.html', './games/pishi-week2.html', './games/color-cup.html',
  './print/week1-colors-print.pdf', './print/week2-animals-print.pdf'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.allSettled(SHELL.map((u) => c.add(u)));
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  const isHTML = req.mode === 'navigate' || req.destination === 'document' ||
                 (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    e.respondWith((async () => {
      try {
        const net = await fetch(req);
        if (sameOrigin) { const c = await caches.open(CACHE); c.put(req, net.clone()); }
        return net;
      } catch (_) {
        return (await caches.match(req)) || (await caches.match('./index.html')) ||
               new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      }
    })());
    return;
  }

  if (sameOrigin) {
    e.respondWith((async () => {
      const cached = await caches.match(req);
      const network = fetch(req).then((net) => {
        caches.open(CACHE).then((c) => c.put(req, net.clone()));
        return net;
      }).catch(() => null);
      return cached || (await network) || fetch(req);
    })());
  }
});
