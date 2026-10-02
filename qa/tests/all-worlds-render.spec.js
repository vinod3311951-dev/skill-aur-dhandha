const { test, expect } = require('@playwright/test');

const BASE = process.env.GAME_URL || 'http://127.0.0.1:4173';
const WORLD_NAMES = ['Glacier Reach','Amber Desert','Pine Watch','Monsoon Pass','Glacier Line','Red Canyon','Night Ridge'];
const WORLD_ASSETS = [
  '/assets/worlds/glacier-reach.svg',
  '/assets/worlds/amber-desert.svg',
  '/assets/worlds/pine-watch.svg',
  '/assets/worlds/monsoon-pass.svg',
  '/assets/worlds/glacier-line.svg',
  '/assets/worlds/red-canyon.svg',
  '/assets/worlds/night-ridge.svg'
];

async function openMission(page, worldId, order) {
  await page.goto(`${BASE}/?fx23=1`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Mission Map/i }).click();
  const world = page.locator(`[data-world-id="${worldId}"]`);
  await expect(world).toBeEnabled();
  await world.click();

  const asset = WORLD_ASSETS[worldId - 1];
  const scenic = page.locator('.world-hero-strip');
  await expect(scenic).toBeVisible();
  await expect(scenic).toContainText(WORLD_NAMES[worldId - 1]);
  const bg = await scenic.evaluate((el) => getComputedStyle(el).getPropertyValue('--world-scene'));
  expect(bg).toContain(asset);

  const assetOk = await page.evaluate(async (src) => {
    try {
      const response = await fetch(src, { cache: 'no-store' });
      if (!response.ok) return false;
      const body = await response.text();
      return body.includes('<svg') && body.length > 500;
    } catch {
      return false;
    }
  }, asset);
  expect(assetOk).toBe(true);

  const card = page.locator('[data-mission-id]').filter({
    has: page.locator(`.mission-order:text-is("${order}")`)
  }).first();
  await expect(card).toBeEnabled();
  await card.click();

  await expect(page.getByText(new RegExp(`WORLD ${worldId} • MISSION ${order}`, 'i'))).toBeVisible();
  await expect(page.locator('.briefing-scenic span')).toHaveText(WORLD_NAMES[worldId - 1]);
  await page.getByRole('button', { name: /^Begin$/i }).click();

  await expect(page.locator('#scene')).toBeVisible();
  await expect(page.locator('#playfield')).toBeVisible();
  await expect(page.locator('[data-action="fire"]')).toBeVisible();

  const qa = await page.evaluate(() => window.__SARHAD_QA_STATE__);
  expect(qa.selectedWorldId).toBe(worldId);
  expect(qa.selectedMissionId).toBeTruthy();
  expect(qa.screen).toBe('mission');

  const health = await page.evaluate(() => window.__SARHAD_HEALTH__);
  expect(health.assetFailures || []).toHaveLength(0);
  expect(health.uncaughtErrors || []).toHaveLength(0);
  expect(health.unhandledRejections || []).toHaveLength(0);
}

for (let worldId = 1; worldId <= 7; worldId += 1) {
  for (let order = 1; order <= 15; order += 1) {
    test(`render audit W${worldId} M${String(order).padStart(2, '0')}`, async ({ page }, testInfo) => {
      await openMission(page, worldId, order);
      await page.waitForTimeout(120);
      await page.screenshot({
        path: testInfo.outputPath(`world-${String(worldId).padStart(2, '0')}-mission-${String(order).padStart(2, '0')}.png`),
        fullPage: true
      });
    });
  }
}

test('all seven world assets are distinct and package-accessible', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  const bodies = [];
  for (const asset of WORLD_ASSETS) {
    const data = await page.evaluate(async (src) => {
      const r = await fetch(src, { cache: 'no-store' });
      return { ok: r.ok, text: await r.text() };
    }, asset);
    expect(data.ok).toBe(true);
    expect(data.text).toContain('<svg');
    bodies.push(data.text);
  }
  expect(new Set(bodies).size).toBe(7);
});
