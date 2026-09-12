import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';
import { InventoryPage } from '../POMs/InventoryPage';

test.describe('Navigation Tests (Hamburger Menu) - SauceDemo', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(); 
  });

  test('The "All Items" link correctly returns to the main inventory view', async ({ page }) => {
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);
    
    await inventoryPage.burgerMenuButton.click();
    
    // FIX CLAVE: Cambiamos .waitFor() por una aserción web-first estándar
    await expect(inventoryPage.allItemsSidebarLink).toBeVisible(); 
    await inventoryPage.allItemsSidebarLink.click();
    
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test('The "About" link correctly redirects to the external Sauce Labs domain', async ({ page }) => {
    await inventoryPage.burgerMenuButton.click();
    
    // FIX CLAVE: Esperar a que la animación del menú termine antes de interactuar
    await expect(inventoryPage.aboutSidebarLink).toBeVisible(); 
    await inventoryPage.aboutSidebarLink.click(); 
    
    await expect(page).toHaveURL('https://saucelabs.com/');
  });

  test('The "Logout" link closes the active session and returns to the login screen', async ({ page }) => {
    // Reutilizamos la función atómica que ya armamos antes
    await inventoryPage.logout();
    
    await expect(page).toHaveURL(/.*saucedemo\.com\//);
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.usernameInput).toBeVisible();
  });

  test('The hamburger menu closes correctly when clicking the close (X) button', async () => {
    await inventoryPage.burgerMenuButton.click();
    
    await expect(inventoryPage.menuWrap).toBeVisible();
    
    // Aseguramos que el botón de cerrar está listo
    await expect(inventoryPage.closeMenuButton).toBeVisible(); 
    await inventoryPage.closeMenuButton.click();

    await expect(inventoryPage.menuWrap).toBeHidden();
  });

  test('The hamburger menu remains open when clicking outside its container', async ({ page }) => {
    await inventoryPage.burgerMenuButton.click();
    
    await expect(inventoryPage.menuWrap).toBeVisible();

    await page.mouse.click(600, 300);

    await expect(inventoryPage.menuWrap).toBeVisible();
  });

  test('The "Reset App State" button clears the cart (badge hidden) and keeps the session active', async ({ page }) => {
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.burgerMenuButton.click();
    
    // FIX CLAVE: Esperar a que el link de Reset sea visible en la interfaz desplegada
    await expect(inventoryPage.resetSidebarLink).toBeVisible();
    await inventoryPage.resetSidebarLink.click();

    await expect(inventoryPage.cartBadge).toBeHidden();

    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(loginPage.loginButton).toBeHidden();
  });
});