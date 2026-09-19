import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  projects: [
    {
      name: 'iphone-webkit',
      use: {
        ...devices['iPhone 13'],
        browserName: 'webkit',
        locale: 'en-IN',
      },
    },
    {
      name: 'android-chromium',
      use: {
        ...devices['Pixel 7'],
        browserName: 'chromium',
        locale: 'en-IN',
      },
    },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173',
    port: 4173,
    reuseExistingServer: false,
    timeout: 30_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:4173',
  },
});
