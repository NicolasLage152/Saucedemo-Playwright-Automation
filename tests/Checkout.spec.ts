import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';
import { CheckoutStep1 } from '../POMs/CheckoutStep1';

test.describe('Automated E-commerce Tests - Checkout Overview', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(); 

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    // FIX CLAVE: Confirmar que el carrito recibió el item antes de navegar
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    await page.locator('[data-test="shopping-cart-link"]').click();
    // FIX CLAVE: Esperar a que la página del carrito cargue
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html'); 

    await page.locator('[data-test="checkout"]').click();
    // FIX CLAVE: Esperar a que la vista de checkout cargue
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html'); 
    
    const checkoutStep1 = new CheckoutStep1(page);
    await checkoutStep1.fillInformationAndContinue('Nicolas', 'Tester', '11000');
    
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');
  });

  test('Validate redirection to the PDP from the product title and its visibility', async ({ page }) => {
    const firstCartItem = page.locator('[data-test="inventory-item"]').first();
    const productTitleLocator = firstCartItem.locator('.inventory_item_name');
    
    // FIX CLAVE: Esperar a que el título sea visible ANTES de extraer su texto
    await expect(productTitleLocator).toBeVisible();
    const expectedProductName = await productTitleLocator.innerText();

    await expect(firstCartItem.locator('.inventory_item_desc')).toBeVisible();
    await expect(firstCartItem.locator('[data-test="inventory-item-price"]')).toBeVisible();

    await productTitleLocator.click();

    await expect(page).toHaveURL(/.*inventory-item\.html.*/);
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText(expectedProductName);
    await expect(page.locator('[data-test="inventory-item-desc"]')).toBeVisible();
  });

  test('Validate static Payment and Shipping information', async ({ page }) => {
    await expect(page.locator('[data-test="payment-info-label"]')).toHaveText('Payment Information:');
    await expect(page.locator('[data-test="payment-info-value"]')).toHaveText('SauceCard #31337');
    
    await expect(page.locator('[data-test="shipping-info-label"]')).toHaveText('Shipping Information:');
    await expect(page.locator('[data-test="shipping-info-value"]')).toHaveText('Free Pony Express Delivery!');
  });

  test('Validate the Cancel button flow returns to the catalog while preserving the cart', async ({ page }) => {
    await page.locator('[data-test="cancel"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('Validate the Finish button flow successfully completes the purchase', async ({ page }) => {
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
  });

  test('Edge Case - Validate dynamic mathematical calculation with multiple products', async ({ page }) => {
    await page.locator('[data-test="cancel"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html'); // FIX: Estabilizar transición

    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('3'); // FIX: Confirmar renderizado del badge
    
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html'); // FIX: Estabilizar transición

    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html'); // FIX

    await page.locator('[data-test="firstName"]').fill('Nicolas');
    await page.locator('[data-test="lastName"]').fill('Tester');
    await page.locator('[data-test="postalCode"]').fill('11000');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html'); // FIX

    const priceElements = page.locator('[data-test="inventory-item-price"]');
    // FIX CLAVE: toHaveCount obliga a esperar que los 3 elementos existan. count() directo da 0 si la red demora.
    await expect(priceElements).toHaveCount(3);
    const count = await priceElements.count(); 

    let calculatedSubtotal = 0;
    for (let i = 0; i < count; i++) {
      const priceText = await priceElements.nth(i).innerText();
      calculatedSubtotal += parseFloat(priceText.replace('$', ''));
    }
    calculatedSubtotal = parseFloat(calculatedSubtotal.toFixed(2));

    const subtotalLabel = page.locator('[data-test="subtotal-label"]');
    await expect(subtotalLabel).toBeVisible(); // FIX CLAVE: Asegurar existencia en DOM
    
    const subtotalText = await subtotalLabel.innerText();
    const actualSubtotal = parseFloat(subtotalText.replace('Item total: $', ''));
    expect(calculatedSubtotal).toBe(actualSubtotal);

    const taxText = await page.locator('[data-test="tax-label"]').innerText();
    const actualTax = parseFloat(taxText.replace('Tax: $', ''));

    const totalText = await page.locator('[data-test="total-label"]').innerText();
    const actualTotal = parseFloat(totalText.replace('Total: $', ''));

    const calculatedTotal = parseFloat((actualSubtotal + actualTax).toFixed(2));
    expect(calculatedTotal).toBe(actualTotal);
  });

  test('Edge Case - Allow checkout with an empty cart (Platform behavior)', async ({ page }) => {
    await page.locator('[data-test="cancel"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html'); // FIX

    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html'); // FIX

    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();
    await expect(page.locator('.shopping_cart_badge')).toBeHidden(); // FIX: Confirmar acción de vaciado

    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html'); // FIX

    const checkoutStep1 = new CheckoutStep1(page);
    await checkoutStep1.fillInformationAndContinue('Nicolas', 'Tester', '11000');  
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html'); // FIX

    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $0');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $0.00');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $0.00');

    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
  });

  test('Edge Case - URL Injection: Attempting to access Step Two without completing Step One', async ({ browser }) => {
    const cleanContext = await browser.newContext();
    const cleanPage = await cleanContext.newPage();

    await cleanPage.goto('https://www.saucedemo.com/checkout-step-two.html');

    await expect(cleanPage).toHaveURL('https://www.saucedemo.com/');
    await expect(cleanPage.locator('[data-test="error"]')).toBeVisible();
    await expect(cleanPage.locator('[data-test="error"]')).toContainText("Epic sadface: You can only access '/checkout-step-two.html' when you are logged in.");

    await cleanContext.close();
  });
});