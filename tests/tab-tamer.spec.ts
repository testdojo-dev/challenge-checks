import { test, expect } from '@playwright/test';
import { runLearnerProgram } from '../runner';
import { inOrder, pageAt, pagesTitled } from './pages';

test('Tab Tamer', async () => {
  const { context, failure, visited, close } = await runLearnerProgram({
    className: 'TabTamer',
    pythonFile: 'tab_tamer.py',
    scriptName: 'tab-tamer'
  });

  try {
    expect(failure, failure ?? '').toBeNull();
    const pages = context.pages();

    expect(
      inOrder(visited, ['/browser/tabs', '/browser/tabs-target', '/browser/windows']),
      `Start on the Tabs page, open its link in a new tab, then go to the Windows page. Your program visited: ${visited.join(' → ') || 'nothing'}`
    ).toBe(true);

    const linkTab = pageAt(pages, '/browser/tabs-target');
    expect(linkTab, 'Open "Open Link in New Tab" and leave that tab open').toBeTruthy();
    await expect(linkTab!.locator('#status'), 'Click the button in the new tab').toHaveText('Clicked inside the new tab!');

    expect(await pagesTitled(pages, 'Tab A'), 'Click "Open 3 Tabs" once and keep Tab A open').toHaveLength(1);
    expect(await pagesTitled(pages, 'Tab B'), 'Close Tab B (and only Tab B)').toHaveLength(0);
    expect(await pagesTitled(pages, 'Tab C'), 'Keep Tab C open').toHaveLength(1);

    const delayed = await pagesTitled(pages, 'Delayed Window');
    expect(delayed, 'On the Windows page, open the delayed window and wait for it to appear').toHaveLength(1);
    await expect(delayed[0].locator('#window-delayed-status-inner'), 'Click the button in the delayed window').toHaveText(
      'Clicked inside the delayed window!'
    );
  } finally {
    await close();
  }
});
