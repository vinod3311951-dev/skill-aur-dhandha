const { test, expect } = require('@playwright/test');

const BASE = process.env.GAME_URL || 'http://127.0.0.1:4173';

async function openLevel(page, globalLevel) {
  const worldId = Math.floor((globalLevel - 1) / 15) + 1;
  const order = ((globalLevel - 1) % 15) + 1;

  await page.goto(`${BASE}/?fx23=1`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Mission Map/i }).click();
  await page.locator(`[data-world-id="${worldId}"]`).click();
  await page.locator('[data-mission-id]').filter({ has: page.locator(`.mission-order:text-is("${order}")`) }).first().click();
  await expect(page.getByRole('button', { name: /^Begin$/i })).toBeVisible();
  await page.getByRole('button', { name: /^Begin$/i }).click();
  await expect(page.locator('#scene')).toBeVisible();
  await expect(page.locator('[data-action="fire"]')).toBeVisible();
  return { worldId, order };
}

test('level 1 is playable and completion unlocks level 2', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Start Campaign|Continue Campaign/i }).click();
  await expect(page.getByRole('button', { name: /^Begin$/i })).toBeVisible();
  await page.getByRole('button', { name: /^Begin$/i }).click();

  await expect(page.locator('#scene')).toBeVisible();
  await page.locator('[data-action="viewToggle"]').click();

  const playfield = page.locator('#playfield');
  const box = await playfield.boundingBox();
  if (!box) throw new Error('Playfield bounding box missing');

  await page.mouse.click(box.x + box.width * 0.68, box.y + box.height * 0.42);
  await page.locator('[data-action="fire"]').click();

  await expect(page.getByRole('heading', { name: /Objective complete/i })).toBeVisible({ timeout: 4000 });
  const scoreText = await page.locator('.result-score strong').textContent();
  expect(Number(scoreText)).toBeGreaterThan(0);

  await page.getByRole('button', { name: /Next|Continue Route/i }).click();
  await expect(page.getByText(/MISSION 2/i)).toBeVisible();

  await page.getByRole('button', { name: /Missions/i }).click();
  const mission2 = page.locator('[data-mission-id]').filter({ has: page.locator('.mission-order:text-is("2")') }).first();
  await expect(mission2).toBeEnabled();
});

for (const level of [5, 10, 25, 50, 100]) {
  test(`representative level ${level} opens into playable mission`, async ({ page }) => {
    await openLevel(page, level);
    const before = await page.locator('#attempts').textContent();
    await page.locator('[data-action="fire"]').click();
    const after = await page.locator('#attempts').textContent();
    if (before === '∞') {
      expect(after).toBe('∞');
      await expect(page.locator('#combatHud')).toBeVisible();
    } else {
      expect(Number(after)).toBeLessThan(Number(before));
    }
  });
}

test('World 1 presents Glacier Reach and Captain Rudraa briefing identity', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Start Campaign|Continue Campaign/i }).click();
  await expect(page.getByText(/WORLD 1 • MISSION 1/i)).toBeVisible();
  await expect(page.locator('.briefing-scenic span')).toHaveText('Glacier Reach');
  await expect(page.locator('.rudraa-note-portrait img')).toHaveCount(1);
});

test('Reduced effects setting visibly binds to the document presentation state', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Settings/i }).click();
  const toggle = page.locator('[data-setting="effects"]');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.reducedEffects)).toBe('true');
});

test('Settings always exposes separate Back and Home controls and Back returns to the previous safe screen', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Mission Map/i }).click();
  await expect(page.getByRole('heading', { name: /Choose any route/i })).toBeVisible();

  await page.getByRole('button', { name: /Settings/i }).click();
  const settingsBack = page.locator('[data-action="settingsBack"]');
  const settingsHome = page.locator('[data-action="settingsHome"]');
  await expect(settingsBack).toBeVisible();
  await expect(settingsBack).toContainText(/Back/i);
  await expect(settingsHome).toBeVisible();
  await expect(settingsHome).toContainText(/Home/i);

  await settingsBack.click();
  await expect(page.getByRole('heading', { name: /Choose any route/i })).toBeVisible();

  await page.getByRole('button', { name: /Settings/i }).click();
  await page.locator('[data-action="settingsHome"]').click();
  await expect(page.getByRole('heading', { name: /Observe\. Decide\. Fire once\./i })).toBeVisible();
});

