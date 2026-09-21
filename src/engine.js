import{keyOf,fromKey,neighbors,cellCenter,nearestEmptyNeighbor}from"./grid.js";
import{chooseNextColor,eligibleColors,selectObjectiveMarkers}from"./stages.js";

export function sameColorGroup(b,s){const c=b.get(s);if(!c)return new Set;const seen=new Set([s]),q=[s];while(q.length){const cur=q.shift(),[r,col]=fromKey(cur);for(const[nr,nc]of neighbors(r,col)){const k=keyOf(nr,nc);if(!seen.has(k)&&b.get(k)===c){seen.add(k);q.push(k)}}}return seen}
export function ceilingConnected(b){const seen=new Set,q=[];for(const k of b.keys()){const[r]=fromKey(k);if(r===0){seen.add(k);q.push(k)}}while(q.length){const cur=q.shift(),[r,c]=fromKey(cur);for(const[nr,nc]of neighbors(r,c)){const k=keyOf(nr,nc);if(b.has(k)&&!seen.has(k)){seen.add(k);q.push(k)}}}return seen}
export function resolveAttach(b,k){const m=sameColorGroup(b,k),removed=[],dropped=[];if(m.size>=3){for(const x of m){b.delete(x);removed.push(x)}const a=ceilingConnected(b);for(const x of[...b.keys()])if(!a.has(x)){b.delete(x);dropped.push(x)}}return{removed,dropped}}

export function scoreResolution(removedCount,droppedCount,combo){const base=removedCount*100+droppedCount*150;const multiplier=base>0?1+Math.max(0,combo-1)*.25:1;return Math.round(base*multiplier)}
export function nextCombo(current,{removed=[],dropped=[]}){return removed.length||dropped.length?Math.min(5,current+1):0}

export function createObjectiveState(board,config){
  const objective=config.objective||{type:"clear_all"};
  if(objective.type==="clear_target_colors"){
    const initial=[...board.values()].filter(c=>c===objective.targetColor).length;
    return{type:objective.type,targetColor:objective.targetColor,initial};
  }
  if(objective.type==="clear_required_clusters")return{type:objective.type,current:0,target:Math.min(objective.targetCount||9,Math.max(3,board.size-2))};
  if(objective.type==="rescue_marked"||objective.type==="drop_anchors"){
    const markers=new Set(selectObjectiveMarkers(board,config));return{type:objective.type,markers,initial:markers.size};
  }
  if(objective.type==="dominion_claim")return{type:objective.type,target:Math.min(objective.targetScore||500,Math.max(300,board.size*100))};
  return{type:"clear_all",initial:board.size};
}

export class GameEngine{
  constructor({board,config}){this.board=new Map(board);this.config=config;this.shotsLeft=config.shots;this.score=0;this.shotNumber=0;this.status="playing";this.projectile=null;this.combo=0;this.completionAwarded=false;this.objectiveState=createObjectiveState(this.board,config);this.nextColor=chooseNextColor(this.board,`${config.seed}-next-0`)}
  fire(o,t,s=720){if(this.status!=="playing"||this.projectile||!this.nextColor)return false;const dx=t.x-o.x,dy=Math.min(-24,t.y-o.y),l=Math.hypot(dx,dy)||1,nx=dx/l,ny=dy/l;if(ny>-.12)return false;this.projectile={x:o.x,y:o.y,vx:nx*s,vy:ny*s,color:this.nextColor};return true}
  objectiveStatus(){
    const o=this.objectiveState;
    if(o.type==="clear_all")return{type:o.type,current:Math.max(0,o.initial-this.board.size),target:o.initial,remaining:this.board.size,complete:this.board.size===0,text:`Clear the board • ${this.board.size} remaining`};
    if(o.type==="clear_target_colors"){const remaining=[...this.board.values()].filter(c=>c===o.targetColor).length;const current=Math.max(0,o.initial-remaining);return{type:o.type,current,target:o.initial,remaining,complete:remaining===0,text:`Clear ${o.targetColor} • ${remaining} remaining`}}
    if(o.type==="clear_required_clusters")return{type:o.type,current:o.current,target:o.target,complete:o.current>=o.target,text:`Clear clustered bubbles • ${o.current}/${o.target}`};
    if(o.type==="rescue_marked"||o.type==="drop_anchors"){const current=o.initial-o.markers.size,label=o.type==="rescue_marked"?"Free marked bubbles":"Drop anchored objects";return{type:o.type,current,target:o.initial,remaining:o.markers.size,complete:o.markers.size===0,text:`${label} • ${current}/${o.initial}`}}
    return{type:o.type,current:Math.min(this.score,o.target),target:o.target,complete:this.score>=o.target,text:`Claim Dominion • ${Math.min(this.score,o.target)}/${o.target} score`};
  }
  updateObjective({removed=[],dropped=[]}){
    const o=this.objectiveState;
    if(o.type==="clear_required_clusters")o.current+=removed.length;
    if(o.markers){const resolved=new Set([...removed,...dropped]);for(const k of[...o.markers])if(resolved.has(k)||!this.board.has(k))o.markers.delete(k)}
  }
  finalizeTurn(z){
    this.shotsLeft--;this.shotNumber++;this.combo=nextCombo(this.combo,z);const scoreDelta=scoreResolution(z.removed.length,z.dropped.length,this.combo);this.score+=scoreDelta;this.updateObjective(z);
    let objective=this.objectiveStatus();
    if(objective.complete){this.status="success";if(!this.completionAwarded){this.score+=500+Math.max(0,this.shotsLeft)*10;this.completionAwarded=true;objective=this.objectiveStatus()}}
    else if(this.shotsLeft<=0)this.status="failure";
    const o=eligibleColors(this.board);this.nextColor=this.status==="playing"&&o.length?chooseNextColor(this.board,`${this.config.seed}-next-${this.shotNumber}`):null;
    return{type:"attached",...z,status:this.status,combo:this.combo,scoreDelta,objective};
  }
  update(dt,g){if(!this.projectile||this.status!=="playing")return null;const p=this.projectile;p.x+=p.vx*dt;p.y+=p.vy*dt;const r=g.radius,L=g.left+r,R=g.left+g.boardWidth-r;if(p.x<L){p.x=L+(L-p.x);p.vx=Math.abs(p.vx)}else if(p.x>R){p.x=R-(p.x-R);p.vx=-Math.abs(p.vx)}let hit=null;for(const k of this.board.keys()){const[row,col]=fromKey(k),c=cellCenter(row,col,g);if((c.x-p.x)**2+(c.y-p.y)**2<=(r*1.9)**2){hit=k;break}}if(p.y<=g.top+r||hit){let target=null;if(hit){const[a,b]=fromKey(hit);target=nearestEmptyNeighbor(this.board,a,b,p.x,p.y,g)}else{let bc=0,b=Infinity;for(let col=0;col<g.cols;col++){const c=cellCenter(0,col,g),d=Math.abs(c.x-p.x);if(d<b){b=d;bc=col}}if(!this.board.has(keyOf(0,bc)))target=[0,bc]}if(!target){this.projectile=null;return{type:"blocked"}}const k=keyOf(target[0],target[1]);this.board.set(k,p.color);this.projectile=null;const z=resolveAttach(this.board,k);return this.finalizeTurn({attachKey:k,...z})}return null}
  stars(){if(this.status!=="success")return 0;const r=this.shotsLeft/this.config.shots;return r>=this.config.starStrongRatio?3:r>=this.config.starNormalRatio?2:1}
}
