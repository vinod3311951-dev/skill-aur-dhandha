import{COLOR_HEX,SYMBOLS,SAVE_KEY,SAVE_VERSION,CORE_STAGE_COUNT,WORLDS}from"./config.js";
import{cellCenter,fromKey}from"./grid.js";
import{STAGES,generateBoard,validateBoard}from"./stages.js";
import{GameEngine}from"./engine.js";

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const screens={home:$("#home-screen"),map:$("#map-screen"),settings:$("#settings-screen"),how:$("#how-screen"),play:$("#play-screen"),error:$("#error-screen")};
const canvas=$("#game"),ctx=canvas.getContext("2d"),overlay=$("#result-overlay"),pauseOverlay=$("#pause-overlay"),bloom=$("#bloom-layer");
const sl=$("#stage-label"),wl=$("#world-label"),sc=$("#score-label"),sh=$("#shots-label"),nc=$("#next-color"),rt=$("#result-title"),rk=$("#result-kicker"),rbody=$("#result-body"),pt=$("#progress-text"),st=$("#status-text"),offlinePill=$("#offline-pill");
const faded=$("#restore-faded"),colorImg=$("#restore-color"),restorePreview=$("#restore-preview");
const music=$("#music"),sting=$("#restoration-sting"),launchSfx=$("#sfx-launch"),popSfx=$("#sfx-pop"),dropSfx=$("#sfx-drop"),bloomSfx=$("#sfx-bloom"),failSfx=$("#sfx-fail");
let state=load(),engine=null,g=null,aim=null,last=performance.now(),paused=false;

function defaults(){return{version:SAVE_VERSION,unlockedStage:1,currentStage:1,best:{},stars:{},settings:{music:true,sfx:true,haptics:true,reducedMotion:false}}}
function load(){try{const raw=JSON.parse(localStorage.getItem(SAVE_KEY));return raw&&raw.version===SAVE_VERSION?{...defaults(),...raw,settings:{...defaults().settings,...raw.settings}}:defaults()}catch{return defaults()}}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state))}catch{}}
function show(name){Object.entries(screens).forEach(([k,el])=>el.hidden=k!==name);if(name==="play")requestAnimationFrame(resize);if(name==="map")renderMap();if(name==="settings")syncSettings();if(name==="home")refreshHome()}
function refreshHome(){pt.textContent=`Stage ${state.currentStage} / ${CORE_STAGE_COUNT} • Unlocked ${state.unlockedStage}`;offlinePill.hidden=navigator.onLine}
function safePlay(el){if(!el)return;try{el.currentTime=0;const p=el.play();if(p?.catch)p.catch(()=>{})}catch{}}
function sfx(el){if(state.settings.sfx)safePlay(el)}
function haptic(pattern=18){if(state.settings.haptics&&navigator.vibrate)navigator.vibrate(pattern)}
function applySettings(){document.body.classList.toggle("reduced-motion",state.settings.reducedMotion);music.muted=!state.settings.music;[sting,launchSfx,popSfx,dropSfx,bloomSfx,failSfx].forEach(a=>a.muted=!state.settings.sfx);if(state.settings.music&&screens.play&&!screens.play.hidden){const p=music.play();if(p?.catch)p.catch(()=>{})}else music.pause()}
function syncSettings(){[["#music-toggle","music"],["#sfx-toggle","sfx"],["#haptics-toggle","haptics"],["#motion-toggle","reducedMotion"]].forEach(([sel,key])=>{$(sel).checked=!!state.settings[key]})}
function setSetting(key,val){state.settings[key]=val;save();applySettings()}

