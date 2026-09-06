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
    await page.locator('[data-test="inventory-sidebar-link"]').click(); 
    
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  });

  test('The "About" link correctly redirects to the external Sauce Labs domain', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('[data-test="about-sidebar-link"]').click(); 
    
    await expect(page).toHaveURL('https://saucelabs.com/');
  });

  test('The "Logout" link closes the active session and returns to the login screen', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('[data-test="logout-sidebar-link"]').click(); 
    
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
    await expect(page.locator('[data-test="username"]')).toBeVisible();
  });

  test('The hamburger menu closes correctly when clicking the close (X) button', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    
    const menuWrap = page.locator('.bm-menu-wrap');
    await expect(menuWrap).toBeVisible();

    await page.locator('#react-burger-cross-btn').click();

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
    await page.locator('[data-test="reset-sidebar-link"]').click();

    await expect(page.locator('[data-test="shopping-cart-badge"]')).toBeHidden();

    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(page.locator('[data-test="login-button"]')).toBeHidden();
  });
});