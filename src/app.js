import{COLOR_HEX,SYMBOLS,SAVE_KEY,SAVE_VERSION,CORE_STAGE_COUNT,WORLDS}from"./config.js";
import{cellCenter,fromKey}from"./grid.js";
import{STAGES,generateValidBoard}from"./stages.js";
import{GameEngine}from"./engine.js";
import{AnalyticsAdapter,AdPolicyAdapter,CrossPromoAdapter}from"./integrations.js";
import{enforceStagingGate}from"./staging-gate.js";
import{DominionPulseMusic}from"./music-engine.js";

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const screens={home:$("#home-screen"),map:$("#map-screen"),settings:$("#settings-screen"),how:$("#how-screen"),play:$("#play-screen"),error:$("#error-screen")};
const canvas=$("#game"),ctx=canvas.getContext("2d"),overlay=$("#result-overlay"),pauseOverlay=$("#pause-overlay"),bloom=$("#bloom-layer"),cascadeRestore=$("#cascade-restore"),cascadeFaded=$("#cascade-faded"),cascadeColor=$("#cascade-color");
const sl=$("#stage-label"),wl=$("#world-label"),sc=$("#score-label"),sh=$("#shots-label"),nc=$("#next-color"),objectiveLabel=$("#objective-label"),comboLabel=$("#combo-label"),rt=$("#result-title"),rk=$("#result-kicker"),rbody=$("#result-body"),pt=$("#progress-text"),st=$("#status-text"),offlinePill=$("#offline-pill"),storagePill=$("#storage-pill");
const faded=$("#restore-faded"),colorImg=$("#restore-color"),restorePreview=$("#restore-preview");
const sting=$("#restoration-sting"),launchSfx=$("#sfx-launch"),popSfx=$("#sfx-pop"),dropSfx=$("#sfx-drop"),comboSfx=$("#sfx-combo"),bloomSfx=$("#sfx-bloom"),failSfx=$("#sfx-fail");
const pulseMusic=new DominionPulseMusic({bpm:110});
const analytics=new AnalyticsAdapter(),adPolicy=new AdPolicyAdapter(),crossPromo=new CrossPromoAdapter([]);
let storageOk=true,storageNotice="";
let state=load(),engine=null,g=null,aim=null,last=performance.now(),paused=false,renderDirty=true,lastShinePaint=0;
let diagnosticLastAttachedEvent=null;
const frameSamples=[];

function defaults(){return{version:SAVE_VERSION,unlockedStage:1,currentStage:1,best:{},stars:{},cosmetics:[],streak:{count:0,lastDate:null},challenge:{},firstPlay:true,recentCrossPromo:{},settings:{music:true,sfx:true,haptics:true,reducedMotion:false}}}
function clampStage(v){const n=Number(v);return Number.isFinite(n)?Math.max(1,Math.min(CORE_STAGE_COUNT,Math.trunc(n))):1}
function normalizeState(raw){const base=defaults();if(!raw||typeof raw!=="object"||![1,SAVE_VERSION].includes(raw.version))return base;return{...base,...raw,version:SAVE_VERSION,unlockedStage:clampStage(raw.unlockedStage),currentStage:clampStage(raw.currentStage),best:raw.best&&typeof raw.best==="object"?raw.best:{},stars:raw.stars&&typeof raw.stars==="object"?raw.stars:{},settings:{...base.settings,...(raw.settings&&typeof raw.settings==="object"?raw.settings:{})}}}
function load(){try{const text=localStorage.getItem(SAVE_KEY);if(!text)return defaults();try{return normalizeState(JSON.parse(text))}catch{storageNotice="Saved progress was unreadable, so Color Dominion loaded safe defaults.";return defaults()}}catch{storageOk=false;storageNotice="Progress cannot be saved on this device right now; this session can still continue.";return defaults()}}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));storageOk=true}catch{storageOk=false;storageNotice="Progress cannot be saved on this device right now; this session can still continue."}refreshStorageNotice()}
function refreshStorageNotice(){storagePill.hidden=!storageNotice;storagePill.textContent=storageNotice}
function show(name){Object.entries(screens).forEach(([k,el])=>el.hidden=k!==name);if(name!=="play")pulseMusic.stop();if(name==="play")requestAnimationFrame(resize);if(name==="map")renderMap();if(name==="settings")syncSettings();if(name==="home")refreshHome()}
function refreshHome(){pt.textContent=`Stage ${state.currentStage} / ${CORE_STAGE_COUNT} • Unlocked ${state.unlockedStage}`;offlinePill.hidden=navigator.onLine;refreshStorageNotice()}
function safePlay(el){if(!el)return;try{el.currentTime=0;const p=el.play();if(p?.catch)p.catch(()=>{})}catch{}}
function sfx(el){if(state.settings.sfx)safePlay(el)}
function haptic(pattern=18){if(state.settings.haptics&&navigator.vibrate)navigator.vibrate(pattern)}
function browserReducedMotion(){return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??false}
function reducedMotionActive(){return state.settings.reducedMotion||browserReducedMotion()} function applySettings(){document.body.classList.toggle("reduced-motion",reducedMotionActive());[sting,launchSfx,popSfx,dropSfx,comboSfx,bloomSfx,failSfx].forEach(a=>a.muted=!state.settings.sfx);if(state.settings.music&&screens.play&&!screens.play.hidden&&!paused){pulseMusic.start().catch(()=>{})}else pulseMusic.stop()}
function syncSettings(){[["#music-toggle","music"],["#sfx-toggle","sfx"],["#haptics-toggle","haptics"],["#motion-toggle","reducedMotion"]].forEach(([sel,key])=>{$(sel).checked=!!state.settings[key]})}
function setSetting(key,val){state.settings[key]=val;save();applySettings()}