test('Pause → Settings preserves the active mission and returns to the same state', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Start Campaign|Continue Campaign/i }).click();
  await page.getByRole('button', { name: /^Begin$/i }).click();
  await expect(page.locator('#scene')).toBeVisible();

  const missionBefore = await page.evaluate(() => window.__SARHAD_QA_STATE__.selectedMissionId);
  const attemptsBefore = await page.locator('#attempts').textContent();

  await page.getByRole('button', { name: /^Pause$/i }).click();
  await expect(page.getByRole('heading', { name: /Mission held/i })).toBeVisible();
  await page.getByRole('button', { name: /^Settings$/i }).click();

  await expect(page.getByRole('button', { name: /Return to active mission/i })).toBeVisible();
  await expect(page.getByText(/Active mission held safely/i)).toBeVisible();

  await page.getByRole('button', { name: /Return to active mission/i }).click();
  await expect(page.locator('#scene')).toBeVisible();

  const missionAfter = await page.evaluate(() => window.__SARHAD_QA_STATE__.selectedMissionId);
  const attemptsAfter = await page.locator('#attempts').textContent();
  expect(missionAfter).toBe(missionBefore);
  expect(attemptsAfter).toBe(attemptsBefore);
});

test('Binoculars scout without consuming an attempt and return to aim in one tap', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Start Campaign|Continue Campaign/i }).click();
  await page.getByRole('button', { name: /^Begin$/i }).click();
  await expect(page.locator('#scene')).toBeVisible();

  const attemptsBefore = Number(await page.locator('#attempts').textContent());
  const binoculars = page.locator('[data-action="binoculars"]');
  await binoculars.click();
  await expect(binoculars).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#playfield')).toHaveClass(/binocular-view/);

  await page.locator('[data-action="fire"]').click();
  const attemptsDuring = Number(await page.locator('#attempts').textContent());
  expect(attemptsDuring).toBe(attemptsBefore);
  await expect(page.locator('#hint')).toContainText(/Binoculars are for observation/i);

  await binoculars.click();
  await expect(binoculars).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#playfield')).not.toHaveClass(/binocular-view/);
});

test('Environmental and Telescopic views are both playable and share aim state', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Start Campaign|Continue Campaign/i }).click();
  await page.getByRole('button', { name: /^Begin$/i }).click();
  const playfield = page.locator('#playfield');
  await expect(playfield).toHaveAttribute('data-view', 'scope');

  const toggle = page.locator('[data-action="viewToggle"]');
  await toggle.click();
  await expect(playfield).toHaveAttribute('data-view', 'overview');

  const box = await playfield.boundingBox();
  if (!box) throw new Error('Playfield bounding box missing');
  await page.mouse.click(box.x + box.width * 0.62, box.y + box.height * 0.44);

  const overviewAim = await page.evaluate(() => ({
    x: window.__SARHAD_QA_STATE__.aimX,
    y: window.__SARHAD_QA_STATE__.aimY
  }));
  expect(overviewAim.x).toBeGreaterThan(0.55);
  expect(overviewAim.x).toBeLessThan(0.70);

  await toggle.click();
  await expect(playfield).toHaveAttribute('data-view', 'scope');
  const scopeAim = await page.evaluate(() => ({
    x: window.__SARHAD_QA_STATE__.aimX,
    y: window.__SARHAD_QA_STATE__.aimY
  }));
  expect(scopeAim.x).toBeCloseTo(overviewAim.x, 5);
  expect(scopeAim.y).toBeCloseTo(overviewAim.y, 5);
});

test('Mission 1 coaching stays clear of the Binoculars and view controls on phone layouts', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Start Campaign|Continue Campaign/i }).click();
  await page.getByRole('button', { name: /^Begin$/i }).click();

  const coach = page.locator('#firstMinuteCoach');
  const tools = page.locator('.view-tools');
  await expect(coach).toBeVisible();
  await expect(tools).toBeVisible();

  const coachBox = await coach.boundingBox();
  const toolsBox = await tools.boundingBox();
  const fieldBox = await page.locator('#playfield').boundingBox();
  if (!coachBox || !toolsBox || !fieldBox) throw new Error('Mission 1 presentation boxes missing');

  expect(coachBox.y).toBeGreaterThanOrEqual(toolsBox.y + toolsBox.height + 6);
  expect(coachBox.x).toBeGreaterThanOrEqual(fieldBox.x);
  expect(coachBox.x + coachBox.width).toBeLessThanOrEqual(fieldBox.x + fieldBox.width);
});

