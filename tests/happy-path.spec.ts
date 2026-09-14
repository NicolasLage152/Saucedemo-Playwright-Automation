import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { InventoryPage } from "../pages/InventoryPage";
import { ProductDetailsPage } from "../pages/ProductDetailsPage";
import { CartPage } from "../pages/CartPage";
import { CheckoutStep1 } from "../pages/CheckoutStep1Page";
import { CheckoutOverviewPage } from "../pages/CheckoutOverviewPage";
import { CheckoutCompletePage } from "../pages/CheckoutCompletePage";

test.describe("Automated E-commerce Tests - SauceDemo", () => {
  let inventoryPage: InventoryPage;
  let pdp: ProductDetailsPage;
  let cartPage: CartPage;
  let checkoutStep1: CheckoutStep1;
  let checkoutOverview: CheckoutOverviewPage;
  let checkoutCompletePage: CheckoutCompletePage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    pdp = new ProductDetailsPage(page);
    cartPage = new CartPage(page);
    checkoutStep1 = new CheckoutStep1(page);
    checkoutOverview = new CheckoutOverviewPage(page);
    checkoutCompletePage = new CheckoutCompletePage(page);

    await loginPage.goto();
    await loginPage.login();
  });

  test("Verify that the product catalog renders correctly", async () => {
    await expect(inventoryPage.inventoryItems).toHaveCount(6);

    for (let i = 0; i < 6; i++) {
      const item = inventoryPage.inventoryItems.nth(i);
      await expect(item.locator("img.inventory_item_img")).toBeVisible();
      await expect(
        item.locator('[data-test="inventory-item-price"]'),
      ).toBeVisible();
      await expect(
        item.locator("button", { hasText: "Add to cart" }),
      ).toBeVisible();
    }
  });

  test("Validate product removal directly from the product detail view (PDP)", async ({
    page,
  }) => {
    const firstProduct = inventoryPage.inventoryItems
      .first()
      .locator(".inventory_item_name");
    await firstProduct.click();
    await expect(page).toHaveURL(/.*inventory-item\.html.*/);

    await expect(pdp.container).toBeVisible();
    await pdp.addToCart();

    await expect(pdp.removeButton).toBeVisible();
    await expect(inventoryPage.navbar.cartBadge).toHaveText("1");

    await pdp.removeFromCart();

    await expect(pdp.addToCartButton).toBeVisible();
    await expect(inventoryPage.navbar.cartBadge).toBeHidden();

    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(0);
  });

  test("Complete purchase flow with PDP navigation, Cart validations, and Tax calculation", async ({
    page,
  }) => {
    const product1 = "Sauce Labs Backpack";
    const product2 = "Sauce Labs Bike Light";

    // Producto 1 desde PDP
    await inventoryPage.openProductByName(product1);
    await expect(page).toHaveURL(/.*inventory-item\.html.*/);
    await expect(pdp.image).toBeVisible();
    await expect(pdp.name).toHaveText(product1);

    await pdp.addToCart();
    await expect(pdp.removeButton).toBeVisible();
    await expect(inventoryPage.navbar.cartBadge).toHaveText("1");

    await pdp.goBackToProducts();

    // Producto 2 desde el catálogo
    await inventoryPage.addProductToCart(product2);
    await expect(inventoryPage.navbar.cartBadge).toHaveText("2");

    // Carrito
    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(2);

    await cartPage.goToCheckout();

    // Checkout Step 1
    await checkoutStep1.fillInformationAndContinue(
      "Nicolas",
      "Tester",
      "11000",
    );
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);

    // Checkout Step 2 - Validaciones de precio
    await expect(checkoutOverview.itemPrices).toHaveCount(2);

    const calculatedSubtotal = await checkoutOverview.getCalculatedSubtotal();

    await expect(checkoutOverview.subtotalLabel).toBeVisible();
    const subtotalText = await checkoutOverview.subtotalLabel.innerText();
    const actualSubtotal = parseFloat(
      subtotalText.replace("Item total: $", ""),
    );
    expect(calculatedSubtotal).toBe(actualSubtotal);

    await expect(checkoutOverview.taxLabel).toBeVisible();
    const taxText = await checkoutOverview.taxLabel.innerText();
    const actualTax = parseFloat(taxText.replace("Tax: $", ""));

    const totalText = await checkoutOverview.totalLabel.innerText();
    const actualTotal = parseFloat(totalText.replace("Total: $", ""));

    expect(parseFloat((actualSubtotal + actualTax).toFixed(2))).toBe(
      actualTotal,
    );

    await checkoutOverview.finishOrder();
    await expect(checkoutCompletePage.headerMessage).toHaveText(
      "Thank you for your order!",
    );
  });
});
