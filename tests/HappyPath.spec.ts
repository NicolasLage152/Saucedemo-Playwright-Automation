import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';
import { CheckoutStep1 } from '../POMs/CheckoutStep1';

test.describe('Automated E-commerce Tests - SauceDemo', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    await loginPage.login(); 
  });

  test('Verify that the product catalog renders correctly', async ({ page }) => {
    const inventoryItems = page.locator('[data-test="inventory-item"]');
    // Esta línea ya estaba perfecta: espera inteligentemente a que haya 6 items
    await expect(inventoryItems).toHaveCount(6);

    for (let i = 0; i < 6; i++) {
      const item = inventoryItems.nth(i);
      await expect(item.locator('img.inventory_item_img')).toBeVisible();
      await expect(item.locator('[data-test="inventory-item-price"]')).toBeVisible();
      await expect(item.locator('button', { hasText: 'Add to cart' })).toBeVisible();
    }
  });

  test('Validate product removal directly from the product detail view (PDP)', async ({ page }) => {
    const firstProduct = page.locator('[data-test="inventory-item-name"]').first();
    await firstProduct.click();
    await expect(page).toHaveURL(/.*inventory-item\.html.*/);

    // FIX CLAVE: Asegurar visualmente que el contenedor del PDP cargó. 
    // Esto previene el "Strict Mode Violation" donde Playwright encontraba 6 botones de Add to Cart del catálogo.
    await expect(page.locator('.inventory_details_container')).toBeVisible();

    const addButton = page.locator('button', { hasText: 'Add to cart' });
    await addButton.click();

    const cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    const removeButton = page.locator('button', { hasText: 'Remove' });
    
    await expect(removeButton).toBeVisible();
    await expect(cartBadge).toHaveText('1');

    await removeButton.click();

    await expect(addButton).toBeVisible();
    await expect(cartBadge).toBeHidden();

    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);
  });

  test('Complete purchase flow with PDP navigation, Cart validations, and Tax calculation', async ({ page }) => {
    const product1 = 'Sauce Labs Backpack';
    const product2 = 'Sauce Labs Bike Light';
    const cartBadge = page.locator('[data-test="shopping-cart-badge"]');

    await page.locator('.inventory_item_name').filter({ hasText: product1 }).click();
    await expect(page).toHaveURL(/.*inventory-item\.html.*/);

    // FIX: Esperar a que el detalle del producto estabilice el DOM antes de leer datos o clickear
    await expect(page.locator('img.inventory_details_img')).toBeVisible();
    await expect(page.locator('.inventory_details_name')).toHaveText(product1);
    await expect(page.locator('.inventory_details_desc')).toBeVisible();
    await expect(page.locator('.inventory_details_price')).toBeVisible();
    
    const pdpAddButton = page.locator('button', { hasText: 'Add to cart' });
    await pdpAddButton.click();

    await expect(page.locator('button', { hasText: 'Remove' })).toBeVisible();
    await expect(cartBadge).toHaveText('1');

    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

    const secondProductItem = page.locator('[data-test="inventory-item"]').filter({ hasText: product2 });
    // FIX CLAVE: Esperar a que el catálogo vuelva a ser visible antes de buscar el segundo producto
    await expect(secondProductItem).toBeVisible();
    await secondProductItem.locator('button', { hasText: 'Add to cart' }).click();

    await expect(secondProductItem.locator('button', { hasText: 'Remove' })).toBeVisible();
    await expect(cartBadge).toHaveText('2');

    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');
    
    const productsInCart = [product1, product2];
    const cartItems = page.locator('[data-test="inventory-item"]');
    // Esperar explícitamente a que los 2 productos carguen en el carrito
    await expect(cartItems).toHaveCount(2);

    for (const productName of productsInCart) {
      const cartItem = cartItems.filter({ hasText: productName });
      await expect(cartItem).toBeVisible();
      await expect(cartItem.locator('.inventory_item_name')).toHaveText(productName);
      await expect(cartItem.locator('button', { hasText: 'Remove' })).toBeVisible();
    }
    
    await page.locator('[data-test="checkout"]').click();
    const checkoutStep1 = new CheckoutStep1(page);
    await checkoutStep1.fillInformationAndContinue('Nicolas', 'Tester', '11000');

    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');

    await expect(page.locator('[data-test="payment-info-label"]')).toHaveText('Payment Information:');
    await expect(page.locator('[data-test="payment-info-value"]')).toHaveText('SauceCard #31337');
    
    await expect(page.locator('[data-test="shipping-info-label"]')).toHaveText('Shipping Information:');
    await expect(page.locator('[data-test="shipping-info-value"]')).toHaveText('Free Pony Express Delivery!');
    
    await expect(page.locator('[data-test="total-info-label"]')).toHaveText('Price Total');

    const priceElements = page.locator('[data-test="inventory-item-price"]');
    
    // FIX CLAVE: Obligar al DOM a confirmar la presencia de los 2 precios antes de intentar contarlos y extraer texto
    await expect(priceElements).toHaveCount(2);
    const count = await priceElements.count();
    let calculatedSubtotal = 0;

    for (let i = 0; i < count; i++) {
      const priceText = await priceElements.nth(i).innerText();
      const priceValue = parseFloat(priceText.replace('$', ''));
      calculatedSubtotal += priceValue;
    }

    calculatedSubtotal = parseFloat(calculatedSubtotal.toFixed(2));

    // FIX CLAVE: Esperar visibilidad de los totales antes de leerlos
    const subtotalLabel = page.locator('[data-test="subtotal-label"]');
    await expect(subtotalLabel).toBeVisible();
    const subtotalText = await subtotalLabel.innerText();
    const actualSubtotal = parseFloat(subtotalText.replace('Item total: $', ''));
    expect(calculatedSubtotal).toBe(actualSubtotal);

    const taxLabel = page.locator('[data-test="tax-label"]');
    await expect(taxLabel).toBeVisible();
    const taxText = await taxLabel.innerText();
    const actualTax = parseFloat(taxText.replace('Tax: $', ''));

    const totalLabel = page.locator('[data-test="total-label"]');
    await expect(totalLabel).toBeVisible();
    const totalText = await totalLabel.innerText();
    const actualTotal = parseFloat(totalText.replace('Total: $', ''));

    const calculatedTotal = parseFloat((actualSubtotal + actualTax).toFixed(2));
    expect(calculatedTotal).toBe(actualTotal);

    await page.locator('[data-test="finish"]').click();
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });
});