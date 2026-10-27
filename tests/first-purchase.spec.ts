import { test, expect } from '@playwright/test';
import { runLearnerProgram } from '../runner';
import { ORDER_NUMBER, confirmationPage, readOrder, visitedInOrder } from './shop';

test('First Purchase', async () => {
  const { context, failure, visited, output, close } = await runLearnerProgram({
    className: 'FirstPurchase',
    pythonFile: 'first_purchase.py',
    scriptName: 'first-purchase'
  });

  try {
    expect(failure, failure ?? '').toBeNull();

    const page = confirmationPage(context.pages());
    expect(page, 'Your program should finish on the order confirmation page and leave it open').toBeTruthy();
    expect(
      visitedInOrder(visited, ['/flows/shop', '/flows/checkout', '/flows/order-confirmation']),
      `Go through the shop, then checkout, then the confirmation page. Your program visited: ${visited.join(' → ') || 'nothing'}`
    ).toBe(true);

    const order = await readOrder(page!);
    expect(order, 'An order should have been placed').not.toBeNull();
    expect(
      order!.items.map((i) => `${i.qty} × ${i.name}`),
      'The order should contain exactly one Wireless Mouse and nothing else'
    ).toEqual(['1 × Wireless Mouse']);
    expect(order!.shipping.method, 'Choose Standard shipping').toBe('standard');
    expect(order!.promo, 'Don’t apply a promo code').toBeNull();
    expect(order!.cardLast4, 'Pay with the approved test card').toBe('4242');

    expect(order!.id).toMatch(ORDER_NUMBER);
    await expect(page!.getByTestId('order-id'), 'The confirmation page should show the order number').toHaveText(order!.id);
    expect(output, `Print the order number shown on the confirmation page (${order!.id})`).toContain(order!.id);
  } finally {
    await close();
  }
});