test('briefing exposes eleven fictional loadouts including Field Catapult and Siege Rocket', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Start Campaign|Continue Campaign/i }).click();

  const choices = page.locator('[data-loadout-id]');
  await expect(choices).toHaveCount(11);
  await expect(page.locator('[data-loadout-id="field-catapult"]')).toContainText(/Field Catapult/i);
  await expect(page.locator('[data-loadout-id="siege-rocket"]')).toContainText(/Siege Rocket/i);

  await page.locator('[data-loadout-id="field-catapult"]').click();
  await expect(page.locator('[data-loadout-id="field-catapult"]')).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /^Begin$/i }).click();
  await expect(page.locator('#activeLoadout')).toHaveText('Field Catapult');
  await expect.poll(() => page.evaluate(() => window.__SARHAD_QA_STATE__.selectedLoadoutId)).toBe('field-catapult');
});

test('Field Catapult and Vector Needle preserve identical precision hit truth', async ({ page }) => {
  async function truth(loadoutId) {
    await page.goto(`${BASE}/?fx23=1`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Start Campaign|Continue Campaign/i }).click();
    await page.locator(`[data-loadout-id="${loadoutId}"]`).click();
    await page.getByRole('button', { name: /^Begin$/i }).click();
    return page.evaluate(() => window.__SARHAD_QA_CONTROL__.shotTruthAtCurrentTarget());
  }

  const vector = await truth('vector-needle');
  const catapult = await truth('field-catapult');

  expect(vector.loadoutId).toBe('vector-needle');
  expect(catapult.loadoutId).toBe('field-catapult');
  expect(vector.hit).toBe(true);
  expect(catapult.hit).toBe(true);
  expect(catapult.score).toBe(vector.score);
  expect(catapult.distance).toBe(vector.distance);
});

test('civilian hit applies deterministic visible negative score penalty', async ({ page }) => {
  await openLevel(page, 7);
  const stateBefore = await page.evaluate(() => window.__SARHAD_QA_STATE__);
  expect(stateBefore.protectedFigures.length).toBeGreaterThan(0);
  expect(stateBefore.civilianHitPenalty).toBe(400);

  const scoreBefore = Number(await page.locator('#missionScore').textContent());
  const attemptsBefore = await page.locator('#attempts').textContent();
  const fired = await page.evaluate(() => window.__SARHAD_QA_CONTROL__.fireAtProtectedFigure(0));
  expect(fired).toBe(true);

  await expect(page.locator('#civilianHits')).toHaveText('1');
  const scoreAfter = Number(await page.locator('#missionScore').textContent());
  const attemptsAfter = await page.locator('#attempts').textContent();
  expect(scoreAfter).toBe(scoreBefore - 400);
  expect(attemptsAfter).toBe(attemptsBefore);
  expect(attemptsAfter).toBe('∞');
  await expect(page.locator('#hint')).toContainText(/Civilian hit.*400 points/i);
  await expect(page.locator('.civilian-penalty')).toContainText('400');
});


test('all seven worlds and 105 missions are open in ordinary consumer mode', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Mission Map/i }).click();

  const worlds = page.locator('[data-world-id]');
  await expect(worlds).toHaveCount(7);
  for (let i = 0; i < 7; i += 1)
    await expect(worlds.nth(i)).toBeEnabled();

  await page.locator('[data-world-id="7"]').click();
  const missions = page.locator('[data-mission-id]');
  await expect(missions).toHaveCount(15);
  for (let i = 0; i < 15; i += 1)
    await expect(missions.nth(i)).toBeEnabled();

  const mission15 = missions.filter({ has: page.locator('.mission-order:text-is("15")') }).first();
  await mission15.click();
  await expect(page.getByRole('button', { name: /^Begin$/i })).toBeVisible();
  await expect(page.getByText(/WORLD 7 • MISSION 15/i)).toBeVisible();
});


