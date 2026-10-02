const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function createCombatState(profile) {
    if (!profile || !Array.isArray(profile.waves) || profile.waves.length === 0)
        throw new Error('Combat profile requires at least one wave');
    return {
        health: clamp(profile.initialHealth ?? 100, 1, 100),
        armor: clamp(profile.initialArmor ?? 0, 0, 100),
        firstAidKits: Math.max(0, Math.trunc(profile.firstAidKits ?? 0)),
        armorPlates: Math.max(0, Math.trunc(profile.armorPlates ?? 0)),
        currentWaveIndex: 0,
        defeatedHostileIds: [],
        wavesCleared: false,
        down: false
    };
}

export function activeCombatWave(profile, state) {
    if (!profile || state.wavesCleared)
        return null;
    return profile.waves[state.currentWaveIndex] ?? null;
}

export function applyCombatDamage(profile, state, rawDamage, { blast = false } = {}) {
    if (state.down || state.wavesCleared)
        return state;
    const incoming = Math.max(0, Number(rawDamage) || 0);
    const resisted = blast
        ? incoming * (1 - clamp(profile.blastResistance ?? 0, 0, 0.95))
        : incoming;
    const armorAbsorb = Math.min(state.armor, resisted * 0.7);
    const healthDamage = Math.max(0, resisted - armorAbsorb);
    const health = clamp(state.health - healthDamage, 0, 100);
    return {
        ...state,
        armor: clamp(state.armor - armorAbsorb, 0, 100),
        health,
        down: health <= 0
    };
}

export function useFirstAid(profile, state) {
    if (state.down || state.firstAidKits <= 0 || state.health >= 100)
        return state;
    return {
        ...state,
        health: clamp(state.health + Math.max(0, profile.firstAidRestore ?? 0), 0, 100),
        firstAidKits: state.firstAidKits - 1
    };
}

export function useArmorPlate(profile, state) {
    if (state.down || state.armorPlates <= 0 || state.armor >= 100)
        return state;
    return {
        ...state,
        armor: clamp(state.armor + Math.max(0, profile.armorRestore ?? 0), 0, 100),
        armorPlates: state.armorPlates - 1
    };
}

export function defeatHostile(profile, state, hostileId) {
    if (state.down || state.wavesCleared || !hostileId)
        return state;
    const wave = activeCombatWave(profile, state);
    if (!wave || !wave.hostiles.some((hostile) => hostile.id === hostileId))
        return state;
    if (state.defeatedHostileIds.includes(hostileId))
        return state;

    const defeatedHostileIds = [...state.defeatedHostileIds, hostileId];
    const waveCleared = wave.hostiles.every((hostile) => defeatedHostileIds.includes(hostile.id));
    if (!waveCleared)
        return { ...state, defeatedHostileIds };

    const nextWaveIndex = state.currentWaveIndex + 1;
    const wavesCleared = nextWaveIndex >= profile.waves.length;
    return {
        ...state,
        defeatedHostileIds,
        currentWaveIndex: wavesCleared ? state.currentWaveIndex : nextWaveIndex,
        wavesCleared
    };
}

export function combatProgress(profile, state) {
    const total = profile.waves.reduce((sum, wave) => sum + wave.hostiles.length, 0);
    const defeated = state.defeatedHostileIds.length;
    return {
        wave: state.wavesCleared ? profile.waves.length : state.currentWaveIndex + 1,
        totalWaves: profile.waves.length,
        defeated,
        total,
        remaining: Math.max(0, total - defeated),
        wavesCleared: state.wavesCleared,
        down: state.down
    };
}


export function activeCombatHostiles(profile, state) {
    const wave = activeCombatWave(profile, state);
    if (!wave)
        return [];
    const defeated = new Set(state.defeatedHostileIds);
    return wave.hostiles.filter((hostile) => !defeated.has(hostile.id));
}

function triangleWave(value) {
    const phase = ((value % 1) + 1) % 1;
    return phase < 0.5 ? phase * 2 : 2 - phase * 2;
}

export function combatHostilePositionAtElapsed(hostile, elapsedMs) {
    const cycle = Math.max(1, hostile.cycleMs ?? 1);
    const phase = (Math.max(0, elapsedMs) + (hostile.phaseMs ?? 0)) / cycle;
    const mix = triangleWave(phase);
    return {
        x: hostile.minX + (hostile.maxX - hostile.minX) * mix,
        y: hostile.y,
        radius: hostile.radius
    };
}

export function combatHostileHitAtElapsed(profile, state, elapsedMs, aimX, aimY) {
    let best = null;
    for (const hostile of activeCombatHostiles(profile, state)) {
        const position = combatHostilePositionAtElapsed(hostile, elapsedMs);
        const distance = Math.hypot(aimX - position.x, aimY - position.y);
        if (distance <= position.radius && (!best || distance < best.distance))
            best = { hostile, position, distance };
    }
    return best;
}
