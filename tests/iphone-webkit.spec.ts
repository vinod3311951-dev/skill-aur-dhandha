import { expect, test } from '@playwright/test';

test('iPhone WebKit PWA shell survives core navigation and layout checks', async ({ page, context }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Skill Aur Dhandha/);

  const viewport = page.viewportSize();
  expect(viewport?.width).toBeGreaterThanOrEqual(320);

  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifestHref).toBe('/manifest.webmanifest');

  await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/icon-192.png');

  const bodyOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
  expect(bodyOverflow).toBeTruthy();

  const pathButton = page.getByText('Find My Path', { exact: false }).first();
  await expect(pathButton).toBeVisible();
  await pathButton.click();

  await page.waitForTimeout(150);
  await expect(page.locator('body')).toBeVisible();

  await page.goBack().catch(() => null);
  await page.waitForTimeout(150);
  await expect(page.locator('body')).toBeVisible();

  // Confirm unsupported SpeechRecognition does not crash the page in WebKit.
  await page.evaluate(() => {
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
  });
  const mic = page.locator('.mic').first();
  if (await mic.count()) {
    await mic.click();
    await expect(page.locator('[data-voice-status]').first()).toContainText(/not available|उपलब्ध नहीं/);
  }

  // Exercise an offline reload after the shell has been loaded once.
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
  await context.setOffline(false);
});
