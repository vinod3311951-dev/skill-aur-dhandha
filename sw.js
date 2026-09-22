const CACHE="color-dominion-v23-jelly-trance-v2";
const CORE=[
  "./","./index.html","./styles.css","./manifest.webmanifest","./robots.txt",
  "./src/app.js","./src/music-engine.js","./src/staging-gate.js","./src/config.js","./src/grid.js","./src/rng.js","./src/stages.js","./src/engine.js","./src/integrations.js",
  "./assets/brand/CD-BRAND-002-emblem-master-v1.svg","./assets/pwa/icon-192.png","./assets/pwa/icon-512.png",
  "./assets/worlds/dawn-gardens/CD-WORLD-dawn-gardens-faded-v1.svg","./assets/worlds/dawn-gardens/CD-WORLD-dawn-gardens-restored-v1.svg",
  "./assets/worlds/river-lights/CD-WORLD-river-lights-faded-v1.svg","./assets/worlds/river-lights/CD-WORLD-river-lights-restored-v1.svg",
  "./assets/worlds/festival-streets/CD-WORLD-festival-streets-faded-v1.svg","./assets/worlds/festival-streets/CD-WORLD-festival-streets-restored-v1.svg",
  "./assets/worlds/sky-courtyards/CD-WORLD-sky-courtyards-faded-v1.svg","./assets/worlds/sky-courtyards/CD-WORLD-sky-courtyards-restored-v1.svg",
  "./assets/worlds/prism-fort/CD-WORLD-prism-fort-faded-v1.svg","./assets/worlds/prism-fort/CD-WORLD-prism-fort-restored-v1.svg",
  "./assets/audio/music/CD-MUS-001-main-gameplay-loop-v1.wav","./assets/audio/music/CD-MUS-002-restoration-sting-v1.wav",
  "./assets/audio/sfx/CD-SFX-003-launch-v1.wav","./assets/audio/sfx/CD-SFX-005-pop-a-v1.wav","./assets/audio/sfx/CD-SFX-006-drop-v1.wav","./assets/audio/sfx/CD-SFX-007-combo-rise-v1.wav","./assets/audio/sfx/CD-SFX-011-color-bloom-v1.wav","./assets/audio/sfx/CD-SFX-012-failure-v1.wav"
];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE))));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("message",event=>{if(event.data?.type==="SKIP_WAITING")self.skipWaiting()});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
  if(event.request.mode==="navigate"){
    event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put("./index.html",copy)))}return response}).catch(()=>caches.match("./index.html")));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)))}return response})));
});
