const KEY = 'sarhad-sniper:v1:save';
export const DEFAULT_SETTINGS = {
    audioEnabled: true,
    hapticsEnabled: true,
    reducedEffects: false
};
const EMPTY = {
    schemaVersion: 3,
    bestScore: 0,
    completedMissionIds: [],
    missionRecords: {},
    settings: { ...DEFAULT_SETTINGS }
};
function normalizeSettings(value) {
    if (!value || typeof value !== 'object')
        return { ...DEFAULT_SETTINGS };
    const candidate = value;
    return {
        audioEnabled: candidate.audioEnabled !== false,
        hapticsEnabled: candidate.hapticsEnabled !== false,
        reducedEffects: candidate.reducedEffects === true
    };
}
function normalizeMissionRecords(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return {};
    const result = {};
    for (const [id, raw] of Object.entries(value)) {
        if (!raw || typeof raw !== 'object')
            continue;
        const candidate = raw;
        const stars = Number(candidate.bestStars);
        if (![1, 2, 3].includes(stars))
            continue;
        result[id] = {
            bestScore: Number.isFinite(candidate.bestScore) ? Math.max(0, Number(candidate.bestScore)) : 0,
            bestStars: stars,
            bestAttemptsRemaining: Number.isFinite(candidate.bestAttemptsRemaining)
                ? Math.max(0, Math.floor(Number(candidate.bestAttemptsRemaining)))
                : 0
        };
    }
    return result;
}
export function normalizeSaveState(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return structuredClone(EMPTY);
    const parsed = value;
    if (![1, 2, 3].includes(parsed.schemaVersion ?? -1))
        return structuredClone(EMPTY);
    return {
        schemaVersion: 3,
        bestScore: Number.isFinite(parsed.bestScore) ? Math.max(0, Number(parsed.bestScore)) : 0,
        completedMissionIds: Array.isArray(parsed.completedMissionIds)
            ? [...new Set(parsed.completedMissionIds.filter((id) => typeof id === 'string'))]
            : [],
        missionRecords: parsed.schemaVersion === 3 ? normalizeMissionRecords(parsed.missionRecords) : {},
        settings: parsed.schemaVersion === 1 ? { ...DEFAULT_SETTINGS } : normalizeSettings(parsed.settings)
    };
}
export function loadSave() {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw)
            return structuredClone(EMPTY);
        return normalizeSaveState(JSON.parse(raw));
    }
    catch {
        return structuredClone(EMPTY);
    }
}
export function saveProgress(next) {
    try {
        localStorage.setItem(KEY, JSON.stringify(next));
    }
    catch {
        // Storage is optional. Gameplay must continue in session memory.
    }
}
export function resetProgress() {
    const fresh = structuredClone(EMPTY);
    try {
        localStorage.removeItem(KEY);
    }
    catch {
        // Storage is optional. The caller still receives a clean in-memory state.
    }
    return fresh;
}