function worldSlug(name){return name.toLowerCase().replaceAll(" ","-")}
function worldAssets(name){const slug=worldSlug(name);return{faded:`./assets/worlds/${slug}/CD-WORLD-${slug}-faded-v1.svg`,restored:`./assets/worlds/${slug}/CD-WORLD-${slug}-restored-v1.svg`}}
function worldProgress(i){const start=i*20+1,end=Math.min(CORE_STAGE_COUNT,start+19),done=Math.max(0,Math.min(20,state.unlockedStage-start));return{start,end,done,pct:Math.round(done/20*100),unlocked:state.unlockedStage>=start}}
function renderMap(){const map=$("#world-map");map.innerHTML=WORLDS.map((w,i)=>{const p=worldProgress(i),a=worldAssets(w),restored=p.pct>=100?"restored":"",locked=p.unlocked?"":"locked";return `<article class="world-card ${restored} ${locked}" style="--world-image:url('${p.pct>0?a.restored:a.faded}')"><h3>${w}</h3><p>${p.unlocked?`${p.pct}% restored • Stages ${p.start}–${p.end}`:"Locked"}</p><div class="world-progress"><span style="width:${p.pct}%"></span></div></article>`}).join("")}

function start(id=state.currentStage){try{state.currentStage=Math.max(1,Math.min(CORE_STAGE_COUNT,id));save();const c=STAGES[state.currentStage-1],b=generateBoard(c),v=validateBoard(b,c);if(!v.ok)throw Error(v.reason);engine=new GameEngine({board:b,config:c});overlay.hidden=true;pauseOverlay.hidden=true;paused=false;show("play");hud();applySettings();st.textContent="Aim anywhere above the launcher, then release."}catch(err){showError(err)}}
function showError(err){$("#error-message").textContent=`The board could not start safely (${err?.message||"unknown error"}). Retry this stage or return Home.`;show("error")}
function hud(){if(!engine)return;sl.textContent=`Stage ${engine.config.id}`;wl.textContent=engine.config.world;sc.textContent=`Score ${engine.score}`;sh.textContent=`Shots ${engine.shotsLeft}`;nc.style.background=COLOR_HEX[engine.nextColor]||"transparent";nc.textContent=engine.nextColor?SYMBOLS[engine.nextColor]:"—"}
function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,r.width*d);canvas.height=Math.max(1,r.height*d);ctx.setTransform(d,0,0,d,0,0);const R=Math.max(15,Math.min(24,r.width/18)),bw=R*17;g={cols:8,radius:R,rowStep:R*1.72,left:Math.max(8,(r.width-bw)/2),top:18,boardWidth:bw,width:r.width,height:r.height,launcher:{x:r.width/2,y:r.height-58}}}
function bubble(x,y,R,c){ctx.beginPath();ctx.arc(x,y,R-1,0,Math.PI*2);ctx.fillStyle=COLOR_HEX[c];ctx.fill();ctx.strokeStyle="rgba(255,255,255,.75)";ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle="#fff";ctx.font=`700 ${Math.max(13,R*.82)}px system-ui`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(SYMBOLS[c],x,y)}
function draw(){if(!g||!engine)return;ctx.fillStyle="#121a31";ctx.fillRect(0,0,g.width,g.height);for(const[k,c]of engine.board){const[r,col]=fromKey(k),p=cellCenter(r,col,g);bubble(p.x,p.y,g.radius,c)}if(aim&&!engine.projectile){const dx=aim.x-g.launcher.x,dy=Math.min(-24,aim.y-g.launcher.y),l=Math.hypot(dx,dy)||1;ctx.setLineDash([7,9]);ctx.strokeStyle="#fff";ctx.beginPath();ctx.moveTo(g.launcher.x,g.launcher.y);ctx.lineTo(g.launcher.x+dx/l*170,g.launcher.y+dy/l*170);ctx.stroke();ctx.setLineDash([])}ctx.fillStyle="#18213A";ctx.beginPath();ctx.arc(g.launcher.x,g.launcher.y+8,g.radius*1.4,Math.PI,0);ctx.fill();if(engine.nextColor)bubble(g.launcher.x,g.launcher.y,g.radius*.86,engine.nextColor);if(engine.projectile)bubble(engine.projectile.x,engine.projectile.y,g.radius*.88,engine.projectile.color)}
function pulseBloom(){if(state.settings.reducedMotion)return;bloom.classList.remove("active");void bloom.offsetWidth;bloom.classList.add("active")}
function showRestore(world){const a=worldAssets(world);faded.src=a.faded;colorImg.src=a.restored;restorePreview.classList.remove("bloom");void restorePreview.offsetWidth;restorePreview.classList.add("bloom");pulseBloom();sfx(bloomSfx)}
function finish(){if(!engine||engine.status==="playing")return;overlay.hidden=false;if(engine.status==="success"){const stars=engine.stars(),id=engine.config.id;rk.textContent="Dominion restored";rt.textContent="Territory Cleared";rbody.textContent=`${"★".repeat(stars)}${"☆".repeat(3-stars)} • Score ${engine.score} • ${engine.config.world} blooms again`;state.best[id]=Math.max(state.best[id]||0,engine.score);state.stars[id]=Math.max(state.stars[id]||0,stars);state.unlockedStage=Math.min(CORE_STAGE_COUNT,Math.max(state.unlockedStage,id+1));if(id<CORE_STAGE_COUNT)state.currentStage=id+1;save();$("#next-btn").hidden=id>=CORE_STAGE_COUNT;showRestore(engine.config.world);safePlay(sting);haptic([25,35,60])}else{rk.textContent="Try again";rt.textContent="Out of Shots";rbody.textContent=`Score ${engine.score} • Retry is always available`;$("#next-btn").hidden=true;sfx(failSfx);haptic(25)}}
function loop(now){const dt=Math.min(.025,(now-last)/1000);last=now;if(engine&&g&&!document.hidden&&!paused){const e=engine.update(dt,g);if(e?.type==="attached"){hud();if(e.removed.length){sfx(popSfx);haptic(12);pulseBloom()}if(e.dropped.length)sfx(dropSfx);st.textContent=e.removed.length?`Match ${e.removed.length}${e.dropped.length?` • Drop ${e.dropped.length}`:""}`:"No match — line up a group of 3.";finish()}draw()}requestAnimationFrame(loop)}
function pos(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
canvas.addEventListener("pointerdown",e=>{if(engine&&!paused&&!engine.projectile&&engine.status==="playing"){canvas.setPointerCapture?.(e.pointerId);aim=pos(e)}})
canvas.addEventListener("pointermove",e=>{if(aim)aim=pos(e)})
canvas.addEventListener("pointerup",e=>{if(aim&&engine&&g&&!paused){const fired=engine.fire(g.launcher,pos(e));if(fired){sfx(launchSfx);haptic(8)}aim=null}})

$("#play-btn").onclick=()=>start();
$("#how-play-btn").onclick=()=>start();
$("#retry-btn").onclick=()=>start(engine?.config.id||state.currentStage);
$("#pause-retry-btn").onclick=()=>start(engine?.config.id||state.currentStage);
$("#next-btn").onclick=()=>start(state.currentStage);
$("#home-btn").onclick=()=>show("home");
$("#pause-home-btn").onclick=()=>{paused=false;show("home");applySettings()};
$("#map-btn").onclick=()=>show("map");
$("#result-map-btn").onclick=()=>show("map");
$("#settings-btn").onclick=()=>show("settings");
$("#how-btn").onclick=()=>show("how");
$("#settings-how-btn").onclick=()=>show("how");
$$("[data-home]").forEach(b=>b.onclick=()=>show("home"));
$("#pause-btn").onclick=()=>{paused=true;pauseOverlay.hidden=false;music.pause()};
$("#resume-btn").onclick=()=>{paused=false;pauseOverlay.hidden=true;applySettings()};
$("#pause-settings-btn").onclick=()=>{pauseOverlay.hidden=true;show("settings")};
$("#error-retry-btn").onclick=()=>start(state.currentStage);
$("#reset-btn").onclick=()=>{if(confirm("Reset all Color Dominion progress on this device?")){localStorage.removeItem(SAVE_KEY);state=defaults();save();syncSettings();show("home")}};
[["#music-toggle","music"],["#sfx-toggle","sfx"],["#haptics-toggle","haptics"],["#motion-toggle","reducedMotion"]].forEach(([sel,key])=>$(sel).addEventListener("change",e=>setSetting(key,e.target.checked)));
window.addEventListener("online",refreshHome);window.addEventListener("offline",refreshHome);window.onresize=resize;
document.addEventListener("visibilitychange",()=>{if(document.hidden)music.pause();else applySettings()});
window.addEventListener("error",e=>{if(!screens.play.hidden)showError(e.error||new Error(e.message))});
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
applySettings();refreshHome();show("home");resize();requestAnimationFrame(loop);
