import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';
import { CheckoutStep1 } from '../POMs/CheckoutStep1';

test.describe('Pruebas automatizadas E-commerce - Checkout Overview', () => {

  // ==========================================================
  // CONFIGURACIÓN INICIAL (SETUP)
  // ==========================================================
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    // Magia: una sola línea, sin variables raras.
    await loginPage.login(); 

    // Pre-condición: Agregar un producto (mochila) y navegar hasta el Checkout Step 2
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    
    // Llenar formulario de checkout (Step 1)
    const checkoutStep1 = new CheckoutStep1(page);

    // Calling the instance method
    await checkoutStep1.fillInformationAndContinue('Nicolas', 'Tester', '11000');
    
    // Verificamos que el setup terminó correctamente en el Overview
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');
  });

  // ==========================================================
  // PRUEBAS FUNCIONALES (HAPPY PATH)
  // ==========================================================

  test('Validar redirección al PDP desde el título del producto y su visibilidad', async ({ page }) => {
    const firstCartItem = page.locator('[data-test="inventory-item"]').first();
    const productTitleLocator = firstCartItem.locator('.inventory_item_name');
    
    const expectedProductName = await productTitleLocator.innerText();

    // Validar UI en el resumen
    await expect(productTitleLocator).toBeVisible();
    await expect(firstCartItem.locator('.inventory_item_desc')).toBeVisible();
    await expect(firstCartItem.locator('[data-test="inventory-item-price"]')).toBeVisible();

    // Navegar al PDP
    await productTitleLocator.click();

    // Validar destino
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

  // ==========================================================
  // PRUEBAS DE FLUJO (ATÓMICAS)
  // ==========================================================

  test('Validar flujo del botón Cancel retorna al catálogo preservando el carrito', async ({ page }) => {
    await page.locator('[data-test="cancel"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    // Validamos que cancelar la compra no borra los items elegidos
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('Validar flujo del botón Finish completa la compra exitosamente', async ({ page }) => {
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
  });

  // ==========================================================
  // PRUEBAS DE CASOS LÍMITE (EDGE CASES)
  // ==========================================================

  test('Edge Case - Validar cálculo matemático dinámico con múltiples productos', async ({ page }) => {
    // 1. Alterar la pre-condición: Volvemos para agregar más items
    await page.locator('[data-test="cancel"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();
    
    // 2. Volver al checkout
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill('Nicolas');
    await page.locator('[data-test="lastName"]').fill('Tester');
    await page.locator('[data-test="postalCode"]').fill('11000');
    await page.locator('[data-test="continue"]').click();

    // 3. Extracción de precios y cálculo dinámico
    const priceElements = page.locator('[data-test="inventory-item-price"]');
    const count = await priceElements.count();
    expect(count).toBe(3); // Nos aseguramos de que haya 3 items para el test

    let calculatedSubtotal = 0;
    for (let i = 0; i < count; i++) {
      const priceText = await priceElements.nth(i).innerText();
      calculatedSubtotal += parseFloat(priceText.replace('$', ''));
    }
    calculatedSubtotal = parseFloat(calculatedSubtotal.toFixed(2));

    // 4. Validar Subtotal
    const subtotalText = await page.locator('[data-test="subtotal-label"]').innerText();
    const actualSubtotal = parseFloat(subtotalText.replace('Item total: $', ''));
    expect(calculatedSubtotal).toBe(actualSubtotal);

    // 5. Validar coherencia del Total final (Subtotal + Impuestos)
    const taxText = await page.locator('[data-test="tax-label"]').innerText();
    const actualTax = parseFloat(taxText.replace('Tax: $', ''));

    const totalText = await page.locator('[data-test="total-label"]').innerText();
    const actualTotal = parseFloat(totalText.replace('Total: $', ''));

    const calculatedTotal = parseFloat((actualSubtotal + actualTax).toFixed(2));
    expect(calculatedTotal).toBe(actualTotal);
  });

  test('Edge Case - Permitir checkout con el carrito vacío (Comportamiento de la plataforma)', async ({ page }) => {
    // 1. Vaciar el carrito
    await page.locator('[data-test="cancel"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();
    await page.locator('[data-test="checkout"]').click();

    const checkoutStep1 = new CheckoutStep1(page);
    await checkoutStep1.fillInformationAndContinue('Nicolas', 'Tester', '11000');  

    // 3. Validar que los montos se manejan correctamente en 0
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $0');
    await expect(page.locator('[data-test="tax-label"]')).toHaveText('Tax: $0.00');
    await expect(page.locator('[data-test="total-label"]')).toHaveText('Total: $0.00');

    // 4. Validar que la plataforma permite finalizar la compra vacía (reportable como bug o documentado como expected behavior)
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
  });

  // ==========================================================
  // PRUEBAS DE SEGURIDAD / CONTROL DE NAVEGACIÓN
  // ==========================================================

  test('Edge Case - Inyección de URL: Intentar acceder a Step Two sin completar Step One', async ({ browser }) => {
    // 1. Creamos un contexto de navegador completamente limpio (sin cookies ni sesión previa)
    const cleanContext = await browser.newContext();
    const cleanPage = await cleanContext.newPage();

    // 2. Intentamos forzar la navegación directa a la URL del Step Two
    await cleanPage.goto('https://www.saucedemo.com/checkout-step-two.html');

    // 3. Validación: Al no estar autenticado ni tener datos de checkout, 
    // Saucedemo debe bloquear el acceso y redirigir al Login con un mensaje de error
    await expect(cleanPage).toHaveURL('https://www.saucedemo.com/');
    await expect(cleanPage.locator('[data-test="error"]')).toBeVisible();
    await expect(cleanPage.locator('[data-test="error"]')).toContainText("Epic sadface: You can only access '/checkout-step-two.html' when you are logged in.");

    // Cerramos el contexto aislado
    await cleanContext.close();
  });
});