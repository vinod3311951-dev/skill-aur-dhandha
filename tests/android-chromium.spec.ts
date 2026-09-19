import { expect, test } from '@playwright/test';

test('Business Sudhaar Android/Chromium PWA release gate', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Business Sudhaar/);

  const viewport=page.viewportSize();
  expect(viewport?.width).toBeGreaterThanOrEqual(320);

  const noHorizontalOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth);
  expect(noHorizontalOverflow).toBeTruthy();

  const manifest=await page.evaluate(async()=>await (await fetch('/manifest.webmanifest')).json());
  expect(manifest.name).toBe('Business Sudhaar');
  expect(manifest.start_url).toBe('/');
  expect(manifest.scope).toBe('/');
  expect(manifest.display).toBe('standalone');
  expect(manifest.theme_color).toBe('#31704b');
  expect(manifest.icons.some((x:any)=>x.sizes==='192x192')).toBeTruthy();
  expect(manifest.icons.some((x:any)=>x.sizes==='512x512')).toBeTruthy();
  expect(manifest.icons.some((x:any)=>String(x.purpose||'').includes('maskable'))).toBeTruthy();

  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content','#31704b');
  await expect(page.locator('#start')).toBeVisible();
  await expect(page.getByText('Privacy:',{exact:false})).toBeVisible();
  await expect(page.getByText('Business guidance disclaimer:',{exact:false})).toBeVisible();

  const touchTargets=await page.locator('button').evaluateAll(btns=>btns.filter(b=>(b as HTMLElement).offsetParent!==null).map(b=>b.getBoundingClientRect().height));
  expect(touchTargets.every(h=>h>=42)).toBeTruthy();

  await page.locator('#start').click();
  await page.locator('[data-issue="sales"]').click();
  await expect(page.locator('#next')).toBeEnabled();
  await page.locator('#next').click();
  await expect(page.getByText('What kind of business is this?',{exact:false})).toBeVisible();

  await page.locator('[data-biz="retail"]').click();
  await expect(page.locator('#home')).toBeVisible();
  await page.locator('#home').click();
  await expect(page.locator('#start')).toBeVisible();

  await page.locator('#home-language').selectOption('hi');
  await expect(page.locator('html')).toHaveAttribute('lang','hi-IN');

  await page.evaluate(async()=>{
    if(!('serviceWorker' in navigator)) throw new Error('Service workers unavailable');
    await navigator.serviceWorker.ready;
  });
  await page.reload({waitUntil:'domcontentloaded'});
  const controlled=await page.evaluate(()=>Boolean(navigator.serviceWorker.controller));
  expect(controlled).toBeTruthy();
});
