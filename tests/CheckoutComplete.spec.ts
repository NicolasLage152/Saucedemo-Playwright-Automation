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
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();

    const checkoutStep1 = new CheckoutStep1(page);

    await checkoutStep1.fillInformationAndContinue('Nicolas', 'Tester', '11000');

    await page.locator('[data-test="finish"]').click();

    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
  });

  test('Validar visibilidad de toda la información y elementos visuales', async () => {
    await checkoutCompletePage.verifyCompletePageDisplayed();
  });

  test('Validar funcionamiento del botón Back Home', async ({ page }) => {
    await checkoutCompletePage.clickBackHome();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  });

  test('Validar funcionamiento y descarga del botón Generate PDF order', async () => {
    const download = await checkoutCompletePage.clickGeneratePDF();
    expect(download.suggestedFilename()).toContain('.pdf');
  });

test('Edge Case - Acceso directo pegando la URL directamente', async ({ browser }) => {
    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();

    await newPage.goto('https://www.saucedemo.com/checkout-complete.html');

    await expect(newPage).toHaveURL('https://www.saucedemo.com/');
    await expect(newPage.locator('[data-test="error"]')).toBeVisible();

    await newContext.close();
  });
});