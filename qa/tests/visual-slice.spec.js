const { test, expect } = require('../helpers');

const BASE = process.env.GAME_URL;

test('capture FX-01 World-1 vertical slice surfaces', async ({ page }, testInfo) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(900);

  await page.screenshot({
    path: testInfo.outputPath('fx01-home.png'),
    fullPage: true,
  });

  const campaign = page.getByRole('button', { name: /Start Campaign|Continue Campaign/i });
  await expect(campaign).toBeVisible();
  await campaign.click();
  await page.waitForTimeout(500);

  await expect(page.locator('.briefing-scenic span')).toHaveText('Glacier Reach');
  await page.screenshot({
    path: testInfo.outputPath('fx01-briefing.png'),
    fullPage: true,
  });

  await page.getByRole('button', { name: /^Begin$/i }).click();
  await expect(page.locator('#scene')).toBeVisible();
  await page.waitForTimeout(1200);

  await page.screenshot({
    path: testInfo.outputPath('fx01-mission.png'),
    fullPage: true,
  });
});