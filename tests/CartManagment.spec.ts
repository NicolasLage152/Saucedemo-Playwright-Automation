import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';
import { InventoryPage } from '../POMs/InventoryPage';
import { CartPage } from '../POMs/CartPage';

test.describe('Cart Management Tests - SauceDemo', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);

    await loginPage.goto();
    await loginPage.login(); 
  });

  test('Verify interface and initial state when entering an empty cart', async ({ page }) => {
    await inventoryPage.goToCart();
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');

    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(inventoryPage.cartBadge).toBeHidden();
    
    await expect(cartPage.continueShoppingButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeVisible();
  });

  test('Validate the "Continue Shopping" button returns to the catalog while maintaining the state', async ({ page }) => {
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    
    // Esperamos a que el badge se actualice ANTES de cambiar de página para evitar race conditions
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.goToCart();
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');

    await cartPage.goBackToShopping();
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('Verify product persistence in the cart after reloading the page (F5)', async ({ page }) => {
    const product = 'Sauce Labs Bolt T-Shirt';
    
    // Esperamos explícitamente que los items del catálogo carguen antes de interactuar
    await expect(inventoryPage.inventoryItems).not.toHaveCount(0);
    
    await inventoryPage.addProductToCart(product);

    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(1);

    await page.reload();

    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.cartItems.locator('.inventory_item_name')).toHaveText(product);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('Verify the bulk addition of all products to the cart (6/6)', async ({ page }) => {
    // FIX CLAVE: Playwright no debe contar hasta asegurarse que el catálogo cargó por completo
    await expect(inventoryPage.inventoryItems).toHaveCount(6); // Forzamos la espera inteligente

    const addButtons = page.locator('button', { hasText: 'Add to cart' });
    const totalProducts = await addButtons.count(); // Ahora sí va a devolver 6 de forma segura

    for (let i = 0; i < totalProducts; i++) {
      await addButtons.first().click();
    }

    await expect(inventoryPage.cartBadge).toHaveText(totalProducts.toString());

    await inventoryPage.goToCart();
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');

    await expect(cartPage.cartItems).toHaveCount(totalProducts);
  });

  test('Partial removal with multiple products correctly updates the badge and list', async () => {
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.addProductToCart('Sauce Labs Bike Light');
    await inventoryPage.addProductToCart('Sauce Labs Bolt T-Shirt');
    
    await expect(inventoryPage.cartBadge).toHaveText('3');

    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(3);

    // Removemos desde el carrito filtrando por el producto
    const itemToRemove = cartPage.cartItems.filter({ hasText: 'Sauce Labs Bike Light' });
    await itemToRemove.locator('button', { hasText: 'Remove' }).click();

    await expect(cartPage.cartItems).toHaveCount(2);
    await expect(inventoryPage.cartBadge).toHaveText('2');
    
    await expect(cartPage.cartItems.filter({ hasText: 'Sauce Labs Backpack' })).toBeVisible();
    await expect(cartPage.cartItems.filter({ hasText: 'Sauce Labs Bolt T-Shirt' })).toBeVisible();
  });

  test('Removing a product from the cart updates the list and counter', async () => {
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    
    await expect(inventoryPage.cartBadge).toHaveText('1'); // Espera estado antes de ir al carrito
    
    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    const itemToRemove = cartPage.cartItems.filter({ hasText: 'Sauce Labs Backpack' });
    await itemToRemove.locator('button', { hasText: 'Remove' }).click();

    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  test('Product details in the cart match those in the catalog', async ({ page }) => {
    const firstCatalogItem = inventoryPage.inventoryItems.first();
    const firstItemName = firstCatalogItem.locator('[data-test="inventory-item-name"]');
    const firstItemPrice = firstCatalogItem.locator('[data-test="inventory-item-price"]');

    // FIX CLAVE: No extraer texto hasta que el elemento esté visible y estable en el DOM
    await firstItemName.waitFor({ state: 'visible' });
    const catalogName = await firstItemName.textContent();
    const catalogPrice = await firstItemPrice.textContent();
    
    await firstCatalogItem.locator('button', { hasText: 'Add to cart' }).click();
    await expect(inventoryPage.cartBadge).toHaveText('1'); // Asegurar estado

    await inventoryPage.goToCart();

    const firstCartItem = cartPage.cartItems.first();
    await expect(firstCartItem.locator('[data-test="inventory-item-name"]')).toHaveText(catalogName!);
    await expect(firstCartItem.locator('[data-test="inventory-item-price"]')).toHaveText(catalogPrice!);  
  });

  test('The Checkout button correctly initiates the purchase flow', async ({ page }) => {
    await inventoryPage.addProductToCart('Sauce Labs Onesie');
    await expect(inventoryPage.cartBadge).toBeVisible(); // Asegurar estado

    await inventoryPage.goToCart();

    await cartPage.goToCheckout();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');
  });

  test('Removing the product from the catalog view updates the badge', async () => {
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.removeProductFromCatalog('Sauce Labs Backpack');

    await expect(inventoryPage.cartBadge).toBeHidden();

    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(0);
  });

  test('Rapid state toggling (Quick Add/Remove toggle) in the catalog', async () => {
    const item = inventoryPage.inventoryItems.filter({ hasText: 'Sauce Labs Bike Light' });
    const addButton = item.locator('button', { hasText: 'Add to cart' });
    const removeButton = item.locator('button', { hasText: 'Remove' });

    await addButton.click();
    await expect(removeButton).toBeVisible(); 
    
    await removeButton.click();
    await expect(addButton).toBeVisible(); 
    
    await addButton.click();

    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(1);
  });

  test('Cart behavior after logging out and logging back in', async () => {
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.logout();
    
    await loginPage.login('standard_user', 'secret_sauce');

    await expect(inventoryPage.cartBadge).toHaveText('1');
    
    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.cartItems.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');
  });
});