const CACHE='skill-aur-dhandha-v8';
const SHELL=['/','/index.html','/manifest.webmanifest','/icon.svg','/icon-192.png','/icon-512.png'];

async function precacheApp(){
  const cache=await caches.open(CACHE);
  await cache.addAll(SHELL);
  try{
    const response=await fetch('/index.html',{cache:'no-store'});
    if(response.ok){
      const html=await response.clone().text();
      await cache.put('/index.html',response);
      const urls=[...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(m=>m[1]);
      if(urls.length)await cache.addAll([...new Set(urls)]);
    }
  }catch{}
}

self.addEventListener('install',event=>{
  event.waitUntil(precacheApp().then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const req=event.request;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;

  if(req.mode==='navigate'){
    event.respondWith(
      fetch(req).then(response=>{
        if(response.ok){
          const copy=response.clone();
          event.waitUntil(caches.open(CACHE).then(cache=>cache.put('/index.html',copy)));
        }
        return response;
      }).catch(async()=>await caches.match('/index.html')||await caches.match('/')||Response.error())
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached=>{
      const network=fetch(req).then(response=>{
        if(response.ok){
          const copy=response.clone();
          event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)));
        }
        return response;
      });
      return cached||network.catch(()=>Response.error());
    })
  );
});
