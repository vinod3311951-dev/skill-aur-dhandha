import assert from 'node:assert/strict';
import { WORLDS, MISSIONS } from '../../sarhad-inspect/src/game/config.js';

const ALLOWED_KINDS = new Set([
  'precision', 'timing', 'sequence', 'ricochet',
  'identification', 'protection', 'disablement'
]);

const inUnit = (value) => Number.isFinite(value) && value >= 0 && value <= 1;
const validTarget = (target, label) => {
  assert.ok(target && typeof target === 'object', `${label}: target missing`);
  assert.ok(inUnit(target.x), `${label}: target x out of bounds`);
  assert.ok(inUnit(target.y), `${label}: target y out of bounds`);
  assert.ok(Number.isFinite(target.radius) && target.radius > 0 && target.radius < 0.25, `${label}: invalid target radius`);
  assert.ok(typeof target.label === 'string' && target.label.length > 0, `${label}: target label missing`);
};

assert.equal(WORLDS.length, 7, 'Factory X V1 must have exactly seven worlds');
assert.equal(MISSIONS.length, 105, 'Factory X V1 must have exactly 105 missions');

const worldIds = new Set(WORLDS.map((world) => world.id));
assert.equal(worldIds.size, 7, 'world IDs must be unique');

const missionIds = new Set();
for (const world of WORLDS) {
  const missions = MISSIONS.filter((mission) => mission.worldId === world.id);
  assert.equal(missions.length, 15, `${world.name}: expected 15 missions`);
  assert.deepEqual(
    missions.map((mission) => mission.order),
    Array.from({ length: 15 }, (_, i) => i + 1),
    `${world.name}: orders must be 1..15`
  );
}

for (const mission of MISSIONS) {
  const label = mission.id;
  assert.ok(!missionIds.has(mission.id), `${label}: duplicate mission ID`);
  missionIds.add(mission.id);
  assert.ok(worldIds.has(mission.worldId), `${label}: invalid world ID`);
  assert.ok(ALLOWED_KINDS.has(mission.kind), `${label}: unsupported mission kind`);
  assert.ok(Number.isInteger(mission.maxAttempts) && mission.maxAttempts >= 1, `${label}: invalid attempt count`);
  validTarget(mission.target, label);

  if (mission.motion) {
    assert.ok(['x', 'y'].includes(mission.motion.axis), `${label}: invalid motion axis`);
    assert.ok(inUnit(mission.motion.min) && inUnit(mission.motion.max) && mission.motion.min < mission.motion.max, `${label}: invalid motion range`);
    assert.ok(mission.motion.cycleMs >= 1000, `${label}: motion cycle too short`);
  }

  if (mission.sequence) {
    assert.ok(mission.sequence.length >= 2, `${label}: sequence must contain multiple targets`);
    mission.sequence.forEach((target, index) => validTarget(target, `${label} sequence[${index}]`));
  }

  if (mission.candidates) {
    assert.ok(mission.candidates.length >= 2, `${label}: identification needs multiple candidates`);
    mission.candidates.forEach((target, index) => validTarget(target, `${label} candidate[${index}]`));
    assert.ok(Number.isInteger(mission.correctCandidateIndex), `${label}: correctCandidateIndex missing`);
    assert.ok(mission.correctCandidateIndex >= 0 && mission.correctCandidateIndex < mission.candidates.length, `${label}: correctCandidateIndex out of range`);
  }

  if (mission.ricochet) {
    assert.ok(['x', 'y'].includes(mission.ricochet.axis), `${label}: invalid ricochet axis`);
    assert.ok(inUnit(mission.ricochet.coordinate), `${label}: ricochet coordinate out of bounds`);
    assert.ok(mission.ricochet.tolerance > 0, `${label}: ricochet tolerance invalid`);
  }

  if (mission.protectedFigures) {
    assert.ok(mission.protectedFigures.length >= 1, `${label}: protection mission needs protected figures`);
    mission.protectedFigures.forEach((figure, index) => {
      assert.ok(inUnit(figure.y), `${label} protected[${index}]: y out of bounds`);
      assert.ok(inUnit(figure.minX) && inUnit(figure.maxX) && figure.minX < figure.maxX, `${label} protected[${index}]: invalid crossing range`);
      assert.ok(figure.cycleMs >= 1000, `${label} protected[${index}]: cycle too short`);
      assert.ok(figure.radius > 0 && figure.radius < 0.25, `${label} protected[${index}]: radius invalid`);
    });
    assert.ok(Number.isFinite(mission.threatMs) && mission.threatMs >= 1000, `${label}: protection threat window invalid`);
  }
}

const familyCounts = Object.fromEntries([...ALLOWED_KINDS].map((kind) => [
  kind,
  MISSIONS.filter((mission) => mission.kind === kind).length
]));
for (const [kind, count] of Object.entries(familyCounts))
  assert.ok(count > 0, `mission family ${kind} is missing`);

console.log(JSON.stringify({
  status: 'PASS',
  worlds: WORLDS.length,
  missions: MISSIONS.length,
  uniqueMissionIds: missionIds.size,
  familyCounts
}, null, 2));
