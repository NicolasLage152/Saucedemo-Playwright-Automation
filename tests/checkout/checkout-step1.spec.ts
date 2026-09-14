import { test, expect } from '@fixtures/baseTest';
import { DEFAULT_CUSTOMER, PRODUCTS } from '@fixtures/testData';

/**
 * Auth-gated suite: session is injected via storageState (auth.setup.ts).
 * beforeEach navigates to the cart checkout step one directly.
 */
test.describe('Checkout Step 1 – Information Form', () => {
  test.beforeEach(async ({ page, inventoryPage, cartPage }) => {
    await page.goto('/inventory.html');
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await expect(inventoryPage.navbar.cartBadge).toHaveText('1');

    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);

    await cartPage.goToCheckout();
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);
  });

  test('Fill out the complete form and continue', async ({
    page,
    checkoutStep1,
  }) => {
    await checkoutStep1.fillInformationAndContinue(DEFAULT_CUSTOMER.firstName, DEFAULT_CUSTOMER.lastName, DEFAULT_CUSTOMER.postalCode);
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
  });

  test('Validate error message when submitting an empty form', async ({
    checkoutStep1,
  }) => {
    await checkoutStep1.clickContinue();
    await expect(checkoutStep1.errorMessage).toBeVisible();
    await expect(checkoutStep1.errorMessage).toContainText(
      'Error: First Name is required',
    );
  });

  test('Validate error message when the last name is missing', async ({
    checkoutStep1,
  }) => {
    await checkoutStep1.fillInformationAndContinue('Nicolas', '', '11000');
    await expect(checkoutStep1.errorMessage).toBeVisible();
    await expect(checkoutStep1.errorMessage).toContainText(
      'Error: Last Name is required',
    );
  });

  test('Validate error message when the postal code is missing', async ({
    checkoutStep1,
  }) => {
    await checkoutStep1.fillInformationAndContinue('Nicolas', 'Tester', '');
    await expect(checkoutStep1.errorMessage).toBeVisible();
    await expect(checkoutStep1.errorMessage).toContainText(
      'Error: Postal Code is required',
    );
  });

  test('Validate error when entering only whitespace in First Name', async ({
    checkoutStep1,
  }) => {
    test.fail(
      true,
      'BUG-001: SauceDemo allows advancing with whitespace-only First Name (missing .trim())',
    );
    await checkoutStep1.fillInformationAndContinue('   ', 'Tester', '11000');
    await expect(checkoutStep1.errorMessage).toBeVisible();
  });

  test('Validate error when entering only whitespace in Last Name', async ({
    checkoutStep1,
  }) => {
    test.fail(
      true,
      'BUG-001: SauceDemo allows advancing with whitespace-only Last Name (missing .trim())',
    );
    await checkoutStep1.fillInformationAndContinue('Nicolas', '   ', '11000');
    await expect(checkoutStep1.errorMessage).toBeVisible();
  });

  test('Validate error when entering only whitespace in Postal Code', async ({
    checkoutStep1,
  }) => {
    test.fail(
      true,
      'BUG-001: SauceDemo allows advancing with whitespace-only Postal Code (missing .trim())',
    );
    await checkoutStep1.fillInformationAndContinue('Nicolas', 'Tester', '   ');
    await expect(checkoutStep1.errorMessage).toBeVisible();
  });

  test('Validate form blocking when submitting only whitespace in all fields', async ({
    checkoutStep1,
  }) => {
    test.fail(
      true,
      'BUG-001: SauceDemo allows advancing with all whitespace fields (missing .trim())',
    );
    await checkoutStep1.fillInformationAndContinue('   ', '   ', '   ');
    await expect(checkoutStep1.errorMessage).toBeVisible();
  });
});
