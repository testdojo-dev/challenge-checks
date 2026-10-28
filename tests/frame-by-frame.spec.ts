import { test, expect } from '@playwright/test';
import { runLearnerProgram } from '../runner';
import { pageAt } from './pages';

test('Frame by Frame', async () => {
  const { context, failure, close } = await runLearnerProgram({
    className: 'FrameByFrame',
    pythonFile: 'frame_by_frame.py',
    scriptName: 'frame-by-frame'
  });

  try {
    expect(failure, failure ?? '').toBeNull();

    const page = pageAt(context.pages(), '/browser/frames');
    expect(page, 'Your program should open the Frames page and leave it open').toBeTruthy();

    await expect(
      page!.frameLocator('#frame-single').locator('#frame-single-status'),
      'Click the button in the single iframe'
    ).toHaveText('Clicked inside the frame!');
    await expect(
      page!.frameLocator('#frame-outer').frameLocator('#frame-inner').locator('#frame-inner-status'),
      'Click the button in the inner frame (inside the outer frame)'
    ).toHaveText('Clicked inside the inner frame!');
    await expect(page!.frameLocator('#frame-b').locator('#frame-b-status'), 'Click the button in Frame B').toHaveText(
      'Clicked in Frame B!'
    );
    await expect(
      page!.frameLocator('#frame-a').locator('#frame-a-status'),
      'Click only Frame B: Frame A should not be clicked'
    ).toHaveText('Not clicked yet');
    await expect(
      page!.frameLocator('#frame-c').locator('#frame-c-status'),
      'Click only Frame B: Frame C should not be clicked'
    ).toHaveText('Not clicked yet');
    await expect(
      page!.frameLocator('#frame-dynamic').locator('#frame-dynamic-status'),
      'Load the dynamic iframe, wait for it, and click its button'
    ).toHaveText('Clicked inside the dynamic frame!');
  } finally {
    await close();
  }
});
