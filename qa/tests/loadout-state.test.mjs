import assert from 'node:assert/strict';
import {
  LOADOUTS,
  beginLoadoutReload,
  consumeLoadoutShot,
  createLoadoutState,
  cycleLoadout,
  loadoutReadiness,
  selectLoadout,
  syncLoadoutState
} from '../../sarhad-inspect/src/game/loadout-state.js';

assert.equal(LOADOUTS.length, 11, 'Sarhad must expose exactly 11 fictional loadouts');
assert.ok(LOADOUTS.some((item) => item.id === 'field-catapult'), 'Field Catapult missing');
assert.ok(LOADOUTS.some((item) => item.id === 'siege-rocket'), 'Siege Rocket missing');

const ids = new Set(LOADOUTS.map((item) => item.id));
assert.equal(ids.size, 11, 'loadout ids must be unique');

const soundProfiles = new Set();
for (const item of LOADOUTS) {
  assert.ok(Number.isInteger(item.capacity) && item.capacity >= 2, item.id + ': invalid capacity');
  assert.ok(item.reloadMs >= 900 && item.reloadMs <= 4000, item.id + ': invalid reload duration');
  assert.ok(item.swapCooldownMs >= 250 && item.swapCooldownMs <= 1000, item.id + ': invalid swap cooldown');
  assert.ok(item.fire && Array.isArray(item.fire.layers) && item.fire.layers.length >= 1, item.id + ': sound profile missing');
  const signature = JSON.stringify(item.fire);
  assert.ok(!soundProfiles.has(signature), item.id + ': firing sound profile must be distinct');
  soundProfiles.add(signature);
}

let state = createLoadoutState('vector-needle');
let ready = loadoutReadiness(state, 0);
assert.equal(ready.ammo, ready.capacity);
assert.equal(ready.reloading, false);
assert.equal(ready.canSwap, true);

for (let i = 0; i < ready.capacity; i += 1) {
  const shot = consumeLoadoutShot(state, i * 10);
  assert.equal(shot.fired, true);
  state = shot.state;
}
ready = loadoutReadiness(state, 500);
assert.equal(ready.ammo, 0);
assert.equal(consumeLoadoutShot(state, 500).fired, false);

const reload = beginLoadoutReload(state, 500);
assert.equal(reload.started, true);
state = reload.state;
ready = loadoutReadiness(state, 501);
assert.equal(ready.reloading, true);
assert.ok(ready.reloadRemainingMs > 0);

state = syncLoadoutState(state, 500 + ready.definition.reloadMs + 1);
ready = loadoutReadiness(state, 500 + ready.definition.reloadMs + 1);
assert.equal(ready.reloading, false);
assert.equal(ready.ammo, ready.capacity);

const swap = selectLoadout(state, 'siege-rocket', 5000);
assert.equal(swap.swapped, true);
state = swap.state;
ready = loadoutReadiness(state, 5001);
assert.equal(ready.definition.id, 'siege-rocket');
assert.equal(ready.canSwap, false);

const tooSoon = cycleLoadout(state, 5002);
assert.equal(tooSoon.swapped, false);

const afterCooldown = cycleLoadout(state, 5000 + ready.definition.swapCooldownMs + 1);
assert.equal(afterCooldown.swapped, true);

console.log(JSON.stringify({
  status: 'PASS',
  loadouts: LOADOUTS.length,
  soundProfiles: soundProfiles.size,
  siegeRocketCapacity: LOADOUTS.find((item) => item.id === 'siege-rocket').capacity
}, null, 2));
