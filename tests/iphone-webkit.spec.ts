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


  // Unified regional mode: one language choice must drive UI + voice locale.
  await page.goto('/');
  await page.locator('#app-language').click();
  await expect(page.locator('#language-select')).toBeVisible();
  await page.locator('#language-select').selectOption('hi');
  await page.waitForTimeout(200);

  const languageState = await page.evaluate(() => ({
    code: localStorage.getItem('skill-aur-dhandha-language-code'),
    voice: localStorage.getItem('skill-aur-dhandha-voice-locale'),
    lang: document.documentElement.lang
  }));
  expect(languageState.code).toBe('hi');
  expect(languageState.voice).toBe('hi-IN');
  expect(languageState.lang).toBe('hi-IN');

  await page.locator('#utility-home').click();
  await page.waitForTimeout(150);
  await expect(page.getByText('मेरा रास्ता खोजें', { exact: false }).first()).toBeVisible();
  await expect(page.locator('.mic').first()).toContainText(/Hindi/);

  // Restore English so the remaining generic PWA checks use the baseline copy.
  await page.evaluate(() => {
    localStorage.setItem('skill-aur-dhandha-language-code','en');
    localStorage.setItem('skill-aur-dhandha-language','English');
    localStorage.setItem('skill-aur-dhandha-voice-locale','en-IN');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });

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

  // Verify the exact offline shell assets are present in Cache Storage.
  // Playwright WebKit's context.setOffline() does not reliably route page fetches
  // through the service worker, so Cache Storage is the deterministic WebKit check.
  const cachedShell = await page.evaluate(async () => {
    const index = await caches.match('/index.html');
    const root = await caches.match('/');
    const response = index || root;
    return response ? await response.text() : '';
  });
  expect(cachedShell).toContain('Skill Aur Dhandha');

  // Confirm the page is controlled by a service worker after reload.
  const controlled = await page.evaluate(() => Boolean(navigator.serviceWorker.controller));
  expect(controlled).toBeTruthy();

  // Confirm normal network fetching still works after the cache/service-worker checks.
  const onlineAgain = await page.evaluate(async () => {
    const response = await fetch('/', { cache: 'no-store' });
    return response.ok;
  });
  expect(onlineAgain).toBeTruthy();
});