function worldSlug(name){return name.toLowerCase().replaceAll(" ","-")}
function worldAssets(name){const slug=worldSlug(name);return{faded:`./assets/worlds/${slug}/CD-WORLD-${slug}-faded-v1.svg`,restored:`./assets/worlds/${slug}/CD-WORLD-${slug}-restored-v1.svg`}}
function worldProgress(i){const start=i*20+1,end=Math.min(CORE_STAGE_COUNT,start+19),done=Array.from({length:end-start+1},(_,n)=>start+n).filter(id=>(state.stars[id]||0)>0||(state.best[id]||0)>0).length;return{start,end,done,pct:Math.round(done/(end-start+1)*100),unlocked:state.unlockedStage>=start}}
function renderMap(){const map=$("#world-map");map.innerHTML=WORLDS.map((w,i)=>{const p=worldProgress(i),a=worldAssets(w),restored=p.pct>=100?"restored":"",locked=p.unlocked?"":"locked",target=state.currentStage>=p.start&&state.currentStage<=p.end?state.currentStage:Math.min(p.end,state.unlockedStage);return `<article class="world-card ${restored} ${locked}" style="--world-image:url('${p.pct>0?a.restored:a.faded}')"><h3>${w}</h3><p>${p.unlocked?`${p.pct}% restored • Stages ${p.start}–${p.end}`:"Locked"}</p><div class="world-progress"><span style="width:${p.pct}%"></span></div><button class="secondary compact world-play" type="button" data-stage="${target}" ${p.unlocked?"":"disabled"}>${p.unlocked?`Play Stage ${target}`:"Locked"}</button></article>`}).join("");map.querySelectorAll("[data-stage]").forEach(b=>b.addEventListener("click",()=>{const id=Number(b.dataset.stage);if(Number.isInteger(id)&&id<=state.unlockedStage)start(id)}))}

