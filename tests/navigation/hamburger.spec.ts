import { test, expect } from '@fixtures/baseTest';

/**
 * Auth-gated suite: session is injected via storageState (auth.setup.ts).
 */
test.describe('Hamburger Menu – Navigation & Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test('Validate that the hamburger menu opens and closes correctly', async ({
    inventoryPage,
  }) => {
    await inventoryPage.navbar.openMenu();
    await expect(inventoryPage.navbar.menuWrap).toHaveCSS('transform', 'none');

    await inventoryPage.navbar.closeMenuButton.click();
    await expect(inventoryPage.navbar.menuWrap).not.toHaveCSS('transform', 'none');
  });

  test('Validate that the "All Items" link redirects to the catalog', async ({
    page,
    inventoryPage,
  }) => {
    await inventoryPage.navbar.openMenu();
    await inventoryPage.navbar.allItemsSidebarLink.click();
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test('Validate that the "About" link redirects to the Sauce Labs website', async ({
    page,
    inventoryPage,
  }) => {
    await inventoryPage.navbar.openMenu();
    await inventoryPage.navbar.aboutSidebarLink.click();
    await expect(page).toHaveURL(/saucelabs\.com/);
  });

  test('Validate that the "Logout" option redirects to the login page', async ({
    page,
    inventoryPage,
  }) => {
    await inventoryPage.navbar.logout();
    await expect(page).toHaveURL(/.*saucedemo\.com\/$/);
  });

  test('Validate that the "Reset App State" clears the cart badge', async ({
    page,
    inventoryPage,
  }) => {
    // Add a product to trigger the badge
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await expect(inventoryPage.navbar.cartBadge).toHaveText('1');

    // Reset via sidebar
    await inventoryPage.navbar.openMenu();
    await inventoryPage.navbar.resetSidebarLink.click();

    // Navigate to a clean page to confirm reset took effect
    await page.goto('/inventory.html');
    await expect(inventoryPage.navbar.cartBadge).toBeHidden();
  });

  test('Validate that the App Logo inside the menu redirects to catalog', async ({
    page,
  }) => {
    // Click the app logo (a static element in the sidebar header)
    await page.locator('.app_logo').click();
    await expect(page).toHaveURL(/.*inventory\.html/);
  });
});
