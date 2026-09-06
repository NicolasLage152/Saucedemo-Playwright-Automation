import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';
import { CheckoutStep1 } from '../POMs/CheckoutStep1';

test.describe('Pruebas automatizadas E-commerce - Checkout Overview', () => {


  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    await loginPage.login(); 

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    
    const checkoutStep1 = new CheckoutStep1(page);

    await checkoutStep1.fillInformationAndContinue('Nicolas', 'Tester', '11000');
    
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');
  });



  test('Validar redirección al PDP desde el título del producto y su visibilidad', async ({ page }) => {
    const firstCartItem = page.locator('[data-test="inventory-item"]').first();
    const productTitleLocator = firstCartItem.locator('.inventory_item_name');
    
    const expectedProductName = await productTitleLocator.innerText();

    await expect(productTitleLocator).toBeVisible();
    await expect(firstCartItem.locator('.inventory_item_desc')).toBeVisible();
    await expect(firstCartItem.locator('[data-test="inventory-item-price"]')).toBeVisible();

    await productTitleLocator.click();

    await expect(page).toHaveURL(/.*inventory-item\.html.*/);
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText(expectedProductName);
    await expect(page.locator('[data-test="inventory-item-desc"]')).toBeVisible();
  });

  test('Validar información estática de Payment y Shipping', async ({ page }) => {
    await expect(page.locator('[data-test="payment-info-label"]')).toHaveText('Payment Information:');
    await expect(page.locator('[data-test="payment-info-value"]')).toHaveText('SauceCard #31337');
    
    await expect(page.locator('[data-test="shipping-info-label"]')).toHaveText('Shipping Information:');
    await expect(page.locator('[data-test="shipping-info-value"]')).toHaveText('Free Pony Express Delivery!');
  });


  test('Validar flujo del botón Cancel retorna al catálogo preservando el carrito', async ({ page }) => {
    await page.locator('[data-test="cancel"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('Validar flujo del botón Finish completa la compra exitosamente', async ({ page }) => {
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
  });



  test('Edge Case - Validar cálculo matemático dinámico con múltiples productos', async ({ page }) => {
    await page.locator('[data-test="cancel"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();
    
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill('Nicolas');
    await page.locator('[data-test="lastName"]').fill('Tester');
    await page.locator('[data-test="postalCode"]').fill('11000');
    await page.locator('[data-test="continue"]').click();

    const priceElements = page.locator('[data-test="inventory-item-price"]');
    const count = await priceElements.count();
    expect(count).toBe(3); 

    let calculatedSubtotal = 0;
    for (let i = 0; i < count; i++) {
      const priceText = await priceElements.nth(i).innerText();
      calculatedSubtotal += parseFloat(priceText.replace('$', ''));
    }
    calculatedSubtotal = parseFloat(calculatedSubtotal.toFixed(2));

    const subtotalText = await page.locator('[data-test="subtotal-label"]').innerText();
    const actualSubtotal = parseFloat(subtotalText.replace('Item total: $', ''));
    expect(calculatedSubtotal).toBe(actualSubtotal);

    const taxText = await page.locator('[data-test="tax-label"]').innerText();
    const actualTax = parseFloat(taxText.replace('Tax: $', ''));

    const totalText = await page.locator('[data-test="total-label"]').innerText();
    const actualTotal = parseFloat(totalText.replace('Total: $', ''));

    const calculatedTotal = parseFloat((actualSubtotal + actualTax).toFixed(2));
    expect(calculatedTotal).toBe(actualTotal);
  });

  test('Edge Case - Permitir checkout con el carrito vacío (Comportamiento de la plataforma)', async ({ page }) => {
    await page.locator('[data-test="cancel"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();
    await page.locator('[data-test="checkout"]').click();

    const checkoutStep1 = new CheckoutStep1(page);
    await checkoutStep1.fillInformationAndContinue('Nicolas', 'Tester', '11000');  

    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $0');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $0.00');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $0.00');

    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
  });



  test('Edge Case - Inyección de URL: Intentar acceder a Step Two sin completar Step One', async ({ browser }) => {
    const cleanContext = await browser.newContext();
    const cleanPage = await cleanContext.newPage();

    await cleanPage.goto('https://www.saucedemo.com/checkout-step-two.html');


    await expect(cleanPage).toHaveURL('https://www.saucedemo.com/');
    await expect(cleanPage.locator('[data-test="error"]')).toBeVisible();
    await expect(cleanPage.locator('[data-test="error"]')).toContainText("Epic sadface: You can only access '/checkout-step-two.html' when you are logged in.");

    await cleanContext.close();
  });
});