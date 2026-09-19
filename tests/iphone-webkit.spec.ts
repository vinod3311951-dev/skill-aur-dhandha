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

  // Verify that the service worker is active and the app shell cache exists.
  await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) throw new Error('Service workers unavailable');
    await navigator.serviceWorker.ready;
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    const keys = await caches.keys();
    if (!keys.some(key => key.startsWith('skill-aur-dhandha-'))) {
      throw new Error('Expected app shell cache was not created');
    }
  });

  // Simulate an offline runtime fetch instead of forcing an offline document reload,
  // which currently triggers a Playwright WebKit internal error unrelated to app code.
  await context.setOffline(true);
  const offlineShell = await page.evaluate(async () => {
    try {
      const response = await fetch('/', { cache: 'no-store' });
      return response.ok ? await response.text() : '';
    } catch {
      return '';
    }
  });
  expect(offlineShell).toContain('Skill Aur Dhandha');
  await context.setOffline(false);

  // Confirm recovery after reconnect.
  const onlineAgain = await page.evaluate(async () => {
    const response = await fetch('/', { cache: 'no-store' });
    return response.ok;
  });
  expect(onlineAgain).toBeTruthy();
});
