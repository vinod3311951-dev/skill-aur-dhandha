import assert from"node:assert/strict";
import fs from"node:fs";
import{chromium,webkit}from"playwright";

const engineName=process.env.FX21_ENGINE||"chromium";
const baseURL=process.env.FX21_BASE_URL||"http://127.0.0.1:8080/";
const browserType={chromium,webkit}[engineName];
if(!browserType)throw new Error("Unsupported engine "+engineName);

const profiles=[
  {name:"phone-320",viewport:{width:320,height:568},hasTouch:true,isMobile:true,deviceScaleFactor:1},
  {name:"phone-360",viewport:{width:360,height:800},hasTouch:true,isMobile:true,deviceScaleFactor:2},
  {name:"phone-390",viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:3},
  {name:"phone-430",viewport:{width:430,height:932},hasTouch:true,isMobile:true,deviceScaleFactor:3},
  {name:"tablet-600",viewport:{width:600,height:960},hasTouch:true,isMobile:true,deviceScaleFactor:2},
  {name:"landscape-844x390",viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2}
];

const out={engine:engineName,profiles:[],soak:null,timestamp:new Date().toISOString()};

async function visibleButtonsMeetFloor(page,label){
  const bad=await page.locator("button:visible").evaluateAll(btns=>btns.map(b=>{
    const r=b.getBoundingClientRect();return{text:(b.textContent||"").trim(),w:r.width,h:r.height};
  }).filter(x=>x.w<48||x.h<48));
  assert.deepEqual(bad,[],label+" visible tap target below 48px: "+JSON.stringify(bad));
}

async function noHorizontalOverflow(page,label){
  const m=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  assert.ok(m.sw-m.cw<=2,`${label}: horizontal overflow ${m.sw-m.cw}px`);
}

async function oneTouchShot(page){
  const box=await page.locator("#game").boundingBox();
  assert.ok(box&&box.width>100&&box.height>160,"game canvas unavailable");
  const before=await page.evaluate(()=>window.__CD_DIAGNOSTICS__.snapshot().shotsLeft);
  const attempts=[[.50,.18],[.38,.22],[.62,.22],[.28,.26],[.72,.26],[.50,.30]];
  const t0=Date.now();
  for(const[xr,yr]of attempts){
    await page.touchscreen.tap(box.x+box.width*xr,box.y+Math.max(32,box.height*yr));
    await page.waitForTimeout(1100);
    const after=await page.evaluate(()=>window.__CD_DIAGNOSTICS__.snapshot().shotsLeft);
    if(after<before)return Date.now()-t0;
  }
  const diag=await page.evaluate(()=>window.__CD_DIAGNOSTICS__.snapshot());
  throw new Error("touch shot did not resolve after bounded aim attempts: "+JSON.stringify(diag));
}

async function sampleFrameBudget(page,durationMs=2600){
  const start=await page.evaluate(()=>window.__CD_DIAGNOSTICS__.frameSamples().length);
  await page.waitForTimeout(durationMs);
  const samples=(await page.evaluate(i=>window.__CD_DIAGNOSTICS__.frameSamples().slice(i),start))
    .filter(x=>x>0&&x<1000).sort((a,b)=>a-b);
  assert.ok(samples.length>=30,"insufficient frame samples");
  const q=p=>samples[Math.min(samples.length-1,Math.floor((samples.length-1)*p))];
  const p95Ms=q(.95),p90Ms=q(.90),medianMs=q(.50),p95Fps=1000/p95Ms;
  assert.ok(p95Fps>=30,`Factory X p95 FPS floor failed: ${p95Fps.toFixed(2)} FPS (${p95Ms.toFixed(2)}ms frame)`);
  return{samples:samples.length,medianMs,p90Ms,p95Ms,p95Fps,maxMs:samples[samples.length-1]};
}

