import { test, expect } from '@playwright/test';

const BASE=process.env.COLOR_DOMINION_URL||'http://127.0.0.1:8080';

async function unlock(page){
  await page.goto(BASE,{waitUntil:'domcontentloaded'});
  const gate=page.locator('#preview-gate');
  if(await gate.isVisible().catch(()=>false)){
    await page.locator('#preview-password').fill(process.env.FACTORYX_PREVIEW_PASSWORD||'fx-test-password');
    await page.locator('#preview-unlock-btn').click();
    await expect(page.locator('#app')).toBeVisible();
  }
}

async function openReviewStage(page,id){
  await unlock(page);
  const home=page.locator('[data-home]').first();
  if(await home.isVisible().catch(()=>false)) await home.click();
  if(await page.locator('#home-screen').isVisible().catch(()=>false)){
    await page.locator('#map-btn').click();
  }else{
    await page.goto(BASE,{waitUntil:'domcontentloaded'});
    await page.locator('#map-btn').click();
  }
  await expect(page.locator('#review-level-input')).toBeVisible();
  await page.locator('#review-level-input').fill(String(id));
  await page.locator('#review-level-go').click();
  await expect(page.locator('#game')).toBeVisible();
  await page.waitForTimeout(450);
}

async function canvasMetrics(page){
  return page.locator('#game').evaluate(canvas=>{
    const ctx=canvas.getContext('2d');
    const w=canvas.width,h=canvas.height;
    const sample=ctx.getImageData(0,0,Math.max(1,w),Math.max(1,h)).data;
    let min=255,max=0,sum=0,n=0;
    const step=Math.max(4,Math.floor(sample.length/4000/4)*4);
    for(let i=0;i<sample.length;i+=step){
      const y=.299*sample[i]+.587*sample[i+1]+.114*sample[i+2];
      min=Math.min(min,y);max=Math.max(max,y);sum+=y;n++;
    }
    return {w,h,range:max-min,mean:n?sum/n:0};
  });
}

test('upgraded jelly renderer and trance engine are active',async({page})=>{
  await unlock(page);
  await page.locator('#play-btn').click();
  await expect(page.locator('#game')).toBeVisible();
  await page.waitForTimeout(600);

  const snap=await page.evaluate(()=>window.__CD_DIAGNOSTICS__.snapshot());
  expect(snap.bubbleIdentity).toBe('factory-x-jelly-glass-v2');
  expect(snap.music.identity).toBe('factory-x-trance-v2');
  expect(snap.music.bpm).toBe(110);
  expect(snap.music.world).toBe('Dawn Gardens');
  expect(snap.music.active).toBe(true);

  const metrics=await canvasMetrics(page);
  expect(metrics.w).toBeGreaterThan(100);
  expect(metrics.h).toBeGreaterThan(100);
  expect(metrics.range).toBeGreaterThan(20);
});

for(const [id,world] of [[1,'Dawn Gardens'],[5,'Dawn Gardens'],[25,'River Lights'],[50,'Festival Streets'],[100,'Prism Fort']]){
  test(`stage ${id} renders upgraded presentation and correct world music profile`,async({page})=>{
    await openReviewStage(page,id);
    const snap=await page.evaluate(()=>window.__CD_DIAGNOSTICS__.snapshot());
    expect(snap.stage).toBe(id);
    expect(snap.bubbleIdentity).toBe('factory-x-jelly-glass-v2');
    expect(snap.music.identity).toBe('factory-x-trance-v2');
    expect(snap.music.world).toBe(world);
    const metrics=await canvasMetrics(page);
    expect(metrics.range).toBeGreaterThan(20);
  });
}

test('jelly reflection visibly changes across idle repaints',async({page})=>{
  await unlock(page);
  await page.locator('#play-btn').click();
  await page.waitForTimeout(350);
  const a=await page.locator('#game').screenshot();
  await page.waitForTimeout(500);
  const b=await page.locator('#game').screenshot();
  expect(Buffer.compare(a,b)).not.toBe(0);
});
