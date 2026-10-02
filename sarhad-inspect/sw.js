const CACHE = 'sarhad-sniper-shell-v10';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/src/styles.css',
  '/src/main.js',
  '/src/phaser-reference.js',
  '/src/game/config.js',
  '/src/game/combat-state.js',
  '/src/game/loadout-state.js',
  '/src/game/engine.js',
  '/src/game/storage.js',
  '/src/game/diagnostics.js',
  '/src/game/types.js',
  '/vendor/phaser.min.js',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/assets/characters/captain-rudraa.svg',
  '/assets/worlds/glacier-reach.svg',
  '/assets/worlds/amber-desert.svg',
  '/assets/worlds/pine-watch.svg',
  '/assets/worlds/monsoon-pass.svg',
  '/assets/worlds/glacier-line.svg',
  '/assets/worlds/red-canyon.svg',
  '/assets/worlds/night-ridge.svg'
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
    fetch(event.request).then((response) => {
      if (response && response.status === 200 && response.type !== 'opaque') {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() =>
      caches.match(event.request).then((cached) =>
        cached || caches.match('/index.html').then((fallback) => fallback || caches.match('/'))
      )
    )
  );
});
