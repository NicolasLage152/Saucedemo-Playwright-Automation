import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutStep1 } from '../pages/CheckoutStep1Page';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';

test.describe('Automated E-commerce Tests - Checkout Overview', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutStep1: CheckoutStep1;
  let checkoutOverview: CheckoutOverviewPage;
  let pdp: ProductDetailsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutStep1 = new CheckoutStep1(page);
    checkoutOverview = new CheckoutOverviewPage(page);
    pdp = new ProductDetailsPage(page);

    await loginPage.goto();
    await loginPage.login(); 

    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    // FIX CLAVE: Confirmar que el carrito recibió el item antes de navegar
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.goToCart();
    // FIX CLAVE: Esperar a que la página del carrito cargue
    await expect(page).toHaveURL(/.*cart\.html/); 

    await cartPage.goToCheckout();
    // FIX CLAVE: Esperar a que la vista de checkout cargue
    await expect(page).toHaveURL(/.*checkout-step-one\.html/); 
    
    await checkoutStep1.fillInformationAndContinue('Nicolas', 'Tester', '11000');
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
  });

  test('Validate redirection to the PDP from the product title and its visibility', async ({ page }) => {
    const firstCartItem = checkoutOverview.inventoryItems.first();
    const productTitleLocator = firstCartItem.locator('.inventory_item_name');
    
    // FIX CLAVE: Esperar a que el título sea visible ANTES de extraer su texto
    await expect(productTitleLocator).toBeVisible();
    const expectedProductName = await productTitleLocator.innerText();

    await expect(firstCartItem.locator('.inventory_item_desc')).toBeVisible();
    await expect(checkoutOverview.itemPrices.first()).toBeVisible();

    await productTitleLocator.click();

    await expect(page).toHaveURL(/.*inventory-item\.html.*/);
    await expect(pdp.name).toHaveText(expectedProductName);
    await expect(pdp.description).toBeVisible();
  });

  test('Validate static Payment and Shipping information', async () => {
    await expect(checkoutOverview.paymentInfoLabel).toHaveText('Payment Information:');
    await expect(checkoutOverview.paymentInfoValue).toHaveText('SauceCard #31337');
    
    await expect(checkoutOverview.shippingInfoLabel).toHaveText('Shipping Information:');
    await expect(checkoutOverview.shippingInfoValue).toHaveText('Free Pony Express Delivery!');
  });

  test('Validate the Cancel button flow returns to the catalog while preserving the cart', async ({ page }) => {
    await checkoutOverview.cancelButton.click();
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('Validate the Finish button flow successfully completes the purchase', async ({ page }) => {
    await checkoutOverview.finishOrder();
    await expect(page).toHaveURL(/.*checkout-complete\.html/);
    await expect(checkoutOverview.completeHeader).toHaveText('Thank you for your order!');
    await expect(checkoutOverview.backToProductsButton).toBeVisible();
  });

  test('Edge Case - Validate dynamic mathematical calculation with multiple products', async ({ page }) => {
    await checkoutOverview.cancelButton.click();
    await expect(page).toHaveURL(/.*inventory\.html/); // FIX: Estabilizar transición

    await inventoryPage.addProductToCart('Sauce Labs Bike Light');
    await inventoryPage.addProductToCart('Sauce Labs Bolt T-Shirt');
    await expect(inventoryPage.cartBadge).toHaveText('3'); // FIX: Confirmar renderizado del badge
    
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/); // FIX: Estabilizar transición

    await cartPage.goToCheckout();
    await expect(page).toHaveURL(/.*checkout-step-one\.html/); // FIX

    await checkoutStep1.fillInformationAndContinue('Nicolas', 'Tester', '11000');
    await expect(page).toHaveURL(/.*checkout-step-two\.html/); // FIX

    // FIX CLAVE: toHaveCount obliga a esperar que los 3 elementos existan.
    await expect(checkoutOverview.itemPrices).toHaveCount(3);
    
    const calculatedSubtotal = await checkoutOverview.getCalculatedSubtotal();

    await expect(checkoutOverview.subtotalLabel).toBeVisible(); // FIX CLAVE: Asegurar existencia en DOM
    const subtotalText = await checkoutOverview.subtotalLabel.innerText();
    const actualSubtotal = parseFloat(subtotalText.replace('Item total: $', ''));
    expect(calculatedSubtotal).toBe(actualSubtotal);

    const taxText = await checkoutOverview.taxLabel.innerText();
    const actualTax = parseFloat(taxText.replace('Tax: $', ''));

    const totalText = await checkoutOverview.totalLabel.innerText();
    const actualTotal = parseFloat(totalText.replace('Total: $', ''));

    const calculatedTotal = parseFloat((actualSubtotal + actualTax).toFixed(2));
    expect(calculatedTotal).toBe(actualTotal);
  });

  test('Edge Case - Allow checkout with an empty cart (Platform behavior)', async ({ page }) => {
    await checkoutOverview.cancelButton.click();
    await expect(page).toHaveURL(/.*inventory\.html/); // FIX

    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/); // FIX

    // Reutilizamos el filtro para remover el item
    const itemToRemove = cartPage.cartItems.filter({ hasText: 'Sauce Labs Backpack' });
    await itemToRemove.locator('button', { hasText: 'Remove' }).click();
    await expect(inventoryPage.cartBadge).toBeHidden(); // FIX: Confirmar acción de vaciado

    await cartPage.goToCheckout();
    await expect(page).toHaveURL(/.*checkout-step-one\.html/); // FIX

    await checkoutStep1.fillInformationAndContinue('Nicolas', 'Tester', '11000');  
    await expect(page).toHaveURL(/.*checkout-step-two\.html/); // FIX

    await expect(checkoutOverview.subtotalLabel).toHaveText('Item total: $0');
    await expect(checkoutOverview.taxLabel).toHaveText('Tax: $0.00');
    await expect(checkoutOverview.totalLabel).toHaveText('Total: $0.00');

    await checkoutOverview.finishOrder();
    await expect(page).toHaveURL(/.*checkout-complete\.html/);
  });

  test('Edge Case - URL Injection: Attempting to access Step Two without completing Step One', async ({ browser }) => {
    const cleanContext = await browser.newContext();
    const cleanPage = await cleanContext.newPage();
    const cleanLoginPage = new LoginPage(cleanPage);

    await cleanPage.goto('/checkout-step-two.html');

    // El framework redirecciona a la raíz si no hay sesión
    await expect(cleanPage).toHaveURL(/.*saucedemo\.com\//);
    
    // Aprovechamos el POM de LoginPage para validar el error
    await expect(cleanLoginPage.errorMessage).toBeVisible();
    await expect(cleanLoginPage.errorMessage).toContainText("Epic sadface: You can only access '/checkout-step-two.html' when you are logged in.");

    await cleanContext.close();
  });
});