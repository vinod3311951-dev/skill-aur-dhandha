const { chromium, webkit, devices } = require('@playwright/test');
const path = require('node:path');
const fs = require('node:fs');

const TARGET = 'https://sarhad-sniper.vercel.app/';
const RUNS = Number(process.env.PROBE_RUNS || 4);
const SAMPLE_MS = Number(process.env.PROBE_SAMPLE_MS || 10000);
const results = [];

async function trial(browser, device, kind, index) {
  const context = await browser.newContext({ ...devices[device] });
  const page = await context.newPage();
  const browserErrors = [];
  const requestTimings = [];
  page.on('pageerror', e => browserErrors.push(e.message));
  page.on('requestfailed', r => browserErrors.push(r.url() + ': ' + (r.failure()?.errorText || 'failed')));
  page.on('requestfinished', async req => {
    try {
      const res = await req.response();
      const t = req.timing();
      requestTimings.push({url:req.url(),status:res?.status(),durationMs:Math.round(t.responseEnd - t.startTime)});
    } catch {}
  });
  await page.addInitScript({ path: path.join(__dirname, 'instrument.js') });
  await page.addInitScript(() => {
    const events=[];
    let last=0, frame=0, previous=0;
    const onFrame=t=>{
      frame++;
      if (last && t-last>100) {
        const startMs=last;
        const endMs=t;
        events.push({
          frame, startMs:Math.round(startMs), endMs:Math.round(endMs),
          deltaMs:Math.round(t-last),
          absoluteEnd: new Date(performance.timeOrigin + t).toISOString(),
          visibility:document.visibilityState, readyState:document.readyState,
          phase:window.__FX_DIAG_PHASE__||'bootstrap',
          recentResource:performance.getEntriesByType('resource').slice(-4).map(x=>({name:x.name,duration:Math.round(x.duration),end:Math.round(x.responseEnd)}))
        });
      }
      last=t;
      if (events.length>40)events.shift();
      requestAnimationFrame(onFrame);
    };
    window.__FX_WEBKIT_DIAG__={events, setPhase:(v)=>{window.__FX_DIAG_PHASE__=v;}, snapshot:()=>({frame,events:events.slice(),visibility:document.visibilityState})};
    addEventListener('visibilitychange',()=>events.push({event:'visibilitychange',time:Math.round(performance.now()),visibility:document.visibilityState}));
    addEventListener('load',e=>{
      if(e.target instanceof HTMLImageElement) {
        events.push({event:'image-load',time:Math.round(performance.now()),src:e.target.src});
      }
    },true);
    requestAnimationFrame(onFrame);
  });

  const url=new URL(TARGET);url.searchParams.set('test','1');url.searchParams.set('seed','1000');
  const started=Date.now();
  const response=await page.goto(url.toString(),{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.__TEST__?.ready===true,null,{timeout:20000});
  await page.evaluate(()=>{window.__TEST__.resetFps();window.__FX_WEBKIT_DIAG__.setPhase('idle');});
  await page.waitForTimeout(SAMPLE_MS);
  const before=await page.evaluate(()=>({fps:window.__TEST__.fps(),trace:window.__FX_WEBKIT_DIAG__.snapshot()}));
  let screenshotMs=null;
  if(kind==='with-screenshot'){
    await page.evaluate(()=>window.__FX_WEBKIT_DIAG__.setPhase('screenshot'));
    const st=Date.now();
    const canvas=page.locator('canvas').first();
    if(await canvas.count())await canvas.screenshot();
    else await page.screenshot();
    screenshotMs=Date.now()-st;
  }
  const after=await page.evaluate(()=>({
    fps:window.__TEST__.fps(),
    trace:window.__FX_WEBKIT_DIAG__.snapshot(),
    resources:performance.getEntriesByType('resource').map(r=>({name:r.name, duration:Math.round(r.duration),end:Math.round(r.responseEnd)})),
    images:Array.from(document.images).map(i=>({src:i.currentSrc,loaded:i.complete,width:i.naturalWidth}))
  }));
  const result={
    browser:device,variant:kind,index,exactURL:page.url(),httpStatus:response?.status(),
    runtimeMs:Date.now()-started,screenshotMs,pre:before,post:after,browserErrors,network:requestTimings
  };
  console.log('FX_WEBKIT_DIAG='+JSON.stringify({
    browser:device,variant:kind,index,exactURL:result.exactURL,status:result.httpStatus,
    before:before.fps,after:after.fps,screenshotMs,
    freezeEvents:after.trace.events.filter(e=>e.deltaMs>1000),
    longest:after.trace.events.filter(e=>e.deltaMs).sort((a,b)=>b.deltaMs-a.deltaMs).slice(0,6),
    browserErrors,network:requestTimings.filter(r=>r.durationMs>500)
  }));
  await context.close();
  return result;
}

(async()=>{
 const browser=await webkit.launch({headless:true});
 try {
  for(let i=0;i<RUNS;i++){
    const variant=i%2===0?'without-screenshot':'with-screenshot';
    results.push(await trial(browser,'iPhone 14',variant,i));
  }
 }finally{await browser.close();}
 fs.writeFileSync(process.env.PROBE_OUTPUT || 'sarhad-webkit-probe.json',JSON.stringify({target:TARGET,created:new Date().toISOString(),results},null,2));
 const anyFailure=results.some(x=>x.pre.fps.freezes || x.post.fps.freezes);
 console.log('FX_WEBKIT_DIAG_SUMMARY='+JSON.stringify({runs:results.length,anyFailure,freezes:results.map(r=>({variant:r.variant,pre:r.pre.fps.freezes,post:r.post.fps.freezes,worstBefore:r.pre.fps.worstFrameMs,worstAfter:r.post.fps.worstFrameMs,screenshotMs:r.screenshotMs}))}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
