import { Page, Locator } from "@playwright/test";

export class CheckoutCompletePage {
  readonly page: Page;
  readonly successIcon: Locator;
  readonly headerMessage: Locator;
  readonly descriptionText: Locator;
  readonly backHomeButton: Locator;
  readonly pdfButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.successIcon = page.locator(".pony_express");
    this.headerMessage = page.locator('[data-test="complete-header"]');
    this.descriptionText = page.locator('[data-test="complete-text"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
    this.pdfButton = page.locator('button:has-text("Generate PDF order")');
  }

  async clickBackHome() {
    await this.backHomeButton.click();
  }

  async clickGeneratePDF() {
    const downloadPromise = this.page.waitForEvent("download");
    await this.pdfButton.click();
    return await downloadPromise;
  }
}