function start(id=state.currentStage){cascadeRestore.classList.remove("active");try{state.currentStage=Math.max(1,Math.min(CORE_STAGE_COUNT,id));state.firstPlay=false;save();const c=STAGES[state.currentStage-1],generated=generateValidBoard(c,3);engine=new GameEngine({board:generated.board,config:{...c,seed:generated.config.seed}});pulseMusic.setWorld(c.world);overlay.hidden=true;pauseOverlay.hidden=true;paused=false;renderDirty=true;show("play");hud();applySettings();st.textContent="Aim anywhere above the launcher, then release."}catch(err){showError(err)}}
function showError(err){$("#error-message").textContent=`The board could not start safely (${err?.message||"unknown error"}). Retry this stage or return Home.`;show("error")}
function hud(){if(!engine)return;const objective=engine.objectiveStatus();sl.textContent=`Stage ${engine.config.id}`;wl.textContent=engine.config.world;sc.textContent=`Score ${engine.score}`;sh.textContent=`Shots ${engine.shotsLeft}`;objectiveLabel.textContent=objective.text;comboLabel.textContent=engine.combo>1?`Combo ×${engine.combo}`:"";nc.style.background=COLOR_HEX[engine.nextColor]||"transparent";nc.textContent=engine.nextColor?SYMBOLS[engine.nextColor]:"—"}
function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,r.width*d);canvas.height=Math.max(1,r.height*d);ctx.setTransform(d,0,0,d,0,0);const compactLandscape=r.height<300,launcherMargin=compactLandscape?20:58,heightCap=compactLandscape?Math.max(9,(r.height-launcherMargin-18)/15.5):24,R=Math.max(9,Math.min(24,r.width/18,heightCap)),bw=R*17;g={cols:8,radius:R,rowStep:R*1.72,left:Math.max(8,(r.width-bw)/2),top:18,boardWidth:bw,width:r.width,height:r.height,launcher:{x:r.width/2,y:r.height-launcherMargin}};renderDirty=true}
function hexRgb(hex){const n=parseInt(hex.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255]}
function mix(hex,target,amount){const [r,g,b]=hexRgb(hex),q=(a,b)=>Math.round(a+(b-a)*amount);return `rgb(${q(r,target[0])} ${q(g,target[1])} ${q(b,target[2])})`}
function alpha(hex,a){const [r,g,b]=hexRgb(hex);return `rgba(${r},${g},${b},${a})`}
const WORLD_TONES={"Dawn Gardens":["#18233f","#243a55","#10172b"],"River Lights":["#10273c","#174454","#0f1730"],"Festival Streets":["#2c173c","#51254c","#11162f"],"Sky Courtyards":["#18224c","#373268","#10162d"],"Prism Fort":["#1b173f","#36215c","#0c1730"]};
function paintPlayfieldBackground(){const t=WORLD_TONES[engine?.config?.world]||WORLD_TONES["Dawn Gardens"],bg=ctx.createLinearGradient(0,0,g.width,g.height);bg.addColorStop(0,t[0]);bg.addColorStop(.54,t[1]);bg.addColorStop(1,t[2]);ctx.fillStyle=bg;ctx.fillRect(0,0,g.width,g.height);const glow=ctx.createRadialGradient(g.width*.72,g.height*.18,0,g.width*.72,g.height*.18,g.width*.72);glow.addColorStop(0,engine?.config?.world==="Prism Fort"?"rgba(217,75,203,.16)":"rgba(25,191,211,.10)");glow.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=glow;ctx.fillRect(0,0,g.width,g.height)}
function bubble(x,y,R,c){const base=COLOR_HEX[c],light=mix(base,[255,255,255],.58),mid=mix(base,[255,255,255],.16),deep=mix(base,[17,24,52],.44),dark=mix(base,[5,9,25],.58),motion=reducedMotionActive()?0:(Math.sin(performance.now()/820+x*.021+y*.017)+1)/2;ctx.save();ctx.shadowColor=alpha(base,.46);ctx.shadowBlur=Math.max(4,R*.48);ctx.shadowOffsetY=Math.max(1,R*.10);const rim=ctx.createRadialGradient(x-R*.34,y-R*.40,Math.max(1,R*.04),x+R*.12,y+R*.15,R*1.20);rim.addColorStop(0,"rgba(255,255,255,.99)");rim.addColorStop(.10,light);rim.addColorStop(.34,mid);rim.addColorStop(.68,base);rim.addColorStop(.88,deep);rim.addColorStop(1,dark);ctx.beginPath();ctx.arc(x,y,R-1,0,Math.PI*2);ctx.fillStyle=rim;ctx.fill();ctx.shadowColor="transparent";const inner=ctx.createRadialGradient(x-R*.18,y-R*.20,R*.04,x,y,R*.78);inner.addColorStop(0,"rgba(255,255,255,.26)");inner.addColorStop(.56,alpha(base,.10));inner.addColorStop(1,"rgba(2,6,18,.20)");ctx.beginPath();ctx.arc(x,y,R*.79,0,Math.PI*2);ctx.fillStyle=inner;ctx.fill();ctx.strokeStyle="rgba(255,255,255,.78)";ctx.lineWidth=Math.max(1.5,R*.075);ctx.beginPath();ctx.arc(x,y,R-1.2,0,Math.PI*2);ctx.stroke();ctx.strokeStyle="rgba(7,12,31,.34)";ctx.lineWidth=Math.max(1,R*.045);ctx.beginPath();ctx.arc(x,y,R-3.2,0,Math.PI*2);ctx.stroke();ctx.fillStyle="rgba(255,255,255,.52)";ctx.beginPath();ctx.ellipse(x-R*.31+motion*R*.035,y-R*.36,R*.30,R*.14,-.48,0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(255,255,255,.22)";ctx.beginPath();ctx.ellipse(x+R*.24-motion*R*.03,y+R*.28,R*.19,R*.075,-.48,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`rgba(255,255,255,${.18+motion*.18})`;ctx.lineWidth=Math.max(1,R*.055);ctx.beginPath();ctx.arc(x-R*.03,y-R*.02,R*.67,-2.45,-1.1);ctx.stroke();ctx.fillStyle="#fff";ctx.shadowColor="rgba(0,0,0,.34)";ctx.shadowBlur=Math.max(1,R*.08);ctx.font=`800 ${Math.max(13,R*.78)}px system-ui`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(SYMBOLS[c],x,y+.5);ctx.restore()}
function marker(x,y,R,type){ctx.beginPath();ctx.arc(x,y,Math.max(6,R*.42),0,Math.PI*2);ctx.fillStyle="#10172b";ctx.fill();ctx.strokeStyle="#f2c94c";ctx.lineWidth=2;ctx.stroke();ctx.fillStyle="#f2c94c";ctx.font=`800 ${Math.max(9,R*.42)}px system-ui`;ctx.fillText(type==="rescue_marked"?"R":"A",x,y)}
function draw(){if(!g||!engine)return;paintPlayfieldBackground();for(const[k,c]of engine.board){const[r,col]=fromKey(k),p=cellCenter(r,col,g);bubble(p.x,p.y,g.radius,c);if(engine.objectiveState.markers?.has(k))marker(p.x+g.radius*.5,p.y-g.radius*.5,g.radius,engine.objectiveState.type)}if(aim&&!engine.projectile){const dx=aim.x-g.launcher.x,dy=Math.min(-24,aim.y-g.launcher.y),l=Math.hypot(dx,dy)||1;ctx.setLineDash([7,9]);ctx.strokeStyle="#fff";ctx.beginPath();ctx.moveTo(g.launcher.x,g.launcher.y);ctx.lineTo(g.launcher.x+dx/l*170,g.launcher.y+dy/l*170);ctx.stroke();ctx.setLineDash([])}ctx.fillStyle="#18213A";ctx.beginPath();ctx.arc(g.launcher.x,g.launcher.y+8,g.radius*1.4,Math.PI,0);ctx.fill();if(engine.nextColor)bubble(g.launcher.x,g.launcher.y,g.radius*.86,engine.nextColor);if(engine.projectile)bubble(engine.projectile.x,engine.projectile.y,g.radius*.88,engine.projectile.color)}
function pulseBloom(){if(reducedMotionActive()return;bloom.classList.remove("active");void bloom.offsetWidth;bloom.classList.add("active")}
function showRestore(world){const a=worldAssets(world);faded.src=a.faded;colorImg.src=a.restored;restorePreview.classList.remove("bloom");void restorePreview.offsetWidth;restorePreview.classList.add("bloom");pulseBloom();sfx(bloomSfx)}function showCascadeRestore(world){
const a=worldAssets(world);
cascadeFaded.src=a.faded;
cascadeColor.src=a.restored;
cascadeRestore.classList.remove("active");
void cascadeRestore.offsetWidth;
cascadeRestore.classList.add("active");
sfx(bloomSfx);
}
function isSignatureCascade(e){
return e?.type==="attached"&&e.removed?.length>=3&&e.dropped?.length>=1;
}
function finish(){if(!engine||engine.status==="playing")return;overlay.hidden=false;if(engine.status==="success"){const stars=engine.stars(),id=engine.config.id;rk.textContent="Dominion restored";rt.textContent="Territory Cleared";rbody.textContent=`${"★".repeat(stars)}${"☆".repeat(3-stars)} • Score ${engine.score} • ${engine.config.world} blooms again`;state.best[id]=Math.max(state.best[id]||0,engine.score);state.stars[id]=Math.max(state.stars[id]||0,stars);state.unlockedStage=Math.min(CORE_STAGE_COUNT,Math.max(state.unlockedStage,id+1));if(id<CORE_STAGE_COUNT)state.currentStage=id+1;save();$("#next-btn").hidden=id>=CORE_STAGE_COUNT;showRestore(engine.config.world);safePlay(sting);haptic([25,35,60]);analytics.track("cd_star_result",{level:id,stars,score:engine.score,result:"success"});analytics.track("cd_world_claim",{level:id,result:"success"})}else{rk.textContent="Try again";rt.textContent="Out of Shots";rbody.textContent=`Score ${engine.score} • Retry is always available`;$("#next-btn").hidden=true;sfx(failSfx);haptic(25);analytics.track("cd_objective_progress",{level:engine.config.id,result:"failure",score:engine.score})}}
function loop(now){const frameDelta=now-last;if(frameDelta>0&&frameDelta<1000){frameSamples.push(frameDelta);if(frameSamples.length>1200)frameSamples.shift()}const dt=Math.min(.025,frameDelta/1000);last=now;if(engine&&g&&!document.hidden&&!paused){const e=engine.update(dt,g);if(e?.type==="attached"){diagnosticLastAttachedEvent=e;hud();if(e.removed.length){sfx(popSfx);haptic(12);pulseBloom();analytics.track("cd_match",{level:engine.config.id,count:e.removed.length,combo:e.combo,score:engine.score})}if(e.dropped.length){sfx(dropSfx);analytics.track("cd_drop",{level:engine.config.id,count:e.dropped.length,combo:e.combo})}if(isSignatureCascade(e))showCascadeRestore(engine.config.world);if(e.combo>1){sfx(comboSfx);analytics.track("cd_combo",{level:engine.config.id,combo:e.combo})}analytics.track("cd_objective_progress",{level:engine.config.id,objectiveType:e.objective.type,count:e.objective.current,score:engine.score});st.textContent=e.removed.length?`Match ${e.removed.length}${e.dropped.length?` • Drop ${e.dropped.length}`:""}${e.combo>1?` • Combo ×${e.combo}`:""}`:"No match — line up a group of 3.";finish()}const shineDue=!reducedMotionActive()&&now-lastShinePaint>=160;if(engine.projectile||aim||e||renderDirty||shineDue){draw();renderDirty=false;if(shineDue)lastShinePaint=now}}requestAnimationFrame(loop)}
function pos(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
canvas.addEventListener("pointerdown",e=>{if(engine&&!paused&&!engine.projectile&&engine.status==="playing"){canvas.setPointerCapture?.(e.pointerId);aim=pos(e);renderDirty=true}})
canvas.addEventListener("pointermove",e=>{if(aim){aim=pos(e);renderDirty=true}})
canvas.addEventListener("pointerup",e=>{if(aim&&engine&&g&&!paused){const fired=engine.fire(g.launcher,pos(e));if(fired){sfx(launchSfx);haptic(8);analytics.track("cd_shot",{level:engine.config.id,seed:engine.config.seed,objectiveType:engine.objectiveState.type,shotCount:engine.shotNumber+1,activeColorCount:new Set(engine.board.values()).size})}aim=null;renderDirty=true}})

$("#play-btn").onclick=()=>start();
$("#how-play-btn").onclick=()=>start();
$("#retry-btn").onclick=()=>start(engine?.config.id||state.currentStage);
$("#pause-retry-btn").onclick=()=>start(engine?.config.id||state.currentStage);
$("#next-btn").onclick=()=>start(state.currentStage);
$("#home-btn").onclick=()=>show("home");
$("#pause-home-btn").onclick=()=>{paused=false;show("home");applySettings()};
$("#map-btn").onclick=()=>show("map");
const reviewLevelInput=$("#review-level-input"),reviewLevelStatus=$("#review-level-status");
$("#review-level-go").onclick=()=>{
  const raw=Number(reviewLevelInput.value),id=Math.trunc(raw);
  if(!Number.isFinite(raw)||id<1||id>CORE_STAGE_COUNT){
    reviewLevelStatus.textContent=`Enter a stage from 1 to ${CORE_STAGE_COUNT}.`;
    return;
  }
  reviewLevelStatus.textContent=`Opening Stage ${id} in private review mode.`;
  start(id);
};
$("#result-map-btn").onclick=()=>show("map");
$("#settings-btn").onclick=()=>show("settings");
$("#how-btn").onclick=()=>show("how");
$("#settings-how-btn").onclick=()=>show("how");
$$("[data-home]").forEach(b=>b.onclick=()=>{paused=false;show("home");applySettings()});
$("#pause-btn").onclick=()=>{paused=true;pauseOverlay.hidden=false;pulseMusic.stop()};
$("#resume-btn").onclick=()=>{paused=false;pauseOverlay.hidden=true;applySettings()};
$("#pause-settings-btn").onclick=()=>{pauseOverlay.hidden=true;show("settings")};
$("#error-retry-btn").onclick=()=>start(state.currentStage);
$("#reset-btn").onclick=()=>{if(confirm("Reset all Color Dominion progress on this device?")){try{localStorage.removeItem(SAVE_KEY)}catch{}state=defaults();storageNotice=storageOk?"":"Progress cannot be saved on this device right now; this session can still continue.";save();syncSettings();show("home")}};
[["#music-toggle","music"],["#sfx-toggle","sfx"],["#haptics-toggle","haptics"],["#motion-toggle","reducedMotion"]].forEach(([sel,key])=>$(sel).addEventListener("change",e=>setSetting(key,e.target.checked)));
window.addEventListener("online",refreshHome);window.addEventListener("offline",refreshHome);window.onresize=resize;
document.addEventListener("visibilitychange",()=>{if(document.hidden)pulseMusic.stop();else applySettings()});
window.addEventListener("error",e=>{if(!screens.play.hidden)showError(e.error||new Error(e.message))});
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));window.__CD_DIAGNOSTICS__={
snapshot:()=>({stage:engine?.config.id||state.currentStage,status:engine?.status||"home",shotsLeft:engine?.shotsLeft??null,score:engine?.score??0,objective:engine?.objectiveStatus?.()||null,frameSampleCount:frameSamples.length,storageOk,online:navigator.onLine,adsEnabled:Boolean(adPolicy.provider),crossPromoChoices:crossPromo.choices("color-dominion").length,bubbleIdentity:"factory-x-jelly-glass-v2",music:pulseMusic.snapshot()}),
frameSamples:()=>frameSamples.slice(),
installSignatureFixture:()=>{
if(!engine||engine.status!=="playing")return false;
engine.board=new Map([
["0,0","blue"],
["0,1","blue"],
["1,1","yellow"],
["0,6","red"],
["1,6","green"]
]);
engine.projectile=null;
engine.nextColor="blue";
diagnosticLastAttachedEvent=null;
renderDirty=true;
hud();
return true;
},
signatureFixture:()=>({
board:[
["0,0","blue"],
["0,1","blue"],
["1,1","yellow"],
["0,6","red"],
["1,6","green"]
],
shotColor:"blue",
expectedAttachKey:"1,0"
}),
isSignatureCascade:e=>isSignatureCascade(e),
geometry:()=>g?{
radius:g.radius,
left:g.left,
top:g.top,
rowStep:g.rowStep,
cols:g.cols,
boardWidth:g.boardWidth,
width:g.width,
height:g.height,
launcher:{...g.launcher}
}:null,
lastAttachedEvent:()=>diagnosticLastAttachedEvent?{
type:diagnosticLastAttachedEvent.type,
attachKey:diagnosticLastAttachedEvent.attachKey,
removed:[...diagnosticLastAttachedEvent.removed],
dropped:[...diagnosticLastAttachedEvent.dropped]
}:null
};
await enforceStagingGate();applySettings();refreshHome();show("home");resize();requestAnimationFrame(loop);
