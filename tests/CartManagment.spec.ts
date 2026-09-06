import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';

test.describe('Pruebas dedicadas de gestión del Carrito - SauceDemo', () => {
test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  await loginPage.login(); 
});


  test('Verificar interfaz y estado inicial al ingresar a un carrito vacío', async ({ page }) => {
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');

    const cartItems = page.locator('[data-test="inventory-item"]');
    await expect(cartItems).toHaveCount(0);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toBeHidden();
    
    await expect(page.locator('[data-test="continue-shopping"]')).toBeVisible();
    await expect(page.locator('[data-test="checkout"]')).toBeVisible();
  });

  test('Validar el botón "Continue Shopping" retorna al catálogo manteniendo el estado', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');

    await page.locator('[data-test="continue-shopping"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('Verificar la persistencia de productos en el carrito tras recargar la página (F5)', async ({ page }) => {
    const product = 'Sauce Labs Bolt T-Shirt';
    
    const productItem = page.locator('[data-test="inventory-item"]').filter({ hasText: product });
    await productItem.locator('button', { hasText: 'Add to cart' }).click();

    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);

    await page.reload();

    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);
    await expect(page.locator('.inventory_item_name')).toHaveText(product);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('Verificar la adición masiva de todos los productos al carrito (6/6)', async ({ page }) => {
    const addButtons = page.locator('button', { hasText: 'Add to cart' });
    const totalProducts = await addButtons.count();

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
test('Eliminación parcial con múltiples productos actualiza correctamente el badge y la lista', async ({ page }) => {
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
test('Eliminar un producto desde el carrito actualiza la lista y el contador', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toBeHidden();
  });

  test('Los datos del producto en el carrito coinciden con los del catálogo', async ({ page }) => {
    const catalogName = await page.locator('[data-test="inventory-item-name"]').first().textContent();
    const catalogPrice = await page.locator('[data-test="inventory-item-price"]').first().textContent();
    
    await page.locator('button', { hasText: 'Add to cart' }).first().click();
    await page.locator('[data-test="shopping-cart-link"]').click();

    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText(catalogName!);
    await expect(page.locator('[data-test="inventory-item-price"]')).toHaveText(catalogPrice!);
  });

  test('El botón Checkout inicia correctamente el flujo de compra', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-onesie"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();

    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');
  });

 test('Eliminación del producto desde la vista de catálogo actualiza el badge', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

    await expect(page.locator('[data-test="shopping-cart-badge"]')).toBeHidden();

    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);
  });

  test('Alternancia rápida de estados (Toggle rápido Add/Remove) en el catálogo', async ({ page }) => {
    const addButton = page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]');
    const removeButton = page.locator('[data-test="remove-sauce-labs-bike-light"]');
    const badge = page.locator('[data-test="shopping-cart-badge"]');

    await addButton.click();
    await removeButton.click();
    await addButton.click();

    await expect(badge).toHaveText('1');

    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);
  });
test('Comportamiento del carrito tras cerrar e iniciar sesión nuevamente', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    await page.locator('#react-burger-menu-btn').click();
    await page.locator('[data-test="logout-sidebar-link"]').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/');

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
    
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack');
  });

  });