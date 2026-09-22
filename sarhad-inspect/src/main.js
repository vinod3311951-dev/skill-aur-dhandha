import { MISSIONS, WORLDS, missionsForWorld } from './game/config.js';
import { evaluateRicochetShot, evaluateShot, masteryLabel, masteryStars, protectedFigureAtElapsed, protectedFigureHitAtElapsed, targetAtElapsed } from './game/engine.js';
import { loadSave, resetProgress, saveProgress } from './game/storage.js';
import { beginMissionDiagnostics, finishMissionDiagnostics, markRuntimeReady, noteContextLoss, noteFrame, notePause, noteShot, recordAssetFailure, recordUncaughtError, recordUnhandledRejection, runtimeHealthSnapshot, runtimeSnapshot } from './game/diagnostics.js';
const appElement = document.querySelector('#app');
if (!appElement)
    throw new Error('App root missing');
const app = appElement;
let screen = 'home';
let selectedWorldId = 1;
let selectedMission = MISSIONS[0];
let attemptsLeft = selectedMission.maxAttempts;
let aimX = 0.5;
let aimY = 0.55;
let lastShot = null;
let missionScore = 0;
let sequenceIndex = 0;
let missionStartedAt = 0;
let totalPausedMs = 0;
let pauseStartedAt = 0;
let paused = false;
let missionEnded = false;
let save = loadSave();
let canvas = null;
let raf = 0;
let audioContext = null;
let ambienceNodes = [];
let ambienceOscillators = [];
let lastMissionStars = 1;
let lastMissionWasPersonalBest = false;
let lastMissionPreviousBest = 0;
let civilianHits = 0;
let viewMode = 'scope';
let missionStatusCache = '';
const SCOPE_ZOOM = 1.78;
const WORLD_SCENE_SOURCES = {
    1: '/assets/worlds/sarhad-cliffs.webp',
    2: '/assets/worlds/dune-outpost.webp',
    3: '/assets/worlds/frost-ridge.webp',
    4: '/assets/worlds/jungle-pass.webp',
    5: '/assets/worlds/coastal-watch.webp',
    6: '/assets/worlds/canyon-base.webp',
    7: '/assets/worlds/sky-fortress.webp'
};
const worldSceneImages = new Map();
let deferredInstallPrompt = null;
let resetArmed = false;
Object.defineProperty(window, '__SARHAD_DIAGNOSTICS__', {
    configurable: false,
    enumerable: false,
    get: () => runtimeSnapshot()
});
Object.defineProperty(window, '__SARHAD_HEALTH__', {
    configurable: false,
    enumerable: false,
    get: () => runtimeHealthSnapshot()
});
function qaStateSnapshot() {
    return {
        screen,
        selectedMissionId: selectedMission.id,
        selectedWorldId,
        paused,
        missionEnded,
        attemptsLeft,
        missionScore,
        civilianHits,
        viewMode,
        visualPerformanceTier: visualPerformanceTier()
    };
}
Object.defineProperty(window, '__SARHAD_QA_STATE__', {
    configurable: false,
    enumerable: false,
    get: () => qaStateSnapshot()
});
if (new URLSearchParams(location.search).get('test') === '1') {
    Object.defineProperty(window, 'render_game_to_text', {
        configurable: true,
        enumerable: false,
        value: () => JSON.stringify(qaStateSnapshot())
    });
}
Object.defineProperty(window, 'render_game_to_text', {
    configurable: false,
    enumerable: false,
    value: () => JSON.stringify({
        screen, selectedMissionId: selectedMission.id, selectedWorldId, paused, missionEnded,
        attemptsLeft, missionScore, civilianHits, viewMode, visualPerformanceTier: visualPerformanceTier()
    })
});
window.addEventListener('error', (event) => {
    const target = event.target;
    if (target instanceof HTMLImageElement || target instanceof HTMLScriptElement || target instanceof HTMLLinkElement) {
        const url = target instanceof HTMLImageElement ? target.currentSrc || target.src : target instanceof HTMLScriptElement ? target.src : target.href;
        recordAssetFailure(url || target.tagName);
        return;
    }
    recordUncaughtError(event.error ?? event.message);
}, true);
window.addEventListener('unhandledrejection', (event) => {
    recordUnhandledRejection(event.reason);
});
function button(label, action, variant = 'primary', disabled = false) {
    return `<button class="btn ${variant}" data-action="${action}" ${disabled ? 'disabled' : ''}>${label}</button>`;
}
function shell(content, showSettings = true) {
    return `
    <section class="app-shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">PRECISION MISSIONS</p>
          <h1>Sarhad Sniper</h1>
        </div>
        <div class="top-actions">
          <div class="score-pill" aria-label="Best score">Best ${save.bestScore}</div>
          ${showSettings ? '<button class="icon-btn" data-action="settings" aria-label="Settings">⚙</button>' : ''}
        </div>
      </header>
      ${content}
      <footer class="footer-note">Fictional worlds • Object targets • No real conflicts</footer>
    </section>`;
}
function renderHome() {
    stopMissionLoop();
    screen = 'home';
    app.innerHTML = shell(`
    <section class="home-card market-home" style="--home-scene:url('/assets/worlds/sarhad-cliffs.webp')">
      <div class="rudraa-lockup" aria-label="Captain Rudraa">
        <div class="rudraa-portrait" aria-hidden="true"><img src="/assets/characters/captain-rudraa.webp" alt="" loading="eager" decoding="async"></div>
        <div><p class="eyebrow">CAPTAIN RUDRAA</p><strong class="hero-callout">Precision over force.</strong><small class="hero-subcall">Observe first. Protect civilians. Act only on a clean objective.</small></div>
      </div>
      <h2>Observe. Decide. Fire once.</h2>
      <p>Short precision and tactical puzzle missions across seven fictional scenic worlds.</p>
      <div class="campaign-progress" aria-label="Campaign progress">
        <span>${save.completedMissionIds.length}/105 missions</span>
        <div aria-hidden="true"><i style="--campaign-progress:${Math.round((save.completedMissionIds.length / 105) * 100)}%"></i></div>
      </div>
      <div class="mastery-summary" aria-label="Campaign mastery">
        <div><span>Mastery</span><strong>${campaignStars()}/315 ★</strong><small>${masteryTier(campaignStars())}</small></div>
        <div><span>World postcards</span><strong>${completedWorlds()}/7</strong><small>Earned by clearing routes</small></div>
      </div>
      <div class="mastery-disciplines" aria-label="Mastery disciplines">
        ${masteryDimensions().map((dimension) => `<div class="mastery-discipline">
          <span><strong>${dimension.label}</strong><small>${dimension.earned}/${dimension.possible}</small></span>
          <div role="progressbar" aria-label="${dimension.label} mastery" aria-valuemin="0" aria-valuemax="${dimension.possible}" aria-valuenow="${dimension.earned}"><i style="--discipline-progress:${dimension.percent}%"></i></div>
        </div>`).join('')}
      </div>
      <div class="world-strip" aria-label="Seven worlds">
        ${WORLDS.map((world) => {
        const progress = worldProgress(world.id);
        const complete = progress === 15;
        const unlocked = worldUnlocked(world.id);
        return `<span class="${complete ? 'complete' : unlocked ? 'active' : 'locked'}" title="${world.name}: ${progress}/15" style="--world-accent:${world.palette[0]}" aria-label="${world.name}, ${progress} of 15 missions complete">${complete ? '✓' : world.id}</span>`;
    }).join('')}
      </div>
      ${campaignResumeMission() ? button(save.completedMissionIds.length ? 'Continue Campaign' : 'Start Campaign', 'quickResume') : button('Campaign Complete', 'worldSelect')}
      ${campaignResumeMission() ? button('Mission Map', 'worldSelect', 'secondary') : ''}
      ${button('Scenic Archive', 'postcards', 'secondary')}
    </section>`);
    bindActions();
}
function worldUnlocked(worldId) {
    if (worldId === 1)
        return true;
    const previous = missionsForWorld(worldId - 1);
    return previous.length === 15 && previous.every((mission) => save.completedMissionIds.includes(mission.id));
}
function worldProgress(worldId) {
    return missionsForWorld(worldId).filter((mission) => save.completedMissionIds.includes(mission.id)).length;
}
function campaignStars() {
    return Object.values(save.missionRecords).reduce((total, record) => total + record.bestStars, 0);
}
function masteryDimensions() {
    const groups = [
        { label: 'Precision', kinds: ['precision', 'ricochet', 'disablement'] },
        { label: 'Timing', kinds: ['timing', 'protection'] },
        { label: 'Intelligence', kinds: ['sequence', 'identification'] }
    ];
    return groups.map(({ label, kinds }) => {
        const missions = MISSIONS.filter((mission) => kinds.includes(mission.kind));
        const possible = missions.length * 3;
        const earned = missions.reduce((total, mission) => total + (save.missionRecords[mission.id]?.bestStars ?? 0), 0);
        const percent = possible ? Math.round((earned / possible) * 100) : 0;
        return { label, earned, possible, percent };
    });
}
function completedWorlds() {
    return WORLDS.filter((world) => worldProgress(world.id) === 15).length;
}
function campaignResumeMission() {
    return MISSIONS.find((mission) => !save.completedMissionIds.includes(mission.id) && missionUnlocked(mission)) ?? null;
}
function renderPostcards() {
    stopMissionLoop();
    screen = 'postcards';
    app.innerHTML = shell(`
    <section class="panel postcard-panel">
      <button class="text-btn" data-action="home" aria-label="Back to home">← Home</button>
      <p class="eyebrow">SCENIC ARCHIVE</p>
      <h2>Seven worlds. Seven memories.</h2>
      <p>Clear a world to unlock its scenic postcard. These rewards are visual only.</p>
      <div class="postcard-grid" aria-label="World postcard collection">
        ${WORLDS.map((world) => {
        const complete = worldProgress(world.id) === 15;
        return `<article class="postcard ${complete ? 'unlocked' : 'locked'}" style="--pc1:${world.palette[0]};--pc2:${world.palette[1]};--pc3:${world.palette[2]}">
            <div class="postcard-art" aria-hidden="true"><span>${String(world.id).padStart(2, '0')}</span><i></i></div>
            <div class="postcard-copy">
              <span>${complete ? `POSTCARD ${world.id}/7` : 'LOCKED'}</span>
              <strong>${world.name}</strong>
              <small>${complete ? world.subtitle : `${worldProgress(world.id)}/15 missions complete`}</small>
            </div>
          </article>`;
    }).join('')}
      </div>
    </section>`);
    bindActions();
}
function quickResumeCampaign() {
    const mission = campaignResumeMission();
    if (!mission) {
        renderWorldSelect();
        return;
    }
    selectedMission = mission;
    selectedWorldId = mission.worldId;
    renderBriefing();
}
function masteryTier(stars) {
    if (stars >= 270)
        return 'Crown Precision';
    if (stars >= 210)
        return 'Silent Mastery';
    if (stars >= 140)
        return 'Field Expert';
    if (stars >= 70)
        return 'Precision Specialist';
    return 'Observer';
}
function renderWorldSelect() {
    stopMissionLoop();
    screen = 'worldSelect';
    app.innerHTML = shell(`
    <section class="panel world-select">
      <button class="text-btn" data-action="home" aria-label="Back to home">← Home</button>
      <p class="eyebrow">SEVEN FICTIONAL WORLDS</p>
      <h2>Choose your route.</h2>
      <div class="world-list">
        ${WORLDS.map((world) => {
        const unlocked = worldUnlocked(world.id);
        const progress = worldProgress(world.id);
        return `<button class="world-card" data-world-id="${world.id}" ${unlocked ? '' : 'disabled'} style="--c1:${world.palette[0]};--c2:${world.palette[1]};--c3:${world.palette[2]};--world-progress:${Math.round((progress / 15) * 100)}%;--world-scene:url('${WORLD_SCENE_SOURCES[world.id]}')">
            <span class="world-number">${world.id}</span>
            <span class="world-copy"><strong>${world.name}</strong><small>${world.subtitle}</small><span class="world-progress" aria-hidden="true"><i></i></span><em>${unlocked ? `${progress}/15 complete` : 'Locked'}</em></span>
            <span class="world-arrow">${progress === 15 ? '✓' : unlocked ? '→' : '•'}</span>
          </button>`;
    }).join('')}
      </div>
    </section>`);
    bindActions();
    document.querySelectorAll('[data-world-id]').forEach((element) => {
        element.addEventListener('click', () => {
            const worldId = Number(element.dataset.worldId);
            if (!worldUnlocked(worldId))
                return;
            selectedWorldId = worldId;
            renderMissionSelect();
        });
    });
}
function missionUnlocked(mission) {
    if (!worldUnlocked(mission.worldId))
        return false;
    if (mission.order === 1)
        return true;
    const previous = missionsForWorld(mission.worldId).find((item) => item.order === mission.order - 1);
    return Boolean(previous && save.completedMissionIds.includes(previous.id));
}
function renderMissionSelect() {
    stopMissionLoop();
    screen = 'missionSelect';
    const world = worldById(selectedWorldId);
    const missions = missionsForWorld(selectedWorldId);
    app.innerHTML = shell(`
    <section class="panel mission-select" style="--c1:${world.palette[0]};--c2:${world.palette[1]};--c3:${world.palette[2]}">
      <button class="text-btn" data-action="worldSelect" aria-label="Back to worlds">← Worlds</button>
      <p class="eyebrow">WORLD ${world.id} • ${world.name.toUpperCase()}</p>
      <h2>${world.subtitle}</h2>
      <div class="world-hero-strip" style="--world-scene:url('${WORLD_SCENE_SOURCES[world.id]}')" aria-hidden="true"><span>${world.name}</span></div>
      <div class="mission-list">
        ${missions.map((mission) => {
        const unlocked = missionUnlocked(mission);
        const done = save.completedMissionIds.includes(mission.id);
        const record = save.missionRecords[mission.id];
        const starText = record ? ` • ${'★'.repeat(record.bestStars)}${'☆'.repeat(3 - record.bestStars)}` : '';
        const bestText = record ? ` • PB ${record.bestScore}` : '';
        return `<button class="mission-card" data-mission-id="${mission.id}" data-kind="${mission.kind}" ${unlocked ? '' : 'disabled'}>
            <span class="mission-order">${mission.order}</span>
            <span class="mission-copy"><strong>${mission.title}</strong><small><b>${mechanicLabel(mission)}</b>${done ? ` • COMPLETE${starText}${bestText}` : unlocked ? '' : ' • LOCKED'}</small></span>
            <span class="mission-arrow">${done ? '✓' : unlocked ? '→' : '•'}</span>
          </button>`;
    }).join('')}
      </div>
    </section>`);
    bindActions();
    document.querySelectorAll('[data-mission-id]').forEach((element) => {
        element.addEventListener('click', () => {
            const mission = MISSIONS.find((item) => item.id === element.dataset.missionId);
            if (!mission || !missionUnlocked(mission))
                return;
            selectedMission = mission;
            selectedWorldId = mission.worldId;
            renderBriefing();
        });
    });
}
function mechanicLabel(mission) {
    const labels = {
        precision: 'Precision', timing: 'Timing', sequence: 'Sequence', identification: 'Identify',
        ricochet: 'Ricochet', protection: 'Protect', disablement: 'Disable'
    };
    return labels[mission.kind];
}
function weaponLabel(mission) {
    const labels = {
        precision: 'Precision class',
        rapid: 'Rapid class',
        heavy: 'Heavy class',
        launcher: 'Launcher class'
    };
    return labels[mission.weaponClass];
}
function worldFieldNote(world) {
    const notes = {
        1: 'Cold ridge air • long clear sightlines',
        2: 'Warm haze • shifting open windows',
        3: 'Layered pine cover • marker discipline',
        4: 'Rain and mist • moving visibility',
        5: 'Hard ice light • rebound geometry',
        6: 'Deep canyon shadows • mechanical chains',
        7: 'Low-light ridge • final mastery conditions'
    };
    return notes[world.id] ?? 'Fictional terrain • precision conditions';
}
function fieldNote(mission) {
    const notes = {
        precision: 'Settle the sight. The clean shot is the fast shot.',
        timing: 'Follow the pattern first. Fire only when the window is yours.',
        sequence: 'Read the order before the first shot. Do not rush the chain.',
        identification: 'The marker is the clue. Confirm it before you commit.',
        ricochet: 'Think in angles. The surface is part of the solution.',
        protection: 'Read the crossing pattern. Protect civilians first, then take the clean opening.',
        disablement: 'Ignore the machine. Find the exposed weakness.'
    };
    return notes[mission.kind];
}
function renderBriefing() {
    stopMissionLoop();
    screen = 'briefing';
    const world = worldById(selectedMission.worldId);
    app.innerHTML = shell(`
    <section class="panel briefing" style="--c1:${world.palette[0]};--c2:${world.palette[1]};--c3:${world.palette[2]}">
      <button class="text-btn" data-action="missionSelect" aria-label="Back to missions">← Missions</button>
      <p class="eyebrow">WORLD ${world.id} • MISSION ${selectedMission.order}</p>
      <div class="briefing-scenic" style="--world-scene:url('${WORLD_SCENE_SOURCES[world.id]}')" aria-hidden="true"><span>${world.name}</span></div>
      <h2>${selectedMission.title}</h2>
      <p class="objective"><strong>Objective:</strong> ${selectedMission.objective}</p>
      <div class="world-condition" aria-label="World conditions"><span>${world.name}</span><strong>${worldFieldNote(world)}</strong></div>
      <div class="rudraa-note"><span aria-hidden="true">R</span><p><strong>Rudraa field note:</strong> ${fieldNote(selectedMission)}</p></div>
      <div class="brief-grid four">
        <div><span>Mission</span><strong>${mechanicLabel(selectedMission)}</strong></div>
        <div><span>Attempts</span><strong>${selectedMission.maxAttempts}</strong></div>
        <div><span>Loadout</span><strong>${weaponLabel(selectedMission)}</strong></div>
        <div><span>Input</span><strong>Drag + Fire</strong></div>
      </div>
      ${button('Begin', 'start')}
    </section>`);
    bindActions();
}
function renderSettings() {
    stopMissionLoop();
    screen = 'settings';
    const { audioEnabled, hapticsEnabled, reducedEffects } = save.settings;
    app.innerHTML = shell(`
    <section class="panel settings-panel">
      <button class="text-btn" data-action="home" aria-label="Back to home">← Home</button>
      <p class="eyebrow">SETTINGS</p>
      <h2>Comfort controls.</h2>
      <div class="setting-list">
        ${settingRow('Sound', 'audio', audioEnabled)}
        ${settingRow('Haptics', 'haptics', hapticsEnabled)}
        ${settingRow('Reduced effects', 'effects', reducedEffects)}
      </div>
      <div class="install-card" aria-label="Install Sarhad Sniper">
        <div><span>PWA</span><strong>Install Sarhad Sniper</strong><small id="installStatus">${installStatusText()}</small></div>
        ${button(isStandaloneDisplay() ? 'Installed' : 'Install', 'install', 'secondary', isStandaloneDisplay())}
      </div>
      <div class="settings-info" aria-label="How to play and privacy">
        <div><span>HOW TO PLAY</span><strong>Drag to aim • switch Scope / Overview • FIRE only when the objective is clear.</strong><small>Pause is always available. Mission information never depends on sound, colour or motion alone.</small></div>
        <div><span>PRIVACY</span><strong>Local-first. No account or sensitive device permissions required.</strong><small>Progress and settings stay in this browser unless the browser clears local storage.</small></div>
      </div>
      <div class="reset-card" aria-label="Reset local progress">
        <div><span>LOCAL PROGRESS</span><strong>${resetArmed ? 'Reset all saved campaign progress?' : 'Reset campaign progress'}</strong><small>${resetArmed ? 'This clears local mission records, mastery and settings on this device.' : 'Use only if you want to start Sarhad Sniper from the beginning.'}</small></div>
        <div class="reset-actions">${resetArmed ? `${button('Cancel', 'resetCancel', 'secondary')}${button('Reset', 'resetConfirm', 'danger')}` : button('Reset…', 'resetArm', 'secondary')}</div>
      </div>
      <p class="microcopy">Gameplay information remains visible even when effects are reduced.</p>
    </section>`, false);
    bindActions();
}
function settingRow(label, key, enabled) {
    return `<button class="setting-row" data-setting="${key}" aria-pressed="${enabled}"><span>${label}</span><strong>${enabled ? 'ON' : 'OFF'}</strong></button>`;
}
function toggleSetting(key) {
    const settings = { ...save.settings };
    if (key === 'audio')
        settings.audioEnabled = !settings.audioEnabled;
    if (key === 'haptics')
        settings.hapticsEnabled = !settings.hapticsEnabled;
    if (key === 'effects')
        settings.reducedEffects = !settings.reducedEffects;
    save = { ...save, settings };
    saveProgress(save);
    renderSettings();
}
function armReset() {
    resetArmed = true;
    renderSettings();
}
function cancelReset() {
    resetArmed = false;
    renderSettings();
}
function confirmReset() {
    stopMissionLoop();
    save = resetProgress();
    selectedWorldId = 1;
    selectedMission = MISSIONS[0];
    attemptsLeft = selectedMission.maxAttempts;
    missionScore = 0;
    sequenceIndex = 0;
    civilianHits = 0;
    viewMode = 'scope';
    resetArmed = false;
    renderHome();
}
function isStandaloneDisplay() {
    return window.matchMedia('(display-mode: standalone)').matches || Boolean(navigator.standalone);
}
function installStatusText() {
    if (isStandaloneDisplay())
        return 'Installed on this device.';
    if (deferredInstallPrompt)
        return 'Ready to install from this browser.';
    return 'If no install prompt appears, use your browser menu and choose Install app or Add to Home Screen.';
}
async function installApp() {
    const status = document.querySelector('#installStatus');
    if (isStandaloneDisplay()) {
        if (status)
            status.textContent = 'Installed on this device.';
        return;
    }
    if (!deferredInstallPrompt) {
        if (status)
            status.textContent = 'Use your browser menu and choose Install app or Add to Home Screen.';
        return;
    }
    const prompt = deferredInstallPrompt;
    deferredInstallPrompt = null;
    try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (status)
            status.textContent = choice.outcome === 'accepted' ? 'Install accepted.' : 'Install cancelled. You can try again later.';
    }
    catch {
        if (status)
            status.textContent = 'Install prompt was unavailable. Use your browser menu to install the app.';
    }
}
function currentElapsed() {
    if (!missionStartedAt)
        return 0;
    const end = paused ? pauseStartedAt : performance.now();
    return Math.max(0, end - missionStartedAt - totalPausedMs);
}
function currentTarget(elapsedMs) {
    if (selectedMission.kind === 'sequence' && selectedMission.sequence) {
        return selectedMission.sequence[Math.min(sequenceIndex, selectedMission.sequence.length - 1)] ?? selectedMission.target;
    }
    return targetAtElapsed(selectedMission.target, selectedMission.motion, elapsedMs);
}
function renderMission() {
    screen = 'mission';
    const world = worldById(selectedMission.worldId);
    app.innerHTML = shell(`
    <section class="mission-wrap" style="--c1:${world.palette[0]};--c2:${world.palette[1]};--c3:${world.palette[2]}">
      <div class="mission-worldline"><span>WORLD ${world.id}</span><strong>${world.name}</strong><em>${mechanicLabel(selectedMission)}</em></div>
      <div class="mission-hud">
        <div><span>Mission</span><strong>${selectedMission.order}/15</strong></div>
        <div><span>Attempts</span><strong id="attempts">${attemptsLeft}</strong></div>
        <div><span>Score</span><strong id="missionScore">${missionScore}</strong></div>
      </div>
      <div class="loadout-strip"><span>Fictional loadout</span><strong>${weaponLabel(selectedMission)}</strong>${selectedMission.kind === 'protection' ? '<em>Civilian hits <b id="civilianHits">0</b></em>' : ''}</div>
      <div class="mission-status" id="missionStatus" role="status" aria-live="polite">${missionStatusText(0)}</div>
      <div class="playfield ${viewMode === 'scope' ? 'scope-view' : 'overview-view'}" id="playfield" data-view="${viewMode}">
        <canvas id="scene" aria-label="Precision mission play area"></canvas>
        <div class="scope-mask" aria-hidden="true"></div>
        <div class="scope-glass" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <div class="reticle" id="reticle" aria-hidden="true"></div>
        <div class="impact-layer" id="impactLayer" aria-hidden="true"></div>
        <button class="view-toggle" id="viewToggle" data-action="viewToggle" aria-pressed="${viewMode === 'overview'}" aria-label="Switch to ${viewMode === 'scope' ? 'overview' : 'telescopic'} view">${viewMode === 'scope' ? 'OVERVIEW' : 'SCOPE'}</button>
        ${selectedMission.id === 'w1-m1-relay-core' && !save.completedMissionIds.includes(selectedMission.id) ? '<div class="first-minute-coach" id="firstMinuteCoach" role="status"><strong>DRAG TO AIM</strong><span>Overview is one tap away • FIRE when the sight is settled</span></div>' : ''}
        <div class="hint" id="hint">${initialHint()}</div>
        <div class="pause-layer" id="pauseLayer" hidden>
          <p class="eyebrow">PAUSED</p><h2>Mission held.</h2>${button('Resume', 'resume')}${button('Missions', 'missionSelect', 'secondary')}
        </div>
      </div>
      <div class="mission-controls">
        <button class="btn secondary" data-action="pause">Pause</button>
        <button class="btn fire" data-action="fire">FIRE</button>
      </div>
    </section>`, false);
    bindActions();
    setupPlayfield();
}
function missionStatusText(elapsedMs) {
    if (selectedMission.kind === 'sequence' && selectedMission.sequence) {
        const current = Math.min(sequenceIndex + 1, selectedMission.sequence.length);
        return `SEQUENCE • NODE ${current}/${selectedMission.sequence.length}`;
    }
    if (selectedMission.kind === 'protection' && selectedMission.threatMs) {
        const seconds = Math.max(0, (selectedMission.threatMs - elapsedMs) / 1000);
        return `PROTECT CIVILIANS • ${seconds.toFixed(1)}s`;
    }
    if (selectedMission.kind === 'timing')
        return 'TRACK • WAIT FOR THE CLEAN WINDOW';
    if (selectedMission.kind === 'identification')
        return 'IDENTIFY • READ SHAPE BEFORE FIRING';
    if (selectedMission.kind === 'ricochet')
        return 'REBOUND • USE THE MARKED SURFACE';
    if (selectedMission.kind === 'disablement')
        return 'DISABLE • FIND THE EXPOSED WEAK POINT';
    return 'PRECISION • SETTLE THE SIGHT';
}
function updateMissionStatus(elapsedMs) {
    const status = missionStatusText(elapsedMs);
    if (status === missionStatusCache)
        return;
    missionStatusCache = status;
    const element = document.querySelector('#missionStatus');
    if (element)
        element.textContent = status;
}
function initialHint() {
    if (selectedMission.kind === 'timing')
        return 'Track the moving signal unit, then fire.';
    if (selectedMission.kind === 'sequence')
        return `First target: ${currentTarget(0).label}.`;
    if (selectedMission.kind === 'identification')
        return selectedMission.objective;
    if (selectedMission.kind === 'ricochet')
        return 'Aim at the marked rebound surface.';
    if (selectedMission.kind === 'protection')
        return 'Disable the carrier device. Do not hit civilians.';
    if (selectedMission.kind === 'disablement')
        return 'Find the small exposed weak point.';
    return `Drag the sight onto ${selectedMission.target.label}.`;
}
function renderResult(success) {
    stopMissionLoop();
    screen = 'result';
    const next = nextMission(selectedMission);
    const world = worldById(selectedMission.worldId);
    const worldCleared = success && selectedMission.order === 15;
    const campaignCleared = worldCleared && selectedMission.worldId === WORLDS.length;
    const nextWorld = worldCleared && !campaignCleared ? worldById(selectedMission.worldId + 1) : null;
    app.innerHTML = shell(`
    <section class="panel result-card ${success ? 'success' : 'fail'}" style="--c1:${world.palette[0]};--c2:${world.palette[1]};--c3:${world.palette[2]}">
      <p class="eyebrow">${campaignCleared ? 'CAMPAIGN COMPLETE' : worldCleared ? 'WORLD COMPLETE' : success ? 'MISSION COMPLETE' : 'MISSION FAILED'}</p>
      <h2>${campaignCleared ? 'Seven worlds secured.' : worldCleared ? `${world.name} secured.` : success ? 'Objective complete.' : 'Objective still active.'}</h2>
      <p>${lastShot?.reason ?? 'Mission ended.'}</p>
      ${success ? `<div class="mastery-badge"><span>${'★'.repeat(lastMissionStars)}${'☆'.repeat(3 - lastMissionStars)}</span><strong>${masteryLabel(lastMissionStars)}</strong><small>mission mastery</small></div>` : ''}
      ${worldCleared ? `<div class="world-clear-card"><span>${campaignCleared ? '7/7' : `WORLD ${world.id}`}</span><strong>${campaignCleared ? 'Sarhad campaign complete' : world.name}</strong><small>${campaignCleared ? 'All 105 missions are now complete.' : `${nextWorld?.name ?? 'Next route'} is now unlocked.`}</small></div>` : ''}
      ${campaignCleared ? `<div class="campaign-finale" aria-label="Campaign completion summary">
        <span class="campaign-finale-kicker">PRECISION JOURNEY COMPLETE</span>
        <div class="campaign-finale-nodes" aria-hidden="true">${WORLDS.map((item) => `<i style="--finale:${item.palette[0]}"></i>`).join('')}</div>
        <strong>105 / 105</strong>
        <small>${campaignStars()}/315 mastery stars • ${masteryTier(campaignStars())}</small>
        <em>Replay any mission, improve mastery, or revisit the seven scenic postcards.</em>
      </div>` : ''}
      ${worldCleared ? `<div class="reward-unlock"><span>SCENIC POSTCARD UNLOCKED</span><strong>${world.name}</strong><small>Collection ${completedWorlds()}/7 • cosmetic reward only</small></div>` : ''}
      ${success ? `<div class="personal-best-card ${lastMissionWasPersonalBest ? 'new-best' : ''}" aria-label="Mission personal best"><span>${lastMissionWasPersonalBest ? 'NEW PERSONAL BEST' : 'PERSONAL BEST'}</span><strong>${save.missionRecords[selectedMission.id]?.bestScore ?? missionScore}</strong><small>${lastMissionWasPersonalBest && lastMissionPreviousBest > 0 ? `Previous ${lastMissionPreviousBest}` : 'Best score for this mission'}</small></div>` : ''}
      ${success ? `<div class="achievement-card" aria-label="Share-ready achievement card"><span>SARHAD SNIPER</span><strong>${world.name} • Mission ${selectedMission.order}</strong><small>${masteryLabel(lastMissionStars)} • ${'★'.repeat(lastMissionStars)}${'☆'.repeat(3 - lastMissionStars)} • Score ${missionScore}</small></div>` : ''}
      <div class="mission-debrief" aria-label="Mission debrief">
        <div><span>Attempts saved</span><strong>${Math.max(0, attemptsLeft)}</strong></div>
        <div><span>Decision</span><strong>${success ? 'Objective clear' : 'Retry ready'}</strong></div>
        ${selectedMission.kind === 'protection' ? `<div><span>Civilian safety</span><strong>${civilianHits === 0 ? 'Clear' : `${civilianHits} penalty`}</strong></div>` : ''}
      </div>
      <div class="result-score"><span>Mission score</span><strong>${missionScore}</strong></div>
      <div class="button-row">
        ${button('Retry', 'start', 'secondary')}
        ${success && next ? button(worldCleared ? 'Continue Route' : 'Next', 'next') : button(campaignCleared ? 'Replay Missions' : 'Missions', 'missionSelect')}
        ${campaignCleared ? button('Scenic Archive', 'postcards', 'secondary') : ''}
      </div>
      ${success ? `<div class="share-row">${button('Share Achievement', 'share', 'secondary')}<p id="shareStatus" class="share-status" aria-live="polite"></p></div>` : ''}
    </section>`);
    bindActions();
}
function setupPlayfield() {
    canvas = document.querySelector('#scene');
    const playfield = document.querySelector('#playfield');
    const reticle = document.querySelector('#reticle');
    if (!canvas || !playfield || !reticle)
        return;
    canvas.addEventListener('webglcontextlost', () => noteContextLoss());
    canvas.addEventListener('webglcontextrestored', () => undefined);
    let dragStartX = 0;
    let dragStartY = 0;
    let dragAimX = aimX;
    let dragAimY = aimY;
    const setOverviewAimFromPointer = (clientX, clientY) => {
        if (paused || missionEnded)
            return;
        const rect = playfield.getBoundingClientRect();
        aimX = clamp01((clientX - rect.left) / rect.width);
        aimY = clamp01((clientY - rect.top) / rect.height);
        positionReticle(reticle);
    };
    const setScopeAimFromDrag = (clientX, clientY) => {
        if (paused || missionEnded)
            return;
        const rect = playfield.getBoundingClientRect();
        const dx = (clientX - dragStartX) / Math.max(1, rect.width);
        const dy = (clientY - dragStartY) / Math.max(1, rect.height);
        aimX = clampScopeCoordinate(dragAimX + dx / SCOPE_ZOOM);
        aimY = clampScopeCoordinate(dragAimY + dy / SCOPE_ZOOM);
        positionReticle(reticle);
    };
    playfield.addEventListener('pointerdown', (event) => {
        if (paused || event.target.closest('button'))
            return;
        document.querySelector('#firstMinuteCoach')?.classList.add('dismissed');
        playfield.setPointerCapture(event.pointerId);
        if (viewMode === 'scope') {
            dragStartX = event.clientX;
            dragStartY = event.clientY;
            dragAimX = aimX;
            dragAimY = aimY;
        }
        else {
            setOverviewAimFromPointer(event.clientX, event.clientY);
        }
    });
    playfield.addEventListener('pointermove', (event) => {
        if (!playfield.hasPointerCapture(event.pointerId))
            return;
        if (viewMode === 'scope')
            setScopeAimFromDrag(event.clientX, event.clientY);
        else
            setOverviewAimFromPointer(event.clientX, event.clientY);
    });
    playfield.addEventListener('pointerup', (event) => {
        if (playfield.hasPointerCapture(event.pointerId))
            playfield.releasePointerCapture(event.pointerId);
    });
    positionReticle(reticle);
    missionStartedAt = performance.now();
    totalPausedMs = 0;
    pauseStartedAt = 0;
    paused = false;
    missionEnded = false;
    drawLoop();
}
function positionReticle(reticle) {
    if (viewMode === 'scope') {
        reticle.style.left = '50%';
        reticle.style.top = '50%';
        return;
    }
    reticle.style.left = `${aimX * 100}%`;
    reticle.style.top = `${aimY * 100}%`;
}
function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}
function clampScopeCoordinate(value) {
    const margin = 0.5 / SCOPE_ZOOM;
    return Math.max(margin, Math.min(1 - margin, value));
}
function toggleViewMode() {
    if (screen !== 'mission' || paused || missionEnded)
        return;
    viewMode = viewMode === 'scope' ? 'overview' : 'scope';
    if (viewMode === 'scope') {
        aimX = clampScopeCoordinate(aimX);
        aimY = clampScopeCoordinate(aimY);
    }
    const playfield = document.querySelector('#playfield');
    const reticle = document.querySelector('#reticle');
    const toggle = document.querySelector('#viewToggle');
    if (playfield) {
        playfield.dataset.view = viewMode;
        playfield.classList.toggle('scope-view', viewMode === 'scope');
        playfield.classList.toggle('overview-view', viewMode === 'overview');
    }
    if (reticle)
        positionReticle(reticle);
    if (toggle) {
        toggle.textContent = viewMode === 'scope' ? 'OVERVIEW' : 'SCOPE';
        toggle.setAttribute('aria-pressed', String(viewMode === 'overview'));
        toggle.setAttribute('aria-label', `Switch to ${viewMode === 'scope' ? 'overview' : 'telescopic'} view`);
    }
}
function visualPerformanceTier() {
    const nav = navigator;
    const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4;
    const lowCpu = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4;
    return lowMemory || lowCpu ? 'low' : 'standard';
}
function resizeCanvas(targetCanvas) {
    const rect = targetCanvas.getBoundingClientRect();
    const dprCap = visualPerformanceTier() === 'low' ? 1.5 : 2;
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));
    if (targetCanvas.width !== width || targetCanvas.height !== height) {
        targetCanvas.width = width;
        targetCanvas.height = height;
    }
    const ctx = targetCanvas.getContext('2d');
    if (!ctx)
        return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
}
function drawLoop() {
    if (!canvas || screen !== 'mission' || paused || missionEnded)
        return;
    const ctx = resizeCanvas(canvas);
    if (!ctx)
        return;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const now = performance.now();
    noteFrame(now);
    const elapsed = currentElapsed();
    updateMissionStatus(elapsed);
    const world = worldById(selectedMission.worldId);
    ctx.save();
    if (viewMode === 'scope') {
        ctx.translate(w * 0.5, h * 0.5);
        ctx.scale(SCOPE_ZOOM, SCOPE_ZOOM);
        ctx.translate(-aimX * w, -aimY * h);
    }
    drawWorld(ctx, w, h, world, elapsed);
    drawMissionObjects(ctx, w, h, elapsed);
    ctx.restore();
    if (selectedMission.kind === 'protection' && selectedMission.threatMs) {
        drawProtectionTimer(ctx, w, selectedMission.threatMs, elapsed);
        if (elapsed >= selectedMission.threatMs) {
            missionEnded = true;
            finishMissionDiagnostics(false, currentElapsed());
            lastShot = { hit: false, score: 0, distance: 1, reason: 'Protection window expired.' };
            window.setTimeout(() => renderResult(false), 180);
            return;
        }
    }
    raf = requestAnimationFrame(drawLoop);
}
function preloadWorldScenes() {
    Object.entries(WORLD_SCENE_SOURCES).forEach(([worldId, src]) => {
        const image = new Image();
        image.decoding = 'async';
        image.src = src;
        image.addEventListener('load', () => {
            worldSceneImages.set(Number(worldId), image);
        }, { once: true });
        image.addEventListener('error', () => recordAssetFailure(src), { once: true });
    });
}
function drawCoverImage(ctx, image, w, h) {
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const boxRatio = w / h;
    let sx = 0;
    let sy = 0;
    let sw = image.naturalWidth;
    let sh = image.naturalHeight;
    if (imageRatio > boxRatio) {
        sw = image.naturalHeight * boxRatio;
        sx = (image.naturalWidth - sw) * .5;
    }
    else {
        sh = image.naturalWidth / boxRatio;
        sy = (image.naturalHeight - sh) * .5;
    }
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, w, h);
}
function drawWorld(ctx, w, h, world, elapsed) {
    const [light, mid, dark] = world.palette;
    const visualBand = Math.max(0, Math.min(4, Math.floor((selectedMission.order - 1) / 3)));
    const sceneImage = worldSceneImages.get(world.id);
    if (sceneImage?.complete && sceneImage.naturalWidth > 0) {
        drawCoverImage(ctx, sceneImage, w, h);
        const cinematicShade = ctx.createLinearGradient(0, 0, 0, h);
        cinematicShade.addColorStop(0, 'rgba(5,12,10,.04)');
        cinematicShade.addColorStop(.58, 'rgba(5,12,10,.10)');
        cinematicShade.addColorStop(1, visualPerformanceTier() === 'low' ? 'rgba(4,12,9,.28)' : 'rgba(4,12,9,.22)');
        ctx.fillStyle = cinematicShade;
        ctx.fillRect(0, 0, w, h);
    }
    else {
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, light);
        sky.addColorStop(0.54, mid);
        sky.addColorStop(1, dark);
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);
    }
    // Mission bands add structured visual progression inside each world's identity.
    // They are decorative only: no colour or atmospheric cue is ever authoritative gameplay information.
    ctx.save();
    if (visualBand > 0) {
        const overlayAlpha = 0.035 + visualBand * 0.018;
        ctx.fillStyle = visualBand % 2 === 0
            ? `rgba(255,232,177,${overlayAlpha})`
            : `rgba(91,125,142,${overlayAlpha})`;
        ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
    // A restrained celestial cue gives each world a readable silhouette without
    // obscuring targets or becoming authoritative gameplay information.
    ctx.save();
    if (!sceneImage?.complete || sceneImage.naturalWidth === 0) {
        const orbSide = (world.id + visualBand) % 2 === 0 ? .78 : .22;
        const orbX = w * orbSide;
        const orbY = h * (world.scenery === 'night' ? .14 + visualBand * .01 : .18 + visualBand * .012);
        const orbRadius = Math.max(18, Math.min(w, h) * (.05 + visualBand * .003));
        const orbGlow = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbRadius * 2.6);
        orbGlow.addColorStop(0, world.scenery === 'night' ? 'rgba(225,235,255,.72)' : 'rgba(255,236,176,.58)');
        orbGlow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = orbGlow;
        ctx.beginPath();
        ctx.arc(orbX, orbY, orbRadius * 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = world.scenery === 'night' ? 'rgba(229,236,255,.72)' : 'rgba(255,232,167,.52)';
        ctx.beginPath();
        ctx.arc(orbX, orbY, orbRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
    ctx.save();
    if (!sceneImage?.complete || sceneImage.naturalWidth === 0) {
        if (world.scenery === 'desert') {
            ctx.fillStyle = alpha(dark, 0.66);
            dune(ctx, w, h, 0.72, 0.1);
            dune(ctx, w, h, 0.84, 0.28);
        }
        else if (world.scenery === 'pine') {
            ctx.fillStyle = alpha(dark, 0.78);
            mountain(ctx, w, h, 0.7);
            for (let i = 0; i < 7; i += 1)
                pine(ctx, w * (0.08 + i * 0.15), h * 0.78, 28 + (i % 3) * 10);
        }
        else if (world.scenery === 'monsoon') {
            ctx.fillStyle = alpha(dark, 0.72);
            mountain(ctx, w, h, 0.7);
            if (!effectsReduced() && visualPerformanceTier() !== 'low') {
                ctx.strokeStyle = 'rgba(235,245,248,.22)';
                ctx.lineWidth = 1;
                const shift = (elapsed * 0.06) % 28;
                for (let x = -40; x < w + 40; x += 24) {
                    ctx.beginPath();
                    ctx.moveTo(x + shift, h * 0.12);
                    ctx.lineTo(x - 22 + shift, h * 0.84);
                    ctx.stroke();
                }
            }
        }
        else if (world.scenery === 'glacier') {
            ctx.fillStyle = alpha(dark, 0.55);
            mountain(ctx, w, h, 0.66);
            ctx.fillStyle = 'rgba(235,250,255,.36)';
            ctx.beginPath();
            ctx.moveTo(0, h * .82);
            ctx.lineTo(w * .25, h * .7);
            ctx.lineTo(w * .55, h * .82);
            ctx.lineTo(w, h * .64);
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.closePath();
            ctx.fill();
        }
        else if (world.scenery === 'canyon') {
            ctx.fillStyle = alpha(dark, 0.76);
            ctx.beginPath();
            ctx.moveTo(0, h);
            ctx.lineTo(0, h * .25);
            ctx.lineTo(w * .18, h * .42);
            ctx.lineTo(w * .3, h);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(w, h);
            ctx.lineTo(w, h * .2);
            ctx.lineTo(w * .8, h * .38);
            ctx.lineTo(w * .68, h);
            ctx.closePath();
            ctx.fill();
        }
        else if (world.scenery === 'night') {
            ctx.fillStyle = alpha(dark, 0.88);
            mountain(ctx, w, h, 0.72);
            if (!effectsReduced() && visualPerformanceTier() !== 'low') {
                ctx.fillStyle = 'rgba(236,242,255,.75)';
                for (let i = 0; i < 18; i += 1) {
                    const sx = ((i * 83) % 97) / 97 * w;
                    const sy = ((i * 47) % 61) / 61 * h * .5;
                    ctx.fillRect(sx, sy, 1.5, 1.5);
                }
            }
        }
        else {
            ctx.fillStyle = alpha(dark, 0.76);
            mountain(ctx, w, h, 0.68);
        }
    }
    ctx.restore();
    drawMissionAtmosphere(ctx, w, h, world, visualBand, elapsed);
    drawMaskedDiverSilhouettes(ctx, w, h, visualBand, elapsed);
    // Fallback-only foreground depth. Photoreal world plates already contain their own depth
    // and must not be covered by a large synthetic band.
    if (!sceneImage?.complete || sceneImage.naturalWidth === 0) {
        const drift = effectsReduced() ? 0 : Math.sin(elapsed / 5000) * w * .008;
        ctx.save();
        ctx.translate(drift, 0);
        ctx.fillStyle = alpha(dark, .72);
        ctx.beginPath();
        ctx.moveTo(-w * .03, h);
        ctx.lineTo(-w * .03, h * .9);
        ctx.lineTo(w * .14, h * .82);
        ctx.lineTo(w * .31, h * .91);
        ctx.lineTo(w * .48, h * .84);
        ctx.lineTo(w * .66, h * .93);
        ctx.lineTo(w * .84, h * .86);
        ctx.lineTo(w * 1.03, h * .91);
        ctx.lineTo(w * 1.03, h);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    else {
        const floorShade = ctx.createLinearGradient(0, h * .72, 0, h);
        floorShade.addColorStop(0, 'rgba(3,8,6,0)');
        floorShade.addColorStop(1, 'rgba(3,8,6,.16)');
        ctx.fillStyle = floorShade;
        ctx.fillRect(0, h * .72, w, h * .28);
    }
    const vignette = ctx.createRadialGradient(w * .5, h * .48, Math.min(w, h) * .2, w * .5, h * .48, Math.max(w, h) * .72);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,.22)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
}
function drawMissionAtmosphere(ctx, w, h, world, visualBand, elapsed) {
    ctx.save();
    const reduced = effectsReduced();
    const lowTier = visualPerformanceTier() === 'low';
    const density = Math.max(2, 3 + visualBand * 2 - (lowTier ? 3 : 0));
    if (world.scenery === 'cliffs' || world.scenery === 'canyon') {
        ctx.strokeStyle = alpha(world.palette[0], .18 + visualBand * .025);
        ctx.lineWidth = 1;
        for (let i = 0; i < density; i += 1) {
            const y = h * (.22 + i * .055);
            const shift = reduced ? 0 : Math.sin(elapsed / 2600 + i) * w * .01;
            ctx.beginPath();
            ctx.moveTo(w * .08 + shift, y);
            ctx.lineTo(w * .92 + shift, y + h * .012);
            ctx.stroke();
        }
    }
    else if (world.scenery === 'desert') {
        ctx.strokeStyle = `rgba(255,234,191,${.08 + visualBand * .018})`;
        ctx.lineWidth = 1;
        const drift = reduced ? 0 : (elapsed * .018) % 36;
        for (let i = 0; i < density + 2; i += 1) {
            const y = h * (.25 + i * .06);
            ctx.beginPath();
            ctx.moveTo(-30 + drift, y);
            ctx.quadraticCurveTo(w * .48, y - 8, w + 30 + drift, y + 2);
            ctx.stroke();
        }
    }
    else if (world.scenery === 'pine') {
        ctx.fillStyle = `rgba(231,244,235,${.04 + visualBand * .012})`;
        for (let i = 0; i < density; i += 1) {
            const x = ((i * 73 + selectedMission.order * 19) % 100) / 100 * w;
            const y = h * (.17 + ((i * 29) % 45) / 100);
            const r = 4 + (i % 3) * 3;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    else if (world.scenery === 'glacier') {
        ctx.strokeStyle = `rgba(245,253,255,${.1 + visualBand * .02})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < density; i += 1) {
            const x = ((i * 61 + selectedMission.order * 31) % 100) / 100 * w;
            ctx.beginPath();
            ctx.moveTo(x, h * .18);
            ctx.lineTo(x + w * .04, h * .28);
            ctx.stroke();
        }
    }
    else if (world.scenery === 'monsoon') {
        if (!reduced) {
            ctx.fillStyle = `rgba(224,241,247,${.025 + visualBand * .008})`;
            const pulse = (Math.sin(elapsed / 850) + 1) / 2;
            ctx.fillRect(0, 0, w, h * (.2 + pulse * .04));
        }
    }
    else if (world.scenery === 'night') {
        ctx.strokeStyle = `rgba(133,164,207,${.08 + visualBand * .02})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < density; i += 1) {
            const x = ((i * 67 + selectedMission.order * 23) % 100) / 100 * w;
            const y = h * (.12 + ((i * 17) % 40) / 100);
            ctx.beginPath();
            ctx.moveTo(x - 4, y);
            ctx.lineTo(x + 4, y);
            ctx.stroke();
        }
    }
    ctx.restore();
}
function drawMaskedDiverSilhouettes(ctx, w, h, visualBand, elapsed) {
    // Fictional masked black dive-suit saboteur silhouettes are scenery only.
    // They are never hittable targets and carry no real-world national, military or faction markings.
    if (selectedMission.order < 4)
        return;
    const count = visualBand >= 3 ? 2 : 1;
    ctx.save();
    ctx.globalAlpha = effectsReduced() ? 0.34 : 0.42;
    ctx.fillStyle = '#090d0c';
    ctx.strokeStyle = 'rgba(151,177,169,.18)';
    ctx.lineWidth = 1;
    for (let i = 0; i < count; i += 1) {
        const side = (selectedMission.order + selectedMission.worldId + i) % 2 === 0 ? 0.085 : 0.915;
        const x = w * (side + (i === 1 ? (side < .5 ? .07 : -.07) : 0));
        const walk = effectsReduced() ? 0 : Math.sin(elapsed / 360 + i * 1.7);
        const y = h * (0.72 + i * 0.045) + walk * 1.6;
        const scale = Math.max(0.7, Math.min(1.05, w / 390));
        // Hood/mask. No face, insignia or culturally identifying clothing.
        ctx.beginPath();
        ctx.ellipse(x, y - 32 * scale, 8.5 * scale, 10.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(89,110,103,.34)';
        ctx.fillRect(x - 6 * scale, y - 34 * scale, 12 * scale, 3 * scale);
        ctx.fillStyle = '#090d0c';
        // Tapered neoprene-like torso and compact breathing pack.
        ctx.beginPath();
        ctx.moveTo(x - 9 * scale, y - 20 * scale);
        ctx.quadraticCurveTo(x - 13 * scale, y - 3 * scale, x - 8 * scale, y + 10 * scale);
        ctx.lineTo(x + 8 * scale, y + 10 * scale);
        ctx.quadraticCurveTo(x + 13 * scale, y - 3 * scale, x + 9 * scale, y - 20 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillRect(x + (side < .5 ? 8 : -13) * scale, y - 16 * scale, 5 * scale, 18 * scale);
        // Jointed limbs with restrained patrol motion.
        ctx.lineWidth = 5 * scale;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#090d0c';
        const arm = walk * 5 * scale;
        ctx.beginPath();
        ctx.moveTo(x - 8 * scale, y - 14 * scale);
        ctx.lineTo(x - 14 * scale, y - 1 * scale + arm);
        ctx.lineTo(x - 12 * scale, y + 10 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 8 * scale, y - 14 * scale);
        ctx.lineTo(x + 14 * scale, y - 1 * scale - arm);
        ctx.lineTo(x + 12 * scale, y + 10 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 5 * scale, y + 8 * scale);
        ctx.lineTo(x - 7 * scale - walk * 2, y + 25 * scale);
        ctx.lineTo(x - 10 * scale - walk * 3, y + 36 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 5 * scale, y + 8 * scale);
        ctx.lineTo(x + 7 * scale + walk * 2, y + 25 * scale);
        ctx.lineTo(x + 10 * scale + walk * 3, y + 36 * scale);
        ctx.stroke();
        ctx.lineCap = 'butt';
    }
    ctx.restore();
}
function mountain(ctx, w, h, base) {
    ctx.beginPath();
    ctx.moveTo(0, h * base);
    ctx.lineTo(w * .18, h * .44);
    ctx.lineTo(w * .38, h * .69);
    ctx.lineTo(w * .61, h * .46);
    ctx.lineTo(w * .8, h * .64);
    ctx.lineTo(w, h * .5);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
}
function dune(ctx, w, h, base, offset) {
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * base);
    ctx.quadraticCurveTo(w * (.28 + offset), h * (base - .15), w * (.56 + offset * .2), h * base);
    ctx.quadraticCurveTo(w * .82, h * (base + .08), w, h * (base - .06));
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
}
function pine(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size * 1.8);
    ctx.lineTo(x - size * .6, y);
    ctx.lineTo(x + size * .6, y);
    ctx.closePath();
    ctx.fill();
}
function alpha(hex, opacity) {
    const normalized = hex.replace('#', '');
    const r = Number.parseInt(normalized.slice(0, 2), 16);
    const g = Number.parseInt(normalized.slice(2, 4), 16);
    const b = Number.parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${opacity})`;
}
function drawMissionObjects(ctx, w, h, elapsed) {
    if (selectedMission.kind === 'sequence' && selectedMission.sequence) {
        selectedMission.sequence.forEach((node, index) => drawTarget(ctx, w, h, node, index === sequenceIndex, index < sequenceIndex));
        return;
    }
    if (selectedMission.kind === 'identification' && selectedMission.candidates) {
        selectedMission.candidates.forEach((candidate, index) => drawTarget(ctx, w, h, candidate, true, false, index));
        return;
    }
    if (selectedMission.kind === 'ricochet' && selectedMission.ricochet) {
        drawRicochetSurface(ctx, w, h, selectedMission.ricochet.axis, selectedMission.ricochet.coordinate);
        drawTarget(ctx, w, h, selectedMission.target, true, false);
        return;
    }
    if (selectedMission.kind === 'protection') {
        drawProtectionOpposition(ctx, w, h, elapsed);
        drawProtectionCrossfire(ctx, w, h, elapsed);
        drawProtectedFigures(ctx, w, h, elapsed);
        drawThreatCarrier(ctx, w, h, currentTarget(elapsed));
        return;
    }
    drawTarget(ctx, w, h, currentTarget(elapsed), true, false);
}
function drawProtectionOpposition(ctx, w, h, elapsed) {
    // Fictional opposing figures provide urgency only. They are scenery, never valid targets.
    // Their masked dive-suit styling carries no national, cultural, military or faction identity.
    ctx.save();
    const pulse = effectsReduced() ? 0 : (Math.sin(elapsed / 180) + 1) / 2;
    const scale = Math.max(0.78, Math.min(1.12, w / 390));
    const positions = [
        { x: w * 0.075, y: h * 0.57, facing: 1, phase: 0.0 },
        { x: w * 0.925, y: h * 0.61, facing: -1, phase: 1.7 }
    ];
    for (const position of positions) {
        const walk = effectsReduced() ? 0 : Math.sin(elapsed / 235 + position.phase);
        const bob = Math.abs(walk) * 1.4 * scale;
        const x = position.x;
        const y = position.y + bob;
        // Ground contact and atmospheric separation from the scenic plate.
        ctx.fillStyle = 'rgba(0,0,0,.34)';
        ctx.beginPath();
        ctx.ellipse(x, y + 38 * scale, 14 * scale, 3.8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Full-face fictional mask / hood. No insignia, flag, uniform badge or cultural marker.
        ctx.fillStyle = '#080c0b';
        ctx.strokeStyle = 'rgba(178,198,189,.34)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(x, y - 27 * scale, 8.2 * scale, 10.2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#16221e';
        ctx.beginPath();
        ctx.roundRect(x - 6.2 * scale, y - 30.5 * scale, 12.4 * scale, 5.2 * scale, 2.2 * scale);
        ctx.fill();
        ctx.fillStyle = 'rgba(164,196,185,.48)';
        ctx.fillRect(x - 4.7 * scale, y - 28.9 * scale, 9.4 * scale, 1.6 * scale);
        // Matte black dive-suit torso with subtle panel seams and compact air-pack silhouette.
        const suit = ctx.createLinearGradient(x - 10 * scale, y - 18 * scale, x + 10 * scale, y + 13 * scale);
        suit.addColorStop(0, '#202a26');
        suit.addColorStop(.42, '#0b100e');
        suit.addColorStop(1, '#020504');
        ctx.fillStyle = suit;
        ctx.beginPath();
        ctx.moveTo(x - 8 * scale, y - 18 * scale);
        ctx.quadraticCurveTo(x - 11 * scale, y - 5 * scale, x - 7.5 * scale, y + 11 * scale);
        ctx.quadraticCurveTo(x, y + 14 * scale, x + 7.5 * scale, y + 11 * scale);
        ctx.quadraticCurveTo(x + 11 * scale, y - 5 * scale, x + 8 * scale, y - 18 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = 'rgba(142,165,156,.22)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - 17 * scale);
        ctx.lineTo(x, y + 9 * scale);
        ctx.stroke();
        ctx.fillStyle = '#111915';
        ctx.beginPath();
        ctx.roundRect(x - position.facing * 12 * scale - 4 * scale, y - 15 * scale, 8 * scale, 22 * scale, 3 * scale);
        ctx.fill();
        // Articulated arms with a compact fictional directional tool. It intentionally avoids a real weapon silhouette.
        const armSwing = walk * 3.6 * scale;
        ctx.strokeStyle = '#080c0b';
        ctx.lineWidth = 5 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - 6.5 * scale, y - 12 * scale);
        ctx.lineTo(x - 10 * scale, y - 1 * scale + armSwing);
        ctx.lineTo(x - 6 * scale, y + 7 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 6.5 * scale, y - 12 * scale);
        ctx.lineTo(x + 9.5 * scale, y - 2 * scale - armSwing);
        ctx.lineTo(x + position.facing * 15 * scale, y - 5 * scale);
        ctx.stroke();
        const emitterStart = x + position.facing * 11 * scale;
        const emitterEnd = x + position.facing * 27 * scale;
        ctx.strokeStyle = '#26332e';
        ctx.lineWidth = 4.4 * scale;
        ctx.beginPath();
        ctx.moveTo(emitterStart, y - 5 * scale);
        ctx.lineTo(emitterEnd, y - 9 * scale);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(190,206,198,.45)';
        ctx.lineWidth = 1.1 * scale;
        ctx.beginPath();
        ctx.moveTo(emitterStart, y - 6 * scale);
        ctx.lineTo(emitterEnd, y - 10 * scale);
        ctx.stroke();
        // Walking legs and fins/boots create recognisable animation rather than mannequin blocks.
        ctx.strokeStyle = '#070b09';
        ctx.lineWidth = 5.4 * scale;
        ctx.beginPath();
        ctx.moveTo(x - 3.2 * scale, y + 9 * scale);
        ctx.lineTo(x - 5 * scale - walk * 2.7, y + 24 * scale);
        ctx.lineTo(x - 8 * scale - walk * 4.2, y + 35 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 3.2 * scale, y + 9 * scale);
        ctx.lineTo(x + 5 * scale + walk * 2.7, y + 24 * scale);
        ctx.lineTo(x + 8 * scale + walk * 4.2, y + 35 * scale);
        ctx.stroke();
        ctx.strokeStyle = '#151f1b';
        ctx.lineWidth = 3.6 * scale;
        ctx.beginPath();
        ctx.moveTo(x - 11 * scale - walk * 4.2, y + 36 * scale);
        ctx.lineTo(x - 5 * scale - walk * 4.2, y + 36 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 5 * scale + walk * 4.2, y + 36 * scale);
        ctx.lineTo(x + 11 * scale + walk * 4.2, y + 36 * scale);
        ctx.stroke();
        ctx.lineCap = 'butt';
        if (!effectsReduced()) {
            ctx.fillStyle = `rgba(240,215,124,${0.16 + pulse * 0.32})`;
            ctx.beginPath();
            ctx.arc(emitterEnd + position.facing * 4 * scale, y - 10 * scale, 2.3 * scale + pulse, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();
}
function drawProtectionCrossfire(ctx, w, h, elapsed) {
    ctx.save();
    ctx.globalAlpha = effectsReduced() ? 0.18 : 0.32;
    ctx.strokeStyle = 'rgba(240,215,124,.58)';
    ctx.lineWidth = 1.4;
    const drift = effectsReduced() ? 0 : Math.sin(elapsed / 420) * h * 0.018;
    for (let i = 0; i < 3; i += 1) {
        const y1 = h * (0.38 + i * 0.11) + drift;
        const y2 = h * (0.44 + i * 0.09) - drift;
        ctx.beginPath();
        ctx.moveTo(w * 0.04, y1);
        ctx.lineTo(w * 0.32, y2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w * 0.96, y2);
        ctx.lineTo(w * 0.68, y1);
        ctx.stroke();
    }
    ctx.restore();
}
function drawProtectedFigures(ctx, w, h, elapsed) {
    if (!selectedMission.protectedFigures)
        return;
    ctx.save();
    for (let index = 0; index < selectedMission.protectedFigures.length; index += 1) {
        const figure = selectedMission.protectedFigures[index];
        const position = protectedFigureAtElapsed(figure, elapsed);
        const x = position.x * w;
        const walk = effectsReduced() ? 0 : Math.sin(elapsed / 210 + index * 2.1);
        const y = position.y * h + Math.abs(walk) * 1.2;
        const depthScale = 0.92 + Math.max(0, Math.min(0.34, (position.y - 0.48) * 1.2));
        const scale = Math.max(0.94, Math.min(1.32, (w / 390) * depthScale));
        const facing = index % 2 === 0 ? 1 : -1;
        const skin = index % 3 === 0 ? '#bf8f6e' : index % 3 === 1 ? '#d0a07d' : '#9e7157';
        const jacket = index % 3 === 0 ? '#465b69' : index % 3 === 1 ? '#6b5947' : '#3e5650';
        const trouser = index % 2 === 0 ? '#26302d' : '#303638';
        const swing = walk * 5.2 * scale;
        // Soft grounded shadow for depth against the scenic plate.
        ctx.fillStyle = 'rgba(0,0,0,.26)';
        ctx.beginPath();
        ctx.ellipse(x, y + 37 * scale, 13 * scale, 3.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Hair + head with layered face shading; no stereotyped cultural markers.
        ctx.fillStyle = '#141816';
        ctx.beginPath();
        ctx.ellipse(x - facing * 1.1 * scale, y - 31.2 * scale, 7.8 * scale, 9.2 * scale, -facing * 0.06, 0, Math.PI * 2);
        ctx.fill();
        const faceGrad = ctx.createLinearGradient(x - 6 * scale, y - 35 * scale, x + 7 * scale, y - 22 * scale);
        faceGrad.addColorStop(0, skin);
        faceGrad.addColorStop(1, '#75513f');
        ctx.fillStyle = faceGrad;
        ctx.beginPath();
        ctx.ellipse(x + facing * 1.7 * scale, y - 28.8 * scale, 6.2 * scale, 7.5 * scale, facing * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(20,24,22,.6)';
        ctx.beginPath();
        ctx.arc(x + facing * 3.4 * scale, y - 30.1 * scale, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = skin;
        ctx.fillRect(x - 2.2 * scale, y - 22.5 * scale, 4.4 * scale, 4.8 * scale);
        // Layered jacket body creates a recognisable human profile instead of a mannequin block.
        const bodyGrad = ctx.createLinearGradient(x - 10 * scale, y - 20 * scale, x + 10 * scale, y + 12 * scale);
        bodyGrad.addColorStop(0, jacket);
        bodyGrad.addColorStop(1, '#1f2c29');
        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = 'rgba(7,15,12,.65)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 7.8 * scale, y - 19 * scale);
        ctx.quadraticCurveTo(x - 11 * scale, y - 5 * scale, x - 7 * scale, y + 9 * scale);
        ctx.quadraticCurveTo(x, y + 13 * scale, x + 7 * scale, y + 9 * scale);
        ctx.quadraticCurveTo(x + 11 * scale, y - 5 * scale, x + 7.8 * scale, y - 19 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = 'rgba(207,222,214,.20)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - 18 * scale);
        ctx.lineTo(x, y + 8 * scale);
        ctx.stroke();
        // Articulated arms with hands and walking swing.
        ctx.strokeStyle = jacket;
        ctx.lineWidth = 4.8 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - 6.2 * scale, y - 13 * scale);
        ctx.lineTo(x - 10.5 * scale, y - 1 * scale + swing);
        ctx.lineTo(x - 8.2 * scale, y + 8 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 6.2 * scale, y - 13 * scale);
        ctx.lineTo(x + 10.5 * scale, y - 1 * scale - swing);
        ctx.lineTo(x + 8.2 * scale, y + 8 * scale);
        ctx.stroke();
        ctx.fillStyle = skin;
        ctx.beginPath();
        ctx.arc(x - 8.2 * scale, y + 8 * scale, 2.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 8.2 * scale, y + 8 * scale, 2.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Separated legs + shoes sell a real walking cycle while hitboxes remain engine-owned.
        ctx.strokeStyle = trouser;
        ctx.lineWidth = 5.4 * scale;
        ctx.beginPath();
        ctx.moveTo(x - 3.2 * scale, y + 7 * scale);
        ctx.lineTo(x - 4.5 * scale - walk * 2.5, y + 23 * scale);
        ctx.lineTo(x - 7.5 * scale - walk * 4, y + 34 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 3.2 * scale, y + 7 * scale);
        ctx.lineTo(x + 4.5 * scale + walk * 2.5, y + 23 * scale);
        ctx.lineTo(x + 7.5 * scale + walk * 4, y + 34 * scale);
        ctx.stroke();
        ctx.strokeStyle = '#111815';
        ctx.lineWidth = 3.4 * scale;
        ctx.beginPath();
        ctx.moveTo(x - 9 * scale - walk * 4, y + 35 * scale);
        ctx.lineTo(x - 4 * scale - walk * 4, y + 35 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 4 * scale + walk * 4, y + 35 * scale);
        ctx.lineTo(x + 9 * scale + walk * 4, y + 35 * scale);
        ctx.stroke();
        ctx.lineCap = 'butt';
        // Neutral carry bag/backpack adds silhouette variety without real-world branding.
        if (index % 2 === 1) {
            ctx.fillStyle = '#283934';
            ctx.beginPath();
            ctx.roundRect(x - facing * 11 * scale - 4 * scale, y - 13 * scale, 8 * scale, 16 * scale, 3 * scale);
            ctx.fill();
        }
        // Compact neutral marker is redundant to the human silhouette and keeps colour from being the only safety cue.
        ctx.fillStyle = 'rgba(6,16,12,.82)';
        ctx.beginPath();
        ctx.roundRect(x - 21 * scale, y + 40 * scale, 42 * scale, 12 * scale, 6 * scale);
        ctx.fill();
        ctx.strokeStyle = 'rgba(220,232,226,.32)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.fillStyle = '#edf3ef';
        ctx.font = `800 ${Math.max(6.5, 7.5 * scale)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillText('CIVILIAN', x, y + 49 * scale);
        ctx.textAlign = 'start';
    }
    ctx.restore();
}
function drawThreatCarrier(ctx, w, h, target) {
    const x = target.x * w;
    const y = target.y * h;
    const r = target.radius * Math.min(w, h);
    const scale = Math.max(0.75, Math.min(1.1, r / 18));
    ctx.save();
    ctx.fillStyle = '#090d0c';
    ctx.strokeStyle = '#f0d77c';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(x, y - 12 * scale, 7 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(x - 9 * scale, y - 5 * scale, 18 * scale, 25 * scale, 5 * scale);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#6f5d3e';
    ctx.fillRect(x - 7 * scale, y + 1 * scale, 14 * scale, 9 * scale);
    ctx.fillStyle = '#f0d77c';
    ctx.beginPath();
    ctx.arc(x, y + 5 * scale, 2.2 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f5e7a8';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(x, y + 5 * scale, Math.max(7 * scale, r * 0.42), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}
function drawTarget(ctx, w, h, target, active, completed, candidateIndex) {
    const tx = target.x * w;
    const ty = target.y * h;
    const tr = target.radius * Math.min(w, h);
    const size = Math.max(14, tr);
    ctx.save();
    ctx.globalAlpha = completed ? 0.34 : active ? 1 : 0.58;
    // Grounded shadow keeps the objective visually attached to the environment.
    ctx.fillStyle = 'rgba(0,0,0,.30)';
    ctx.beginPath();
    ctx.ellipse(tx, ty + size * 1.25, size * 1.18, size * .28, 0, 0, Math.PI * 2);
    ctx.fill();
    const metal = ctx.createLinearGradient(tx - size, ty - size, tx + size, ty + size);
    metal.addColorStop(0, '#66766f');
    metal.addColorStop(.38, '#26342f');
    metal.addColorStop(.72, '#111b17');
    metal.addColorStop(1, '#4b5e56');
    const edge = active ? '#f0d77c' : '#a8b5af';
    ctx.strokeStyle = edge;
    ctx.lineWidth = active ? 2.2 : 1.3;
    const marker = target.marker ?? 'core';
    if (marker === 'ring') {
        // Compact hovering sensor/drone: fictional, unbranded mechanical objective.
        ctx.fillStyle = metal;
        ctx.beginPath();
        ctx.ellipse(tx, ty, size * 1.08, size * .54, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = 'rgba(210,224,217,.72)';
        ctx.lineWidth = 1.3;
        for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(tx + side * size * .72, ty - size * .12);
            ctx.lineTo(tx + side * size * 1.36, ty - size * .48);
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(tx + side * size * 1.48, ty - size * .52, size * .44, size * .12, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.fillStyle = '#0c1411';
        ctx.beginPath();
        ctx.roundRect(tx - size * .48, ty - size * .24, size * .96, size * .55, size * .16);
        ctx.fill();
    }
    else if (marker === 'bar') {
        // Power junction with protective side rails and exposed center bus.
        ctx.fillStyle = metal;
        ctx.beginPath();
        ctx.roundRect(tx - size * .88, ty - size * 1.02, size * 1.76, size * 2.04, size * .16);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#111815';
        ctx.fillRect(tx - size * .58, ty - size * .56, size * 1.16, size * 1.06);
        ctx.strokeStyle = 'rgba(190,208,198,.42)';
        ctx.lineWidth = 1;
        for (let i = -1; i <= 1; i += 1) {
            ctx.beginPath();
            ctx.moveTo(tx - size * .48, ty + i * size * .28);
            ctx.lineTo(tx + size * .48, ty + i * size * .28);
            ctx.stroke();
        }
    }
    else if (marker === 'diamond') {
        // Directional beacon/sensor head on a short mast.
        ctx.strokeStyle = '#53685f';
        ctx.lineWidth = Math.max(3, size * .16);
        ctx.beginPath();
        ctx.moveTo(tx, ty + size * 1.18);
        ctx.lineTo(tx, ty + size * .24);
        ctx.stroke();
        ctx.fillStyle = metal;
        ctx.beginPath();
        ctx.moveTo(tx, ty - size * 1.04);
        ctx.lineTo(tx + size * .82, ty);
        ctx.lineTo(tx, ty + size * .82);
        ctx.lineTo(tx - size * .82, ty);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    else {
        // Relay core: mounted field communications device with antenna and service panel.
        ctx.strokeStyle = '#52675e';
        ctx.lineWidth = Math.max(3, size * .14);
        ctx.beginPath();
        ctx.moveTo(tx - size * .45, ty + size * 1.05);
        ctx.lineTo(tx - size * .28, ty + size * .44);
        ctx.moveTo(tx + size * .45, ty + size * 1.05);
        ctx.lineTo(tx + size * .28, ty + size * .44);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(196,213,204,.70)';
        ctx.lineWidth = Math.max(1.5, size * .07);
        ctx.beginPath();
        ctx.moveTo(tx + size * .48, ty - size * .70);
        ctx.lineTo(tx + size * .72, ty - size * 1.52);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(tx + size * .72, ty - size * 1.58, size * .08, 0, Math.PI * 2);
        ctx.fillStyle = edge;
        ctx.fill();
        ctx.fillStyle = metal;
        ctx.beginPath();
        ctx.roundRect(tx - size * .82, ty - size * .84, size * 1.64, size * 1.62, size * .18);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#0b1411';
        ctx.beginPath();
        ctx.roundRect(tx - size * .52, ty - size * .46, size * 1.04, size * .86, size * .11);
        ctx.fill();
        ctx.fillStyle = 'rgba(180,204,191,.26)';
        ctx.fillRect(tx - size * .40, ty - size * .30, size * .8, size * .08);
        ctx.fillRect(tx - size * .40, ty - size * .08, size * .55, size * .08);
    }
    // Small screws/rivets reinforce a physical-device read without relying on colour.
    ctx.fillStyle = 'rgba(226,235,230,.72)';
    for (const [ox, oy] of [[-.55, -.55], [.55, -.55], [-.55, .55], [.55, .55]]) {
        ctx.beginPath();
        ctx.arc(tx + ox * size, ty + oy * size, Math.max(1.1, size * .055), 0, Math.PI * 2);
        ctx.fill();
    }
    // The authoritative marker remains centered so art never changes hit truth.
    drawMarker(ctx, tx, ty, Math.max(size * .34, 5), marker, completed);
    if (active && !completed) {
        ctx.strokeStyle = 'rgba(240,215,124,.38)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(tx, ty, size * 1.72, 0, Math.PI * 2);
        ctx.stroke();
    }
    if (candidateIndex !== undefined) {
        ctx.fillStyle = 'rgba(255,255,255,.88)';
        ctx.font = '800 11px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(String.fromCharCode(65 + candidateIndex), tx, ty + size * 1.9);
        ctx.textAlign = 'start';
    }
    ctx.restore();
}
function drawMarker(ctx, x, y, size, marker, completed) {
    ctx.strokeStyle = completed ? '#789d83' : '#f0d77c';
    ctx.fillStyle = completed ? '#789d83' : '#d7b866';
    ctx.lineWidth = 2.4;
    if (marker === 'ring') {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, size * .5, 0, Math.PI * 2);
        ctx.stroke();
    }
    else if (marker === 'bar') {
        ctx.fillRect(x - size, y - size * .24, size * 2, size * .48);
        ctx.fillRect(x - size * .24, y - size, size * .48, size * 2);
    }
    else if (marker === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size, y);
        ctx.closePath();
        ctx.fill();
    }
    else {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}
function drawRicochetSurface(ctx, w, h, axis, coordinate) {
    ctx.save();
    ctx.strokeStyle = 'rgba(240,215,124,.88)';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    if (axis === 'x') {
        ctx.moveTo(coordinate * w, h * .12);
        ctx.lineTo(coordinate * w, h * .86);
    }
    else {
        ctx.moveTo(w * .08, coordinate * h);
        ctx.lineTo(w * .92, coordinate * h);
    }
    ctx.stroke();
    ctx.restore();
}
function drawProtectionTimer(ctx, w, total, elapsed) {
    const remaining = Math.max(0, 1 - elapsed / total);
    ctx.fillStyle = 'rgba(8,14,12,.54)';
    ctx.fillRect(w * .1, 16, w * .8, 8);
    ctx.fillStyle = remaining > .35 ? '#d7b866' : '#dc8b73';
    ctx.fillRect(w * .1, 16, w * .8 * remaining, 8);
}
function fire() {
    if (screen !== 'mission' || paused || missionEnded || attemptsLeft <= 0)
        return;
    const elapsed = currentElapsed();
    noteShot();
    if (selectedMission.kind === 'protection' && selectedMission.protectedFigures) {
        const protectedHit = protectedFigureHitAtElapsed(selectedMission.protectedFigures, elapsed, aimX, aimY);
        if (protectedHit) {
            attemptsLeft -= 1;
            civilianHits += 1;
            missionScore = Math.max(0, missionScore - 400);
            lastShot = { hit: false, score: 0, distance: 0, reason: 'Civilian hit — score penalty.' };
            feedback(false);
            const hint = document.querySelector('#hint');
            const attempts = document.querySelector('#attempts');
            const scoreEl = document.querySelector('#missionScore');
            const civilianEl = document.querySelector('#civilianHits');
            if (hint)
                hint.textContent = lastShot.reason;
            if (attempts)
                attempts.textContent = String(attemptsLeft);
            if (scoreEl)
                scoreEl.textContent = String(missionScore);
            if (civilianEl)
                civilianEl.textContent = String(civilianHits);
            if (attemptsLeft <= 0) {
                missionEnded = true;
                finishMissionDiagnostics(false, currentElapsed());
                window.setTimeout(() => renderResult(false), 260);
            }
            return;
        }
    }
    let result;
    if (selectedMission.kind === 'ricochet' && selectedMission.ricochet) {
        result = evaluateRicochetShot(selectedMission.target, selectedMission.ricochet, aimX, aimY);
    }
    else if (selectedMission.kind === 'identification' && selectedMission.candidates) {
        const correct = selectedMission.candidates[selectedMission.correctCandidateIndex ?? 0] ?? selectedMission.target;
        result = evaluateShot(correct, aimX, aimY);
        if (!result.hit) {
            const wrongCandidate = selectedMission.candidates.some((candidate, index) => {
                if (index === selectedMission.correctCandidateIndex)
                    return false;
                return evaluateShot(candidate, aimX, aimY).hit;
            });
            if (wrongCandidate)
                result = { ...result, reason: 'Wrong marker. Re-read the objective.' };
        }
    }
    else {
        result = evaluateShot(currentTarget(elapsed), aimX, aimY);
    }
    lastShot = result;
    attemptsLeft -= 1;
    feedback(result.hit);
    const hint = document.querySelector('#hint');
    const attempts = document.querySelector('#attempts');
    const scoreEl = document.querySelector('#missionScore');
    if (attempts)
        attempts.textContent = String(attemptsLeft);
    if (result.hit) {
        missionScore += result.score;
        if (scoreEl)
            scoreEl.textContent = String(missionScore);
        if (selectedMission.kind === 'sequence' && selectedMission.sequence) {
            sequenceIndex += 1;
            const sequenceComplete = sequenceIndex >= selectedMission.sequence.length;
            if (!sequenceComplete) {
                const next = selectedMission.sequence[sequenceIndex];
                if (hint)
                    hint.textContent = `${result.reason} Next target: ${next.label}.`;
                return;
            }
        }
        missionEnded = true;
        completeMission();
        return;
    }
    if (hint)
        hint.textContent = result.reason;
    if (attemptsLeft <= 0) {
        missionEnded = true;
        finishMissionDiagnostics(false, currentElapsed());
        window.setTimeout(() => renderResult(false), 260);
    }
}
function completeMission() {
    finishMissionDiagnostics(true, currentElapsed());
    showEnvironmentActivation();
    const completed = new Set(save.completedMissionIds);
    completed.add(selectedMission.id);
    lastMissionStars = masteryStars(selectedMission, missionScore, attemptsLeft);
    const previous = save.missionRecords[selectedMission.id];
    lastMissionPreviousBest = previous?.bestScore ?? 0;
    lastMissionWasPersonalBest = missionScore > lastMissionPreviousBest;
    const record = {
        bestScore: Math.max(previous?.bestScore ?? 0, missionScore),
        bestStars: Math.max(previous?.bestStars ?? 1, lastMissionStars),
        bestAttemptsRemaining: Math.max(previous?.bestAttemptsRemaining ?? 0, attemptsLeft)
    };
    save = {
        ...save,
        schemaVersion: 3,
        bestScore: Math.max(save.bestScore, missionScore),
        completedMissionIds: [...completed],
        missionRecords: { ...save.missionRecords, [selectedMission.id]: record }
    };
    saveProgress(save);
    window.setTimeout(() => renderResult(true), effectsReduced() ? 90 : 560);
}
function startMission() {
    stopMissionLoop();
    attemptsLeft = selectedMission.maxAttempts;
    aimX = 0.5;
    aimY = 0.55;
    lastShot = null;
    missionScore = 0;
    lastMissionStars = 1;
    lastMissionWasPersonalBest = false;
    lastMissionPreviousBest = 0;
    civilianHits = 0;
    sequenceIndex = 0;
    viewMode = 'scope';
    missionEnded = false;
    beginMissionDiagnostics(selectedMission.id);
    renderMission();
    startWorldAmbience();
}
function pauseMission(reason = 'manual') {
    if (screen !== 'mission' || paused || missionEnded)
        return;
    paused = true;
    pauseStartedAt = performance.now();
    notePause(reason);
    cancelAnimationFrame(raf);
    const layer = document.querySelector('#pauseLayer');
    if (layer)
        layer.hidden = false;
}
function resumeMission() {
    if (screen !== 'mission' || !paused)
        return;
    totalPausedMs += performance.now() - pauseStartedAt;
    paused = false;
    pauseStartedAt = 0;
    const layer = document.querySelector('#pauseLayer');
    if (layer)
        layer.hidden = true;
    drawLoop();
}
function nextMission(mission) {
    if (mission.order < 15)
        return missionsForWorld(mission.worldId).find((item) => item.order === mission.order + 1) ?? null;
    if (mission.worldId < WORLDS.length)
        return missionsForWorld(mission.worldId + 1)[0] ?? null;
    return null;
}
function goNext() {
    const next = nextMission(selectedMission);
    if (!next) {
        renderWorldSelect();
        return;
    }
    selectedMission = next;
    selectedWorldId = next.worldId;
    renderBriefing();
}
function showEnvironmentActivation() {
    const layer = document.querySelector('#impactLayer');
    if (!layer)
        return;
    const world = worldById(selectedMission.worldId);
    const activation = document.createElement('div');
    activation.className = `environment-activation${effectsReduced() ? ' reduced' : ''}`;
    activation.style.setProperty('--activation-light', world.palette[0]);
    activation.style.setProperty('--activation-mid', world.palette[1]);
    activation.setAttribute('aria-hidden', 'true');
    activation.innerHTML = '<i></i><i></i><i></i><b></b><span></span>';
    layer.appendChild(activation);
    window.setTimeout(() => activation.remove(), effectsReduced() ? 180 : 620);
}
function showImpactFeedback(success) {
    const layer = document.querySelector('#impactLayer');
    if (!layer)
        return;
    const pulse = document.createElement('span');
    pulse.className = `impact-pulse ${success ? 'hit' : 'miss'} weapon-${selectedMission.weaponClass}${effectsReduced() ? ' reduced' : ''}`;
    pulse.style.left = `${aimX * 100}%`;
    pulse.style.top = `${aimY * 100}%`;
    layer.appendChild(pulse);
    window.setTimeout(() => pulse.remove(), effectsReduced() ? 140 : 420);
}
function ensureAudioContext() {
    if (!save.settings.audioEnabled)
        return null;
    try {
        audioContext ??= new AudioContext();
        if (audioContext.state === 'suspended')
            void audioContext.resume().catch(() => undefined);
        return audioContext;
    }
    catch {
        return null;
    }
}
function stopWorldAmbience() {
    for (const oscillator of ambienceOscillators) {
        try {
            oscillator.stop();
        }
        catch { /* already stopped */ }
        try {
            oscillator.disconnect();
        }
        catch { /* optional */ }
    }
    for (const node of ambienceNodes) {
        try {
            node.disconnect();
        }
        catch { /* optional */ }
    }
    ambienceOscillators = [];
    ambienceNodes = [];
}
function startWorldAmbience() {
    stopWorldAmbience();
    if (screen !== 'mission' || !save.settings.audioEnabled)
        return;
    const context = ensureAudioContext();
    if (!context)
        return;
    try {
        const world = worldById(selectedMission.worldId);
        const baseByWorld = [92, 104, 110, 98, 124, 84, 116];
        const base = baseByWorld[world.id - 1] ?? 96;
        const master = context.createGain();
        master.gain.setValueAtTime(0.0001, context.currentTime);
        master.gain.exponentialRampToValueAtTime(0.012, context.currentTime + 0.35);
        master.connect(context.destination);
        const low = context.createOscillator();
        low.type = 'sine';
        low.frequency.value = base;
        const lowGain = context.createGain();
        lowGain.gain.value = 0.62;
        low.connect(lowGain).connect(master);
        const air = context.createOscillator();
        air.type = world.scenery === 'night' || world.scenery === 'glacier' ? 'sine' : 'triangle';
        air.frequency.value = base * (world.id % 2 === 0 ? 1.5 : 1.333);
        const airGain = context.createGain();
        airGain.gain.value = 0.19;
        air.connect(airGain).connect(master);
        const lfo = context.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.08 + world.id * 0.006;
        const lfoGain = context.createGain();
        lfoGain.gain.value = 0.0035;
        lfo.connect(lfoGain).connect(master.gain);
        low.start();
        air.start();
        lfo.start();
        ambienceOscillators = [low, air, lfo];
        ambienceNodes = [master, lowGain, airGain, lfoGain];
    }
    catch {
        stopWorldAmbience();
    }
}
function feedback(success) {
    showImpactFeedback(success);
    if (save.settings.hapticsEnabled && 'vibrate' in navigator)
        navigator.vibrate(success ? 18 : 8);
    if (!save.settings.audioEnabled)
        return;
    try {
        const context = ensureAudioContext();
        if (!context)
            return;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const loadoutTone = { precision: 640, rapid: 720, heavy: 360, launcher: 250 }[selectedMission.weaponClass];
        const duration = { precision: 0.10, rapid: 0.075, heavy: 0.13, launcher: 0.17 }[selectedMission.weaponClass];
        oscillator.type = selectedMission.weaponClass === 'launcher' ? 'triangle' : selectedMission.weaponClass === 'heavy' ? 'square' : 'sine';
        oscillator.frequency.value = success ? loadoutTone : Math.max(150, loadoutTone * 0.42);
        gain.gain.setValueAtTime(0.0001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + duration + 0.015);
    }
    catch {
        // Audio is enhancement only; gameplay never depends on it.
    }
}
function effectsReduced() {
    return save.settings.reducedEffects || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function stopMissionLoop() {
    stopWorldAmbience();
    cancelAnimationFrame(raf);
    raf = 0;
    canvas = null;
    paused = false;
}
function worldById(id) {
    return WORLDS.find((world) => world.id === id) ?? WORLDS[0];
}
async function shareAchievement() {
    const world = worldById(selectedMission.worldId);
    const status = document.querySelector('#shareStatus');
    const text = `Sarhad Sniper • ${world.name} • Mission ${selectedMission.order} • ${masteryLabel(lastMissionStars)} • Score ${missionScore}`;
    const url = `${location.origin}${location.pathname}`;
    if (typeof navigator.share !== 'function') {
        if (status)
            status.textContent = 'Share is not available on this device. The game link can still be shared normally.';
        return;
    }
    try {
        await navigator.share({ title: 'Sarhad Sniper', text, url });
        if (status)
            status.textContent = 'Achievement shared.';
    }
    catch (error) {
        if (error?.name !== 'AbortError' && status)
            status.textContent = 'Share did not complete. Your result is still saved.';
    }
}
function bindActions() {
    document.querySelectorAll('[data-action]').forEach((element) => {
        element.addEventListener('click', () => {
            const action = element.dataset.action;
            if (action === 'home')
                renderHome();
            else if (action === 'worldSelect')
                renderWorldSelect();
            else if (action === 'quickResume')
                quickResumeCampaign();
            else if (action === 'postcards')
                renderPostcards();
            else if (action === 'missionSelect')
                renderMissionSelect();
            else if (action === 'start')
                startMission();
            else if (action === 'fire')
                fire();
            else if (action === 'pause')
                pauseMission();
            else if (action === 'viewToggle')
                toggleViewMode();
            else if (action === 'resume')
                resumeMission();
            else if (action === 'next')
                goNext();
            else if (action === 'settings')
                renderSettings();
            else if (action === 'share')
                void shareAchievement();
            else if (action === 'install')
                void installApp();
            else if (action === 'resetArm')
                armReset();
            else if (action === 'resetCancel')
                cancelReset();
            else if (action === 'resetConfirm')
                confirmReset();
        });
    });
    document.querySelectorAll('[data-setting]').forEach((element) => {
        element.addEventListener('click', () => toggleSetting(element.dataset.setting ?? ''));
    });
}
function handleVisibilityChange() {
    if (document.hidden && screen === 'mission' && !paused && !missionEnded)
        pauseMission('visibility');
}
function handlePageHide() {
    if (screen === 'mission' && !paused && !missionEnded)
        pauseMission('visibility');
}
function registerServiceWorker() {
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
        window.addEventListener('load', () => {
            void navigator.serviceWorker.register('/sw.js').catch(() => undefined);
        });
    }
}
function registerInstallFlow() {
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredInstallPrompt = event;
        if (screen === 'settings')
            renderSettings();
    });
    window.addEventListener('appinstalled', () => {
        deferredInstallPrompt = null;
        if (screen === 'settings')
            renderSettings();
    });
}
document.addEventListener('visibilitychange', handleVisibilityChange);
window.addEventListener('pagehide', handlePageHide);
registerInstallFlow();
registerServiceWorker();
preloadWorldScenes();
renderHome();
markRuntimeReady();
const injectedTest = window.__TEST__;
injectedTest?.markReady?.();
