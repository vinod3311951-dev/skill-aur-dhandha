const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'results.json' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    reducedMotion: null,
  },
  projects: process.env.BROWSERSTACK_USERNAME ? [
    { name: 'browserstack-sdk-placeholder', use: { ...devices['Pixel 7'] } },
  ] : [
    { name: 'chromium-desktop', use: { browserName: 'chromium' } },
    { name: 'firefox-desktop', use: { browserName: 'firefox' } },
    { name: 'webkit-desktop', use: { browserName: 'webkit' } },
    { name: 'android-chrome-emulation', use: { ...devices['Pixel 7'] } },
    { name: 'iphone-webkit-emulation', use: { ...devices['iPhone 14'] } },
  ],
});
