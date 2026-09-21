import{COLOR_HEX,SYMBOLS,SAVE_KEY,SAVE_VERSION,CORE_STAGE_COUNT,WORLDS}from"./config.js";
import{cellCenter,fromKey}from"./grid.js";
import{STAGES,generateValidBoard}from"./stages.js";
import{GameEngine}from"./engine.js";
import{AnalyticsAdapter,AdPolicyAdapter,CrossPromoAdapter}from"./integrations.js";
import{enforceStagingGate}from"./staging-gate.js";

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const screens={home:$("#home-screen"),map:$("#map-screen"),settings:$("#settings-screen"),how:$("#how-screen"),play:$("#play-screen"),error:$("#error-screen")};
const canvas=$("#game"),ctx=canvas.getContext("2d"),overlay=$("#result-overlay"),pauseOverlay=$("#pause-overlay"),bloom=$("#bloom-layer");
const sl=$("#stage-label"),wl=$("#world-label"),sc=$("#score-label"),sh=$("#shots-label"),nc=$("#next-color"),objectiveLabel=$("#objective-label"),comboLabel=$("#combo-label"),rt=$("#result-title"),rk=$("#result-kicker"),rbody=$("#result-body"),pt=$("#progress-text"),st=$("#status-text"),offlinePill=$("#offline-pill"),storagePill=$("#storage-pill");
const faded=$("#restore-faded"),colorImg=$("#restore-color"),restorePreview=$("#restore-preview");
const music=$("#music"),sting=$("#restoration-sting"),launchSfx=$("#sfx-launch"),popSfx=$("#sfx-pop"),dropSfx=$("#sfx-drop"),comboSfx=$("#sfx-combo"),bloomSfx=$("#sfx-bloom"),failSfx=$("#sfx-fail");
const analytics=new AnalyticsAdapter(),adPolicy=new AdPolicyAdapter(),crossPromo=new CrossPromoAdapter([]);
let storageOk=true,storageNotice="";
let state=load(),engine=null,g=null,aim=null,last=performance.now(),paused=false,renderDirty=true;
const frameSamples=[];

function defaults(){return{version:SAVE_VERSION,unlockedStage:1,currentStage:1,best:{},stars:{},cosmetics:[],streak:{count:0,lastDate:null},challenge:{},firstPlay:true,recentCrossPromo:{},settings:{music:true,sfx:true,haptics:true,reducedMotion:false}}}
function clampStage(v){const n=Number(v);return Number.isFinite(n)?Math.max(1,Math.min(CORE_STAGE_COUNT,Math.trunc(n))):1}
function normalizeState(raw){const base=defaults();if(!raw||typeof raw!=="object"||![1,SAVE_VERSION].includes(raw.version))return base;return{...base,...raw,version:SAVE_VERSION,unlockedStage:clampStage(raw.unlockedStage),currentStage:clampStage(raw.currentStage),best:raw.best&&typeof raw.best==="object"?raw.best:{},stars:raw.stars&&typeof raw.stars==="object"?raw.stars:{},settings:{...base.settings,...(raw.settings&&typeof raw.settings==="object"?raw.settings:{})}}}
function load(){try{const text=localStorage.getItem(SAVE_KEY);if(!text)return defaults();try{return normalizeState(JSON.parse(text))}catch{storageNotice="Saved progress was unreadable, so Color Dominion loaded safe defaults.";return defaults()}}catch{storageOk=false;storageNotice="Progress cannot be saved on this device right now; this session can still continue.";return defaults()}}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));storageOk=true}catch{storageOk=false;storageNotice="Progress cannot be saved on this device right now; this session can still continue."}refreshStorageNotice()}
function refreshStorageNotice(){storagePill.hidden=!storageNotice;storagePill.textContent=storageNotice}
function show(name){Object.entries(screens).forEach(([k,el])=>el.hidden=k!==name);if(name==="play")requestAnimationFrame(resize);if(name==="map")renderMap();if(name==="settings")syncSettings();if(name==="home")refreshHome()}
function refreshHome(){pt.textContent=`Stage ${state.currentStage} / ${CORE_STAGE_COUNT} • Unlocked ${state.unlockedStage}`;offlinePill.hidden=navigator.onLine;refreshStorageNotice()}
function safePlay(el){if(!el)return;try{el.currentTime=0;const p=el.play();if(p?.catch)p.catch(()=>{})}catch{}}
function sfx(el){if(state.settings.sfx)safePlay(el)}
function haptic(pattern=18){if(state.settings.haptics&&navigator.vibrate)navigator.vibrate(pattern)}
function applySettings(){document.body.classList.toggle("reduced-motion",state.settings.reducedMotion);music.muted=!state.settings.music;[sting,launchSfx,popSfx,dropSfx,comboSfx,bloomSfx,failSfx].forEach(a=>a.muted=!state.settings.sfx);if(state.settings.music&&screens.play&&!screens.play.hidden){const p=music.play();if(p?.catch)p.catch(()=>{})}else music.pause()}
function syncSettings(){[["#music-toggle","music"],["#sfx-toggle","sfx"],["#haptics-toggle","haptics"],["#motion-toggle","reducedMotion"]].forEach(([sel,key])=>{$(sel).checked=!!state.settings[key]})}
function setSetting(key,val){state.settings[key]=val;save();applySettings()}

