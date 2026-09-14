import { Locator, Page } from "@playwright/test";

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator(
      '[data-test="continue-shopping"]',
    );
  }

  async goToCheckout() {
    await this.checkoutButton.click();
  }

  async goBackToShopping() {
    await this.continueShoppingButton.click();
  }
}
