import { test, expect } from '@playwright/test';
import { firstPurchase } from '../solutions/challenge-02-first-purchase';
import { ORDER_NUMBER, readOrder, recordJourney, visitedInOrder } from './journey';

test('Challenge 02: First Purchase', async ({ page }) => {
  const journey = recordJourney(page);

  const returned = await firstPurchase(page);

  await expect(page, 'Finish on the order confirmation page').toHaveURL(/\/flows\/order-confirmation(\.html)?$/);
  expect(
    visitedInOrder(journey, ['/flows/shop', '/flows/checkout', '/flows/order-confirmation']),
    'Go through the shop, then checkout, then the confirmation page'
  ).toBe(true);

  const order = await readOrder(page);
  expect(order, 'An order should have been placed').not.toBeNull();
  expect(order!.items.map((i) => `${i.sku} x${i.qty}`), 'Buy exactly one Wireless Mouse').toEqual(['M100 x1']);
  expect(order!.shipping.method, 'Use Standard shipping').toBe('standard');
  expect(order!.promo, 'Do not apply a promo code').toBeNull();

  await expect(page.getByTestId('order-id')).toHaveText(order!.id);
  expect(order!.id).toMatch(ORDER_NUMBER);
  expect(typeof returned === 'string' ? returned.trim() : returned, 'Return the order number shown on the page').toBe(
    order!.id
  );
});
