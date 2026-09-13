import { Locator, Page } from "@playwright/test";

export class FooterComponent {
  readonly page: Page;
  readonly footer: Locator;
  readonly twitterLink: Locator;
  readonly facebookLink: Locator;
  readonly linkedInLink: Locator;
  readonly footerCopy: Locator;

  constructor(page: Page) {
    this.page = page;
    this.footer = page.locator('[data-test="footer"]');
    this.twitterLink = page.locator('[data-test="social-x"]');
    this.facebookLink = page.locator('[data-test="social-facebook"]');
    this.linkedInLink = page.locator('[data-test="social-linkedin"]');
    this.footerCopy = page.locator('[data-test="footer-copy"]');
  }
}
