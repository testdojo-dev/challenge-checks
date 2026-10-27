import { test, expect } from '@playwright/test';
import { bargainHunter } from '../solutions/challenge-03-bargain-hunter';
import { ORDER_NUMBER, amount, readOrder, recordJourney, visitedInOrder } from './journey';

type Product = { sku: string; category: string; stock: number; prices: Record<string, number> };

test('Challenge 03: Bargain Hunter', async ({ page }) => {
  const journey = recordJourney(page);

  const returned = await bargainHunter(page);

  await expect(page, 'Finish on the order confirmation page').toHaveURL(/\/flows\/order-confirmation(\.html)?$/);
  expect(
    visitedInOrder(journey, ['/flows/shop', '/flows/checkout', '/flows/order-confirmation']),
    'Go through the shop, then checkout, then the confirmation page'
  ).toBe(true);

  const order = await readOrder(page);
  expect(order, 'An order should have been placed').not.toBeNull();

  // The cheapest in-stock Audio product, in the currency the order was paid in.
  const catalogue: Product[] = await page.evaluate(() => (window as any).TYS.shop.PRODUCTS);
  const target = catalogue
    .filter((p) => p.category === 'Audio' && p.stock > 0)
    .sort((a, b) => a.prices[order!.currency] - b.prices[order!.currency])[0];

  expect(order!.items.map((i) => `${i.sku} x${i.qty}`), 'Buy one unit of the cheapest in-stock Audio product').toEqual([
    `${target.sku} x1`
  ]);
  expect(order!.promo, 'Apply promo code DOJO10').toBe('DOJO10');
  expect(order!.shipping.method, 'Choose Express shipping').toBe('express');

  // Recompute the total independently, in minor units (cents, paise).
  const subtotal = Math.round(target.prices[order!.currency] * 100);
  const discount = Math.round(subtotal * 0.1);
  const shipping = Math.round(order!.totals.shipping * 100);
  expect(shipping, 'Express shipping should be charged').toBeGreaterThan(0);
  const expectedTotal = (subtotal - discount + shipping) / 100;
  expect(order!.totals.total, 'Total = subtotal - 10% + Express shipping').toBeCloseTo(expectedTotal, 2);
  expect(amount(await page.getByTestId('order-total').innerText()), 'The page shows the same total').toBeCloseTo(
    expectedTotal,
    2
  );

  await expect(page.getByTestId('order-id')).toHaveText(order!.id);
  expect(order!.id).toMatch(ORDER_NUMBER);
  expect(typeof returned === 'string' ? returned.trim() : returned, 'Return the order number shown on the page').toBe(
    order!.id
  );
});
