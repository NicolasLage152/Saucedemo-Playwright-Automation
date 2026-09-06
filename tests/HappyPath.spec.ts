import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';
import { CheckoutStep1 } from '../POMs/CheckoutStep1';


test.describe('Pruebas automatizadas E-commerce - SauceDemo', () => {

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  await loginPage.login(); 
});

  test('Verificar que el catálogo de productos se renderice correctamente', async ({ page }) => {
    const inventoryItems = page.locator('[data-test="inventory-item"]');
    await expect(inventoryItems).toHaveCount(6);

    for (let i = 0; i < 6; i++) {
      const item = inventoryItems.nth(i);
      await expect(item.locator('img.inventory_item_img')).toBeVisible();
      await expect(item.locator('[data-test="inventory-item-price"]')).toBeVisible();
      await expect(item.locator('button', { hasText: 'Add to cart' })).toBeVisible();
    }
  });

    test('Validar la remoción de un producto directamente desde la vista de detalle (PDP)', async ({ page }) => {
    const firstProduct = page.locator('[data-test="inventory-item-name"]').first();
    await firstProduct.click();
    await expect(page).toHaveURL(/.*inventory-item\.html.*/);

    const addButton = page.locator('button', { hasText: 'Add to cart' });
    await addButton.click();

    const cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    const removeButton = page.locator('button', { hasText: 'Remove' });
    await expect(cartBadge).toHaveText('1');
    await expect(removeButton).toBeVisible();

    await removeButton.click();

    await expect(cartBadge).toBeHidden();
    await expect(addButton).toBeVisible();

    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);
  });

  test('Flujo de compra completo con navegación PDP, validaciones en Cart y suma de Taxes', async ({ page }) => {
    const product1 = 'Sauce Labs Backpack';
    const product2 = 'Sauce Labs Bike Light';
    const cartBadge = page.locator('[data-test="shopping-cart-badge"]');

    await page.locator('.inventory_item_name').filter({ hasText: product1 }).click();
    await expect(page).toHaveURL(/.*inventory-item\.html.*/);

    await expect(page.locator('img.inventory_details_img')).toBeVisible();
    await expect(page.locator('.inventory_details_name')).toHaveText(product1);
    await expect(page.locator('.inventory_details_desc')).toBeVisible();
    await expect(page.locator('.inventory_details_price')).toBeVisible();
    
    const pdpAddButton = page.locator('button', { hasText: 'Add to cart' });
    await expect(pdpAddButton).toBeVisible();
    
    await pdpAddButton.click();

    await expect(page.locator('button', { hasText: 'Remove' })).toBeVisible();
    await expect(cartBadge).toBeVisible();
    await expect(cartBadge).toHaveText('1');

    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

    const secondProductItem = page.locator('[data-test="inventory-item"]').filter({ hasText: product2 });
    await secondProductItem.locator('button', { hasText: 'Add to cart' }).click();

    await expect(secondProductItem.locator('button', { hasText: 'Remove' })).toBeVisible();
    await expect(cartBadge).toHaveText('2');

    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');
    
    const productsInCart = [product1, product2];
    const cartItems = page.locator('[data-test="inventory-item"]');
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
    const count = await priceElements.count();
    let calculatedSubtotal = 0;

    for (let i = 0; i < count; i++) {
      const priceText = await priceElements.nth(i).innerText();
      const priceValue = parseFloat(priceText.replace('$', ''));
      calculatedSubtotal += priceValue;
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

    await page.locator('[data-test="finish"]').click();
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });


});