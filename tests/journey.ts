import type { Page } from '@playwright/test';

/**
 * Records every page the main frame lands on, so a check can confirm the
 * learner really went through the pages a challenge requires.
 */
export function recordJourney(page: Page): string[] {
  const visited: string[] = [];
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) {
      // Cloudflare serves clean URLs (/flows/shop); compare without ".html".
      visited.push(new URL(frame.url()).pathname.replace(/\.html$/, ''));
    }
  });
  return visited;
}

/** True when every path appears in `visited`, in this order. */
export function visitedInOrder(visited: string[], paths: string[]): boolean {
  let from = 0;
  for (const path of paths) {
    const at = visited.indexOf(path, from);
    if (at === -1) return false;
    from = at + 1;
  }
  return true;
}

/** "₹8,386.30", "$128.98", "€118.97" -> 8386.3, 128.98, 118.97 */
export function amount(text: string): number {
  return Number(text.replace(/[^\d.]/g, ''));
}

export type Order = {
  id: string;
  currency: string;
  items: { sku: string; name: string; qty: number; price: number }[];
  promo: string | null;
  totals: { subtotal: number; discount: number; shipping: number; total: number };
  shipping: { method: string };
};

/** The order the site stored for the confirmation page, or null. */
export function readOrder(page: Page): Promise<Order | null> {
  return page.evaluate(() => {
    const raw = sessionStorage.getItem('tys-last-order');
    return raw ? JSON.parse(raw) : null;
  });
}

export const ORDER_NUMBER = /^TD-\d{8}-[A-Z2-9]{4}$/;