const browser=await browserType.launch({headless:true});
try{
  for(const profile of profiles){
    const context=await browser.newContext({
      viewport:profile.viewport,
      hasTouch:profile.hasTouch,
      isMobile:profile.isMobile,
      deviceScaleFactor:profile.deviceScaleFactor,
      reducedMotion:"no-preference"
    });
    const page=await context.newPage();
    const errors=[];
    page.on("console",m=>{if(m.type()==="error")errors.push("console:"+m.text())});
    page.on("pageerror",e=>errors.push("page:"+String(e)));

    const t0=Date.now();
    const response=await page.goto(baseURL,{waitUntil:"networkidle",timeout:60000});
    const coldLoadMs=Date.now()-t0;
    assert.equal(response?.status(),200);
    assert.equal((await page.locator("h1").textContent())?.trim(),"Color Dominion");
    await noHorizontalOverflow(page,profile.name+" home");
    await visibleButtonsMeetFloor(page,profile.name+" home");

    const firstActionStart=Date.now();
    await page.locator("#play-btn").click();
    await page.locator("#game").waitFor({state:"visible"});
    const firstBoardMs=Date.now()-firstActionStart;
    assert.ok(firstBoardMs<=10000,`${profile.name}: first board exceeded 10s target: ${firstBoardMs}ms`);
    await visibleButtonsMeetFloor(page,profile.name+" gameplay");

    const inputResolveMs=await oneTouchShot(page);
    const frameBudget=await sampleFrameBudget(page);

    await page.locator("#pause-btn").click();
    await page.locator("#pause-overlay").waitFor({state:"visible"});
    await visibleButtonsMeetFloor(page,profile.name+" pause");
    await page.locator("#resume-btn").click();

    const beforeFrames=await page.evaluate(()=>window.__CD_DIAGNOSTICS__.frameSamples().length);
    const bg=await context.newPage();
    await bg.setContent("<title>background helper</title>");
    await bg.bringToFront();
    await new Promise(r=>setTimeout(r,250));
    await page.bringToFront();
    await new Promise(r=>setTimeout(r,250));
    const afterFrames=await page.evaluate(()=>window.__CD_DIAGNOSTICS__.frameSamples().length);
    assert.ok(afterFrames>=beforeFrames,"frame diagnostics regressed after background/foreground");

    await noHorizontalOverflow(page,profile.name+" game");
    assert.deepEqual(errors,[],profile.name+" browser errors: "+errors.join(" | "));

    const samples=await page.evaluate(()=>window.__CD_DIAGNOSTICS__.frameSamples());
    const usable=samples.filter(x=>x>0&&x<1000).sort((a,b)=>a-b);
    const q=p=>usable.length?usable[Math.min(usable.length-1,Math.floor((usable.length-1)*p))]:null;
    out.profiles.push({
      name:profile.name,viewport:profile.viewport,dpr:profile.deviceScaleFactor,
      coldLoadMs,firstBoardMs,inputResolveMs,
      frameSamples:usable.length,frameMedianMs:q(.5),frameP90Ms:q(.9),frameP95Ms:q(.95),
      frameMaxMs:usable.length?usable[usable.length-1]:null,performanceGate:frameBudget
    });
    await context.close();
  }

  if(engineName==="chromium"){
    const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2,reducedMotion:"no-preference"});
    const page=await context.newPage();
    const errors=[];
    page.on("console",m=>{if(m.type()==="error")errors.push("console:"+m.text())});
    page.on("pageerror",e=>errors.push("page:"+String(e)));
    await page.goto(baseURL,{waitUntil:"networkidle"});
    await page.locator("#play-btn").click();
    await page.locator("#game").waitFor({state:"visible"});
    await page.waitForTimeout(400);

    const startHeap=await page.evaluate(()=>performance.memory?.usedJSHeapSize??null);
    const stageMetrics=[];
    for(let cycle=1;cycle<=24;cycle++){
      await page.locator("#pause-btn").click();
      await page.locator("#pause-overlay").waitFor({state:"visible"});
      await page.locator("#pause-retry-btn").click();
      await page.locator("#game").waitFor({state:"visible"});
      await page.waitForTimeout(100);
      const diag=await page.evaluate(()=>window.__CD_DIAGNOSTICS__.snapshot());
      assert.equal(diag.stage,1,`soak cycle stage mismatch ${cycle}`);
      assert.equal(diag.status,"playing");
      stageMetrics.push({cycle,shotsLeft:diag.shotsLeft,frameSampleCount:diag.frameSampleCount});
    }
    if(global.gc)global.gc();
    const endHeap=await page.evaluate(()=>performance.memory?.usedJSHeapSize??null);
    assert.deepEqual(errors,[],"24-cycle soak browser errors: "+errors.join(" | "));
    out.soak={cycles:24,startHeap,endHeap,heapDelta:startHeap!=null&&endHeap!=null?endHeap-startHeap:null,stageMetrics};
    await context.close();
  }

  fs.mkdirSync("artifacts",{recursive:true});
  const artifactPath=`artifacts/fx21-${engineName}.json`;
  fs.writeFileSync(artifactPath,JSON.stringify(out,null,2));
  console.log("FX21_DEVICE_QA=PASS");
  console.log("FX21_METRICS="+JSON.stringify(out));
}finally{
  await browser.close();
}
