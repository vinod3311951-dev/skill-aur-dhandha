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
