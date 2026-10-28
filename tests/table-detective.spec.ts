import { test, expect } from '@playwright/test';
import { runLearnerProgram } from '../runner';
import { pageAt } from './pages';

test('Table Detective', async () => {
  const { context, failure, output, close } = await runLearnerProgram({
    className: 'TableDetective',
    pythonFile: 'table_detective.py',
    scriptName: 'table-detective'
  });

  try {
    expect(failure, failure ?? '').toBeNull();

    const page = pageAt(context.pages(), '/advanced/tables');
    expect(page, 'Your program should open the Tables page and leave it open').toBeTruthy();

    expect(output, 'Print the top-scoring Designer and their score, e.g. "Sana Malik 95"').toMatch(/Sana Malik\D{0,20}95\b/);
    await expect(
      page!.locator('#table-page-indicator'),
      'Leave the paginated table on the page that shows the top-scoring Designer'
    ).toHaveText('Page 2 of 4');
    await expect(page!.locator('#table-page-body'), 'That page should show the top-scoring Designer').toContainText('Sana Malik');

    const scores = await page!.locator('#table-sort-body tr td:nth-child(3)').allTextContents();
    expect(scores.map(Number), 'Sort the "Sort by Column" table by Score, highest first').toEqual([95, 91, 88, 82, 76]);

    await expect(page!.locator('#table-filter-input'), 'Filter the names by Shah').toHaveValue('Shah');
    await expect(page!.locator('#table-filter-status'), 'The filter should leave one row').toHaveText('1 of 5 rows shown');
  } finally {
    await close();
  }
});