function worldSlug(name){return name.toLowerCase().replaceAll(" ","-")}
function worldAssets(name){const slug=worldSlug(name);return{faded:`./assets/worlds/${slug}/CD-WORLD-${slug}-faded-v1.svg`,restored:`./assets/worlds/${slug}/CD-WORLD-${slug}-restored-v1.svg`}}
function worldProgress(i){const start=i*20+1,end=Math.min(CORE_STAGE_COUNT,start+19),done=Array.from({length:end-start+1},(_,n)=>start+n).filter(id=>(state.stars[id]||0)>0||(state.best[id]||0)>0).length;return{start,end,done,pct:Math.round(done/(end-start+1)*100),unlocked:state.unlockedStage>=start}}
function renderMap(){const map=$("#world-map");map.innerHTML=WORLDS.map((w,i)=>{const p=worldProgress(i),a=worldAssets(w),restored=p.pct>=100?"restored":"",locked=p.unlocked?"":"locked",target=state.currentStage>=p.start&&state.currentStage<=p.end?state.currentStage:Math.min(p.end,state.unlockedStage);return `<article class="world-card ${restored} ${locked}" style="--world-image:url('${p.pct>0?a.restored:a.faded}')"><h3>${w}</h3><p>${p.unlocked?`${p.pct}% restored • Stages ${p.start}–${p.end}`:"Locked"}</p><div class="world-progress"><span style="width:${p.pct}%"></span></div><button class="secondary compact world-play" type="button" data-stage="${target}" ${p.unlocked?"":"disabled"}>${p.unlocked?`Play Stage ${target}`:"Locked"}</button></article>`}).join("");map.querySelectorAll("[data-stage]").forEach(b=>b.addEventListener("click",()=>{const id=Number(b.dataset.stage);if(Number.isInteger(id)&&id<=state.unlockedStage)start(id)}))}

