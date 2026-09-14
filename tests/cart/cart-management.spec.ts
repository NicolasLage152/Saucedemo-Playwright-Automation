import { test, expect } from '@fixtures/baseTest';
import { PRODUCTS } from '@fixtures/testData';

/**
 * Auth-gated suite: session is injected via storageState (auth.setup.ts).
 * beforeEach navigates directly to the inventory catalog — no UI login needed.
 */
test.describe('Cart Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test('Verify interface and initial state when entering an empty cart', async ({
    page,
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);

    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(inventoryPage.navbar.cartBadge).toBeHidden();

    await expect(cartPage.continueShoppingButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeVisible();
  });

  test('Validate the "Continue Shopping" button returns to the catalog while maintaining the state', async ({
    page,
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await expect(inventoryPage.navbar.cartBadge).toHaveText('1');

    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);

    await cartPage.goBackToShopping();
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(inventoryPage.navbar.cartBadge).toHaveText('1');
  });

  test('Verify product persistence in the cart after reloading the page (F5)', async ({
    page,
    inventoryPage,
    cartPage,
  }) => {
    const product = PRODUCTS.BOLT_T_SHIRT;

    await expect(inventoryPage.inventoryItems).not.toHaveCount(0);
    await inventoryPage.addProductToCart(product);

    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(1);

    await page.reload();

    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.cartItems.locator('.inventory_item_name')).toHaveText(product);
    await expect(inventoryPage.navbar.cartBadge).toHaveText('1');
  });

  test('Verify the bulk addition of all products to the cart (6/6)', async ({
    page,
    inventoryPage,
    cartPage,
  }) => {
    await expect(inventoryPage.inventoryItems).toHaveCount(6);

    const addButtons = page.locator('button', { hasText: 'Add to cart' });
    const totalProducts = await addButtons.count();

    for (let i = 0; i < totalProducts; i++) {
      await addButtons.first().click();
    }

    await expect(inventoryPage.navbar.cartBadge).toHaveText(totalProducts.toString());

    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);
    await expect(cartPage.cartItems).toHaveCount(totalProducts);
  });

  test('Partial removal with multiple products correctly updates the badge and list', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await inventoryPage.addProductToCart(PRODUCTS.BIKE_LIGHT);
    await inventoryPage.addProductToCart(PRODUCTS.BOLT_T_SHIRT);
    await expect(inventoryPage.navbar.cartBadge).toHaveText('3');

    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(3);

    const itemToRemove = cartPage.cartItems.filter({ hasText: PRODUCTS.BIKE_LIGHT });
    await itemToRemove.locator('button', { hasText: 'Remove' }).click();

    await expect(cartPage.cartItems).toHaveCount(2);
    await expect(inventoryPage.navbar.cartBadge).toHaveText('2');

    await expect(cartPage.cartItems.filter({ hasText: PRODUCTS.BACKPACK })).toBeVisible();
    await expect(
      cartPage.cartItems.filter({ hasText: PRODUCTS.BOLT_T_SHIRT }),
    ).toBeVisible();
  });

  test('Removing a product from the cart updates the list and counter', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await expect(inventoryPage.navbar.cartBadge).toHaveText('1');

    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(1);

    const itemToRemove = cartPage.cartItems.filter({ hasText: PRODUCTS.BACKPACK });
    await itemToRemove.locator('button', { hasText: 'Remove' }).click();

    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(inventoryPage.navbar.cartBadge).toBeHidden();
  });

  test('Product details in the cart match those in the catalog', async ({
    page,
    inventoryPage,
    cartPage,
  }) => {
    const firstCatalogItem = inventoryPage.inventoryItems.first();
    const firstItemName = firstCatalogItem.locator('[data-test="inventory-item-name"]');
    const firstItemPrice = firstCatalogItem.locator('[data-test="inventory-item-price"]');

    await firstItemName.waitFor({ state: 'visible' });
    const catalogName = await firstItemName.textContent();
    const catalogPrice = await firstItemPrice.textContent();

    await firstCatalogItem.locator('button', { hasText: 'Add to cart' }).click();
    await expect(inventoryPage.navbar.cartBadge).toHaveText('1');

    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);

    const firstCartItem = cartPage.cartItems.first();
    await expect(firstCartItem.locator('[data-test="inventory-item-name"]')).toHaveText(
      catalogName!,
    );
    await expect(firstCartItem.locator('[data-test="inventory-item-price"]')).toHaveText(
      catalogPrice!,
    );
  });

  test('The Checkout button correctly initiates the purchase flow', async ({
    page,
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addProductToCart(PRODUCTS.ONESIE);
    await expect(inventoryPage.navbar.cartBadge).toBeVisible();

    await inventoryPage.goToCart();
    await cartPage.goToCheckout();
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);
  });

  test('Removing the product from the catalog view updates the badge', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await expect(inventoryPage.navbar.cartBadge).toHaveText('1');

    await inventoryPage.removeProductFromCatalog(PRODUCTS.BACKPACK);
    await expect(inventoryPage.navbar.cartBadge).toBeHidden();

    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(0);
  });

  test('Rapid state toggling (Quick Add/Remove toggle) in the catalog', async ({
    inventoryPage,
    cartPage,
  }) => {
    const item = inventoryPage.inventoryItems.filter({ hasText: PRODUCTS.BIKE_LIGHT });
    const addButton = item.locator('button', { hasText: 'Add to cart' });
    const removeButton = item.locator('button', { hasText: 'Remove' });

    await addButton.click();
    await expect(removeButton).toBeVisible();

    await removeButton.click();
    await expect(addButton).toBeVisible();

    await addButton.click();

    await expect(inventoryPage.navbar.cartBadge).toHaveText('1');
    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(1);
  });

  test('Cart behavior after logging out and logging back in', async ({
    inventoryPage,
    cartPage,
    loginPage,
  }) => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await expect(inventoryPage.navbar.cartBadge).toHaveText('1');

    await inventoryPage.navbar.logout();

    // Re-login explicitly (this test validates session isolation behavior)
    await loginPage.login('standard_user', 'secret_sauce');

    await expect(inventoryPage.navbar.cartBadge).toHaveText('1');
    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.cartItems.locator('.inventory_item_name')).toHaveText(
      PRODUCTS.BACKPACK,
    );
  });
});
