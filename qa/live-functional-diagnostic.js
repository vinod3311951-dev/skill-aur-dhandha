const { chromium } = require('@playwright/test');
const fs = require('fs');

(async () => {
  const url = process.env.GAME_URL || 'https://sarhad-sniper.vercel.app/';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
  const report = [];
  const errs = [];

  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('requestfailed', r => errs.push('requestfailed: ' + r.url() + ' ' + (r.failure()?.errorText || '')));

  async function snap(label) {
    const buttons = await page.locator('button').allTextContents().catch(() => []);
    const text = await page.locator('body').innerText().catch(() => '');
    const state = await page.evaluate(() => typeof window.render_game_to_text === 'function' ? window.render_game_to_text() : null).catch(() => null);
    report.push('\n=== ' + label + ' ===\nURL: ' + page.url() + '\nBUTTONS: ' + JSON.stringify(buttons) + '\nSTATE: ' + JSON.stringify(state) + '\nTEXT:\n' + text.slice(0,6000));
  }

  async function clickBy(regex, label) {
    const btn = page.getByRole('button', { name: regex }).first();
    const count = await btn.count();
    report.push('\nCLICK ' + label + ': count=' + count);
    if (!count) return false;
    await btn.click({ timeout: 5000 }).catch(e => { errs.push('click '+label+': '+e.message); });
    await page.waitForTimeout(700);
    await snap('after ' + label);
    return true;
  }

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);
    await snap('home');

    // Direct campaign route first.
    if (await clickBy(/Start Campaign|Continue Campaign|Play|Start/i, 'primary CTA')) {
      await clickBy(/Begin|Start Mission|Deploy|Enter/i, 'briefing start');
    }

    // Return home and inspect mission-map route.
    const home = page.getByRole('button', { name: /home/i }).first();
    if (await home.count()) {
      await home.click().catch(()=>{});
      await page.waitForTimeout(500);
    } else {
      await page.goto(url, { waitUntil:'domcontentloaded' });
      await page.waitForTimeout(500);
    }
    await snap('home before map');

    await clickBy(/Mission Map/i, 'mission map');
    // World 1: click first enabled world card.
    const world = page.locator('[data-world-id]:not([disabled])').first();
    report.push('\nWORLD ENABLED COUNT=' + await page.locator('[data-world-id]:not([disabled])').count());
    if (await world.count()) {
      report.push('\nWORLD DATA=' + JSON.stringify(await world.evaluate(el => ({id:el.dataset.worldId,text:el.innerText}))));
      await world.click().catch(e=>errs.push('world click: '+e.message));
      await page.waitForTimeout(500);
      await snap('after world click');
    }

    const enabledMission = page.locator('[data-mission-id]:not([disabled])').first();
    report.push('\nMISSION ENABLED COUNT=' + await page.locator('[data-mission-id]:not([disabled])').count());
    if (await enabledMission.count()) {
      report.push('\nMISSION DATA=' + JSON.stringify(await enabledMission.evaluate(el => ({id:el.dataset.missionId,text:el.innerText}))));
      await enabledMission.click().catch(e=>errs.push('mission click: '+e.message));
      await page.waitForTimeout(700);
      await snap('after mission click');
      await clickBy(/Begin|Start Mission|Deploy|Enter/i, 'mission begin');
    }

    // Record structural gameplay signals.
    report.push('\nCANVAS COUNT=' + await page.locator('canvas').count());
    report.push('\nFIRE BUTTON COUNT=' + await page.locator('[data-action="fire"]').count());
    report.push('\nPAUSE BUTTON COUNT=' + await page.locator('[data-action="pause"]').count());
  } catch (e) {
    errs.push('fatal: ' + e.stack);
  }

  report.push('\n\n=== ERRORS ===\n' + (errs.length ? errs.join('\n') : 'NONE'));
  fs.writeFileSync('SARHAD_LIVE_DIAGNOSTIC_REPORT.txt', report.join('\n'));
  await browser.close();
})();
