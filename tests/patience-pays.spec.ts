import { test, expect } from '@playwright/test';
import { runLearnerProgram } from '../runner';
import { pageAt } from './pages';

test('Patience Pays', async () => {
  const { context, failure, output, close } = await runLearnerProgram({
    className: 'PatiencePays',
    pythonFile: 'patience_pays.py',
    scriptName: 'patience-pays'
  });

  try {
    expect(failure, failure ?? '').toBeNull();

    const page = pageAt(context.pages(), '/elements/dynamic');
    expect(page, 'Your program should open the Dynamic page and leave it open').toBeTruthy();

    await expect(page!.locator('#dyn-load-result'), 'Click Load Data and wait for the result').toBeVisible();
    expect(output, 'Print the loaded text ("Data loaded successfully!")').toContain('Data loaded successfully!');
    await expect(page!.locator('#dyn-progress-status'), 'Start the progress bar and wait until it says Complete!').toHaveText(
      'Complete!'
    );
    await expect(page!.locator('#dyn-countdown-status'), 'Start the countdown and wait until it says Done!').toHaveText('Done!');
    await expect(page!.locator('#dyn-delayed-status'), 'Wait for Submit to be enabled, then click it exactly once').toHaveText(
      'Clicked 1 times'
    );

    const id = await page!.getByTestId('dynamic-target').getAttribute('id');
    expect(id, 'Click "Regenerate ID" so the element gets a new id').not.toBe('dyn-target-initial');
    expect(output, `Print the element's id after regenerating it (it's now ${id})`).toContain(id!);
  } finally {
    await close();
  }
});
