import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Includes building the learner's project (first Maven/NuGet/pip install is slow).
  timeout: 10 * 60_000,
  expect: { timeout: 10_000 },
  retries: 0,
  // One browser on one debugging port at a time.
  workers: 1,
  reporter: process.env.CI ? [['list'], ['github']] : [['list']]
});
