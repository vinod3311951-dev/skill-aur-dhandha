/*
 * In-page test instrumentation. Injected BEFORE the game runs by Playwright (addInitScript),
 * so the game needs only ONE change: call  window.__TEST__ && window.__TEST__.markReady()
 * once the game is interactive. Optional: define window.render_game_to_text() to expose state.
 *
 * Exposes window.__TEST__ = { seed, rng, ready, markReady, issues, fps, resetFps, memoryMB, getState, note }
 */
(() => {
  if (window.__TEST__) return;

  const params = new URLSearchParams(location.search);
  const seed = (Number(params.get('seed')) >>> 0) || 12345;

  // Seeded PRNG (mulberry32). If ?seed= is present, the game's Math.random becomes deterministic.
  function mulberry32(a) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rng = mulberry32(seed);
  if (params.has('seed')) Math.random = rng;

  // ---- Issue collection -------------------------------------------------------------------
  const issues = [];
  const note = (type, detail) => {
    if (issues.length >= 200) return;
    issues.push({ type, detail: String(detail).slice(0, 600), at: Math.round(performance.now()) });
  };

  addEventListener('error', (e) => {
    const t = e.target;
    if (t && t !== window && (t.src || t.href)) note('asset-failed', `${t.tagName} ${t.src || t.href}`);
    else note('js-error', `${e.message} @ ${e.filename}:${e.lineno}`);
  }, true);

  addEventListener('unhandledrejection', (e) => {
    note('unhandled-rejection', (e.reason && (e.reason.stack || e.reason.message)) || e.reason);
  });

  // WebGL context loss does not bubble, so listen in the capture phase.
  document.addEventListener('webglcontextlost', () => note('webgl-context-lost', 'a canvas lost its WebGL context'), true);

  const origConsoleError = console.error;
  console.error = function (...args) {
    note('console-error', args.map((a) => (a && a.stack) || String(a)).join(' '));
    return origConsoleError.apply(this, args);
  };

  if (window.fetch) {
    const origFetch = window.fetch;
    window.fetch = function (...args) {
      return origFetch.apply(this, args).then(
        (res) => { if (!res.ok) note('fetch-failed', `${res.status} ${res.url || args[0]}`); return res; },
        (err) => { note('fetch-failed', `${(err && err.message) || err} ${args[0]}`); throw err; }
      );
    };
  }

  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.addEventListener('loadend', () => {
      if (this.status === 0 || this.status >= 400) note('xhr-failed', `${this.status} ${url}`);
    });
    return origOpen.apply(this, arguments);
  };

  // ---- Frame timing -----------------------------------------------------------------------
  const frames = [];
  let last = 0;
  let skip = true; // skip the first delta and any delta that spans a hidden tab
  const tick = (now) => {
    if (last && !skip) {
      frames.push(now - last);
      if (frames.length > 20000) frames.splice(0, 5000);
    }
    skip = false;
    last = now;
    requestAnimationFrame(tick);
  };
  document.addEventListener('visibilitychange', () => { skip = true; });
  requestAnimationFrame(tick);

  const pct = (arr, p) => {
    if (!arr.length) return 0;
    const s = arr.slice().sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.floor(p * s.length))];
  };

  const fps = () => {
    const n = frames.length;
    const total = frames.reduce((a, b) => a + b, 0);
    const p95 = pct(frames, 0.95);
    return {
      frames: n,
      avgFps: n ? +((1000 * n) / total).toFixed(1) : 0,
      p95FrameMs: +p95.toFixed(1),
      p95Fps: p95 ? +(1000 / p95).toFixed(1) : 0,   // "5th-percentile FPS": what the slowest 5% of frames look like
      p99FrameMs: +pct(frames, 0.99).toFixed(1),
      worstFrameMs: +frames.reduce((a, b) => Math.max(a, b), 0).toFixed(1),
      longFrames: frames.filter((d) => d > 50).length,
      freezes: frames.filter((d) => d > 1000).length,
    };
  };

  // performance.memory exists in Chromium only (Android Chrome yes, iOS Safari no) -> null when unavailable.
  const memoryMB = () => (performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null);

  const api = {
    seed,
    rng,
    ready: false,
    issues,
    note,
    fps,
    memoryMB,
    resetFps: () => { frames.length = 0; skip = true; },
    getState: () => (typeof window.render_game_to_text === 'function' ? window.render_game_to_text() : null),
  };
  api.markReady = () => { api.ready = true; };
  window.__TEST__ = api;
})();