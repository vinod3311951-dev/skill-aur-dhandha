import { COLOR_HEX, SYMBOLS, SAVE_KEY, SAVE_VERSION, CORE_STAGE_COUNT } from "./config.js";
import { cellCenter, fromKey } from "./grid.js";
import { STAGES, generateBoard, validateBoard } from "./stages.js";
import { GameEngine } from "./engine.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const screens = {
  home: document.querySelector("#home-screen"),
  play: document.querySelector("#play-screen")
};
const overlay = document.querySelector("#result-overlay");
const playButton = document.querySelector("#play-btn");
const retryButton = document.querySelector("#retry-btn");
const nextButton = document.querySelector("#next-btn");
const homeButton = document.querySelector("#home-btn");
const stageLabel = document.querySelector("#stage-label");
const worldLabel = document.querySelector("#world-label");
const scoreLabel = document.querySelector("#score-label");
const shotsLabel = document.querySelector("#shots-label");
const nextColorEl = document.querySelector("#next-color");
const resultTitle = document.querySelector("#result-title");
const resultBody = document.querySelector("#result-body");
const progressText = document.querySelector("#progress-text");
const statusText = document.querySelector("#status-text");

let state = loadSave();
let engine = null;
let geometry = null;
let aim = null;
let lastTime = performance.now();
let raf = 0;

function defaultSave() {
  return { version: SAVE_VERSION, unlockedStage: 1, currentStage: 1, best: {} };
}
function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw);
    if (parsed.version !== SAVE_VERSION) return defaultSave();
    return { ...defaultSave(), ...parsed };
  } catch {
    return defaultSave();
  }
}
function persist() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch {}
}

function setScreen(name) {
  Object.entries(screens).forEach(([k, el]) => el.hidden = k !== name);
  if (name === "play") requestAnimationFrame(resizeCanvas);
}

function stageConfig() {
  return STAGES[state.currentStage - 1];
}

function startStage(id = state.currentStage) {
  state.currentStage = Math.max(1, Math.min(CORE_STAGE_COUNT, id));
  persist();
  const config = stageConfig();
  const board = generateBoard(config);
  const validation = validateBoard(board, config);
  if (!validation.ok) throw new Error(`Invalid generated board: ${validation.reason}`);
  engine = new GameEngine({ board, config });
  overlay.hidden = true;
  statusText.textContent = "Aim anywhere above the launcher, then release.";
  setScreen("play");
  refreshHud();
}

function refreshHome() {
  progressText.textContent = `Stage ${state.currentStage} / ${CORE_STAGE_COUNT} • Unlocked ${state.unlockedStage}`;
}

function refreshHud() {
  if (!engine) return;
  stageLabel.textContent = `Stage ${engine.config.id}`;
  worldLabel.textContent = engine.config.world;
  scoreLabel.textContent = `Score ${engine.score}`;
  shotsLabel.textContent = `Shots ${engine.shotsLeft}`;
  nextColorEl.style.background = COLOR_HEX[engine.nextColor] || "transparent";
  nextColorEl.textContent = engine.nextColor ? SYMBOLS[engine.nextColor] : "—";
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const width = rect.width;
  const radius = Math.max(15, Math.min(24, width / 18));
  const boardWidth = radius * 2 * 8 + radius;
  geometry = {
    cols: 8,
    radius,
    rowStep: radius * 1.72,
    left: Math.max(8, (width - boardWidth) / 2),
    top: 18,
    boardWidth,
    width,
    height: rect.height,
    launcher: { x: width / 2, y: rect.height - 58 }
  };
}

function drawBubble(x, y, radius, color) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius - 1, 0, Math.PI * 2);
  ctx.fillStyle = COLOR_HEX[color];
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,255,.62)";
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.font = `700 ${Math.max(13, radius * 0.82)}px system-ui`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(SYMBOLS[color], x, y + 1);
  ctx.restore();
}

