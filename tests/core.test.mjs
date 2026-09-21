import test from"node:test";import assert from"node:assert/strict";import{CORE_STAGE_COUNT}from"../src/config.js";import{STAGES,generateBoard,generateValidBoard,validateBoard,productiveColors,chooseNextColor}from"../src/stages.js";
test("100 stages",()=>{assert.equal(CORE_STAGE_COUNT,100);assert.equal(STAGES.length,100)});
test("all openings valid",()=>{for(const c of STAGES)assert.equal(validateBoard(generateBoard(c),c).ok,true)});
test("bounded deterministic recovery returns valid opening",()=>{for(const c of STAGES.slice(0,10)){const r=generateValidBoard(c,3);assert.equal(validateBoard(r.board,c).ok,true);assert.ok(r.attempt>=1&&r.attempt<=3)}});
test("next color prefers a productive color when one exists",()=>{const b=new Map([["0,0","cyan"],["0,1","cyan"],["1,0","magenta"]]);assert.deepEqual(productiveColors(b),["cyan"]);assert.equal(chooseNextColor(b,"seed"),"cyan")});
