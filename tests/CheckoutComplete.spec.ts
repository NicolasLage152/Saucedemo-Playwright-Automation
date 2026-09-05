import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';
import { CheckoutCompletePage } from '../POMs/CheckoutComplete';
import { CheckoutStep1 } from '../POMs/CheckoutStep1';

test.describe('Pruebas automatizadas E-commerce - Checkout Complete', () => {
  let checkoutCompletePage: CheckoutCompletePage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    checkoutCompletePage = new CheckoutCompletePage(page);

    // Precondición: Completar la compra para llegar a la pantalla final
    await loginPage.goto();
    await loginPage.login();
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();

    const checkoutStep1 = new CheckoutStep1(page);

    await checkoutStep1.fillInformationAndContinue('Nicolas', 'Tester', '11000');

    // Clic en el botón Finish para finalizar la compra y llegar a la página complete
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
    // Simulamos un usuario pegando la URL en una pestaña nueva sin sesión
    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();

    await newPage.goto('https://www.saucedemo.com/checkout-complete.html');

    // Saucedemo bloquea el acceso directo y redirige al login con error
    await expect(newPage).toHaveURL('https://www.saucedemo.com/');
    await expect(newPage.locator('[data-test="error"]')).toBeVisible();

    await newContext.close();
  });
});