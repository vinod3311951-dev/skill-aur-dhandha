const { test: base, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { PNG } = require('pngjs');

const num = (key, fallback) => (process.env[key] !== undefined ? Number(process.env[key]) : fallback);

// Every threshold can be overridden with an env var, so CI can tighten or relax without code changes.
const GATES = {
  readyTimeoutMs: num('GATE_READY_MS', 20000),
  idleSampleMs: num('GATE_IDLE_SAMPLE_MS', 10000),
  minP95Fps: num('GATE_MIN_P95_FPS', 30),          // slowest 5% of frames must still be >= this FPS
  maxFreezes: num('GATE_MAX_FREEZES', 0),           // frames > 1s during idle
  fuzzMaxFreezes: num('GATE_FUZZ_MAX_FREEZES', 3),  // looser: rotate/resize can legitimately hitch
  maxHeapGrowthPct: num('GATE_MAX_HEAP_GROWTH_PCT', 75), // coarse leak detector, Chromium only
  minLumaStdDev: num('GATE_MIN_LUMA_STDDEV', 3),    // below this the canvas is considered blank
  fuzzSeconds: num('FUZZ_SECONDS', 120),
  stuckSeconds: num('STUCK_SECONDS', 30),
  stuckFails: process.env.GATE_STUCK_FAIL === '1',  // default: stuck detection only warns
  seedBase: num('FUZZ_SEED', 1000),
  // Known-benign noise, e.g. IGNORE_ISSUES="autoplay|favicon"
  ignore: process.env.IGNORE_ISSUES ? new RegExp(process.env.IGNORE_ISSUES, 'i') : null,
};

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const INSTRUMENT_PATH = path.join(__dirname, 'instrument.js');

const test = base.extend({
  game: async ({ page }, use, testInfo) => {
    if (!process.env.GAME_URL) throw new Error('Set GAME_URL to a public https URL of the game (BrowserStack cannot reach localhost).');

    const net = [];
    let crashed = false;
    page.on('crash', () => { crashed = true; });
    page.on('pageerror', (e) => net.push({ type: 'page-error', detail: String((e && e.message) || e) }));
    page.on('requestfailed', (r) => net.push({ type: 'request-failed', detail: `${r.url()} ${(r.failure() && r.failure().errorText) || ''}` }));
    page.on('response', (r) => { if (r.status() >= 400) net.push({ type: `http-${r.status()}`, detail: r.url() }); });

    const seed = GATES.seedBase + testInfo.repeatEachIndex; // each repeat explores a different but reproducible path
    let lateInject = false;
    let lumaCaptureIndex = 0;

    const game = {
      page,
      seed,

      async open() {
        // Preferred: inject before any game code runs. Fallback below if the remote browser ignores it.
        try { await page.addInitScript({ path: INSTRUMENT_PATH }); } catch (_) { /* handled by fallback */ }
        const url = new URL(process.env.GAME_URL);
        url.searchParams.set('test', '1');
        url.searchParams.set('seed', String(seed));
        await page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
        if (!(await page.evaluate(() => !!window.__TEST__))) {
          await page.addScriptTag({ path: INSTRUMENT_PATH });
          lateInject = true; // early errors and Math.random seeding were missed on this device
          testInfo.annotations.push({ type: 'warning', description: 'instrument.js injected late on this device' });
        }
      },

      async waitReady() {
        const canvasFallback = lateInject || process.env.READY_MODE === 'canvas';
        await page.waitForFunction((useCanvas) => {
          const t = window.__TEST__;
          if (t && t.ready) return true;
          if (useCanvas) { const c = document.querySelector('canvas'); return !!c && c.width > 0 && c.height > 0; }
          return false;
        }, canvasFallback, { timeout: GATES.readyTimeoutMs });
      },

      async issues() {
        let inPage = [];
        try { inPage = await page.evaluate(() => (window.__TEST__ ? window.__TEST__.issues.slice() : [])); }
        catch (e) { inPage = [{ type: 'page-unreachable', detail: String(e.message).slice(0, 200) }]; }
        const all = [...inPage, ...net];
        if (crashed) all.push({ type: 'page-crash', detail: 'renderer crashed' });
        return GATES.ignore ? all.filter((i) => !GATES.ignore.test(`${i.type} ${i.detail}`)) : all;
      },

      fps: () => page.evaluate(() => window.__TEST__.fps()),
      resetFps: () => page.evaluate(() => window.__TEST__.resetFps()),
      heapMB: () => page.evaluate(() => window.__TEST__.memoryMB()),
      state: () => page.evaluate(() => window.__TEST__.getState()),

      viewport: () => page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight })),

      // Std-dev of luminance on a screenshot. BrowserStack's Playwright wrapper requires
      // an explicit screenshot path on real devices, so capture to testInfo.outputPath().
      async lumaStdDev() {
        const shotPath = testInfo.outputPath(`luma-${++lumaCaptureIndex}.png`);
        const canvas = page.locator('canvas').first();
        if (await canvas.count()) await canvas.screenshot({ path: shotPath });
        else await page.screenshot({ path: shotPath });

        const buf = fs.readFileSync(shotPath);
        try { fs.unlinkSync(shotPath); } catch (_) { /* non-fatal cleanup */ }

        const { data, width, height } = PNG.sync.read(buf);
        const total = width * height;
        const step = Math.max(1, Math.floor(total / 20000));
        let n = 0, sum = 0, sumSq = 0;
        for (let i = 0; i < total; i += step) {
          const o = i * 4;
          const y = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
          sum += y; sumSq += y * y; n++;
        }
        const mean = sum / n;
        return Math.sqrt(Math.max(0, sumSq / n - mean * mean));
      },

      // ---- Input (touch first, mouse fallback) ----
      async tap(x, y) {
        try { await page.touchscreen.tap(x, y); } catch (_) { await page.mouse.click(x, y); }
      },
      async swipe(x1, y1, x2, y2, steps = 8) {
        await page.mouse.move(x1, y1);
        await page.mouse.down();
        await page.mouse.move(x2, y2, { steps });
        await page.mouse.up();
      },
      key: (k) => page.keyboard.press(k),

      // ---- Lifecycle (simulated: fires the events games listen for, not a real OS backgrounding) ----
      async background() {
        await page.evaluate(() => {
          Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
          Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
          document.dispatchEvent(new Event('visibilitychange'));
          window.dispatchEvent(new Event('blur'));
        });
      },
      async foreground() {
        await page.evaluate(() => {
          delete document.hidden;
          delete document.visibilityState;
          document.dispatchEvent(new Event('visibilitychange'));
          window.dispatchEvent(new Event('focus'));
        });
      },
      async rotate() {
        const vp = page.viewportSize();
        if (!vp) throw new Error('viewport not controllable on this device');
        await page.setViewportSize({ width: vp.height, height: vp.width });
      },
      async resizeJitter(rand) {
        const vp = page.viewportSize();
        if (!vp) throw new Error('viewport not controllable on this device');
        const f = () => 0.8 + rand() * 0.4;
        await page.setViewportSize({ width: Math.round(vp.width * f()), height: Math.round(vp.height * f()) });
      },
    };

    await use(game);
  },
});

module.exports = { test, expect, GATES, mulberry32 };
