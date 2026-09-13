import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { InventoryPage } from "../pages/InventoryPage";

test.describe("Navigation Tests (Hamburger Menu) - SauceDemo", () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login();
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
  });

  test('The "All Items" link correctly returns to the main inventory view', async ({
    page,
  }) => {
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);

    await inventoryPage.navbar.openMenu();

    // FIX CLAVE: Cambiamos .waitFor() por una aserción web-first estándar
    await expect(inventoryPage.navbar.allItemsSidebarLink).toBeVisible();
    await inventoryPage.navbar.allItemsSidebarLink.click();

    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test('The "About" link correctly redirects to the external Sauce Labs domain', async ({
    page,
  }) => {
    await inventoryPage.navbar.openMenu();

    // FIX CLAVE: Esperar a que la animación del menú termine antes de interactuar
    await expect(inventoryPage.navbar.aboutSidebarLink).toBeVisible();
    await inventoryPage.navbar.aboutSidebarLink.click();

    await expect(page).toHaveURL("https://saucelabs.com/");
  });

  test('The "Logout" link closes the active session and returns to the login screen', async ({
    page,
  }) => {
    // Reutilizamos la función atómica que ya armamos antes
    await inventoryPage.navbar.logout();

    await expect(page).toHaveURL(/.*saucedemo\.com\//);
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.usernameInput).toBeVisible();
  });

  test("The hamburger menu closes correctly when clicking the close (X) button", async () => {
    await inventoryPage.navbar.openMenu();

    // Aseguramos que el botón de cerrar está listo
    await expect(inventoryPage.navbar.closeMenuButton).toBeVisible();
    await inventoryPage.navbar.closeMenuButton.click();

    await expect(inventoryPage.navbar.menuWrap).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  test("The hamburger menu remains open when clicking outside its container", async ({
    page,
  }) => {
    await inventoryPage.navbar.openMenu();
    await expect(inventoryPage.navbar.menuWrap).toBeVisible();

    // Click outside the menu on an unobstructed content area without forcing
    await page.locator(".header_secondary_container").click();

    await expect(inventoryPage.navbar.menuWrap).toBeVisible();
  });

  test('The "Reset App State" button clears the cart (badge hidden) and keeps the session active', async ({
    page,
  }) => {
    await inventoryPage.addProductToCart("Sauce Labs Backpack");
    await expect(inventoryPage.navbar.cartBadge).toHaveText("1");

    await inventoryPage.navbar.openMenu();

    // FIX CLAVE: Esperar a que el link de Reset sea visible en la interfaz desplegada
    await expect(inventoryPage.navbar.resetSidebarLink).toBeVisible();
    await inventoryPage.navbar.resetSidebarLink.click();

    await expect(inventoryPage.navbar.cartBadge).toBeHidden();

    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(loginPage.loginButton).toBeHidden();
  });
});
