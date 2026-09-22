import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'.',
  testMatch:'color-dominion-fx23.spec.mjs',
  timeout:30000,
  use:{viewport:{width:390,height:844}},
  projects:[{name:'chromium',use:{browserName:'chromium'}}],
  reporter:'line'
});
