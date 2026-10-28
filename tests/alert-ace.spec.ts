import { test, expect } from '@playwright/test';
import { runLearnerProgram } from '../runner';
import { pageAt } from './pages';

test('Alert Ace', async () => {
  const { context, failure, close } = await runLearnerProgram({
    className: 'AlertAce',
    pythonFile: 'alert_ace.py',
    scriptName: 'alert-ace'
  });

  try {
    expect(failure, failure ?? '').toBeNull();

    const page = pageAt(context.pages(), '/browser/alerts');
    expect(page, 'Your program should open the Alerts page and leave it open').toBeTruthy();

    // A dialog left open blocks the page, so these time out if one is still showing.
    await expect(page!.locator('#alert-basic-status'), 'Trigger the JS Alert and accept it').toHaveText('Alert accepted');
    await expect(page!.locator('#alert-confirm-status'), 'Trigger the JS Confirm and dismiss it (Cancel)').toHaveText(
      'You clicked: Cancel'
    );
    await expect(page!.locator('#alert-prompt-status'), 'Answer the JS Prompt with Ravi Kumar and accept it').toHaveText(
      'You entered: Ravi Kumar'
    );
    await expect(page!.locator('#alert-delayed-status'), 'Wait for the delayed alert, then accept it').toHaveText(
      'Delayed alert accepted'
    );
  } finally {
    await close();
  }
});
