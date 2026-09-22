export function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}
export function targetAtElapsed(base, motion, elapsedMs) {
    if (!motion)
        return base;
    const cycleMs = Math.max(800, motion.cycleMs);
    const phase = ((elapsedMs % cycleMs) + cycleMs) % cycleMs / cycleMs;
    const pingPong = phase <= 0.5 ? phase * 2 : (1 - phase) * 2;
    const value = motion.min + (motion.max - motion.min) * pingPong;
    return motion.axis === 'x' ? { ...base, x: value } : { ...base, y: value };
}
export function protectedFigureAtElapsed(spec, elapsedMs) {
    const cycleMs = Math.max(1200, spec.cycleMs);
    const phase = ((((elapsedMs + spec.phaseMs) % cycleMs) + cycleMs) % cycleMs) / cycleMs;
    const pingPong = phase <= 0.5 ? phase * 2 : (1 - phase) * 2;
    return {
        x: spec.minX + (spec.maxX - spec.minX) * pingPong,
        y: spec.y,
        radius: spec.radius
    };
}
export function protectedFigureHitAtElapsed(specs, elapsedMs, aimX, aimY) {
    if (!specs?.length)
        return null;
    const x = clamp01(aimX);
    const y = clamp01(aimY);
    for (const spec of specs) {
        const figure = protectedFigureAtElapsed(spec, elapsedMs);
        const distance = Math.hypot(x - figure.x, y - figure.y);
        if (distance <= figure.radius)
            return { id: spec.id, distance };
    }
    return null;
}
export function evaluateShot(target, aimX, aimY) {
    const x = clamp01(aimX);
    const y = clamp01(aimY);
    const dx = x - target.x;
    const dy = y - target.y;
    const distance = Math.hypot(dx, dy);
    const hit = distance <= target.radius;
    if (!hit) {
        return {
            hit: false,
            score: 0,
            distance,
            reason: distance > target.radius * 2.6 ? `Shot missed the ${target.label.toLowerCase()}.` : `Close — adjust toward ${target.label}.`
        };
    }
    const precision = 1 - distance / target.radius;
    const score = Math.max(100, Math.round(500 + precision * 500));
    return {
        hit: true,
        score,
        distance,
        reason: precision > 0.82 ? 'Precision hit.' : `${target.label} disabled.`
    };
}
export function ricochetBouncePoint(target, ricochet, originX = 0.5, originY = 0.9) {
    if (ricochet.axis === 'x') {
        const mirroredTargetX = 2 * ricochet.coordinate - target.x;
        const dx = mirroredTargetX - originX;
        const t = Math.abs(dx) < 1e-9 ? 0 : (ricochet.coordinate - originX) / dx;
        return { x: ricochet.coordinate, y: clamp01(originY + (target.y - originY) * t) };
    }
    const mirroredTargetY = 2 * ricochet.coordinate - target.y;
    const dy = mirroredTargetY - originY;
    const t = Math.abs(dy) < 1e-9 ? 0 : (ricochet.coordinate - originY) / dy;
    return { x: clamp01(originX + (target.x - originX) * t), y: ricochet.coordinate };
}
export function evaluateRicochetShot(target, ricochet, aimX, aimY) {
    const bounce = ricochetBouncePoint(target, ricochet);
    const distance = Math.hypot(clamp01(aimX) - bounce.x, clamp01(aimY) - bounce.y);
    const hit = distance <= ricochet.tolerance;
    if (!hit) {
        return {
            hit: false,
            score: 0,
            distance,
            reason: distance > ricochet.tolerance * 2.5 ? 'Rebound angle missed the relay.' : 'Close — refine the rebound angle.'
        };
    }
    const precision = 1 - distance / ricochet.tolerance;
    return {
        hit: true,
        score: Math.max(120, Math.round(520 + precision * 520)),
        distance,
        reason: precision > 0.82 ? 'Perfect rebound.' : 'Rebound connected.'
    };
}
export function missionMaxScore(mission) {
    if (mission.kind === 'sequence')
        return Math.max(1, mission.sequence?.length ?? 1) * 1000;
    if (mission.kind === 'ricochet')
        return 1040;
    return 1000;
}
export function masteryStars(mission, score, attemptsRemaining) {
    const scoreRatio = Math.max(0, Math.min(1, score / missionMaxScore(mission)));
    const attemptRatio = Math.max(0, Math.min(1, attemptsRemaining / Math.max(1, mission.maxAttempts)));
    const mastery = scoreRatio * 0.72 + attemptRatio * 0.28;
    if (mastery >= 0.84)
        return 3;
    if (mastery >= 0.58)
        return 2;
    return 1;
}
export function masteryLabel(stars) {
    if (stars === 3)
        return 'Precision';
    if (stars === 2)
        return 'Timing';
    return 'Intelligence';
}
