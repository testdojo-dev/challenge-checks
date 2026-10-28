import { test, expect } from '@playwright/test';
import { runLearnerProgram } from '../runner';
import { inOrder, loginAttempts, pageAt } from './pages';

test('Gatekeeper', async () => {
  const { context, failure, output, close } = await runLearnerProgram({
    className: 'Gatekeeper',
    pythonFile: 'gatekeeper.py',
    scriptName: 'gatekeeper'
  });

  try {
    expect(failure, failure ?? '').toBeNull();

    const page = pageAt(context.pages(), '/flows/login-dashboard');
    expect(page, 'Finish by signing in: your program should end on the dashboard').toBeTruthy();
    await expect(page!.locator('#dashboard-welcome'), 'Sign in as demo@test.com').toHaveText('Welcome, demo@test.com');

    // Noted by the Login page for each attempt in this tab.
    const attempts = await loginAttempts(page!);
    expect(
      inOrder(attempts, ['invalid-email', 'missing-password', 'wrong-credentials', 'signed-in']),
      `Try a badly formed email, then a missing password, then a wrong password, then sign in. Attempts seen: ${attempts.join(', ') || 'none'}`
    ).toBe(true);
    expect(attempts, 'Stop after one wrong password: this challenge must not trigger the lockout').not.toContain('locked-out');

    expect(output, 'Print the email error').toContain('Enter a valid email address.');
    expect(output, 'Print the password error').toContain('Password is required.');
    expect(output, 'Print the wrong-password message').toContain('Invalid email or password. 2 attempt(s) left before lockout.');
  } finally {
    await close();
  }
});
