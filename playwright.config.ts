import { defineConfig, devices } from '@playwright/test';

// The site under test. Kept here (not in learners' repos) so it can't be pointed elsewhere.
const TESTDOJO_URL = process.env.TESTDOJO_URL || 'https://testdojo.testverse.workers.dev';

export default defineConfig({
  testDir: './tests',
  // The lockout challenge alone waits ~10 seconds, plus checkout's processing delay.
  timeout: 90_000,
  expect: { timeout: 15_000 },
  retries: 0,
  fullyParallel: true,
  reporter: process.env.CI ? [['list'], ['github']] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: TESTDOJO_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
