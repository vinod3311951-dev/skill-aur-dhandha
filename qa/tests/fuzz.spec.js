const { test, expect, GATES, mulberry32 } = require('../helpers');

const KEYS = (process.env.FUZZ_KEYS || 'ArrowLeft,ArrowRight,ArrowUp,ArrowDown,Space,Enter').split(',');

test('fuzz bot survives random input, rotation, resize and background/foreground', async ({ game }, testInfo) => {
  test.setTimeout((GATES.fuzzSeconds + 90) * 1000);

  await game.open();
  await game.waitReady();

  const rand = mulberry32(game.seed);           // same seed => same action sequence (see fuzz-log.json)
  const log = [];
  const skipped = {};
  const between = (lo, hi) => lo + rand() * (hi - lo);

  const actions = [
    [50, 'tap', async () => {
      const { w, h } = await game.viewport();
      const x = Math.round(between(1, w - 1)), y = Math.round(between(1, h - 1));
      await game.tap(x, y);
      return { x, y };
    }],
    [15, 'swipe', async () => {
      const { w, h } = await game.viewport();
      const a = [between(1, w - 1), between(1, h - 1), between(1, w - 1), between(1, h - 1)].map(Math.round);
      await game.swipe(...a);
      return a;
    }],
    [10, 'tap-burst', async () => {
      const { w, h } = await game.viewport();
      const x = Math.round(between(1, w - 1)), y = Math.round(between(1, h - 1));
      for (let i = 0; i < 6; i++) await game.tap(x, y);
      return { x, y, count: 6 };
    }],
    [7, 'key', async () => {
      const k = KEYS[Math.floor(rand() * KEYS.length)];
      await game.key(k);
      return k;
    }],
    [8, 'background-foreground', async () => {
      await game.background();
      const ms = Math.round(between(200, 3000));
      await game.page.waitForTimeout(ms);
      await game.foreground();
      return { hiddenMs: ms };
    }],
    [6, 'rotate', async () => { await game.rotate(); return {}; }],
    [4, 'resize', async () => { await game.resizeJitter(rand); return {}; }],
  ];
  const totalWeight = actions.reduce((s, a) => s + a[0], 0);
  const pick = () => {
    let r = rand() * totalWeight;
    for (const a of actions) { if ((r -= a[0]) <= 0) return a; }
    return actions[0];
  };

  const attachLog = () => testInfo.attach('fuzz-log.json', {
    body: JSON.stringify({ seed: game.seed, skipped, lastActions: log.slice(-200) }, null, 2),
    contentType: 'application/json',
  });

  try {
    await game.page.waitForTimeout(3000);           // warm-up before measuring
    const heapStart = await game.heapMB();
    await game.resetFps();

    const end = Date.now() + GATES.fuzzSeconds * 1000;
    let i = 0;
    let lastState = await game.state();
    let lastChange = Date.now();
    let stuckWarned = false;

    while (Date.now() < end) {
      const [, name, run] = pick();
      try {
        log.push({ i, name, detail: await run() });
      } catch (e) {
        // Unsupported on this device (e.g. rotate on a real phone): record it, keep fuzzing.
        skipped[name] = (skipped[name] || 0) + 1;
        log.push({ i, name, skipped: String(e.message).slice(0, 120) });
      }
      i++;
      await game.page.waitForTimeout(Math.round(between(20, 270)));

      if (i % 10 === 0) {
        expect(await game.issues(), `issues after action #${i} (seed ${game.seed})`).toEqual([]);
      }

      if (i % 50 === 0) {
        let luma = await game.lumaStdDev();
        if (luma <= GATES.minLumaStdDev) {          // re-check once: a fade or transition can be briefly flat
          await game.page.waitForTimeout(1000);
          luma = await game.lumaStdDev();
        }
        expect(luma, `canvas blank after action #${i} (seed ${game.seed})`).toBeGreaterThan(GATES.minLumaStdDev);
      }

      // Stuck detection (only when the game exposes render_game_to_text). Idle screens are legitimate, so it warns by default.
      const s = await game.state();
      if (s !== null) {
        if (s !== lastState) { lastState = s; lastChange = Date.now(); stuckWarned = false; }
        else if ((Date.now() - lastChange) / 1000 > GATES.stuckSeconds) {
          const msg = `game state unchanged for >${GATES.stuckSeconds}s while inputs were sent (action #${i})`;
          if (GATES.stuckFails) expect(false, msg).toBe(true);
          if (!stuckWarned) { testInfo.annotations.push({ type: 'warning', description: msg }); stuckWarned = true; }
        }
      }
    }

    expect(await game.issues(), `issues at end of fuzz run (seed ${game.seed})`).toEqual([]);

    const fps = await game.fps();
    await testInfo.attach('fps-fuzz.json', { body: JSON.stringify(fps, null, 2), contentType: 'application/json' });
    expect(fps.freezes, 'frames longer than 1s during fuzz').toBeLessThanOrEqual(GATES.fuzzMaxFreezes);

    const heapEnd = await game.heapMB();
    if (heapStart && heapEnd) {
      const growth = ((heapEnd - heapStart) / heapStart) * 100;
      expect(growth, `JS heap grew ${growth.toFixed(0)}% (${heapStart}MB -> ${heapEnd}MB)`).toBeLessThanOrEqual(GATES.maxHeapGrowthPct);
    }
  } finally {
    await attachLog();
  }
});