import { test, expect } from '@playwright/test';
import { registrationRookie } from '../solutions/challenge-01-registration';

test('Challenge 01: Registration Rookie', async ({ page }) => {
  await registrationRookie(page);

  await expect(page, 'Finish on the Forms page').toHaveURL(/\/elements\/forms(\.html)?$/);

  await expect(page.locator('#form-summary'), 'The success message should be shown').toHaveText(
    'Account created successfully!'
  );
  await expect(page.locator('#registration-form .field-error:visible'), 'No field should show an error').toHaveCount(0);

  await expect(page.locator('#form-name'), 'Full name should be Asha Verma').toHaveValue('Asha Verma');
  await expect(page.locator('#form-email'), 'Email should be asha.verma@example.com').toHaveValue('asha.verma@example.com');
  await expect(page.locator('#form-phone'), 'Phone should be 9876543210').toHaveValue('9876543210');
  await expect(page.locator('#form-dob'), 'Date of birth should be 21 April 1998').toHaveValue('1998-04-21');

  const password = await page.locator('#form-password').inputValue();
  expect(password.length, 'Password needs at least 6 characters').toBeGreaterThanOrEqual(6);
  await expect(page.locator('#form-confirm-password'), 'Confirm the same password').toHaveValue(password);

  await expect(page.locator('#form-autosuggest'), 'Choose India from the suggestions').toHaveValue('India');
  await expect(page.locator('#form-autosuggest-status strong'), 'India should be the selected country').toHaveText(
    'India'
  );
});
