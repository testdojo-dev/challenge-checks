import type { Page } from '@playwright/test';

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

export type Order = {
  id: string;
  currency: string;
  items: { sku: string; name: string; qty: number; price: number }[];
  promo: string | null;
  totals: { subtotal: number; discount: number; shipping: number; total: number };
  shipping: { method: string };
  cardLast4: string;
};

/** The order the shop stored for the confirmation page, or null. */
export function readOrder(page: Page): Promise<Order | null> {
  return page.evaluate(() => {
    const raw = sessionStorage.getItem('tys-last-order');
    return raw ? JSON.parse(raw) : null;
  });
}

/** The confirmation page the program left open, if any. */
export function confirmationPage(pages: Page[]): Page | undefined {
  return pages.filter((p) => /\/flows\/order-confirmation(\.html)?$/.test(new URL(p.url()).pathname)).pop();
}

export const ORDER_NUMBER = /^TD-\d{8}-[A-Z2-9]{4}$/;
