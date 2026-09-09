import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e', workers: 1, timeout: 60000, retries: 0,
  use: { viewport: { width: 1600, height: 1080 }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  outputDir: 'artifacts/playwright',
});
