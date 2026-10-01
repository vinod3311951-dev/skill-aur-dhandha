const { test, expect } = require('@playwright/test');

const BASE = process.env.GAME_URL || 'http://127.0.0.1:4173';

async function openLevel(page, globalLevel) {
  const worldId = Math.floor((globalLevel - 1) / 15) + 1;
  const order = ((globalLevel - 1) % 15) + 1;

  await page.goto(`${BASE}/?fx23=1`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Mission Map/i }).click();
  await page.locator(`[data-world-id="${worldId}"]`).click();
  await page.locator(`[data-mission-id]`).filter({ has: page.locator(`.mission-order:text-is("${order}")`) }).first().click();
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
    const before = Number(await page.locator('#attempts').textContent());
    await page.locator('[data-action="fire"]').click();
    const after = Number(await page.locator('#attempts').textContent());
    expect(after).toBeLessThan(before);
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

test('briefing exposes ten fictional loadouts including Field Catapult', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Start Campaign|Continue Campaign/i }).click();

  const choices = page.locator('[data-loadout-id]');
  await expect(choices).toHaveCount(10);
  await expect(page.locator('[data-loadout-id="field-catapult"]')).toContainText(/Field Catapult/i);

  await page.locator('[data-loadout-id="field-catapult"]').click();
  await expect(page.locator('[data-loadout-id="field-catapult"]')).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /^Begin$/i }).click();
  await expect(page.locator('#activeLoadout')).toHaveText('Field Catapult');
  await expect.poll(() => page.evaluate(() => window.__SARHAD_QA_STATE__.selectedLoadoutId)).toBe('field-catapult');
});

test('Field Catapult and Vector Needle preserve identical precision hit truth', async ({ page }) => {
  async function run(loadoutId) {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Start Campaign|Continue Campaign/i }).click();
    await page.locator(`[data-loadout-id="${loadoutId}"]`).click();
    await page.getByRole('button', { name: /^Begin$/i }).click();
    const fired = await page.evaluate(() => window.__SARHAD_QA_CONTROL__.fireAtCurrentTarget());
    expect(fired).toBe(true);
    await expect(page.getByRole('heading', { name: /Objective complete/i })).toBeVisible({ timeout: 4000 });
    return Number(await page.locator('.result-score strong').textContent());
  }

  const vectorScore = await run('vector-needle');
  const catapultScore = await run('field-catapult');
  expect(catapultScore).toBe(vectorScore);
});

test('civilian hit applies deterministic visible negative score penalty', async ({ page }) => {
  await openLevel(page, 7);
  const stateBefore = await page.evaluate(() => window.__SARHAD_QA_STATE__);
  expect(stateBefore.protectedFigures.length).toBeGreaterThan(0);
  expect(stateBefore.civilianHitPenalty).toBe(400);

  const scoreBefore = Number(await page.locator('#missionScore').textContent());
  const attemptsBefore = Number(await page.locator('#attempts').textContent());
  const fired = await page.evaluate(() => window.__SARHAD_QA_CONTROL__.fireAtProtectedFigure(0));
  expect(fired).toBe(true);

  await expect(page.locator('#civilianHits')).toHaveText('1');
  const scoreAfter = Number(await page.locator('#missionScore').textContent());
  const attemptsAfter = Number(await page.locator('#attempts').textContent());
  expect(scoreAfter).toBe(scoreBefore - 400);
  expect(attemptsAfter).toBe(attemptsBefore - 1);
  await expect(page.locator('#hint')).toContainText(/Civilian hit.*400 points/i);
  await expect(page.locator('.civilian-penalty')).toContainText('400');
});
