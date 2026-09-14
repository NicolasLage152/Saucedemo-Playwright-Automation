import { test as baseTest, BrowserContext } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { InventoryPage } from '@pages/InventoryPage';
import { CartPage } from '@pages/CartPage';
import { CheckoutStep1 } from '@pages/CheckoutStep1Page';
import { CheckoutOverviewPage } from '@pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '@pages/CheckoutCompletePage';
import { ProductDetailsPage } from '@pages/ProductDetailsPage';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _unused = BrowserContext; // imported to satisfy linter if needed

type CustomFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutStep1: CheckoutStep1;
  checkoutOverview: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
  pdp: ProductDetailsPage;
};

export const test = baseTest.extend<CustomFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutStep1: async ({ page }, use) => {
    await use(new CheckoutStep1(page));
  },
  checkoutOverview: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },
  pdp: async ({ page }, use) => {
    await use(new ProductDetailsPage(page));
  },
});

export { expect } from '@playwright/test';
