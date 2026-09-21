import assert from"node:assert/strict";
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";
import{chromium}from"playwright";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>fs.readFileSync(path.join(root,p));
const text=p=>fs.readFileSync(path.join(root,p),"utf8");
const manifest=JSON.parse(text("manifest.webmanifest"));

function pngSize(buffer){
  assert.equal(buffer.toString("ascii",1,4),"PNG","not a PNG file");
  return{width:buffer.readUInt32BE(16),height:buffer.readUInt32BE(20)};
}

assert.equal(manifest.name,"Color Dominion");
assert.equal(manifest.short_name,"Color Dominion");
assert.equal(manifest.start_url,"./");
assert.equal(manifest.scope,"./");
assert.equal(manifest.display,"standalone");
assert.equal(manifest.orientation,"portrait-primary");
assert.ok(manifest.theme_color);
assert.ok(manifest.background_color);
assert.ok(Array.isArray(manifest.icons)&&manifest.icons.length>=3);

const expected=new Map([
  ["./assets/pwa/icon-192.png",[192,192,"any"]],
  ["./assets/pwa/icon-512.png",[512,512,"any"]],
  ["./assets/pwa/CD-BRAND-004-maskable-icon-512-v1.png",[512,512,"maskable"]]
]);
for(const icon of manifest.icons){
  if(!expected.has(icon.src))continue;
  const [w,h,purpose]=expected.get(icon.src);
  const local=icon.src.replace(/^\.\//,"");
  assert.ok(fs.existsSync(path.join(root,local)),`missing icon ${local}`);
  const size=pngSize(read(local));
  assert.deepEqual(size,{width:w,height:h},`wrong icon dimensions ${local}`);
  assert.equal(icon.purpose,purpose,`wrong purpose ${local}`);
  expected.delete(icon.src);
}
assert.equal(expected.size,0,`manifest missing required icons: ${[...expected.keys()].join(", ")}`);

const html=text("index.html");
assert.match(html,/rel="manifest" href="\.\/manifest\.webmanifest"/);
assert.match(html,/name="theme-color"/);
assert.match(html,/rel="apple-touch-icon"/);
for(const external of html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g))throw new Error("unexpected external runtime resource: "+external[1]);

const sw=text("sw.js");
assert.match(sw,/color-dominion-v16/);
assert.match(sw,/caches\.open\(CACHE\)/);
assert.match(sw,/request\.mode==="navigate"/);
assert.match(sw,/caches\.match\("\.\/index\.html"\)/);
assert.match(sw,/self\.clients\.claim\(\)/);
assert.match(sw,/SKIP_WAITING/);

const baseURL=process.env.FX20_BASE_URL||"http://127.0.0.1:8080/";
const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();
  const errors=[];
  page.on("console",m=>{if(m.type()==="error")errors.push("console:"+m.text())});
  page.on("pageerror",e=>errors.push("page:"+String(e)));

  const response=await page.goto(baseURL,{waitUntil:"networkidle",timeout:60000});
  assert.equal(response?.status(),200);

  const meta=await page.evaluate(()=>({
    manifest:document.querySelector('link[rel="manifest"]')?.getAttribute("href"),
    theme:document.querySelector('meta[name="theme-color"]')?.getAttribute("content"),
    apple:document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href"),
    swSupported:"serviceWorker"in navigator
  }));
  assert.equal(meta.manifest,"./manifest.webmanifest");
  assert.ok(meta.theme);
  assert.ok(meta.apple);
  assert.equal(meta.swSupported,true);

  const manifestResp=await page.request.get(new URL("manifest.webmanifest",baseURL).href);
  assert.equal(manifestResp.status(),200);
  assert.match(manifestResp.headers()["content-type"]||"",/application\/manifest\+json/);

  const swResp=await page.request.get(new URL("sw.js",baseURL).href);
  assert.equal(swResp.status(),200);
  assert.match(swResp.headers()["content-type"]||"",/(javascript|text\/javascript)/);

  await page.evaluate(async()=>{await navigator.serviceWorker.ready});
  await page.reload({waitUntil:"networkidle"});
  const controlled=await page.evaluate(()=>Boolean(navigator.serviceWorker.controller));
  assert.equal(controlled,true,"page not controlled by service worker after reload");

  const cachedOnline=await page.evaluate(async()=>Object.fromEntries(await Promise.all([
    "./styles.css","./src/app.js","./src/engine.js","./src/stages.js","./assets/pwa/icon-192.png"
  ].map(async p=>[p,(await fetch(p)).ok]))));
  for(const [p,ok] of Object.entries(cachedOnline))assert.equal(ok,true,`online core fetch failed ${p}`);

  await context.setOffline(true);
  await page.reload({waitUntil:"domcontentloaded",timeout:30000});
  assert.equal(await page.locator("#home-screen").isVisible(),true);
  assert.equal((await page.locator("h1").textContent())?.trim(),"Color Dominion");
  assert.equal(await page.locator("#offline-pill").isVisible(),true);

  const cachedOffline=await page.evaluate(async()=>Object.fromEntries(await Promise.all([
    "./styles.css","./src/app.js","./src/engine.js","./src/stages.js","./assets/pwa/icon-192.png"
  ].map(async p=>{try{return[p,(await fetch(p)).ok]}catch{return[p,false]}}))));
  for(const [p,ok] of Object.entries(cachedOffline))assert.equal(ok,true,`offline core fetch failed ${p}`);

  await page.locator("#play-btn").click();
  assert.equal(await page.locator("#game").isVisible(),true);
  assert.ok(((await page.locator("#objective-label").textContent())||"").trim());

  await context.setOffline(false);
  await page.reload({waitUntil:"networkidle"});
  assert.equal(await page.locator("#offline-pill").isHidden(),true);
  assert.deepEqual(errors,[],"browser errors during PWA lifecycle");

  console.log("FX20_PWA_BROWSER=PASS");
  console.log("FX20_PWA_CONTROLLED="+controlled);
  console.log("FX20_OFFLINE_CORE="+JSON.stringify(cachedOffline));
  await context.close();
}finally{
  await browser.close();
}
