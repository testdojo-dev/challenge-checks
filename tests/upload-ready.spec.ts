import { test, expect } from '@playwright/test';
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { FIXTURES_DIR, runLearnerProgram } from '../runner';
import { pageAt } from './pages';

type Picked = { name: string; size: number };

/** A file from fixtures/ as the page should report it. */
function fixture(name: string): Picked {
  return { name, size: statSync(join(FIXTURES_DIR, name)).size };
}

const byName = (a: Picked, b: Picked) => a.name.localeCompare(b.name);

test('Upload Ready', async () => {
  const { context, failure, close } = await runLearnerProgram({
    className: 'UploadReady',
    pythonFile: 'upload_ready.py',
    scriptName: 'upload-ready'
  });

  try {
    expect(failure, failure ?? '').toBeNull();

    const page = pageAt(context.pages(), '/advanced/upload-download');
    expect(page, 'Your program should open the Upload / Download page and leave it open').toBeTruthy();

    // Names and sizes, so only the real files from TESTDOJO_FIXTURES count.
    const picked = await page!.evaluate(() => {
      const files = (id: string) =>
        Array.from((document.getElementById(id) as HTMLInputElement).files || []).map((f) => ({ name: f.name, size: f.size }));
      return {
        single: files('upload-single-input'),
        multi: files('upload-multi-input'),
        zone: files('upload-dropzone-input')
      };
    });

    expect(picked.single, 'Upload resume.pdf in "Upload a Single File"').toEqual([fixture('resume.pdf')]);
    expect(
      picked.multi.sort(byName),
      'Upload photo.png and notes.txt together in "Upload Multiple Files"'
    ).toEqual([fixture('notes.txt'), fixture('photo.png')]);
    expect(picked.zone, 'Upload photo.png in the "Drag-and-Drop Upload Zone"').toEqual([fixture('photo.png')]);
  } finally {
    await close();
  }
});
