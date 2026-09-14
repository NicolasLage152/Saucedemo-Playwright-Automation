import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { InventoryPage } from "../pages/InventoryPage";
import { CartPage } from "../pages/CartPage";
import { CheckoutStep1 } from "../pages/CheckoutStep1Page";
import { CheckoutOverviewPage } from "../pages/CheckoutOverviewPage";
import { CheckoutCompletePage } from "../pages/CheckoutCompletePage";

test.describe("Pruebas automatizadas E-commerce - Checkout Complete", () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutStep1: CheckoutStep1;
  let checkoutOverview: CheckoutOverviewPage;
  let checkoutCompletePage: CheckoutCompletePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutStep1 = new CheckoutStep1(page);
    checkoutOverview = new CheckoutOverviewPage(page);
    checkoutCompletePage = new CheckoutCompletePage(page);

    await loginPage.goto();
    await loginPage.login();

    // Preparación del estado a través de los POMs
    await inventoryPage.addProductToCart("Sauce Labs Backpack");
    await expect(inventoryPage.navbar.cartBadge).toHaveText("1");

    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);

    await cartPage.goToCheckout();
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);

    await checkoutStep1.fillInformationAndContinue(
      "Nicolas",
      "Tester",
      "11000",
    );
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);

    await checkoutOverview.finishOrder();
    await expect(page).toHaveURL(/.*checkout-complete\.html/);
  });

  test("Validate visibility of all information and visual elements", async () => {
    await expect(checkoutCompletePage.successIcon).toBeVisible();
    await expect(checkoutCompletePage.headerMessage).toHaveText(
      "Thank you for your order!",
    );
    await expect(checkoutCompletePage.descriptionText).toHaveText(
      "Your order has been dispatched, and will arrive just as fast as the pony can get there!",
    );
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();
    await expect(checkoutCompletePage.pdfButton).toBeVisible();
  });

  test("Validate Back Home button functionality", async ({ page }) => {
    await checkoutCompletePage.clickBackHome();
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test("Validate functionality and download of the Generate PDF order button", async () => {
    const download = await checkoutCompletePage.clickGeneratePDF();
    expect(download.suggestedFilename()).toContain(".pdf");
  });

  test("Edge Case - Direct access by pasting the URL directly", async ({
    browser,
  }) => {
    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();
    const cleanLoginPage = new LoginPage(newPage);

    await newPage.goto("/checkout-complete.html");

    // Validación unificada del redireccionamiento y error usando el POM de Login
    await expect(newPage).toHaveURL(/.*saucedemo\.com\//);
    await expect(cleanLoginPage.errorMessage).toBeVisible();
    await expect(cleanLoginPage.errorMessage).toContainText("Epic sadface");

    await newContext.close();
  });
});