test('protection combat is one-thumb playable with ammo reload swap aid armour and waves', async ({ page }) => {
  await openLevel(page, 7);

  await expect(page.locator('#combatHud')).toBeVisible();
  await expect(page.locator('#readinessStrip')).toBeVisible();
  await expect(page.locator('#attempts')).toHaveText('∞');

  const start = await page.evaluate(() => window.__SARHAD_QA_STATE__);
  expect(start.combat).toBeTruthy();
  expect(start.combat.health).toBe(100);
  expect(start.combat.armor).toBe(100);
  expect(start.combat.totalWaves).toBeGreaterThanOrEqual(3);
  expect(start.loadout.capacity).toBeGreaterThan(1);

  const ammoBefore = start.loadout.ammo;
  const hostileBefore = start.combat.defeated;
  const firedHostile = await page.evaluate(() => window.__SARHAD_QA_CONTROL__.fireAtFirstCombatHostile());
  expect(firedHostile).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__SARHAD_QA_STATE__.loadout.ammo)).toBe(ammoBefore - 1);
  await expect.poll(() => page.evaluate(() => window.__SARHAD_QA_STATE__.combat.defeated)).toBeGreaterThan(hostileBefore);

  await page.locator('[data-action="reload"]').click();
  await expect.poll(() => page.evaluate(() => window.__SARHAD_QA_STATE__.loadout.reloading)).toBe(true);

  await page.waitForTimeout(1400);
  await expect.poll(() => page.evaluate(() => window.__SARHAD_QA_STATE__.loadout.reloading)).toBe(false);

  const selectedBefore = await page.evaluate(() => window.__SARHAD_QA_STATE__.selectedLoadoutId);
  await page.locator('[data-action="swap"]').click();
  await expect.poll(() => page.evaluate(() => window.__SARHAD_QA_STATE__.selectedLoadoutId)).not.toBe(selectedBefore);

  const damaged = await page.evaluate(() => window.__SARHAD_QA_CONTROL__.damageRudraa(120, false));
  expect(damaged).toBe(true);
  const afterDamage = await page.evaluate(() => window.__SARHAD_QA_STATE__.combat);
  expect(afterDamage.health).toBeLessThan(100);
  expect(afterDamage.armor).toBeLessThan(100);

  const aidBefore = afterDamage.firstAidKits;
  await page.locator('[data-action="firstAid"]').click();
  const afterAid = await page.evaluate(() => window.__SARHAD_QA_STATE__.combat);
  expect(afterAid.health).toBeGreaterThan(afterDamage.health);
  expect(afterAid.firstAidKits).toBe(aidBefore - 1);

  const platesBefore = afterAid.armorPlates;
  await page.locator('[data-action="armorPlate"]').click();
  const afterPlate = await page.evaluate(() => window.__SARHAD_QA_STATE__.combat);
  expect(afterPlate.armor).toBeGreaterThan(afterAid.armor);
  expect(afterPlate.armorPlates).toBe(platesBefore - 1);

  const cleared = await page.evaluate(() => window.__SARHAD_QA_CONTROL__.clearCombatWaves());
  expect(cleared).toBe(true);
  await expect(page.locator('#missionStatus')).toContainText(/CARRIER EXPOSED/i);

  const carrier = await page.evaluate(() => window.__SARHAD_QA_CONTROL__.fireAtCurrentTarget());
  expect(carrier).toBe(true);
  await expect(page.getByRole('heading', { name: /Objective complete/i })).toBeVisible({ timeout: 4000 });
});

test('Siege Rocket has finite ammo and a distinct runtime firing profile', async ({ page }) => {
  await page.goto(`${BASE}/?fx23=1`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Start Campaign|Continue Campaign/i }).click();
  await page.locator('[data-loadout-id="siege-rocket"]').click();
  await page.getByRole('button', { name: /^Begin$/i }).click();

  await expect(page.locator('#activeLoadout')).toHaveText('Siege Rocket');
  const state = await page.evaluate(() => window.__SARHAD_QA_STATE__.loadout);
  expect(state.capacity).toBe(2);
  expect(state.ammo).toBe(2);

  await page.locator('[data-action="fire"]').click();
  await expect.poll(() => page.evaluate(() => window.__SARHAD_QA_STATE__.loadout.ammo)).toBe(1);
});
