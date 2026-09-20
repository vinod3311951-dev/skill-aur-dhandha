const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 0, // a retry would hide flakiness; use --repeat-each=3 instead and require 3 greens
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'results.json' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Playwright defaults reducedMotion to "no-preference". BrowserStack real iOS
    // currently validates its bridge value as "none", so make the system-default
    // intent explicit via null and let the SDK translate it for the remote context.
    reducedMotion: null,
  },
  // Local sanity projects. On BrowserStack, the SDK replaces these with the platforms in browserstack.yml.
  projects: [
    { name: 'local-android-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'local-iphone-webkit', use: { ...devices['iPhone 14'] } },
  ],
});
