import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';

test.describe('Pruebas de Navegación (Menú Hamburguesa) - SauceDemo', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    await loginPage.login(); 
  });

  test('El enlace "All Items" retorna correctamente a la vista principal del inventario', async ({ page }) => {
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');
    
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('[data-test="inventory-sidebar-link"]').click(); 
    
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  });

  test('El enlace "About" redirige correctamente al dominio externo de Sauce Labs', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('[data-test="about-sidebar-link"]').click(); 
    
    await expect(page).toHaveURL('https://saucelabs.com/');
  });

  test('El enlace "Logout" cierra la sesión activa y devuelve a la pantalla de inicio', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('[data-test="logout-sidebar-link"]').click(); 
    
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
    await expect(page.locator('[data-test="username"]')).toBeVisible();
  });

  test('El menú hamburguesa se cierra correctamente al hacer clic en la cruz (X)', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    
    const menuWrap = page.locator('.bm-menu-wrap');
    await expect(menuWrap).toBeVisible();

    await page.locator('#react-burger-cross-btn').click();

    await expect(menuWrap).toBeHidden();
  });

test('El menú hamburguesa permanece abierto al hacer clic fuera de su contenedor', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    
    const menuWrap = page.locator('.bm-menu-wrap');
    await expect(menuWrap).toBeVisible();

    await page.mouse.click(600, 300);

    await expect(menuWrap).toBeVisible();
  });

  test('El botón "Reset App State" vacía el carrito (badge oculto) y mantiene la sesión activa', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    await page.locator('#react-burger-menu-btn').click();
    await page.locator('[data-test="reset-sidebar-link"]').click();

    await expect(page.locator('[data-test="shopping-cart-badge"]')).toBeHidden();

    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(page.locator('[data-test="login-button"]')).toBeHidden();
  });
});