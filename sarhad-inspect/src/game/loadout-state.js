export const LOADOUTS = [
  { id:'vector-needle', name:'Vector Needle', family:'precision', capacity:8, reloadMs:1250, swapCooldownMs:360, fire:{ duration:.105, layers:[{type:'sine',from:760,to:520,gain:.032},{type:'triangle',from:1180,to:780,gain:.014}] } },
  { id:'pulse-carbine', name:'Pulse Carbine', family:'rapid', capacity:18, reloadMs:1550, swapCooldownMs:340, fire:{ duration:.082, layers:[{type:'square',from:640,to:520,gain:.024},{type:'sine',from:980,to:760,gain:.012}] } },
  { id:'twin-relay', name:'Twin Relay', family:'rapid', capacity:14, reloadMs:1480, swapCooldownMs:340, fire:{ duration:.09, layers:[{type:'triangle',from:820,to:590,gain:.027},{type:'sine',from:1220,to:850,gain:.011}] } },
  { id:'arc-driver', name:'Arc Driver', family:'precision', capacity:7, reloadMs:1320, swapCooldownMs:360, fire:{ duration:.12, layers:[{type:'sawtooth',from:520,to:310,gain:.022},{type:'sine',from:1050,to:690,gain:.014}] } },
  { id:'slate-heavy', name:'Slate Heavy', family:'heavy', capacity:6, reloadMs:2100, swapCooldownMs:420, fire:{ duration:.16, layers:[{type:'square',from:250,to:145,gain:.034},{type:'triangle',from:420,to:240,gain:.017}] } },
  { id:'echo-repeater', name:'Echo Repeater', family:'rapid', capacity:20, reloadMs:1650, swapCooldownMs:340, fire:{ duration:.095, layers:[{type:'sine',from:700,to:560,gain:.024},{type:'triangle',from:930,to:610,gain:.012}] } },
  { id:'beacon-launcher', name:'Beacon Launcher', family:'launcher', capacity:4, reloadMs:2350, swapCooldownMs:460, fire:{ duration:.22, layers:[{type:'triangle',from:210,to:130,gain:.036},{type:'sine',from:360,to:190,gain:.018}] } },
  { id:'prism-rifle', name:'Prism Rifle', family:'precision', capacity:9, reloadMs:1380, swapCooldownMs:360, fire:{ duration:.11, layers:[{type:'sine',from:900,to:640,gain:.03},{type:'sine',from:1320,to:980,gain:.01}] } },
  { id:'rail-dart', name:'Rail Dart', family:'heavy', capacity:5, reloadMs:2050, swapCooldownMs:430, fire:{ duration:.145, layers:[{type:'sawtooth',from:310,to:170,gain:.028},{type:'triangle',from:590,to:330,gain:.016}] } },
  { id:'field-catapult', name:'Field Catapult', family:'catapult', capacity:3, reloadMs:1900, swapCooldownMs:420, fire:{ duration:.24, layers:[{type:'sine',from:180,to:310,gain:.028},{type:'triangle',from:430,to:170,gain:.014}] } },
  { id:'siege-rocket', name:'Siege Rocket', family:'rocket', capacity:2, reloadMs:3100, swapCooldownMs:520, fire:{ duration:.28, layers:[{type:'sawtooth',from:170,to:90,gain:.032},{type:'triangle',from:290,to:135,gain:.02},{type:'sine',from:520,to:180,gain:.008}] } }
];

const byId=(id)=>LOADOUTS.find((item)=>item.id===id)??LOADOUTS[0];

export function createLoadoutState(selectedId='vector-needle'){
  const id=byId(selectedId).id;
  return {
    selectedId:id,
    magazines:Object.fromEntries(LOADOUTS.map((item)=>[item.id,{ammo:item.capacity,reloadingUntil:0}])),
    swapReadyAt:0
  };
}

export function syncLoadoutState(state,nowMs){
  const now=Math.max(0,Number(nowMs)||0);
  let changed=false;
  const magazines={...state.magazines};
  for(const item of LOADOUTS){
    const current=magazines[item.id]??{ammo:item.capacity,reloadingUntil:0};
    if(current.reloadingUntil>0&&now>=current.reloadingUntil){
      magazines[item.id]={ammo:item.capacity,reloadingUntil:0};
      changed=true;
    }
  }
  return changed?{...state,magazines}:state;
}

export function selectedLoadoutDefinition(state){
  return byId(state?.selectedId);
}

export function loadoutReadiness(state,nowMs){
  const synced=syncLoadoutState(state,nowMs);
  const def=selectedLoadoutDefinition(synced);
  const mag=synced.magazines[def.id]??{ammo:def.capacity,reloadingUntil:0};
  const now=Math.max(0,Number(nowMs)||0);
  return {
    state:synced,
    definition:def,
    ammo:mag.ammo,
    capacity:def.capacity,
    reloadRemainingMs:Math.max(0,mag.reloadingUntil-now),
    reloading:mag.reloadingUntil>now,
    canReload:mag.ammo<def.capacity&&mag.reloadingUntil<=now,
    swapRemainingMs:Math.max(0,(synced.swapReadyAt??0)-now),
    canSwap:(synced.swapReadyAt??0)<=now
  };
}

export function consumeLoadoutShot(state,nowMs){
  const ready=loadoutReadiness(state,nowMs);
  if(ready.reloading) return {state:ready.state,fired:false,reason:'reloading'};
  if(ready.ammo<=0) return {state:ready.state,fired:false,reason:'empty'};
  const magazines={...ready.state.magazines,[ready.definition.id]:{ammo:ready.ammo-1,reloadingUntil:0}};
  return {state:{...ready.state,magazines},fired:true,reason:'fired'};
}

export function beginLoadoutReload(state,nowMs){
  const ready=loadoutReadiness(state,nowMs);
  if(!ready.canReload) return {state:ready.state,started:false};
  const magazines={...ready.state.magazines,[ready.definition.id]:{ammo:ready.ammo,reloadingUntil:Math.max(0,Number(nowMs)||0)+ready.definition.reloadMs}};
  return {state:{...ready.state,magazines},started:true};
}

export function selectLoadout(state,nextId,nowMs){
  const ready=loadoutReadiness(state,nowMs);
  const next=byId(nextId);
  if(!ready.canSwap||next.id===ready.state.selectedId) return {state:ready.state,swapped:false};
  return {state:{...ready.state,selectedId:next.id,swapReadyAt:Math.max(0,Number(nowMs)||0)+next.swapCooldownMs},swapped:true};
}

export function cycleLoadout(state,nowMs){
  const ready=loadoutReadiness(state,nowMs);
  if(!ready.canSwap) return {state:ready.state,swapped:false};
  const index=LOADOUTS.findIndex((item)=>item.id===ready.state.selectedId);
  const next=LOADOUTS[(index+1)%LOADOUTS.length];
  return selectLoadout(ready.state,next.id,nowMs);
}