function draw() {
  if (!geometry || !engine) return;
  const { width, height, radius, launcher } = geometry;
  ctx.clearRect(0, 0, width, height);
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "#111a31");
  grad.addColorStop(1, "#202b4b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  for (const [key, color] of engine.board) {
    const [r, c] = fromKey(key);
    const p = cellCenter(r, c, geometry);
    drawBubble(p.x, p.y, radius, color);
  }

  if (aim && !engine.projectile && engine.status === "playing") {
    const dx = aim.x - launcher.x;
    const dy = Math.min(-24, aim.y - launcher.y);
    const len = Math.hypot(dx, dy) || 1;
    const nx = dx / len, ny = dy / len;
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.72)";
    ctx.setLineDash([7, 9]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(launcher.x, launcher.y);
    ctx.lineTo(launcher.x + nx * 170, launcher.y + ny * 170);
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = "#18213A";
  ctx.beginPath();
  ctx.arc(launcher.x, launcher.y + 8, radius * 1.4, Math.PI, 0);
  ctx.fill();
  if (engine.nextColor) drawBubble(launcher.x, launcher.y, radius * 0.86, engine.nextColor);
  if (engine.projectile) drawBubble(engine.projectile.x, engine.projectile.y, radius * 0.88, engine.projectile.color);
}

function finishIfNeeded() {
  if (!engine || engine.status === "playing") return;
  overlay.hidden = false;
  if (engine.status === "success") {
    const stars = engine.stars();
    resultTitle.textContent = "Territory Cleared";
    resultBody.textContent = `${"★".repeat(stars)}${"☆".repeat(3 - stars)} • Score ${engine.score}`;
    const id = engine.config.id;
    state.best[id] = Math.max(state.best[id] || 0, engine.score);
    state.unlockedStage = Math.min(CORE_STAGE_COUNT, Math.max(state.unlockedStage, id + 1));
    if (id < CORE_STAGE_COUNT) state.currentStage = id + 1;
    persist();
    nextButton.hidden = id >= CORE_STAGE_COUNT;
  } else {
    resultTitle.textContent = "Out of Shots";
    resultBody.textContent = `Score ${engine.score}. Retry the same deterministic stage.`;
    nextButton.hidden = true;
  }
}

function loop(now) {
  const dt = Math.min(0.025, (now - lastTime) / 1000);
  lastTime = now;
  if (engine && geometry && !document.hidden) {
    const event = engine.update(dt, geometry);
    if (event?.type === "attached") {
      refreshHud();
      if (event.removed.length) {
        statusText.textContent = `Match ${event.removed.length}${event.dropped.length ? ` + drop ${event.dropped.length}` : ""}`;
      } else {
        statusText.textContent = "No match — line up a group of 3.";
      }
      finishIfNeeded();
    }
    draw();
  }
  raf = requestAnimationFrame(loop);
}

function pointerPos(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

canvas.addEventListener("pointerdown", (event) => {
  if (!engine || engine.projectile || engine.status !== "playing") return;
  canvas.setPointerCapture?.(event.pointerId);
  aim = pointerPos(event);
});
canvas.addEventListener("pointermove", (event) => {
  if (!aim) return;
  aim = pointerPos(event);
});
canvas.addEventListener("pointerup", (event) => {
  if (!aim || !engine || !geometry) return;
  const target = pointerPos(event);
  engine.fire(geometry.launcher, target);
  aim = null;
});
canvas.addEventListener("pointercancel", () => { aim = null; });

playButton.addEventListener("click", () => startStage(state.currentStage));
retryButton.addEventListener("click", () => startStage(engine?.config.id || state.currentStage));
nextButton.addEventListener("click", () => startStage(state.currentStage));
homeButton.addEventListener("click", () => { refreshHome(); setScreen("home"); });
window.addEventListener("resize", resizeCanvas);
document.addEventListener("visibilitychange", () => { lastTime = performance.now(); });

refreshHome();
setScreen("home");
resizeCanvas();
raf = requestAnimationFrame(loop);