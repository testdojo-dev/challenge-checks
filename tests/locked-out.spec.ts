import { test, expect } from '@playwright/test';
import { runLearnerProgram } from '../runner';
import { inOrder, loginAttempts, pageAt } from './pages';

test('Locked Out', async () => {
  const { context, failure, output, close } = await runLearnerProgram({
    className: 'LockedOut',
    pythonFile: 'locked_out.py',
    scriptName: 'locked-out'
  });

  try {
    expect(failure, failure ?? '').toBeNull();

    const page = pageAt(context.pages(), '/flows/login-dashboard');
    expect(page, 'Finish by signing in: your program should end on the dashboard').toBeTruthy();
    await expect(page!.locator('#dashboard-welcome'), 'Sign in as demo@test.com').toHaveText('Welcome, demo@test.com');

    const attempts = await loginAttempts(page!);
    expect(
      inOrder(attempts, ['locked-out', 'signed-in']),
      `Trigger the lockout with three wrong passwords, wait for it to end, then sign in. Attempts seen: ${attempts.join(', ') || 'none'}`
    ).toBe(true);
    expect(output, 'Print the lockout message ("Too many failed attempts. Try again in …s.")').toMatch(
      /Too many failed attempts\. Try again in \d+s\./
    );
  } finally {
    await close();
  }
});
