import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';

test.describe('Pruebas de Navegación (Menú Hamburguesa) - SauceDemo', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    // Magia: una sola línea, sin variables raras.
    await loginPage.login(); 
  });

  test('El enlace "All Items" retorna correctamente a la vista principal del inventario', async ({ page }) => {
    // Primero navegamos fuera del inventario (al carrito) para que la prueba tenga sentido
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');
    
    // Abrimos el menú y hacemos clic en All Items
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('[data-test="inventory-sidebar-link"]').click(); 
    
    // Validamos la redirección
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  });

  test('El enlace "About" redirige correctamente al dominio externo de Sauce Labs', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('[data-test="about-sidebar-link"]').click(); 
    
    // Al ser un dominio externo, Playwright esperará automáticamente a que la página cargue
    await expect(page).toHaveURL('https://saucelabs.com/');
  });

  test('El enlace "Logout" cierra la sesión activa y devuelve a la pantalla de inicio', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('[data-test="logout-sidebar-link"]').click(); 
    
    // Validar redirección a la raíz
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    
    // Validar que los campos de autenticación vuelvan a estar interactivos
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
    await expect(page.locator('[data-test="username"]')).toBeVisible();
  });

  test('El menú hamburguesa se cierra correctamente al hacer clic en la cruz (X)', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    
    // Validar que el menú se desplegó correctamente
    const menuWrap = page.locator('.bm-menu-wrap');
    await expect(menuWrap).toBeVisible();

    // Clic en el botón de cierre (la cruz)
    await page.locator('#react-burger-cross-btn').click();

    // Validar que el menú ya no está visible
    await expect(menuWrap).toBeHidden();
  });

test('El menú hamburguesa permanece abierto al hacer clic fuera de su contenedor', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    
    const menuWrap = page.locator('.bm-menu-wrap');
    await expect(menuWrap).toBeVisible();

    // Hacemos clic mediante coordenadas en el área de la derecha (fuera del panel del menú lateral)
    await page.mouse.click(600, 300);

    // Validar que el menú se mantiene abierto
    await expect(menuWrap).toBeVisible();
  });

  test('El botón "Reset App State" vacía el carrito (badge oculto) y mantiene la sesión activa', async ({ page }) => {
    // 1. Agregar un producto al carrito
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    // 2. Abrir el menú hamburguesa y hacer clic en Reset App State
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('[data-test="reset-sidebar-link"]').click();

    // 3. Validar que el badge del carrito desaparece (carrito vacío)
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toBeHidden();

    // 4. Validar que la sesión sigue activa permaneciendo en el inventario
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(page.locator('[data-test="login-button"]')).toBeHidden();
  });
});