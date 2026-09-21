import test from"node:test";import assert from"node:assert/strict";import fs from"node:fs";
import{CORE_STAGE_COUNT}from"../src/config.js";
import{STAGES,OBJECTIVE_TYPES,generateBoard,validateBoard,generateValidBoard,selectObjectiveMarkers}from"../src/stages.js";
import{GameEngine,scoreResolution,nextCombo,createObjectiveState}from"../src/engine.js";
import{AnalyticsAdapter,AdPolicyAdapter,CrossPromoAdapter}from"../src/integrations.js";

test("FX-16 keeps 100 core stages and covers all frozen objective families",()=>{assert.equal(CORE_STAGE_COUNT,100);assert.equal(STAGES.length,100);const present=new Set(STAGES.map(s=>s.objective.type));for(const type of OBJECTIVE_TYPES)assert.ok(present.has(type),`missing ${type}`);assert.ok(STAGES.some(s=>s.limitedShots),"limited-shots family missing")});

test("2000 deterministic opening variants remain valid across difficulty bands",()=>{for(let i=0;i<2000;i++){const base=STAGES[i%STAGES.length],cfg={...base,seed:`${base.seed}-soak-${i}`};const board=generateBoard(cfg);const result=validateBoard(board,cfg);assert.equal(result.ok,true,`${cfg.id}:${i}:${result.reason||""}`)}});

test("bounded board recovery remains valid",()=>{for(const c of STAGES){const r=generateValidBoard(c,3);assert.equal(validateBoard(r.board,c).ok,true);assert.ok(r.attempt>=1&&r.attempt<=3)}});

test("objective markers are deterministic and bounded",()=>{const c=STAGES.find(s=>s.objective.type==="rescue_marked"),b=generateBoard(c),a=selectObjectiveMarkers(b,c),d=selectObjectiveMarkers(b,c);assert.deepEqual(a,d);assert.equal(a.length,c.objective.markerCount);assert.ok(a.every(k=>b.has(k)))});

test("combo and score escalation are bounded and deterministic",()=>{assert.equal(nextCombo(0,{removed:["a"],dropped:[]}),1);assert.equal(nextCombo(4,{removed:["a"],dropped:[]}),5);assert.equal(nextCombo(5,{removed:["a"],dropped:[]}),5);assert.equal(nextCombo(3,{removed:[],dropped:[]}),0);assert.equal(scoreResolution(3,0,1),300);assert.equal(scoreResolution(3,0,2),375)});

test("target-color objective can complete before the whole board",()=>{const c={...STAGES[20],shots:10,starStrongRatio:.5,starNormalRatio:.25,objective:{type:"clear_target_colors",targetColor:"cyan"}},b=new Map([["0,0","cyan"],["0,1","cyan"],["1,0","magenta"],["1,1","magenta"]]),e=new GameEngine({board:b,config:c});e.board.delete("0,0");e.board.delete("0,1");const r=e.finalizeTurn({removed:["0,0","0,1"],dropped:[]});assert.equal(r.status,"success");assert.equal(e.board.size,2);assert.equal(e.objectiveStatus().complete,true)});

test("clear-required-clusters objective tracks removed bubbles",()=>{const c={...STAGES[30],shots:10,objective:{type:"clear_required_clusters",targetCount:3}},b=new Map([["0,0","cyan"],["0,1","cyan"],["1,0","magenta"],["1,1","magenta"],["2,0","yellow"]]),e=new GameEngine({board:b,config:c});e.board.delete("0,0");e.board.delete("0,1");e.board.delete("1,0");const r=e.finalizeTurn({removed:["0,0","0,1","1,0"],dropped:[]});assert.equal(r.status,"success");assert.equal(e.objectiveStatus().current,3)});

test("rescue/drop objective state starts with tracked markers",()=>{for(const type of["rescue_marked","drop_anchors"]){const c={...STAGES[40],objective:{type,markerCount:2}},b=generateBoard(c),o=createObjectiveState(b,c);assert.equal(o.markers.size,2)}});

test("integrations are privacy-minimised and fail safe without providers",async()=>{const a=new AnalyticsAdapter();assert.equal(a.track("cd_shot",{level:2,shotCount:1,email:"blocked@example.com"}),true);assert.deepEqual(a.buffer[0].properties,{level:2,shotCount:1});assert.equal(a.track("unknown_event",{}),false);const ads=new AdPolicyAdapter();assert.equal(ads.canShowInterstitial({policyApproved:true,naturalBreak:true,firstSession:false}),false);assert.deepEqual(await ads.rewarded({policyApproved:true}),{shown:false,rewarded:false,reason:"unavailable"});const cross=new CrossPromoAdapter([{id:"color-dominion"},{id:"other-game"}]);assert.deepEqual(cross.choices("color-dominion"),[{id:"other-game"}])});

test("PWA repair uses a versioned complete core cache and deferred update activation",()=>{const sw=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");assert.match(sw,/color-dominion-v22-staging/);assert.match(sw,/src\/integrations\.js/);assert.match(sw,/CD-SFX-007-combo-rise-v1\.wav/);assert.doesNotMatch(sw,/install"[\s\S]{0,240}skipWaiting/);assert.match(sw,/SKIP_WAITING/)});
