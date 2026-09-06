import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';

test.describe('Pruebas de Login y Usuarios Específicos - SauceDemo', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

test('Validar login exitoso con usuario estándar', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  await loginPage.login(); 
  
  await expect(page).toHaveURL('/inventory.html');
});
  test('Validar bloqueo para locked_out_user', async ({ page }) => {
    await loginPage.login('locked_out_user', 'secret_sauce');
    
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Epic sadface: Sorry, this user has been locked out.');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  test('Validar fallo de renderizado de imágenes para problem_user', async ({ page }) => {
    await loginPage.login('problem_user', 'secret_sauce');
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

    const firstProductImg = page.locator('.inventory_item_img img').first();
     await expect(firstProductImg).toHaveAttribute('src', '/assets/sl-404-Cq1a9k9X.jpg');
  });

  test('Validar tiempos de respuesta diferidos para performance_glitch_user', async ({ page }) => {
    const startTime = Date.now();
    
    await loginPage.login('performance_glitch_user', 'secret_sauce');
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    
    const duration = Date.now() - startTime;
    expect(duration).toBeGreaterThan(3000);
  });

  test('Validar inconsistencia de eventos para error_user', async ({ page }) => {
    await loginPage.login('error_user', 'secret_sauce');
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

    const addToCartBtn = page.locator('[data-test="add-to-cart-sauce-labs-fleece-jacket"]');
    await addToCartBtn.click();
    
    await expect(addToCartBtn).toBeVisible(); 
  });

  test('Validar fallos en maquetación/layout para visual_user', async ({ page }) => {
    await loginPage.login('visual_user', 'secret_sauce');
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

    const shoppingCart = page.locator('.shopping_cart_link');
    await expect(shoppingCart).toBeVisible();
  });


  test('Validar error con credenciales inválidas', async ({ page }) => {
    await loginPage.login('invalid_user', 'wrong_password');
    
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Username and password do not match any user in this service');
  });

  test('Validar campos vacíos', async ({ page }) => {
    await loginPage.login('', '');
    
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Username is required');
  });
});