import { expect, test } from '@playwright/test';

test('Business Sudhaar iPhone/WebKit release gate', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Business Sudhaar/);

  const viewport=page.viewportSize();
  expect(viewport?.width).toBeGreaterThanOrEqual(320);

  await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content','yes');
  await expect(page.locator('meta[name="apple-mobile-web-app-status-bar-style"]')).toHaveAttribute('content','default');
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content',/viewport-fit=cover/);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href','/icon-192.png');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href','/manifest.webmanifest');

  const noHorizontalOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth);
  expect(noHorizontalOverflow).toBeTruthy();

  await expect(page.getByText('Privacy:',{exact:false})).toBeVisible();
  await expect(page.getByText('Business guidance disclaimer:',{exact:false})).toBeVisible();
  await expect(page.locator('#home-language')).toBeVisible();

  await page.locator('#home-language').selectOption('hi');
  await expect(page.locator('html')).toHaveAttribute('lang','hi-IN');

  await page.locator('#start').click();
  await expect(page.locator('#back')).toBeVisible();
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('#next')).toBeVisible();

  const navHeights=await page.locator('.bs-nav button').evaluateAll(btns=>btns.map(b=>b.getBoundingClientRect().height));
  expect(navHeights.every(h=>h>=44)).toBeTruthy();

  await page.locator('#home').click();
  await expect(page.locator('#start')).toBeVisible();

  await page.evaluate(()=>{
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
  });
  await page.locator('#voice-input').click();
  await expect(page.locator('#voice-status')).toContainText(/not available/i);

  await page.evaluate(async()=>{
    if(!('serviceWorker' in navigator)) throw new Error('Service workers unavailable');
    await navigator.serviceWorker.ready;
  });
  await page.reload({waitUntil:'domcontentloaded'});
  const cacheOk=await page.evaluate(async()=>{
    await navigator.serviceWorker.ready;
    const keys=await caches.keys();
    return keys.some(k=>k.startsWith('business-sudhaar-'));
  });
  expect(cacheOk).toBeTruthy();

  const manifest=await page.evaluate(async()=>await (await fetch('/manifest.webmanifest')).json());
  expect(manifest.display).toBe('standalone');
  expect(manifest.orientation).toBe('portrait-primary');
  expect(manifest.icons.some((x:any)=>x.sizes==='192x192')).toBeTruthy();
  expect(manifest.icons.some((x:any)=>x.sizes==='512x512')).toBeTruthy();
});
