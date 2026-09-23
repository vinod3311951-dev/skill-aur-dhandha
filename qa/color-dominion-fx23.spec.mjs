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
function findSignatureAim(g){
  const board=[[0,0],[0,1],[1,1],[0,6],[1,6]];
  const key=(r,c)=>`${r},${c}`;
  const occupied=new Set(board.map(([r,c])=>key(r,c)));

  const neighbors=(r,c)=>{
    const odd=r%2===1;
    const d=odd
      ?[[-1,0],[-1,1],[0,-1],[0,1],[1,0],[1,1]]
      :[[-1,-1],[-1,0],[0,-1],[0,1],[1,-1],[1,0]];
    return d.map(([dr,dc])=>[r+dr,c+dc])
      .filter(([rr,cc])=>rr>=0&&cc>=0&&cc<g.cols);
  };

  const center=(r,c)=>({
    x:g.left+g.radius+c*g.radius*2+(r%2?g.radius:0),
    y:g.top+g.radius+r*g.rowStep
  });

  const nearestEmpty=(r,c,x,y)=>{
    const candidates=[[r,c],...neighbors(r,c)]
      .filter(([rr,cc])=>!occupied.has(key(rr,cc)));

    candidates.sort((a,b)=>{
      const pa=center(a[0],a[1]),pb=center(b[0],b[1]);
      return((pa.x-x)**2+(pa.y-y)**2)
        -((pb.x-x)**2+(pb.y-y)**2);
    });
    return candidates[0]||null;
  };

  for(let x=g.left;x<=g.left+g.boardWidth;x+=1){
    const o=g.launcher,t={x,y:g.top};
    const dx=t.x-o.x,dy=Math.min(-24,t.y-o.y);
    const len=Math.hypot(dx,dy)||1;
    let px=o.x,py=o.y,vx=dx/len*720,vy=dy/len*720;
    const dt=1/240;

    for(let step=0;step<2400;step++){
      px+=vx*dt;
      py+=vy*dt;

      const L=g.left+g.radius,R=g.left+g.boardWidth-g.radius;
      if(px<L){
        px=L+(L-px);
        vx=Math.abs(vx);
      }else if(px>R){
        px=R-(px-R);
        vx=-Math.abs(vx);
      }

      let hit=null;
      for(const [r,c]of board){
        const p=center(r,c);
        if((p.x-px)**2+(p.y-py)**2<=(g.radius*1.9)**2){
          hit=[r,c];
          break;
        }
      }

      if(py<=g.top+g.radius||hit){
        let target=null;
        if(hit){
          target=nearestEmpty(hit[0],hit[1],px,py);
        }else{
          let bestCol=0,best=Infinity;
          for(let col=0;col<g.cols;col++){
            const p=center(0,col),distance=Math.abs(p.x-px);
            if(distance<best){best=distance;bestCol=col}
          }
          if(!occupied.has(key(0,bestCol)))target=[0,bestCol];
        }

        if(target?.[0]===1&&target?.[1]===0)return t;
        break;
      }
    }
  }

  throw new Error('No deterministic real-shot aim found for attachKey "1,0"');
}

test('signature cascade resolves through genuine gameplay attachment',async({page})=>{
  await page.goto(BASE);
  await unlock(page);

  const installed=await page.evaluate(
    ()=>window.__CD_DIAGNOSTICS__.installSignatureFixture()
  );
  expect(installed).toBe(true);

  const geometry=await page.evaluate(
    ()=>window.__CD_DIAGNOSTICS__.geometry()
  );
  expect(geometry).toBeTruthy();

  const aim=findSignatureAim(geometry);
  const canvas=page.locator('#game');
  const box=await canvas.boundingBox();
  expect(box).toBeTruthy();

  await page.mouse.move(box.x+geometry.launcher.x,box.y+geometry.launcher.y);
  await page.mouse.down();
  await page.mouse.move(box.x+aim.x,box.y+aim.y);
  await page.mouse.up();

  await expect.poll(async()=>page.evaluate(
    ()=>window.__CD_DIAGNOSTICS__.lastAttachedEvent()
  )).not.toBeNull();

  const event=await page.evaluate(
    ()=>window.__CD_DIAGNOSTICS__.lastAttachedEvent()
  );

  expect(event.attachKey).toBe('1,0');
  expect(event.removed).toHaveLength(3);
  expect(event.dropped).toEqual(['1,1']);

  const qualifies=await page.evaluate(
    e=>window.__CD_DIAGNOSTICS__.isSignatureCascade(e),
    event
  );
  expect(qualifies).toBe(true);

  await expect(page.locator('#cascade-restore')).toHaveClass(/active/);
});
