export const WORLDS = [
    { id: 1, name: 'Sarhad Cliffs', subtitle: 'High ridges and clean sightlines', palette: ['#8fb6aa', '#48695d', '#162821'], scenery: 'cliffs' },
    { id: 2, name: 'Amber Desert', subtitle: 'Heat shimmer and timed windows', palette: ['#e2b76f', '#9b6638', '#2a2119'], scenery: 'desert' },
    { id: 3, name: 'Pine Watch', subtitle: 'Forest cover and identification', palette: ['#9cb79f', '#4f6a50', '#17251a'], scenery: 'pine' },
    { id: 4, name: 'Monsoon Pass', subtitle: 'Rain, motion and visibility', palette: ['#8faeb6', '#496671', '#15232a'], scenery: 'monsoon' },
    { id: 5, name: 'Glacier Line', subtitle: 'Cold air and ricochet geometry', palette: ['#d5edf2', '#799ca8', '#1a2b31'], scenery: 'glacier' },
    { id: 6, name: 'Red Canyon', subtitle: 'Mechanical sequence puzzles', palette: ['#cc9477', '#7f4e3a', '#2d1d19'], scenery: 'canyon' },
    { id: 7, name: 'Night Ridge', subtitle: 'Mastery under low visibility', palette: ['#7987a8', '#343d5b', '#111522'], scenery: 'night' }
];
const KIND_PATTERN = [
    'precision', 'timing', 'sequence', 'identification', 'ricochet',
    'disablement', 'protection', 'precision', 'timing', 'identification',
    'sequence', 'ricochet', 'disablement', 'protection', 'precision'
];
const WEAPON_BY_KIND = {
    precision: 'precision',
    timing: 'rapid',
    sequence: 'precision',
    identification: 'precision',
    ricochet: 'precision',
    protection: 'heavy',
    disablement: 'launcher'
};
function protectedFiguresFor(worldId, order, tier) {
    return Array.from({ length: 3 }, (_, index) => ({
        id: `civilian-${worldId}-${order}-${index + 1}`,
        y: 0.60 + index * 0.09,
        minX: 0.18 + (index % 2) * 0.06,
        maxX: 0.82 - (index % 2) * 0.05,
        cycleMs: Math.max(3000, 5200 - tier * 9 + index * 420),
        phaseMs: index * 760 + Math.round(seeded(worldId, order, 120 + index) * 700),
        radius: 0.035
    }));
}
const TITLE_BY_KIND = {
    precision: ['Silent Relay', 'Beacon Pin', 'Signal Eye'],
    timing: ['Crossing Signal', 'Moving Window', 'Transit Pulse'],
    sequence: ['Power Junction', 'Circuit Order', 'Relay Chain'],
    identification: ['True Marker', 'Pattern Read', 'Signal Match'],
    ricochet: ['Bank Angle', 'Mirror Line', 'Rebound Gate'],
    protection: ['Guard Window', 'Intercept Pulse', 'Shield Watch'],
    disablement: ['Weak Point', 'Core Breaker', 'System Lock']
};
function seeded(worldId, order, salt) {
    const n = Math.sin(worldId * 173.41 + order * 91.73 + salt * 37.19) * 43758.5453;
    return n - Math.floor(n);
}
function target(worldId, order, salt, label, radius = 0.052, marker = 'core') {
    return {
        label,
        x: 0.24 + seeded(worldId, order, salt) * 0.52,
        y: 0.26 + seeded(worldId, order, salt + 1) * 0.34,
        radius,
        marker
    };
}
function spreadTargets(worldId, order, salt, specs, radius) {
    const anchors = [
        { x: 0.30, y: 0.34 },
        { x: 0.70, y: 0.36 },
        { x: 0.50, y: 0.60 }
    ];
    const rotation = (worldId + order + salt) % anchors.length;
    return specs.map((spec, index) => {
        const anchor = anchors[(index + rotation) % anchors.length];
        const jitterX = (seeded(worldId, order, salt + index * 7) - 0.5) * 0.04;
        const jitterY = (seeded(worldId, order, salt + index * 7 + 1) - 0.5) * 0.04;
        return {
            label: spec.label,
            x: anchor.x + jitterX,
            y: anchor.y + jitterY,
            radius,
            marker: spec.marker
        };
    });
}
function missionFor(worldId, order) {
    if (worldId === 1 && order === 1) {
        return {
            id: 'w1-m1-relay-core', worldId, order, kind: 'precision', title: 'Silent Relay',
            objective: 'Disable the exposed relay core with one precise shot.', maxAttempts: 3,
            target: { label: 'Relay Core', x: 0.68, y: 0.42, radius: 0.055, marker: 'core' },
            weaponClass: 'precision'
        };
    }
    if (worldId === 1 && order === 2) {
        return {
            id: 'w1-m2-signal-drone', worldId, order, kind: 'timing', title: 'Crossing Signal',
            objective: 'Disable the moving signal drone while it crosses the open corridor.', maxAttempts: 4,
            target: { label: 'Signal Drone', x: 0.28, y: 0.38, radius: 0.05, marker: 'bar' },
            motion: { axis: 'x', min: 0.24, max: 0.78, cycleMs: 4200 },
            weaponClass: 'rapid'
        };
    }
    if (worldId === 1 && order === 3) {
        return {
            id: 'w1-m3-power-junction', worldId, order, kind: 'sequence', title: 'Power Junction',
            objective: 'Disable the three marked control nodes in the shown order.', maxAttempts: 5,
            target: { label: 'Node A', x: 0.34, y: 0.38, radius: 0.052, marker: 'ring' },
            sequence: [
                { label: 'Node A', x: 0.34, y: 0.38, radius: 0.052, marker: 'ring' },
                { label: 'Node B', x: 0.66, y: 0.34, radius: 0.052, marker: 'bar' },
                { label: 'Node C', x: 0.58, y: 0.58, radius: 0.052, marker: 'diamond' }
            ],
            weaponClass: 'precision'
        };
    }
    const kind = KIND_PATTERN[order - 1];
    const tier = (worldId - 1) * 15 + order;
    const radius = Math.max(0.035, 0.058 - tier * 0.00016);
    const baseTitle = TITLE_BY_KIND[kind][(worldId + order) % TITLE_BY_KIND[kind].length];
    const title = `${baseTitle} ${String(order).padStart(2, '0')}`;
    const id = `w${worldId}-m${String(order).padStart(2, '0')}-${kind}`;
    if (kind === 'timing') {
        const moving = target(worldId, order, 2, 'Signal Drone', radius, 'bar');
        return {
            id, worldId, order, kind, title,
            objective: 'Track the moving signal unit and disable it inside the open sightline.',
            maxAttempts: 4,
            target: moving,
            motion: {
                axis: order % 2 === 0 ? 'x' : 'y',
                min: 0.22,
                max: order % 2 === 0 ? 0.78 : 0.62,
                cycleMs: Math.max(2400, 4300 - tier * 12)
            },
            weaponClass: WEAPON_BY_KIND[kind]
        };
    }
    if (kind === 'sequence') {
        const nodes = spreadTargets(worldId, order, 10, [
            { label: 'Node A', marker: 'ring' },
            { label: 'Node B', marker: 'bar' },
            { label: 'Node C', marker: 'diamond' }
        ], radius);
        return {
            id, worldId, order, kind, title,
            objective: 'Disable the three control nodes in the shown order.',
            maxAttempts: 5,
            target: nodes[0],
            sequence: nodes,
            weaponClass: WEAPON_BY_KIND[kind]
        };
    }
    if (kind === 'identification') {
        const correct = (worldId + order) % 3;
        const candidates = spreadTargets(worldId, order, 40, [
            { label: 'Ring Node', marker: 'ring' },
            { label: 'Bar Node', marker: 'bar' },
            { label: 'Diamond Node', marker: 'diamond' }
        ], radius * 1.08);
        const markerNames = ['double-ring', 'bar', 'diamond'];
        return {
            id, worldId, order, kind, title,
            objective: `Identify and disable the ${markerNames[correct]} marker.`,
            maxAttempts: 3,
            target: candidates[correct],
            candidates,
            correctCandidateIndex: correct,
            weaponClass: WEAPON_BY_KIND[kind]
        };
    }
    if (kind === 'ricochet') {
        const ricochetTarget = target(worldId, order, 70, 'Hidden Relay', radius * 1.08, 'core');
        const axis = order % 2 === 0 ? 'x' : 'y';
        const coordinate = axis === 'x' ? (ricochetTarget.x > 0.5 ? 0.88 : 0.12) : 0.16;
        return {
            id, worldId, order, kind, title,
            objective: 'Use the marked rebound surface to reach the hidden relay.',
            maxAttempts: 4,
            target: ricochetTarget,
            ricochet: { axis, coordinate, tolerance: Math.max(0.035, radius * 0.9) },
            weaponClass: WEAPON_BY_KIND[kind]
        };
    }
    if (kind === 'protection') {
        const generatedTarget = target(worldId, order, 80, 'Carrier Device', radius * 1.08, 'diamond');
        const moving = { ...generatedTarget, y: 0.32 + seeded(worldId, order, 84) * 0.10 };
        return {
            id, worldId, order, kind, title,
            objective: 'Disable the carrier device while civilians cross the danger zone. Civilian hits reduce score.',
            maxAttempts: 4,
            target: moving,
            motion: { axis: 'x', min: 0.16, max: 0.84, cycleMs: Math.max(2700, 4100 - tier * 7) },
            threatMs: Math.max(5600, 8200 - tier * 18),
            weaponClass: WEAPON_BY_KIND[kind],
            protectedFigures: protectedFiguresFor(worldId, order, tier)
        };
    }
    if (kind === 'disablement') {
        const weakPoint = target(worldId, order, 90, 'Weak Point', radius * 0.78, 'ring');
        return {
            id, worldId, order, kind, title,
            objective: 'Disable the machine through its small exposed weak point.',
            maxAttempts: 3,
            target: weakPoint,
            weaponClass: WEAPON_BY_KIND[kind]
        };
    }
    return {
        id, worldId, order, kind, title,
        objective: 'Disable the exposed mechanical core with a precise shot.',
        maxAttempts: 3,
        target: target(worldId, order, 100, 'Mechanical Core', radius, 'core'),
        weaponClass: WEAPON_BY_KIND[kind]
    };
}
export const MISSIONS = WORLDS.flatMap((world) => Array.from({ length: 15 }, (_, index) => missionFor(world.id, index + 1)));
export function missionsForWorld(worldId) {
    return MISSIONS.filter((mission) => mission.worldId === worldId);
}
