import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';

test.describe('Cart Management Tests - SauceDemo', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(); 
  });

  test('Verify interface and initial state when entering an empty cart', async ({ page }) => {
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');

    const cartItems = page.locator('[data-test="inventory-item"]');
    await expect(cartItems).toHaveCount(0);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toBeHidden();
    
    await expect(page.locator('[data-test="continue-shopping"]')).toBeVisible();
    await expect(page.locator('[data-test="checkout"]')).toBeVisible();
  });

  test('Validate the "Continue Shopping" button returns to the catalog while maintaining the state', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    
    // Esperamos a que el badge se actualice ANTES de cambiar de página para evitar race conditions
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');

    await page.locator('[data-test="continue-shopping"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('Verify product persistence in the cart after reloading the page (F5)', async ({ page }) => {
    const product = 'Sauce Labs Bolt T-Shirt';
    
    // Esperamos explícitamente que los items del catálogo carguen antes de interactuar
    await expect(page.locator('[data-test="inventory-item"]')).not.toHaveCount(0);
    
    const productItem = page.locator('[data-test="inventory-item"]').filter({ hasText: product });
    await productItem.locator('button', { hasText: 'Add to cart' }).click();

    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);

    await page.reload();

    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);
    await expect(page.locator('.inventory_item_name')).toHaveText(product);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('Verify the bulk addition of all products to the cart (6/6)', async ({ page }) => {
    // FIX CLAVE: Playwright no debe contar hasta asegurarse que el catálogo cargó por completo
    const inventoryItems = page.locator('[data-test="inventory-item"]');
    await expect(inventoryItems).toHaveCount(6); // Forzamos la espera inteligente

    const addButtons = page.locator('button', { hasText: 'Add to cart' });
    const totalProducts = await addButtons.count(); // Ahora sí va a devolver 6 de forma segura

    for (let i = 0; i < totalProducts; i++) {
      await addButtons.first().click();
    }

    const cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    await expect(cartBadge).toHaveText(totalProducts.toString());

    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');

    const cartItems = page.locator('[data-test="inventory-item"]');
    await expect(cartItems).toHaveCount(totalProducts);
  });

  test('Partial removal with multiple products correctly updates the badge and list', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();
    
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('3');

    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(3);

    await page.locator('[data-test="remove-sauce-labs-bike-light"]').click();

    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(2);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');
    
    await expect(page.locator('[data-test="inventory-item"]').filter({ hasText: 'Sauce Labs Backpack' })).toBeVisible();
    await expect(page.locator('[data-test="inventory-item"]').filter({ hasText: 'Sauce Labs Bolt T-Shirt' })).toBeVisible();
  });

  test('Removing a product from the cart updates the list and counter', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1'); // Espera estado antes de ir al carrito
    
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toBeHidden();
  });

  test('Product details in the cart match those in the catalog', async ({ page }) => {
    const firstItemName = page.locator('[data-test="inventory-item-name"]').first();
    const firstItemPrice = page.locator('[data-test="inventory-item-price"]').first();

    // FIX CLAVE: No extraer texto hasta que el elemento esté visible y estable en el DOM
    await firstItemName.waitFor({ state: 'visible' });
    const catalogName = await firstItemName.textContent();
    const catalogPrice = await firstItemPrice.textContent();
    
    await page.locator('button', { hasText: 'Add to cart' }).first().click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1'); // Asegurar estado

    await page.locator('[data-test="shopping-cart-link"]').click();

    await expect(page.locator('[data-test="inventory-item"]').locator('[data-test="inventory-item-name"]').first()).toHaveText(catalogName!);
    await expect(page.locator('[data-test="inventory-item"]').locator('[data-test="inventory-item-price"]').first()).toHaveText(catalogPrice!);  });

  test('The Checkout button correctly initiates the purchase flow', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-onesie"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toBeVisible(); // Asegurar estado

    await page.locator('[data-test="shopping-cart-link"]').click();

    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');
  });

  test('Removing the product from the catalog view updates the badge', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

    await expect(page.locator('[data-test="shopping-cart-badge"]')).toBeHidden();

    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);
  });

  test('Rapid state toggling (Quick Add/Remove toggle) in the catalog', async ({ page }) => {
    const addButton = page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]');
    const removeButton = page.locator('[data-test="remove-sauce-labs-bike-light"]');
    const badge = page.locator('[data-test="shopping-cart-badge"]');

    // FIX CLAVE: Esperar a que los botones hagan su transición de renderizado antes del siguiente click
    await addButton.click();
    await expect(removeButton).toBeVisible(); // Confirmar que el botón cambió a Remove
    
    await removeButton.click();
    await expect(addButton).toBeVisible(); // Confirmar que volvió a Add
    
    await addButton.click();

    await expect(badge).toHaveText('1');

    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);
  });

  test('Cart behavior after logging out and logging back in', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    await page.locator('#react-burger-menu-btn').click();

    // El menú lateral tiene una animación, Playwright debe esperar a que termine para interactuar
    await expect(page.locator('[data-test="logout-sidebar-link"]')).toBeVisible();

    await page.locator('[data-test="logout-sidebar-link"]').click();
    
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
    
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack');
  });
});