const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 0, // a retry would hide flakiness; use --repeat-each=3 instead and require 3 greens
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'results.json' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // IMPORTANT: do not set reducedMotion globally for BrowserStack real iOS.
    // BrowserStack's real-iOS newContext bridge currently rejects the translated
    // Playwright "no-override" value. Omitting the option leaves the physical
    // device/system preference untouched and avoids sending an unsupported
    // emulation capability to the remote context.
  },
  // Local sanity projects. On BrowserStack, the SDK replaces these with the platforms in browserstack.yml.
  projects: [
    { name: 'local-android-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'local-iphone-webkit', use: { ...devices['iPhone 14'] } },
  ],
});
