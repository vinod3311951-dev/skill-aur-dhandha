const recent = [];
let current = null;
const bootStartedAt = performance.now();
let readyAt = null;
const uncaughtErrors = [];
const unhandledRejections = [];
const assetFailures = [];
let contextLosses = 0;
function boundedPush(target, value) {
    if (!value || target.includes(value))
        return;
    target.push(value.slice(0, 500));
    if (target.length > 32)
        target.shift();
}
function percentile95(values) {
    if (!values.length)
        return 0;
    const ordered = [...values].sort((a, b) => a - b);
    const index = Math.min(ordered.length - 1, Math.ceil(ordered.length * 0.95) - 1);
    return ordered[Math.max(0, index)] ?? 0;
}
function publicSummary(value) {
    return {
        missionId: value.missionId,
        activeMs: Math.max(0, Math.round(value.activeMs)),
        shots: value.shots,
        pauses: value.pauses,
        visibilityPauses: value.visibilityPauses,
        frames: value.frames,
        slowFrames: value.slowFrames,
        longFrames: value.longFrames,
        worstFrameMs: Math.round(value.worstFrameMs * 10) / 10,
        averageFrameMs: value.frames > 1 ? Math.round((value.frameMsTotal / (value.frames - 1)) * 10) / 10 : 0,
        p95FrameMs: Math.round(percentile95(value.frameDurations) * 10) / 10,
        completed: value.completed,
        success: value.success
    };
}
export function beginMissionDiagnostics(missionId) {
    current = {
        missionId,
        activeMs: 0,
        shots: 0,
        pauses: 0,
        visibilityPauses: 0,
        frames: 0,
        slowFrames: 0,
        longFrames: 0,
        worstFrameMs: 0,
        averageFrameMs: 0,
        p95FrameMs: 0,
        completed: false,
        success: null,
        lastFrameAt: 0,
        frameMsTotal: 0,
        frameDurations: []
    };
}
export function noteFrame(now) {
    if (!current || current.completed)
        return;
    if (current.lastFrameAt > 0) {
        const frameMs = Math.max(0, now - current.lastFrameAt);
        // Ignore deliberate background/pause gaps. They are tracked separately.
        if (frameMs < 1000) {
            current.frameMsTotal += frameMs;
            current.worstFrameMs = Math.max(current.worstFrameMs, frameMs);
            current.frameDurations.push(frameMs);
            if (current.frameDurations.length > 3600)
                current.frameDurations.shift();
            if (frameMs > 34)
                current.slowFrames += 1;
            if (frameMs > 100)
                current.longFrames += 1;
        }
    }
    current.lastFrameAt = now;
    current.frames += 1;
}
export function noteShot() {
    if (current && !current.completed)
        current.shots += 1;
}
export function notePause(reason) {
    if (!current || current.completed)
        return;
    current.pauses += 1;
    if (reason === 'visibility')
        current.visibilityPauses += 1;
    current.lastFrameAt = 0;
}
export function finishMissionDiagnostics(success, activeMs) {
    if (!current || current.completed)
        return;
    current.activeMs = activeMs;
    current.completed = true;
    current.success = success;
    const summary = publicSummary(current);
    recent.unshift(summary);
    if (recent.length > 8)
        recent.length = 8;
}
export function markRuntimeReady() {
    if (readyAt === null)
        readyAt = performance.now();
}
export function recordUncaughtError(value) {
    const message = value instanceof Error ? `${value.name}: ${value.message}` : String(value ?? 'Unknown error');
    boundedPush(uncaughtErrors, message);
}
export function recordUnhandledRejection(value) {
    const message = value instanceof Error ? `${value.name}: ${value.message}` : String(value ?? 'Unknown rejection');
    boundedPush(unhandledRejections, message);
}
export function recordAssetFailure(url) {
    boundedPush(assetFailures, url);
}
export function noteContextLoss() {
    contextLosses += 1;
}
export function runtimeSnapshot() {
    return {
        current: current ? publicSummary(current) : null,
        recent: recent.map((item) => ({ ...item }))
    };
}
export function runtimeHealthSnapshot() {
    return {
        bootStartedAt,
        readyAt,
        readyMs: readyAt === null ? null : Math.round((readyAt - bootStartedAt) * 10) / 10,
        uncaughtErrors: [...uncaughtErrors],
        unhandledRejections: [...unhandledRejections],
        assetFailures: [...assetFailures],
        contextLosses
    };
}
