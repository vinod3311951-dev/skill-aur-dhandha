import test from"node:test";
import assert from"node:assert/strict";
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";
import{CORE_STAGE_COUNT,COLORS,WORLDS}from"../src/config.js";
import{STAGES,OBJECTIVE_TYPES,generateBoard,generateValidBoard,validateBoard,chooseNextColor,eligibleColors}from"../src/stages.js";
import{GameEngine,sameColorGroup,resolveAttach}from"../src/engine.js";
import{AnalyticsAdapter,AdPolicyAdapter,CrossPromoAdapter}from"../src/integrations.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const exists=p=>fs.existsSync(path.join(root,p));
const stat=p=>fs.statSync(path.join(root,p));

test("FX17 identity and locked content count",()=>{
  assert.equal(CORE_STAGE_COUNT,100);
  assert.equal(STAGES.length,100);
  assert.deepEqual(WORLDS,["Dawn Gardens","River Lights","Festival Streets","Sky Courtyards","Prism Fort"]);
  assert.deepEqual(COLORS,["cyan","magenta","yellow","lime","violet","coral"]);
});

test("all required objective families occur in the 100-stage progression",()=>{
  const present=new Set(STAGES.map(s=>s.objective.type));
  for(const type of OBJECTIVE_TYPES)assert.ok(present.has(type),`missing objective family ${type}`);
  assert.ok(STAGES.some(s=>s.limitedShots),"limited-shots modifier missing");
});

test("deterministic generator reproduces exact boards",()=>{
  for(const c of STAGES){
    const a=[...generateBoard(c).entries()];
    const b=[...generateBoard(c).entries()];
    assert.deepEqual(a,b,`stage ${c.id} was not reproducible`);
  }
});

test("5000 seeded opening soak is valid and playable",()=>{
  for(let i=0;i<5000;i++){
    const base=STAGES[i%STAGES.length];
    const c={...base,seed:`${base.seed}-fx17-${i}`};
    const board=generateBoard(c);
    const v=validateBoard(board,c);
    assert.equal(v.ok,true,`stage ${c.id} seed ${c.seed}: ${v.reason||"invalid"}`);
    const next=chooseNextColor(board,`${c.seed}-next`);
    assert.ok(eligibleColors(board).includes(next),`stage ${c.id} next color not eligible`);
  }
});

test("bounded recovery returns valid boards for every core stage",()=>{
  for(const c of STAGES){
    const r=generateValidBoard(c,3);
    assert.ok(r.attempt>=1&&r.attempt<=3);
    assert.equal(validateBoard(r.board,c).ok,true);
  }
});

test("known connected component resolves as expected",()=>{
  const board=new Map([["0,0","cyan"],["0,1","cyan"],["1,0","cyan"],["2,0","magenta"]]);
  assert.equal(sameColorGroup(board,"1,0").size,3);
  const result=resolveAttach(board,"1,0");
  assert.equal(result.removed.length,3);
  assert.deepEqual(result.dropped,["2,0"]);
  assert.equal(board.size,0);
});

test("invalid generated state is rejected",()=>{
  const c=STAGES[0];
  assert.equal(validateBoard(new Map(),c).ok,false);
  const bad=new Map([["0,0","not-a-palette-color"],["0,1","not-a-palette-color"]]);
  assert.equal(validateBoard(bad,c).ok,false);
});

