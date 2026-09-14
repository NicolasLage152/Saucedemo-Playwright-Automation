import { test, expect } from '@fixtures/baseTest';

/**
 * Auth-gated suite: session is injected via storageState (auth.setup.ts).
 * No UI login needed — the beforeEach navigates directly to the catalog.
 */
test.describe('Happy Path – Full E2E Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // storageState is already injected by the Playwright project config.
    // We just ensure we land on the catalog before each test.
    await page.goto('/inventory.html');
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test('Verify that the product catalog renders correctly', async ({
    inventoryPage,
  }) => {
    await expect(inventoryPage.inventoryItems).toHaveCount(6);

    for (let i = 0; i < 6; i++) {
      const item = inventoryPage.inventoryItems.nth(i);
      await expect(item.locator('img.inventory_item_img')).toBeVisible();
      await expect(
        item.locator('[data-test="inventory-item-price"]'),
      ).toBeVisible();
      await expect(
        item.locator('button', { hasText: 'Add to cart' }),
      ).toBeVisible();
    }
  });

  test('Validate product removal directly from the product detail view (PDP)', async ({
    page,
    inventoryPage,
    pdp,
    cartPage,
  }) => {
    const firstProduct = inventoryPage.inventoryItems
      .first()
      .locator('.inventory_item_name');
    await firstProduct.click();
    await expect(page).toHaveURL(/.*inventory-item\.html.*/);

    await expect(pdp.container).toBeVisible();
    await pdp.addToCart();

    await expect(pdp.removeButton).toBeVisible();
    await expect(inventoryPage.navbar.cartBadge).toHaveText('1');

    await pdp.removeFromCart();

    await expect(pdp.addToCartButton).toBeVisible();
    await expect(inventoryPage.navbar.cartBadge).toBeHidden();

    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(0);
  });

  test('Complete purchase flow with PDP navigation, cart validations, and tax calculation', async ({
    page,
    inventoryPage,
    pdp,
    cartPage,
    checkoutStep1,
    checkoutOverview,
    checkoutCompletePage,
  }) => {
    const product1 = 'Sauce Labs Backpack';
    const product2 = 'Sauce Labs Bike Light';

    // Product 1 via PDP
    await inventoryPage.openProductByName(product1);
    await expect(page).toHaveURL(/.*inventory-item\.html.*/);
    await expect(pdp.image).toBeVisible();
    await expect(pdp.name).toHaveText(product1);

    await pdp.addToCart();
    await expect(pdp.removeButton).toBeVisible();
    await expect(inventoryPage.navbar.cartBadge).toHaveText('1');

    await pdp.goBackToProducts();

    // Product 2 from catalog
    await inventoryPage.addProductToCart(product2);
    await expect(inventoryPage.navbar.cartBadge).toHaveText('2');

    // Cart
    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(2);

    await cartPage.goToCheckout();

    // Checkout Step 1
    await checkoutStep1.fillInformationAndContinue('Nicolas', 'Tester', '11000');
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);

    // Checkout Step 2 – price validation (web-first)
    await expect(checkoutOverview.itemPrices).toHaveCount(2);

    // Robust price assertions: wait for subtotal to contain expected format,
    // then parse — guarded by the preceding toHaveCount auto-wait.
    await expect(checkoutOverview.subtotalLabel).toBeVisible();
    const subtotalText = await checkoutOverview.subtotalLabel.innerText();
    const actualSubtotal = parseFloat(subtotalText.replace('Item total: $', ''));

    const calculatedSubtotal = await checkoutOverview.getCalculatedSubtotal();
    expect(calculatedSubtotal).toBe(actualSubtotal);

    await expect(checkoutOverview.taxLabel).toBeVisible();
    const taxText = await checkoutOverview.taxLabel.innerText();
    const actualTax = parseFloat(taxText.replace('Tax: $', ''));

    await expect(checkoutOverview.totalLabel).toBeVisible();
    const totalText = await checkoutOverview.totalLabel.innerText();
    const actualTotal = parseFloat(totalText.replace('Total: $', ''));

    expect(parseFloat((actualSubtotal + actualTax).toFixed(2))).toBe(actualTotal);

    await checkoutOverview.finishOrder();
    await expect(checkoutCompletePage.headerMessage).toHaveText(
      'Thank you for your order!',
    );
  });
});
