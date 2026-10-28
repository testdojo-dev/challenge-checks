import { test, expect } from '@playwright/test';
import { runLearnerProgram } from '../runner';
import { pageAt } from './pages';

const PHRASE = 'No shadow can hide from me';

test('Shadow Walker', async () => {
  const { context, failure, close } = await runLearnerProgram({
    className: 'ShadowWalker',
    pythonFile: 'shadow_walker.py',
    scriptName: 'shadow-walker'
  });

  try {
    expect(failure, failure ?? '').toBeNull();

    const page = pageAt(context.pages(), '/advanced/shadow-dom');
    expect(page, 'Your program should open the Shadow DOM page and leave it open').toBeTruthy();

    // Playwright's CSS locators reach into open shadow roots.
    await expect(page!.locator('#shadow-status'), 'Click the button inside the open shadow root').toHaveText(
      'Clicked inside the shadow root!'
    );
    await expect(page!.locator('#shadow-inner-status'), 'Click the button inside the nested shadow root').toHaveText(
      'Clicked inside the nested shadow root!'
    );
    await expect(page!.locator('#shadow-form-input'), `Type "${PHRASE}" into the shadow input`).toHaveValue(PHRASE);
    await expect(page!.locator('#shadow-form-status'), 'Type into the input (not just set its value)').toHaveText(
      `You typed: ${PHRASE}`
    );
  } finally {
    await close();
  }
});
