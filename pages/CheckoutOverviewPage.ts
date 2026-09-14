import { Locator, Page } from "@playwright/test";

export class CheckoutOverviewPage {
  readonly page: Page;
  readonly inventoryItems: Locator;
  readonly itemPrices: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;
  readonly paymentInfoLabel: Locator;
  readonly paymentInfoValue: Locator;
  readonly shippingInfoLabel: Locator;
  readonly shippingInfoValue: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.paymentInfoLabel = page.locator('[data-test="payment-info-label"]');
    this.paymentInfoValue = page.locator('[data-test="payment-info-value"]');
    this.shippingInfoLabel = page.locator('[data-test="shipping-info-label"]');
    this.shippingInfoValue = page.locator('[data-test="shipping-info-value"]');
  }

  async getCalculatedSubtotal(): Promise<number> {
    const count = await this.itemPrices.count();
    let subtotal = 0;
    for (let i = 0; i < count; i++) {
      const priceText = await this.itemPrices.nth(i).innerText();
      subtotal += parseFloat(priceText.replace("$", ""));
    }
    return parseFloat(subtotal.toFixed(2));
  }

  async finishOrder() {
    await this.finishButton.click();
  }
}
