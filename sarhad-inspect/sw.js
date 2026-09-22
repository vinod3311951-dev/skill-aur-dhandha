const CACHE = 'sarhad-sniper-shell-v4';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/src/styles.css',
  '/src/main.js',
  '/src/game/config.js',
  '/src/game/engine.js',
  '/src/game/storage.js',
  '/src/game/diagnostics.js',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/assets/worlds/sarhad-cliffs.webp',
  '/assets/worlds/dune-outpost.webp',
  '/assets/worlds/frost-ridge.webp',
  '/assets/worlds/jungle-pass.webp',
  '/assets/worlds/coastal-watch.webp',
  '/assets/worlds/canyon-base.webp',
  '/assets/worlds/sky-fortress.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (!response || response.status !== 200 || response.type === 'opaque') return response;
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match('/index.html').then((fallback) => fallback || caches.match('/'))))
  );
});
