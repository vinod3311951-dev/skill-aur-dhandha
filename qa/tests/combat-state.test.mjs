import assert from 'node:assert/strict';
import { MISSIONS } from '../../sarhad-inspect/src/game/config.js';
import {
  activeCombatWave,
  applyCombatDamage,
  combatProgress,
  createCombatState,
  defeatHostile,
  useFirstAid
} from '../../sarhad-inspect/src/game/combat-state.js';

const missions = MISSIONS.filter((mission) => mission.kind === 'protection');
assert.ok(missions.length > 0, 'protection missions missing');

for (const mission of missions) {
  const profile = mission.combatProfile;
  let state = createCombatState(profile);
  assert.equal(state.health, profile.initialHealth);
  assert.equal(state.armor, profile.initialArmor);
  assert.equal(state.firstAidKits, profile.firstAidKits);
  assert.equal(state.currentWaveIndex, 0);
  assert.equal(state.wavesCleared, false);

  const bullet = applyCombatDamage(profile, state, 20);
  const blast = applyCombatDamage(profile, state, 20, { blast: true });
  assert.ok(bullet.armor < state.armor, `${mission.id}: bullet must consume armour`);
  assert.ok(blast.armor > bullet.armor, `${mission.id}: blast resistance must reduce incoming blast damage`);

  const damaged = applyCombatDamage(profile, { ...state, armor: 0 }, 40);
  const healed = useFirstAid(profile, damaged);
  assert.ok(healed.health > damaged.health, `${mission.id}: first aid must restore health`);
  assert.equal(healed.firstAidKits, damaged.firstAidKits - 1, `${mission.id}: first aid kit must be consumed`);

  while (!state.wavesCleared) {
    const wave = activeCombatWave(profile, state);
    assert.ok(wave, `${mission.id}: active wave missing`);
    const waveIndexBefore = state.currentWaveIndex;
    for (const hostile of wave.hostiles) {
      const previousDefeated = state.defeatedHostileIds.length;
      state = defeatHostile(profile, state, hostile.id);
      assert.equal(state.defeatedHostileIds.length, previousDefeated + 1, `${mission.id}: hostile defeat not recorded`);
      const duplicate = defeatHostile(profile, state, hostile.id);
      assert.deepEqual(duplicate, state, `${mission.id}: duplicate hostile defeat must be idempotent`);
    }
    if (!state.wavesCleared)
      assert.equal(state.currentWaveIndex, waveIndexBefore + 1, `${mission.id}: wave did not advance`);
  }

  const progress = combatProgress(profile, state);
  assert.equal(progress.remaining, 0, `${mission.id}: remaining hostiles after clear`);
  assert.equal(progress.defeated, progress.total, `${mission.id}: defeated total mismatch`);
  assert.equal(progress.wavesCleared, true, `${mission.id}: wavesCleared false after full clear`);
}

console.log(JSON.stringify({
  status: 'PASS',
  protectionMissions: missions.length,
  checkedCombatProfiles: missions.length
}, null, 2));
