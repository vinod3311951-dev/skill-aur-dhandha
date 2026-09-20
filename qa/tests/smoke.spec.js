const { test, expect, GATES } = require('../helpers');

test('game loads, becomes ready, renders, stays error-free and holds frame rate', async ({ game }, testInfo) => {
  await game.open();
  await game.waitReady();

  game.resetFps();
  await game.page.waitForTimeout(GATES.idleSampleMs);

  const issues = await game.issues();
  expect(issues, 'errors/failed requests after load').toEqual([]);

  expect(await game.lumaStdDev(), 'canvas looks blank').toBeGreaterThan(GATES.minLumaStdDev);

  const fps = await game.fps();
  await testInfo.attach('fps.json', { body: JSON.stringify(fps, null, 2), contentType: 'application/json' });
  expect(fps.frames, 'too few frames rendered').toBeGreaterThan(30);
  expect(fps.p95Fps, `p95 FPS (${fps.p95Fps}) below gate`).toBeGreaterThanOrEqual(GATES.minP95Fps);
  expect(fps.freezes, 'frames longer than 1s').toBeLessThanOrEqual(GATES.maxFreezes);
});