function start(id=state.currentStage){try{state.currentStage=Math.max(1,Math.min(CORE_STAGE_COUNT,id));state.firstPlay=false;save();const c=STAGES[state.currentStage-1],generated=generateValidBoard(c,3);engine=new GameEngine({board:generated.board,config:{...c,seed:generated.config.seed}});overlay.hidden=true;pauseOverlay.hidden=true;paused=false;renderDirty=true;show("play");hud();applySettings();st.textContent="Aim anywhere above the launcher, then release."}catch(err){showError(err)}}
function showError(err){$("#error-message").textContent=`The board could not start safely (${err?.message||"unknown error"}). Retry this stage or return Home.`;show("error")}
function hud(){if(!engine)return;const objective=engine.objectiveStatus();sl.textContent=`Stage ${engine.config.id}`;wl.textContent=engine.config.world;sc.textContent=`Score ${engine.score}`;sh.textContent=`Shots ${engine.shotsLeft}`;objectiveLabel.textContent=objective.text;comboLabel.textContent=engine.combo>1?`Combo ×${engine.combo}`:"";nc.style.background=COLOR_HEX[engine.nextColor]||"transparent";nc.textContent=engine.nextColor?SYMBOLS[engine.nextColor]:"—"}
function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,r.width*d);canvas.height=Math.max(1,r.height*d);ctx.setTransform(d,0,0,d,0,0);const compactLandscape=r.height<300,launcherMargin=compactLandscape?20:58,heightCap=compactLandscape?Math.max(9,(r.height-launcherMargin-18)/15.5):24,R=Math.max(9,Math.min(24,r.width/18,heightCap)),bw=R*17;g={cols:8,radius:R,rowStep:R*1.72,left:Math.max(8,(r.width-bw)/2),top:18,boardWidth:bw,width:r.width,height:r.height,launcher:{x:r.width/2,y:r.height-launcherMargin}};renderDirty=true}
function bubble(x,y,R,c){ctx.beginPath();ctx.arc(x,y,R-1,0,Math.PI*2);ctx.fillStyle=COLOR_HEX[c];ctx.fill();ctx.strokeStyle="rgba(255,255,255,.75)";ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle="#fff";ctx.font=`700 ${Math.max(13,R*.82)}px system-ui`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(SYMBOLS[c],x,y)}
function marker(x,y,R,type){ctx.beginPath();ctx.arc(x,y,Math.max(6,R*.42),0,Math.PI*2);ctx.fillStyle="#10172b";ctx.fill();ctx.strokeStyle="#f2c94c";ctx.lineWidth=2;ctx.stroke();ctx.fillStyle="#f2c94c";ctx.font=`800 ${Math.max(9,R*.42)}px system-ui`;ctx.fillText(type==="rescue_marked"?"R":"A",x,y)}
function draw(){if(!g||!engine)return;ctx.fillStyle="#121a31";ctx.fillRect(0,0,g.width,g.height);for(const[k,c]of engine.board){const[r,col]=fromKey(k),p=cellCenter(r,col,g);bubble(p.x,p.y,g.radius,c);if(engine.objectiveState.markers?.has(k))marker(p.x+g.radius*.5,p.y-g.radius*.5,g.radius,engine.objectiveState.type)}if(aim&&!engine.projectile){const dx=aim.x-g.launcher.x,dy=Math.min(-24,aim.y-g.launcher.y),l=Math.hypot(dx,dy)||1;ctx.setLineDash([7,9]);ctx.strokeStyle="#fff";ctx.beginPath();ctx.moveTo(g.launcher.x,g.launcher.y);ctx.lineTo(g.launcher.x+dx/l*170,g.launcher.y+dy/l*170);ctx.stroke();ctx.setLineDash([])}ctx.fillStyle="#18213A";ctx.beginPath();ctx.arc(g.launcher.x,g.launcher.y+8,g.radius*1.4,Math.PI,0);ctx.fill();if(engine.nextColor)bubble(g.launcher.x,g.launcher.y,g.radius*.86,engine.nextColor);if(engine.projectile)bubble(engine.projectile.x,engine.projectile.y,g.radius*.88,engine.projectile.color)}
function pulseBloom(){if(state.settings.reducedMotion)return;bloom.classList.remove("active");void bloom.offsetWidth;bloom.classList.add("active")}
function showRestore(world){const a=worldAssets(world);faded.src=a.faded;colorImg.src=a.restored;restorePreview.classList.remove("bloom");void restorePreview.offsetWidth;restorePreview.classList.add("bloom");pulseBloom();sfx(bloomSfx)}
function finish(){if(!engine||engine.status==="playing")return;overlay.hidden=false;if(engine.status==="success"){const stars=engine.stars(),id=engine.config.id;rk.textContent="Dominion restored";rt.textContent="Territory Cleared";rbody.textContent=`${"★".repeat(stars)}${"☆".repeat(3-stars)} • Score ${engine.score} • ${engine.config.world} blooms again`;state.best[id]=Math.max(state.best[id]||0,engine.score);state.stars[id]=Math.max(state.stars[id]||0,stars);state.unlockedStage=Math.min(CORE_STAGE_COUNT,Math.max(state.unlockedStage,id+1));if(id<CORE_STAGE_COUNT)state.currentStage=id+1;save();$("#next-btn").hidden=id>=CORE_STAGE_COUNT;showRestore(engine.config.world);safePlay(sting);haptic([25,35,60]);analytics.track("cd_star_result",{level:id,stars,score:engine.score,result:"success"});analytics.track("cd_world_claim",{level:id,result:"success"})}else{rk.textContent="Try again";rt.textContent="Out of Shots";rbody.textContent=`Score ${engine.score} • Retry is always available`;$("#next-btn").hidden=true;sfx(failSfx);haptic(25);analytics.track("cd_objective_progress",{level:engine.config.id,result:"failure",score:engine.score})}}
function loop(now){const frameDelta=now-last;if(frameDelta>0&&frameDelta<1000){frameSamples.push(frameDelta);if(frameSamples.length>1200)frameSamples.shift()}const dt=Math.min(.025,frameDelta/1000);last=now;if(engine&&g&&!document.hidden&&!paused){const e=engine.update(dt,g);if(e?.type==="attached"){hud();if(e.removed.length){sfx(popSfx);haptic(12);pulseBloom();analytics.track("cd_match",{level:engine.config.id,count:e.removed.length,combo:e.combo,score:engine.score})}if(e.dropped.length){sfx(dropSfx);analytics.track("cd_drop",{level:engine.config.id,count:e.dropped.length,combo:e.combo})}if(e.combo>1){sfx(comboSfx);analytics.track("cd_combo",{level:engine.config.id,combo:e.combo})}analytics.track("cd_objective_progress",{level:engine.config.id,objectiveType:e.objective.type,count:e.objective.current,score:engine.score});st.textContent=e.removed.length?`Match ${e.removed.length}${e.dropped.length?` • Drop ${e.dropped.length}`:""}${e.combo>1?` • Combo ×${e.combo}`:""}`:"No match — line up a group of 3.";finish()}if(engine.projectile||aim||e||renderDirty){draw();renderDirty=false}}requestAnimationFrame(loop)}
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
$("#pause-btn").onclick=()=>{paused=true;pauseOverlay.hidden=false;music.pause()};
$("#resume-btn").onclick=()=>{paused=false;pauseOverlay.hidden=true;applySettings()};
$("#pause-settings-btn").onclick=()=>{pauseOverlay.hidden=true;show("settings")};
$("#error-retry-btn").onclick=()=>start(state.currentStage);
$("#reset-btn").onclick=()=>{if(confirm("Reset all Color Dominion progress on this device?")){try{localStorage.removeItem(SAVE_KEY)}catch{}state=defaults();storageNotice=storageOk?"":"Progress cannot be saved on this device right now; this session can still continue.";save();syncSettings();show("home")}};
[["#music-toggle","music"],["#sfx-toggle","sfx"],["#haptics-toggle","haptics"],["#motion-toggle","reducedMotion"]].forEach(([sel,key])=>$(sel).addEventListener("change",e=>setSetting(key,e.target.checked)));
window.addEventListener("online",refreshHome);window.addEventListener("offline",refreshHome);window.onresize=resize;
document.addEventListener("visibilitychange",()=>{if(document.hidden)music.pause();else applySettings()});
window.addEventListener("error",e=>{if(!screens.play.hidden)showError(e.error||new Error(e.message))});
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
window.__CD_DIAGNOSTICS__={snapshot:()=>({stage:engine?.config.id||state.currentStage,status:engine?.status||"home",shotsLeft:engine?.shotsLeft??null,score:engine?.score??0,objective:engine?.objectiveStatus?.()||null,frameSampleCount:frameSamples.length,storageOk,online:navigator.onLine,adsEnabled:Boolean(adPolicy.provider),crossPromoChoices:crossPromo.choices("color-dominion").length}),frameSamples:()=>frameSamples.slice()};
await enforceStagingGate();applySettings();refreshHome();show("home");resize();requestAnimationFrame(loop);
