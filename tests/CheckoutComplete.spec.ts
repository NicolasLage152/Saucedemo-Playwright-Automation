import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';
import { CheckoutCompletePage } from '../POMs/CheckoutComplete';
import { CheckoutStep1 } from '../POMs/CheckoutStep1';

test.describe('Pruebas automatizadas E-commerce - Checkout Complete', () => {
  let checkoutCompletePage: CheckoutCompletePage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    checkoutCompletePage = new CheckoutCompletePage(page);

    await loginPage.goto();
    await loginPage.login();
    
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    // FIX CLAVE: Confirmar estado del carrito antes de avanzar
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
    
    await page.locator('[data-test="shopping-cart-link"]').click();
    // FIX CLAVE: Esperar a que la URL cambie para estabilizar el DOM
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');
    
    await page.locator('[data-test="checkout"]').click();
    // FIX CLAVE: Confirmar llegada a step-one
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');

    const checkoutStep1 = new CheckoutStep1(page);
    await checkoutStep1.fillInformationAndContinue('Nicolas', 'Tester', '11000');
    // FIX CLAVE: Confirmar llegada a step-two antes de presionar Finish
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');

    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
  });

  test('Validate visibility of all information and visual elements', async () => {
    await checkoutCompletePage.verifyCompletePageDisplayed();
  });

  test('Validate Back Home button functionality', async ({ page }) => {
    await checkoutCompletePage.clickBackHome();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  });

  test('Validate functionality and download of the Generate PDF order button', async () => {
    // Nota: Asegúrate de que tu método clickGeneratePDF() en el POM 
    // incluya const [download] = await Promise.all([page.waitForEvent('download'), ...])
    const download = await checkoutCompletePage.clickGeneratePDF();
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('Edge Case - Direct access by pasting the URL directly', async ({ browser }) => {
    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();

    await newPage.goto('https://www.saucedemo.com/checkout-complete.html');

    await expect(newPage).toHaveURL('https://www.saucedemo.com/');
    await expect(newPage.locator('[data-test="error"]')).toBeVisible();
    await expect(newPage.locator('[data-test="error"]')).toContainText('Epic sadface');

    await newContext.close();
  });
});