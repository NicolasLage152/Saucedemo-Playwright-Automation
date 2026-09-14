import { Locator, Page } from "@playwright/test";
import { NavbarComponent } from "./components/NavbarComponent";
import { FooterComponent } from "./components/FooterComponent";

export class InventoryPage {
  readonly page: Page;
  readonly navbar: NavbarComponent;
  readonly footer: FooterComponent;
  readonly inventoryItems: Locator;
  readonly sortDropdown: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly addButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navbar = new NavbarComponent(page);
    this.footer = new FooterComponent(page);
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
    this.addButtons = page.locator("button", { hasText: "Add to cart" });
  }

  async openProductByName(productName: string) {
    await this.page
      .locator(".inventory_item_name")
      .filter({ hasText: productName })
      .click();
  }

  async addProductToCart(productName: string) {
    const item = this.inventoryItems.filter({ hasText: productName });
    await item.locator("button", { hasText: "Add to cart" }).click();
  }

  async removeProductFromCatalog(productName: string) {
    const item = this.inventoryItems.filter({ hasText: productName });
    await item.locator("button", { hasText: "Remove" }).click();
  }

  async goToCart() {
    await this.navbar.goToCart();
  }

  async sortProducts(option: "az" | "za" | "lohi" | "hilo") {
    await this.sortDropdown.selectOption(option);
  }
}
