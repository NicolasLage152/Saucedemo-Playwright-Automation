import { Locator, Page } from '@playwright/test';

export class ProductDetailsPage {
  readonly page: Page;
  readonly container: Locator;
  readonly image: Locator;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backToProductsButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('.inventory_details_container');
    this.image = page.locator('img.inventory_details_img');
    this.name = page.locator('.inventory_details_name');
    this.description = page.locator('.inventory_details_desc');
    this.price = page.locator('.inventory_details_price');
    this.addToCartButton = page.locator('button', { hasText: 'Add to cart' });
    this.removeButton = page.locator('button', { hasText: 'Remove' });
    this.backToProductsButton = page.locator('[data-test="back-to-products"]');
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  async removeFromCart() {
    await this.removeButton.click();
  }

  async goBackToProducts() {
    await this.backToProductsButton.click();
  }
}