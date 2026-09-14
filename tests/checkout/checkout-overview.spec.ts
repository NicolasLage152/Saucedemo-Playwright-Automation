import { test, expect } from '@fixtures/baseTest';
import { LoginPage } from '@pages/LoginPage';
import { DEFAULT_CUSTOMER, PRODUCTS } from '@fixtures/testData';

/**
 * Auth-gated suite: session is injected via storageState (auth.setup.ts).
 * beforeEach navigates to the cart checkout step two with one item.
 */
test.describe('Checkout Overview (Step 2)', () => {
  test.beforeEach(async ({ page, inventoryPage, cartPage, checkoutStep1 }) => {
    await page.goto('/inventory.html');

    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await expect(inventoryPage.navbar.cartBadge).toHaveText('1');

    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);

    await cartPage.goToCheckout();
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);

    await checkoutStep1.fillInformationAndContinue(DEFAULT_CUSTOMER.firstName, DEFAULT_CUSTOMER.lastName, DEFAULT_CUSTOMER.postalCode);
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
  });

  test('Validate redirection to the PDP from the product title and its visibility', async ({
    page,
    checkoutOverview,
    pdp,
  }) => {
    const firstCartItem = checkoutOverview.inventoryItems.first();
    const productTitleLocator = firstCartItem.locator('.inventory_item_name');

    await expect(productTitleLocator).toBeVisible();
    const expectedProductName = await productTitleLocator.innerText();

    await expect(firstCartItem.locator('.inventory_item_desc')).toBeVisible();
    await expect(checkoutOverview.itemPrices.first()).toBeVisible();

    await productTitleLocator.click();

    await expect(page).toHaveURL(/.*inventory-item\.html.*/);
    await expect(pdp.name).toHaveText(expectedProductName);
    await expect(pdp.description).toBeVisible();
  });

  test('Validate static Payment and Shipping information', async ({
    checkoutOverview,
  }) => {
    await expect(checkoutOverview.paymentInfoLabel).toHaveText('Payment Information:');
    await expect(checkoutOverview.paymentInfoValue).toHaveText('SauceCard #31337');
    await expect(checkoutOverview.shippingInfoLabel).toHaveText('Shipping Information:');
    await expect(checkoutOverview.shippingInfoValue).toHaveText(
      'Free Pony Express Delivery!',
    );
  });

  test('Validate the Cancel button returns to the catalog while preserving the cart', async ({
    page,
    checkoutOverview,
    inventoryPage,
  }) => {
    await checkoutOverview.cancelButton.click();
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(inventoryPage.navbar.cartBadge).toHaveText('1');
  });

  test('Validate the Finish button successfully completes the purchase', async ({
    page,
    checkoutOverview,
    checkoutCompletePage,
  }) => {
    await checkoutOverview.finishOrder();
    await expect(page).toHaveURL(/.*checkout-complete\.html/);
    await expect(checkoutCompletePage.headerMessage).toHaveText(
      'Thank you for your order!',
    );
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();
  });

  test('Edge Case – Dynamic subtotal calculation with multiple products', async ({
    page,
    checkoutOverview,
    inventoryPage,
    cartPage,
    checkoutStep1,
  }) => {
    await checkoutOverview.cancelButton.click();
    await expect(page).toHaveURL(/.*inventory\.html/);

    await inventoryPage.addProductToCart(PRODUCTS.BIKE_LIGHT);
    await inventoryPage.addProductToCart(PRODUCTS.BOLT_T_SHIRT);
    await expect(inventoryPage.navbar.cartBadge).toHaveText('3');

    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);

    await cartPage.goToCheckout();
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);

    await checkoutStep1.fillInformationAndContinue(DEFAULT_CUSTOMER.firstName, DEFAULT_CUSTOMER.lastName, DEFAULT_CUSTOMER.postalCode);
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);

    // toHaveCount auto-waits for all 3 price elements to render
    await expect(checkoutOverview.itemPrices).toHaveCount(3);

    const calculatedSubtotal = await checkoutOverview.getCalculatedSubtotal();

    await expect(checkoutOverview.subtotalLabel).toBeVisible();
    const subtotalText = await checkoutOverview.subtotalLabel.innerText();
    const actualSubtotal = parseFloat(subtotalText.replace('Item total: $', ''));
    expect(calculatedSubtotal).toBe(actualSubtotal);

    const taxText = await checkoutOverview.taxLabel.innerText();
    const actualTax = parseFloat(taxText.replace('Tax: $', ''));

    const totalText = await checkoutOverview.totalLabel.innerText();
    const actualTotal = parseFloat(totalText.replace('Total: $', ''));

    expect(parseFloat((actualSubtotal + actualTax).toFixed(2))).toBe(actualTotal);
  });

  test('Edge Case – Checkout with an empty cart (platform behavior)', async ({
    page,
    checkoutOverview,
    inventoryPage,
    cartPage,
    checkoutStep1,
  }) => {
    await checkoutOverview.cancelButton.click();
    await expect(page).toHaveURL(/.*inventory\.html/);

    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);

    const itemToRemove = cartPage.cartItems.filter({ hasText: PRODUCTS.BACKPACK });
    await itemToRemove.locator('button', { hasText: 'Remove' }).click();
    await expect(inventoryPage.navbar.cartBadge).toBeHidden();

    await cartPage.goToCheckout();
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);

    await checkoutStep1.fillInformationAndContinue(DEFAULT_CUSTOMER.firstName, DEFAULT_CUSTOMER.lastName, DEFAULT_CUSTOMER.postalCode);
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);

    await expect(checkoutOverview.subtotalLabel).toHaveText('Item total: $0');
    await expect(checkoutOverview.taxLabel).toHaveText('Tax: $0.00');
    await expect(checkoutOverview.totalLabel).toHaveText('Total: $0.00');

    await checkoutOverview.finishOrder();
    await expect(page).toHaveURL(/.*checkout-complete\.html/);
  });

  test('Edge Case – URL injection: accessing Step 2 without a session is rejected', async ({
    browser,
  }) => {
    // Fresh context — no storageState — simulates an unauthenticated user.
    const cleanContext = await browser.newContext();
    const cleanPage = await cleanContext.newPage();
    const cleanLoginPage = new LoginPage(cleanPage);

    await cleanPage.goto('/checkout-step-two.html');

    await expect(cleanPage).toHaveURL(/.*saucedemo\.com\//);
    await expect(cleanLoginPage.errorMessage).toBeVisible();
    await expect(cleanLoginPage.errorMessage).toContainText(
      "Epic sadface: You can only access '/checkout-step-two.html' when you are logged in.",
    );

    await cleanContext.close();
  });
});
