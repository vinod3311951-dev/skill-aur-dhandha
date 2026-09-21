import assert from"node:assert/strict";
import{chromium,firefox,webkit,devices}from"playwright";

const browserName=process.env.FX18_BROWSER||"chromium";
const profile=process.env.FX18_PROFILE||"desktop";
const baseURL=process.env.FX18_BASE_URL||"http://127.0.0.1:8080/";
const engines={chromium,firefox,webkit};
const browserType=engines[browserName];
if(!browserType)throw new Error("Unsupported browser: "+browserName);

function contextOptions(){
  if(profile==="android")return{...devices["Pixel 7"],reducedMotion:"no-preference"};
  if(profile==="ios")return{...devices["iPhone 13"],reducedMotion:"no-preference"};
  return{viewport:{width:1365,height:768},reducedMotion:"no-preference"};
}

async function assertNoHorizontalOverflow(page,label){
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert.ok(overflow<=2,`${label}: horizontal overflow ${overflow}px`);
}

async function assertTapTargets(page){
  const failures=await page.locator("button:not([hidden]):visible").evaluateAll(btns=>btns.map(b=>{
    const r=b.getBoundingClientRect();return{text:(b.textContent||"").trim(),w:r.width,h:r.height};
  }).filter(x=>x.w<40||x.h<40));
  assert.deepEqual(failures,[],`undersized visible tap targets: ${JSON.stringify(failures)}`);
}

async function fireOneShot(page,contextOptionsValue){
  const box=await page.locator("#game").boundingBox();
  assert.ok(box&&box.width>100&&box.height>200,"game canvas not measurable");
  const x=box.x+box.width*.5,y=box.y+box.height*.24;
  const before=await page.evaluate(()=>window.__CD_DIAGNOSTICS__.snapshot().shotsLeft);
  if(contextOptionsValue.hasTouch)await page.touchscreen.tap(x,y);
  else await page.mouse.click(x,y);
  await page.waitForFunction(prev=>window.__CD_DIAGNOSTICS__?.snapshot().shotsLeft<prev,before,{timeout:7000});
  const after=await page.evaluate(()=>window.__CD_DIAGNOSTICS__.snapshot().shotsLeft);
  assert.ok(after<before,`shot did not resolve: before=${before} after=${after}`);
}

async function runMainContext(browser){
  const opts=contextOptions();
  const context=await browser.newContext(opts);
  const page=await context.newPage();
  const errors=[];
  page.on("console",m=>{if(m.type()==="error")errors.push("console:"+m.text())});
  page.on("pageerror",e=>errors.push("page:"+String(e)));

  const response=await page.goto(baseURL,{waitUntil:"networkidle",timeout:60000});
  assert.equal(response?.status(),200,`${browserName}/${profile}: home HTTP`);
  assert.equal((await page.locator("h1").textContent())?.trim(),"Color Dominion");
  assert.equal(await page.locator("#play-btn").isVisible(),true);
  await assertNoHorizontalOverflow(page,"home");
  await assertTapTargets(page);

  await page.locator("#how-btn").click();
  assert.equal(await page.locator("#how-screen").isVisible(),true);
  await assertNoHorizontalOverflow(page,"how");
  await page.locator("#how-play-btn").click();
  await page.locator("#game").waitFor({state:"visible"});
  assert.match((await page.locator("#stage-label").textContent())||"",/Stage 1/);
  assert.ok(((await page.locator("#objective-label").textContent())||"").trim().length>0);

  await fireOneShot(page,opts);
  const shotDiag=await page.evaluate(()=>window.__CD_DIAGNOSTICS__.snapshot());
  assert.equal(shotDiag.stage,1);
  assert.equal(shotDiag.status,"playing");

  await page.locator("#pause-btn").click();
  assert.equal(await page.locator("#pause-overlay").isVisible(),true);
  await page.locator("#resume-btn").click();
  assert.equal(await page.locator("#pause-overlay").isHidden(),true);

  await page.locator("#pause-btn").click();
  await page.locator("#pause-home-btn").click();
  assert.equal(await page.locator("#home-screen").isVisible(),true);

  await page.locator("#settings-btn").click();
  const initialMotion=await page.locator("#motion-toggle").isChecked();
  if(initialMotion)await page.locator("#motion-toggle").uncheck();
  else await page.locator("#motion-toggle").check();
  const expected=!initialMotion;
  await page.locator("#settings-screen [data-home]").click();
  await page.reload({waitUntil:"networkidle"});
  await page.locator("#settings-btn").click();
  assert.equal(await page.locator("#motion-toggle").isChecked(),expected,`${browserName}/${profile}: setting did not persist`);
  await page.locator("#settings-screen [data-home]").click();

  await page.locator("#map-btn").click();
  assert.equal(await page.locator("#map-screen").isVisible(),true);
  assert.equal(await page.locator(".world-card").count(),5);
  const unlockedButtons=page.locator(".world-play:not([disabled])");
  assert.ok(await unlockedButtons.count()>=1);
  await unlockedButtons.first().click();
  await page.locator("#game").waitFor({state:"visible"});
  assert.match((await page.locator("#stage-label").textContent())||"",/Stage 1/);

  await assertNoHorizontalOverflow(page,"game");
  assert.deepEqual(errors,[],`${browserName}/${profile}: browser errors: ${errors.join(" | ")}`);
  const diag=await page.evaluate(()=>window.__CD_DIAGNOSTICS__.snapshot());
  console.log("FX18_MAIN_PASS="+JSON.stringify({browserName,profile,diag}));
  await context.close();
}

async function runReducedMotionContext(browser){
  const base=contextOptions();
  const context=await browser.newContext({...base,reducedMotion:"reduce"});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",e=>errors.push(String(e)));
  const response=await page.goto(baseURL,{waitUntil:"networkidle",timeout:60000});
  assert.equal(response?.status(),200);
  assert.equal(await page.evaluate(()=>matchMedia("(prefers-reduced-motion: reduce)").matches),true);
  await page.locator("#settings-btn").click();
  await page.locator("#motion-toggle").check();
  await page.locator("#settings-screen [data-home]").click();
  await page.locator("#play-btn").click();
  assert.equal(await page.locator("#game").isVisible(),true);
  assert.deepEqual(errors,[]);
  console.log("FX18_REDUCED_MOTION_PASS="+JSON.stringify({browserName,profile}));
  await context.close();
}

const browser=await browserType.launch({headless:true});
try{
  await runMainContext(browser);
  await runReducedMotionContext(browser);
}finally{
  await browser.close();
}
