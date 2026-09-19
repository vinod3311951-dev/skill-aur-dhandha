import fs from 'node:fs';

const required=['index.html','public/manifest.webmanifest','public/sw.js','public/icon.svg','public/icon-192.png','public/icon-512.png','public/icon-maskable.svg','src/history-back.ts'];
const failures=[];
for(const file of required){if(!fs.existsSync(file))failures.push(`missing ${file}`);}
if(!failures.length){
  const index=fs.readFileSync('index.html','utf8');
  const manifest=JSON.parse(fs.readFileSync('public/manifest.webmanifest','utf8'));
  const sw=fs.readFileSync('public/sw.js','utf8');
  const historyBack=fs.readFileSync('src/history-back.ts','utf8');
  if(!index.includes('rel="manifest" href="/manifest.webmanifest"'))failures.push('index.html does not link /manifest.webmanifest');
  if(!index.includes("navigator.serviceWorker.register('/sw.js')"))failures.push('index.html does not register /sw.js');
  if(!index.includes('/src/history-back.ts'))failures.push('index.html does not load history-back.ts');
  for(const key of ['name','short_name','start_url','scope','display','icons']) if(!manifest[key]) failures.push(`manifest missing ${key}`);
  if(manifest.start_url!=='/'||manifest.scope!=='/')failures.push('manifest start_url/scope must remain root-scoped');
  const iconSizes=new Set((manifest.icons||[]).map(x=>x.sizes));
  for(const size of ['192x192','512x512'])if(!iconSizes.has(size))failures.push(`manifest missing ${size} icon declaration`);
  if(!(manifest.icons||[]).some(x=>String(x.purpose||'').split(/\s+/).includes('maskable')))failures.push('manifest missing maskable icon declaration');
  for(const token of ["'/index.html'","'/manifest.webmanifest'","'/icon.svg'","addEventListener('fetch'","req.mode==='navigate'"]) if(!sw.includes(token)) failures.push(`service worker missing contract token: ${token}`);
  for(const token of ['popstate','pushState','button[id$="-back"]']) if(!historyBack.includes(token)) failures.push(`history back handler missing contract token: ${token}`);
}
if(failures.length){
  console.error('PWA contract failures:\n'+failures.map(x=>' - '+x).join('\n'));
  process.exit(1);
}
console.log('PWA contract PASS: manifest, icons, maskable icon, registration, offline shell and system-back guard are present.');
