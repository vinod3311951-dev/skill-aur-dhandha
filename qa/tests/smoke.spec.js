const { test, expect, GATES } = require('../helpers');

test('game loads, becomes ready, renders, stays error-free and holds frame rate', async ({ game }, testInfo) => {
  await game.open();
  await game.waitReady();

  game.resetFps();
  await game.page.waitForTimeout(GATES.idleSampleMs);

  const issues = await game.issues();
  expect(issues, 'errors/failed requests after load').toEqual([]);

  // Snapshot immediately before screenshot capture.
  const fpsBefore = await game.fps();
  const screenshotStartMs = Date.now();

  const luma = await game.lumaStdDev();

  const screenshotEndMs = Date.now();
  const fpsAfter = await game.fps();

  const freezeDelta = fpsAfter.freezes - fpsBefore.freezes;

  const interpretation =
    fpsBefore.freezes > 0
      ? 'GAME_SIDE_FREEZE_BEFORE_SCREENSHOT'
      : fpsAfter.freezes > 0
        ? 'TEST_HARNESS_FREEZE_DURING_SCREENSHOT'
        : 'NO_FREEZE';

  const diagnostic = {
    fpsBefore,
    fpsAfter,
    screenshotDurationMs: screenshotEndMs - screenshotStartMs,
    freezeDelta,
    bufferTruncationPossible: fpsAfter.frames >= 20000,
    interpretation,
  };

  console.log(
    '[screenshot FPS diagnostic]',
    JSON.stringify(diagnostic, null, 2)
  );

  await testInfo.attach('screenshot-fps-diagnostic.json', {
    body: JSON.stringify(diagnostic, null, 2),
    contentType: 'application/json',
  });

  expect(luma, 'canvas looks blank').toBeGreaterThan(GATES.minLumaStdDev);

  const fps = fpsAfter;
  await testInfo.attach('fps.json', { body: JSON.stringify(fps, null, 2), contentType: 'application/json' });
  expect(fps.frames, 'too few frames rendered').toBeGreaterThan(30);
  expect(fps.p95Fps, `p95 FPS (${fps.p95Fps}) below gate`).toBeGreaterThanOrEqual(GATES.minP95Fps);
  expect(fps.freezes, 'frames longer than 1s').toBeLessThanOrEqual(GATES.maxFreezes);
});