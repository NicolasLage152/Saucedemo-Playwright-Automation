import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';
import { CheckoutStep1 } from '../POMs/CheckoutStep1';

test.describe('Pruebas automatizadas - Checkout Step One', () => {
  let checkoutStepOnePage: CheckoutStep1;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    checkoutStepOnePage = new CheckoutStep1(page);

    // Llegar hasta la pantalla del formulario
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
  });

  test('Llenar formulario completo y continuar', async ({ page }) => {
    // Usamos el método unificado del POM
    await checkoutStepOnePage.fillInformationAndContinue('Nicolas', 'Tester', '11000');
    
    // Verificamos redirección al Step Two
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');
  });

  test('Validar mensaje de error si se envía el formulario vacío', async () => {
    await checkoutStepOnePage.clickContinue();
    
    // Validamos el error usando el locator centralizado[cite: 1]
    await expect(checkoutStepOnePage.errorMessage).toBeVisible();
    await expect(checkoutStepOnePage.errorMessage).toContainText('Error: First Name is required');
  });

  test('Validar mensaje de error si falta el apellido (Last Name)', async () => {
    await checkoutStepOnePage.fillInformationAndContinue('Nicolas', '', '11000');
    
    await expect(checkoutStepOnePage.errorMessage).toBeVisible();
    await expect(checkoutStepOnePage.errorMessage).toContainText('Error: Last Name is required');
  });

  test('Validar mensaje de error si falta el código postal (Postal Code)', async () => {
    await checkoutStepOnePage.fillInformationAndContinue('Nicolas', 'Tester', '');
    
    await expect(checkoutStepOnePage.errorMessage).toBeVisible();
    await expect(checkoutStepOnePage.errorMessage).toContainText('Error: Postal Code is required');
  });
test('Validar error al ingresar únicamente espacios en blanco en Nombre (First Name)', async () => {
    test.fail(true, 'BUG-001: SauceDemo permite avanzar con espacios en blanco en First Name (falta .trim())');

    await checkoutStepOnePage.fillInformationAndContinue('   ', 'Tester', '11000');
    await expect(checkoutStepOnePage.errorMessage).toBeVisible();
  });

  test('Validar error al ingresar únicamente espacios en blanco en Apellido (Last Name)', async () => {
    test.fail(true, 'BUG-001: SauceDemo permite avanzar con espacios en blanco en Last Name (falta .trim())');

    await checkoutStepOnePage.fillInformationAndContinue('Nicolas', '   ', '11000');
    await expect(checkoutStepOnePage.errorMessage).toBeVisible();
  });

  test('Validar error al ingresar únicamente espacios en blanco en Código Postal (Postal Code)', async () => {
    test.fail(true, 'BUG-001: SauceDemo permite avanzar con espacios en blanco en Postal Code (falta .trim())');

    await checkoutStepOnePage.fillInformationAndContinue('Nicolas', 'Tester', '   ');
    await expect(checkoutStepOnePage.errorMessage).toBeVisible();
  });

  test('Validar bloqueo de formulario enviando únicamente espacios en todos los campos', async () => {
    test.fail(true, 'BUG-001: SauceDemo permite avanzar enviando solo espacios en blanco en todos los campos');

    await checkoutStepOnePage.fillInformationAndContinue('   ', '   ', '   ');
    await expect(checkoutStepOnePage.errorMessage).toBeVisible();
  });
});