import { Locator, Page } from "@playwright/test";

export class NavbarComponent {
  readonly page: Page;
  readonly burgerMenuButton: Locator;
  readonly logoutSidebarLink: Locator;
  readonly allItemsSidebarLink: Locator;
  readonly aboutSidebarLink: Locator;
  readonly resetSidebarLink: Locator;
  readonly closeMenuButton: Locator;
  readonly menuWrap: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly appLogo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.burgerMenuButton = page.getByRole("button", { name: "Open Menu" });
    this.logoutSidebarLink = page.locator('[data-test="logout-sidebar-link"]');
    this.allItemsSidebarLink = page.locator(
      '[data-test="inventory-sidebar-link"]',
    );
    this.aboutSidebarLink = page.locator('[data-test="about-sidebar-link"]');
    this.resetSidebarLink = page.locator('[data-test="reset-sidebar-link"]');
    this.appLogo = page.locator(".app_logo");
    this.closeMenuButton = page.getByRole("button", { name: "Close Menu" });
    this.menuWrap = page.locator(".bm-menu-wrap");
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
  }

  async goToCart() {
    await this.cartLink.click();
  }

  async openMenu() {
    const isClosed =
      (await this.menuWrap.getAttribute("aria-hidden")) !== "false";
    if (isClosed) {
      await this.burgerMenuButton.click();
    }
    await this.logoutSidebarLink.waitFor({ state: "visible" });
  }

  async logout() {
    await this.openMenu();
    await this.logoutSidebarLink.click();
  }
}
