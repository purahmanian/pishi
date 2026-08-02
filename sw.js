// Pishi service worker — offline cache for the static site.
// Cache name is versioned; bump when app-shell contents change.
const CACHE_NAME = 'pishi-v1';

// Paths are relative to sw.js (repo root), so this works whether the
// site is served from https://purahmanian.github.io/pishi/ or any
// other subpath — never use root-absolute ('/') paths here.
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './games/pishi-week1.html',
  './games/color-cup.html',
];

// Add each file individually and swallow failures per-file, so a single
// missing asset (e.g. games/week2.html not existing yet) never aborts
// the whole install.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        APP_SHELL.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[sw] pre-cache skipped for', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Cache-first, falling back to network; newly-fetched same-origin GET
// responses are stashed in the cache so pages added later (e.g. a
// future games/week2.html) get cached automatically on first visit.
self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (
            response &&
            response.ok &&
            new URL(request.url).origin === self.location.origin
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request));
    })
  );
});