test("first meaningful shot is immediately available without account or permission",()=>{
  const c=STAGES[0],generated=generateValidBoard(c,3),engine=new GameEngine({board:generated.board,config:c});
  assert.ok(engine.nextColor);
  const fired=engine.fire({x:195,y:760},{x:195,y:100});
  assert.equal(fired,true);
  assert.ok(engine.projectile);
  const html=read("index.html");
  assert.match(html,/No login/);
  assert.doesNotMatch(html,/<input[^>]+type=["'](?:email|tel|password)["']/i);
});

test("stars follow explicit stage thresholds",()=>{
  const c=STAGES[0],generated=generateValidBoard(c,3),engine=new GameEngine({board:generated.board,config:c});
  engine.status="success";
  engine.shotsLeft=Math.ceil(c.shots*.5);
  assert.equal(engine.stars(),3);
  engine.shotsLeft=Math.ceil(c.shots*.25);
  assert.ok([2,3].includes(engine.stars()));
  engine.shotsLeft=0;
  assert.equal(engine.stars(),1);
});

test("analytics is privacy-minimised and rejects unknown event names",()=>{
  const analytics=new AnalyticsAdapter();
  assert.equal(analytics.track("cd_shot",{level:1,seed:"S",email:"blocked",phone:"blocked",shotCount:1}),true);
  assert.deepEqual(analytics.buffer[0].properties,{level:1,seed:"S",shotCount:1});
  assert.equal(analytics.track("not_allowed",{level:1}),false);
});

test("ad policy is fail-safe and protects first session",async()=>{
  const provider={rewarded:async()=>({shown:true,rewarded:true})};
  const ads=new AdPolicyAdapter(provider);
  assert.equal(ads.canShowInterstitial({policyApproved:true,naturalBreak:true,firstSession:true}),false);
  assert.equal(ads.canShowInterstitial({policyApproved:true,naturalBreak:false,firstSession:false}),false);
  assert.equal(ads.canShowInterstitial({policyApproved:false,naturalBreak:true,firstSession:false}),false);
  assert.equal(ads.canShowInterstitial({policyApproved:true,naturalBreak:true,firstSession:false}),true);
  assert.deepEqual(await new AdPolicyAdapter().rewarded({policyApproved:true}),{shown:false,rewarded:false,reason:"unavailable"});
});

test("cross-promo never targets Color Dominion itself",()=>{
  const cross=new CrossPromoAdapter([{id:"color-dominion"},{id:"patang"},{id:"kanche"}]);
  assert.deepEqual(cross.choices("color-dominion").map(x=>x.id),["patang","kanche"]);
});

test("PWA manifest and offline shell files are internally consistent",()=>{
  const manifest=JSON.parse(read("manifest.webmanifest"));
  assert.equal(manifest.name,"Color Dominion");
  assert.equal(manifest.display,"standalone");
  assert.equal(manifest.start_url,"./");
  assert.equal(manifest.scope,"./");
  assert.ok(Array.isArray(manifest.icons)&&manifest.icons.length>=3);
  for(const icon of manifest.icons){
    const p=icon.src.replace(/^\.\//,"");
    assert.ok(exists(p),`missing manifest icon ${p}`);
    assert.ok(stat(p).size>0,`empty manifest icon ${p}`);
  }
  assert.ok(exists("sw.js"));
  const sw=read("sw.js");
  for(const required of["./index.html","./styles.css","./src/app.js","./src/engine.js","./src/stages.js","./manifest.webmanifest"])assert.ok(sw.includes(required),`service worker core cache missing ${required}`);
  assert.match(sw,/SKIP_WAITING/);
});

test("all frozen world before/after assets exist and are non-empty",()=>{
  for(const world of WORLDS){
    const slug=world.toLowerCase().replaceAll(" ","-");
    for(const state of["faded","restored"]){
      const p=`assets/worlds/${slug}/CD-WORLD-${slug}-${state}-v1.svg`;
      assert.ok(exists(p),`missing ${p}`);
      assert.ok(stat(p).size>100,`implausibly small ${p}`);
    }
  }
});

test("required audio identity assets exist and are non-empty",()=>{
  for(const p of[
    "assets/audio/music/CD-MUS-001-main-gameplay-loop-v1.wav",
    "assets/audio/music/CD-MUS-002-restoration-sting-v1.wav",
    "assets/audio/sfx/CD-SFX-003-launch-v1.wav",
    "assets/audio/sfx/CD-SFX-005-pop-a-v1.wav",
    "assets/audio/sfx/CD-SFX-006-drop-v1.wav",
    "assets/audio/sfx/CD-SFX-007-combo-rise-v1.wav",
    "assets/audio/sfx/CD-SFX-011-color-bloom-v1.wav",
    "assets/audio/sfx/CD-SFX-012-failure-v1.wav"
  ]){
    assert.ok(exists(p),`missing ${p}`);
    assert.ok(stat(p).size>1000,`implausibly small ${p}`);
  }
});

test("accessibility hooks required before browser QA are present",()=>{
  const html=read("index.html"),css=read("styles.css"),app=read("src/app.js");
  assert.match(html,/Reduced Motion/);
  assert.match(app,/reducedMotion/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(app,/SYMBOLS/);
  assert.match(css,/min-height:48px/);
});

test("runtime source does not introduce forbidden account or privileged-browser APIs",()=>{
  const source=["src/app.js","src/engine.js","src/stages.js","src/integrations.js"].map(read).join("\n");
  for(const forbidden of["navigator.geolocation","getUserMedia(","contacts.select(","credentials.create(","PaymentRequest("])assert.equal(source.includes(forbidden),false,`forbidden runtime API: ${forbidden}`);
});

test("IP/provenance and founder trademark disposition records remain present",()=>{
  for(const p of[
    "docs/ip/IP_PROVENANCE_REGISTER.md",
    "docs/ip/ASSET_REGISTER.csv",
    "docs/ip/DEPENDENCY_LICENSE_REGISTER.md",
    "docs/ip/MUSIC_SFX_RIGHTS_REGISTER.md",
    "docs/ip/FONT_REGISTER.md",
    "docs/ip/TRADEMARK_NAME_CHECK.md",
    "docs/ip/IP_AUDIT_RESULT.md"
  ])assert.ok(exists(p),`missing ${p}`);
  const tm=read("docs/ip/TRADEMARK_NAME_CHECK.md");
  assert.match(tm,/Keep "Color Dominion"/);
  assert.match(tm,/Do NOT rename/);
  assert.match(tm,/post-FX-23/i);
  assert.match(tm,/broad marketing\/store submission/i);
});

test("no V1 scope-expansion dependencies or backend were introduced",()=>{
  const pkg=JSON.parse(read("package.json"));
  assert.equal(Object.keys(pkg.dependencies||{}).length,0);
  assert.equal(Object.keys(pkg.devDependencies||{}).length,0);
  const source=["src/app.js","src/engine.js","src/stages.js","src/integrations.js"].map(read).join("\n");
  for(const marker of["WebSocket(","firebase","supabase","openai","stripe"])assert.equal(source.toLowerCase().includes(marker.toLowerCase()),false,`unexpected V1 scope marker ${marker}`);
});
