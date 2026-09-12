import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';
import { CheckoutStep1 } from '../POMs/CheckoutStep1';

test.describe('Pruebas automatizadas - Checkout Step One', () => {
  let checkoutStepOnePage: CheckoutStep1;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    checkoutStepOnePage = new CheckoutStep1(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    // FIX CLAVE: Confirmar que el botón reaccionó y el carrito tiene 1 item antes de navegar
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
    
    await page.locator('[data-test="shopping-cart-link"]').click();
    // FIX CLAVE: Esperar a que la vista del carrito cargue por completo
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');
    
    await page.locator('[data-test="checkout"]').click();
    // FIX CLAVE: Esperar a que el formulario cargue antes de empezar a tipear
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');
  });

  test('Fill out the complete form and continue', async ({ page }) => {
    await checkoutStepOnePage.fillInformationAndContinue('Nicolas', 'Tester', '11000');
    
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');
  });

  test('Validate error message when submitting an empty form', async () => {
    await checkoutStepOnePage.clickContinue();
    
    await expect(checkoutStepOnePage.errorMessage).toBeVisible();
    await expect(checkoutStepOnePage.errorMessage).toContainText('Error: First Name is required');
  });

  test('Validate error message when the last name (Last Name) is missing', async () => {
    await checkoutStepOnePage.fillInformationAndContinue('Nicolas', '', '11000');
    
    await expect(checkoutStepOnePage.errorMessage).toBeVisible();
    await expect(checkoutStepOnePage.errorMessage).toContainText('Error: Last Name is required');
  });

  test('Validate error message when the postal code (Postal Code) is missing', async () => {
    await checkoutStepOnePage.fillInformationAndContinue('Nicolas', 'Tester', '');
    
    await expect(checkoutStepOnePage.errorMessage).toBeVisible();
    await expect(checkoutStepOnePage.errorMessage).toContainText('Error: Postal Code is required');
  });

  test('Validate error when entering only whitespace in First Name', async ({ page }) => {
    test.fail(true, 'BUG-001: SauceDemo permite avanzar con espacios en blanco en First Name (falta .trim())');

    await checkoutStepOnePage.fillInformationAndContinue('   ', 'Tester', '11000');
    await expect(checkoutStepOnePage.errorMessage).toBeVisible();
  });

  test('Validate error when entering only whitespace in Last Name', async ({ page }) => {
    test.fail(true, 'BUG-001: SauceDemo permite avanzar con espacios en blanco en Last Name (falta .trim())');

    await checkoutStepOnePage.fillInformationAndContinue('Nicolas', '   ', '11000');
    await expect(checkoutStepOnePage.errorMessage).toBeVisible();
  });

  test('Validate error when entering only whitespace in Postal Code', async ({ page }) => {
    test.fail(true, 'BUG-001: SauceDemo permite avanzar con espacios en blanco en Postal Code (falta .trim())');

    await checkoutStepOnePage.fillInformationAndContinue('Nicolas', 'Tester', '   ');
    await expect(checkoutStepOnePage.errorMessage).toBeVisible();
  });

  test('Validate form blocking when submitting only whitespace in all fields', async ({ page }) => {
    test.fail(true, 'BUG-001: SauceDemo permite avanzar enviando solo espacios en blanco en todos los campos');

    await checkoutStepOnePage.fillInformationAndContinue('   ', '   ', '   ');
    await expect(checkoutStepOnePage.errorMessage).toBeVisible();
  });
});