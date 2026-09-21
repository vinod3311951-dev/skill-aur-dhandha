import{COLORS,CORE_STAGE_COUNT,WORLDS,COLS}from"./config.js";
import{keyOf,neighbors,fromKey}from"./grid.js";
import{seededRandom}from"./rng.js";

export const OBJECTIVE_TYPES=["clear_all","clear_target_colors","clear_required_clusters","rescue_marked","drop_anchors","dominion_claim"];
export const LEVEL_FAMILIES=[...OBJECTIVE_TYPES,"limited_shots"];

function familyFor(id){
  if(id<=5)return"clear_all";
  if(id<=20)return["clear_all","clear_target_colors"][(id-6)%2];
  if(id<=35)return["clear_target_colors","clear_required_clusters","clear_all"][(id-21)%3];
  if(id<=50)return["rescue_marked","clear_required_clusters","clear_target_colors"][(id-36)%3];
  if(id<=75)return["drop_anchors","dominion_claim","clear_target_colors","clear_required_clusters"][(id-51)%4];
  return OBJECTIVE_TYPES[(id-76)%OBJECTIVE_TYPES.length];
}

function objectiveFor(id,palette){
  const type=familyFor(id);
  if(type==="clear_target_colors")return{type,targetColor:palette[(id-1)%palette.length]};
  if(type==="clear_required_clusters")return{type,targetCount:Math.min(24,9+Math.floor((id-1)/20)*3)};
  if(type==="rescue_marked"||type==="drop_anchors")return{type,markerCount:2+(id%2)};
  if(type==="dominion_claim")return{type,targetScore:500+Math.floor((id-1)/20)*100};
  return{type:"clear_all"};
}

export function stageConfig(id){
  if(!Number.isInteger(id)||id<1||id>CORE_STAGE_COUNT)throw new RangeError("stage");
  const x=id-1,w=Math.floor(x/20),l=x%20,ps=Math.min(6,3+Math.floor(x/24)),fr=Math.min(8,4+Math.floor(l/5));
  const palette=COLORS.slice(0,ps),limitedShots=id>=16&&id%5===0,baseShots=Math.max(18,30-Math.floor(x/12));
  return{id,seed:`CD-V1-${id}`,worldIndex:w,world:WORLDS[w],palette,filledRows:fr,shots:Math.max(15,baseShots-(limitedShots?3:0)),limitedShots,objective:objectiveFor(id,palette),starStrongRatio:.5,starNormalRatio:.25};
}
export const STAGES=Array.from({length:CORE_STAGE_COUNT},(_,i)=>stageConfig(i+1));

export function generateBoard(c){
  const r=seededRandom(c.seed),b=new Map;
  for(let row=0;row<c.filledRows;row++)for(let col=0;col<COLS;col++){
    if(row===c.filledRows-1&&r()<.28)continue;
    b.set(keyOf(row,col),c.palette[Math.floor(r()*c.palette.length)]);
  }
  const opening=c.palette[Math.floor(r()*c.palette.length)];
  b.set(keyOf(0,0),opening);b.set(keyOf(0,1),opening);
  if(c.objective?.type==="clear_target_colors"){
    b.set(keyOf(0,2),c.objective.targetColor);b.set(keyOf(0,3),c.objective.targetColor);
  }
  return b;
}
export function eligibleColors(b){return[...new Set(b.values())]}
export function productiveColors(b){const out=new Set;for(const[k,c]of b){const[r,col]=fromKey(k);if(neighbors(r,col).some(([rr,cc])=>b.get(keyOf(rr,cc))===c))out.add(c)}return[...out]}
export function chooseNextColor(b,s){const useful=productiveColors(b),o=useful.length?useful:eligibleColors(b);if(!o.length)return null;const r=seededRandom(s);return o[Math.floor(r()*o.length)]}
export function hasPlayablePair(b){return productiveColors(b).length>0}
export function validateBoard(b,c){
  if(!(b instanceof Map))return{ok:false,reason:"not-map"};
  if(!b.size)return{ok:false,reason:"empty-opening"};
  for(const color of b.values())if(!c.palette.includes(color))return{ok:false,reason:"palette-violation"};
  if(!hasPlayablePair(b))return{ok:false,reason:"no-playable-pair"};
  if(c.objective?.type==="clear_target_colors"&&![...b.values()].includes(c.objective.targetColor))return{ok:false,reason:"target-color-absent"};
  const eligible=eligibleColors(b);return eligible.length?{ok:true,eligible}:{ok:false,reason:"no-eligible-color"};
}
export function generateValidBoard(c,maxAttempts=3){for(let i=0;i<maxAttempts;i++){const cfg=i===0?c:{...c,seed:`${c.seed}-recovery-${i}`};const board=generateBoard(cfg),v=validateBoard(board,c);if(v.ok)return{board,config:cfg,recovered:i>0,attempt:i+1}}throw new Error("board-generation-recovery-exhausted")}

export function selectObjectiveMarkers(board,config){
  const count=config.objective?.markerCount||0;if(!count)return[];
  const preferred=[...board.keys()].filter(k=>fromKey(k)[0]>0),fallback=[...board.keys()];
  const pool=(preferred.length>=count?preferred:fallback).slice();const rand=seededRandom(`${config.seed}-objective-markers`);
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
  return pool.slice(0,Math.min(count,pool.length));
}
