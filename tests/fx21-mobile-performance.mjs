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

async function visibleButtonsMeetFloor(page){
  const bad=await page.locator("button:visible").evaluateAll(btns=>btns.map(b=>{
    const r=b.getBoundingClientRect();return{text:(b.textContent||"").trim(),w:r.width,h:r.height};
  }).filter(x=>x.w<40||x.h<40));
  assert.deepEqual(bad,[],"visible tap target below 40px: "+JSON.stringify(bad));
}

async function noHorizontalOverflow(page,label){
  const m=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  assert.ok(m.sw-m.cw<=2,`${label}: horizontal overflow ${m.sw-m.cw}px`);
}

async function oneTouchShot(page){
  const box=await page.locator("#game").boundingBox();
  assert.ok(box&&box.width>100&&box.height>160,"game canvas unavailable");
  const before=await page.evaluate(()=>window.__CD_DIAGNOSTICS__.snapshot().shotsLeft);
  const t0=Date.now();
  await page.touchscreen.tap(box.x+box.width*.5,box.y+Math.max(40,box.height*.22));
  await page.waitForFunction(prev=>window.__CD_DIAGNOSTICS__.snapshot().shotsLeft<prev,before,{timeout:7000});
  return Date.now()-t0;
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
    await visibleButtonsMeetFloor(page);

    const firstActionStart=Date.now();
    await page.locator("#play-btn").click();
    await page.locator("#game").waitFor({state:"visible"});
    const firstBoardMs=Date.now()-firstActionStart;
    assert.ok(firstBoardMs<=10000,`${profile.name}: first board exceeded 10s target: ${firstBoardMs}ms`);
    const inputResolveMs=await oneTouchShot(page);
    const frameBudget=await sampleFrameBudget(page);

    await page.locator("#pause-btn").click();
    await page.locator("#pause-overlay").waitFor({state:"visible"});
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
      name:profile.name,
      viewport:profile.viewport,
      dpr:profile.deviceScaleFactor,
      coldLoadMs,
      firstBoardMs,
      inputResolveMs,
      frameSamples:usable.length,
      frameMedianMs:q(.5),
      frameP90Ms:q(.9),
      frameP95Ms:q(.95),
      frameMaxMs:usable.length?usable[usable.length-1]:null,
      performanceGate:frameBudget
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
    const startHeap=await page.evaluate(()=>performance.memory?.usedJSHeapSize??null);
    const stageMetrics=[];
    for(let stage=1;stage<=24;stage++){
      await page.evaluate(({stage})=>{
        localStorage.setItem("color-dominion-fx07-v1",JSON.stringify({
          version:2,unlockedStage:stage,currentStage:stage,best:{},stars:{},cosmetics:[],streak:{count:0,lastDate:null},challenge:{},firstPlay:false,recentCrossPromo:{},
          settings:{music:false,sfx:false,haptics:false,reducedMotion:false}
        }));
      },{stage});
      await page.reload({waitUntil:"domcontentloaded"});
      await page.locator("#play-btn").click();
      await page.locator("#game").waitFor({state:"visible"});
      await page.waitForTimeout(120);
      const diag=await page.evaluate(()=>window.__CD_DIAGNOSTICS__.snapshot());
      assert.equal(diag.stage,stage,`soak stage mismatch ${stage}`);
      assert.equal(diag.status,"playing");
      stageMetrics.push({stage,shotsLeft:diag.shotsLeft,frameSampleCount:diag.frameSampleCount});
    }
    if(global.gc)global.gc();
    const endHeap=await page.evaluate(()=>performance.memory?.usedJSHeapSize??null);
    assert.deepEqual(errors,[],"20+ level soak browser errors: "+errors.join(" | "));
    out.soak={levels:24,startHeap,endHeap,heapDelta:startHeap!=null&&endHeap!=null?endHeap-startHeap:null,stageMetrics};
    await context.close();
  }

  fs.mkdirSync("artifacts",{recursive:true});
  const path=`artifacts/fx21-${engineName}.json`;
  fs.writeFileSync(path,JSON.stringify(out,null,2));
  console.log("FX21_DEVICE_QA=PASS");
  console.log("FX21_METRICS="+JSON.stringify(out));
}finally{
  await browser.close();
}
