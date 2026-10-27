import { test, expect } from '@playwright/test';
import { lockedOut } from '../solutions/challenge-04-locked-out';

test('Challenge 04: Locked Out', async ({ page }) => {
  await lockedOut(page);

  await expect(page, 'Finish on the dashboard').toHaveURL(/\/flows\/login-dashboard(\.html)?$/);
  await expect(page.locator('#dashboard-welcome'), 'Sign in as the demo user').toHaveText('Welcome, demo@test.com');

  const lockoutSeen = await page.evaluate(() => sessionStorage.getItem('tys-lockout-seen'));
  expect(lockoutSeen, 'Trigger the lockout (three failed sign-ins) before signing in').toBe('1');
});
