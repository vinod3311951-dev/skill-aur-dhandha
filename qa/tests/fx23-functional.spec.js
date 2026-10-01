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
