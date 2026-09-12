import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';

test.describe('Navigation Tests (Hamburger Menu) - SauceDemo', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    await loginPage.login(); 
  });

  test('The "All Items" link correctly returns to the main inventory view', async ({ page }) => {
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');
    
    await page.locator('#react-burger-menu-btn').click();
    
    const allItemsLink = page.locator('[data-test="inventory-sidebar-link"]');
    // FIX CLAVE: Cambiamos .waitFor() por una aserción web-first estándar
    await expect(allItemsLink).toBeVisible(); 
    await allItemsLink.click();
    
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  });

  test('The "About" link correctly redirects to the external Sauce Labs domain', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    
    const aboutLink = page.locator('[data-test="about-sidebar-link"]');
    // FIX CLAVE: Esperar a que la animación del menú termine antes de interactuar
    await expect(aboutLink).toBeVisible(); 
    await aboutLink.click(); 
    
    await expect(page).toHaveURL('https://saucelabs.com/');
  });

  test('The "Logout" link closes the active session and returns to the login screen', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    
    const logoutLink = page.locator('[data-test="logout-sidebar-link"]');
    // FIX CLAVE: Confirmar visualmente el link de logout (protege contra la animación CSS)
    await expect(logoutLink).toBeVisible();
    await logoutLink.click(); 
    
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
    await expect(page.locator('[data-test="username"]')).toBeVisible();
  });

  test('The hamburger menu closes correctly when clicking the close (X) button', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    
    const menuWrap = page.locator('.bm-menu-wrap');
    await expect(menuWrap).toBeVisible();
    
    const closeBtn = page.locator('#react-burger-cross-btn');
    await expect(closeBtn).toBeVisible(); // Aseguramos que el botón de cerrar está listo
    await closeBtn.click();

    await expect(menuWrap).toBeHidden();
  });

  test('The hamburger menu remains open when clicking outside its container', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    
    const menuWrap = page.locator('.bm-menu-wrap');
    await expect(menuWrap).toBeVisible();

    await page.mouse.click(600, 300);

    await expect(menuWrap).toBeVisible();
  });

  test('The "Reset App State" button clears the cart (badge hidden) and keeps the session active', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    await page.locator('#react-burger-menu-btn').click();
    
    const resetLink = page.locator('[data-test="reset-sidebar-link"]');
    // FIX CLAVE: Esperar a que el link de Reset sea visible en la interfaz desplegada
    await expect(resetLink).toBeVisible();
    await resetLink.click();

    await expect(page.locator('[data-test="shopping-cart-badge"]')).toBeHidden();

    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(page.locator('[data-test="login-button"]')).toBeHidden();
  });
});