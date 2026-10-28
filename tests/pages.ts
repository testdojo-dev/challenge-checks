import type { Page } from '@playwright/test';

/** The last open page at this site path (e.g. "/browser/alerts"), if any. */
export function pageAt(pages: Page[], path: string): Page | undefined {
  return pages.filter((p) => urlPath(p) === path).pop();
}

/** Open pages whose title is exactly `title` (pop-up windows and blank tabs have no path). */
export async function pagesTitled(pages: Page[], title: string): Promise<Page[]> {
  const titles = await Promise.all(pages.map((p) => p.title().catch(() => '')));
  return pages.filter((_, i) => titles[i] === title);
}

function urlPath(page: Page): string {
  try {
    return new URL(page.url()).pathname.replace(/\.html$/, '');
  } catch {
    return '';
  }
}

/** What the Login page noted about each sign-in attempt in this tab, oldest first. */
export function loginAttempts(page: Page): Promise<string[]> {
  return page.evaluate(() => JSON.parse(sessionStorage.getItem('tys-login-attempts') || '[]'));
}

/** True when `items` contains `wanted` in this order (other items may come between). */
export function inOrder(items: string[], wanted: string[]): boolean {
  let from = 0;
  for (const item of wanted) {
    const at = items.indexOf(item, from);
    if (at === -1) return false;
    from = at + 1;
  }
  return true;
}
