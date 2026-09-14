import { test, expect } from "@fixtures/baseTest";
import { DEFAULT_CUSTOMER, PRODUCTS } from "@fixtures/testData";
import { LoginPage } from "@pages/LoginPage";

/**
 * Auth-gated suite: session is injected via storageState (auth.setup.ts).
 */
test.describe("Checkout Complete – Order Confirmation", () => {
  test.beforeEach(
    async ({
      page,
      inventoryPage,
      cartPage,
      checkoutStep1,
      checkoutOverview,
    }) => {
      await page.goto("/inventory.html");
      await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
      await expect(inventoryPage.navbar.cartBadge).toHaveText("1");

      await inventoryPage.goToCart();
      await expect(page).toHaveURL(/.*cart\.html/);

      await cartPage.goToCheckout();
      await expect(page).toHaveURL(/.*checkout-step-one\.html/);

      await checkoutStep1.fillInformationAndContinue(
        DEFAULT_CUSTOMER.firstName,
        DEFAULT_CUSTOMER.lastName,
        DEFAULT_CUSTOMER.postalCode,
      );
      await expect(page).toHaveURL(/.*checkout-step-two\.html/);

      await checkoutOverview.finishOrder();
      await expect(page).toHaveURL(/.*checkout-complete\.html/);
    },
  );

  test("Validate visibility of all information and visual elements", async ({
    checkoutCompletePage,
  }) => {
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

  test("Validate Back Home button functionality", async ({
    page,
    checkoutCompletePage,
  }) => {
    await checkoutCompletePage.clickBackHome();
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test("Validate functionality and download of the Generate PDF order button", async ({
    checkoutCompletePage,
  }) => {
    const download = await checkoutCompletePage.clickGeneratePDF();
    expect(download.suggestedFilename()).toContain(".pdf");
  });

  test("Edge Case – Direct URL access without a valid session is rejected", async ({
    browser,
  }) => {
    // Fresh context — no storageState — simulates an unauthenticated user.
    const newContext = await browser.newContext({ storageState: undefined });
    const newPage = await newContext.newPage();
    const cleanLoginPage = new LoginPage(newPage);

    await newPage.goto("/checkout-complete.html");

    await expect(newPage).toHaveURL(/.*saucedemo\.com\//);
    await expect(cleanLoginPage.errorMessage).toBeVisible();
    await expect(cleanLoginPage.errorMessage).toContainText("Epic sadface");

    await newContext.close();
  });
});
