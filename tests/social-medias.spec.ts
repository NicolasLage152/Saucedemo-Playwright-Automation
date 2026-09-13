import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { InventoryPage } from "../pages/InventoryPage";

test.describe("Footer and Social Media Tests - SauceDemo", () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login();

    // FIX CLAVE: Confirmar que el login terminó y el catálogo principal cargó antes de ir al footer
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test("Validate social media links and copyright text in the footer", async () => {
    await inventoryPage.footer.footer.scrollIntoViewIfNeeded();
    await expect(inventoryPage.footer.footer).toBeVisible();

    await expect(inventoryPage.footer.twitterLink).toBeVisible();
    await expect(inventoryPage.footer.twitterLink).toHaveAttribute(
      "href",
      "https://x.com/saucelabs",
    );

    await expect(inventoryPage.footer.facebookLink).toBeVisible();
    await expect(inventoryPage.footer.facebookLink).toHaveAttribute(
      "href",
      "https://www.facebook.com/saucelabs",
    );

    await expect(inventoryPage.footer.linkedInLink).toBeVisible();
    await expect(inventoryPage.footer.linkedInLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/company/sauce-labs/",
    );

    await expect(inventoryPage.footer.footerCopy).toBeVisible();
    await expect(inventoryPage.footer.footerCopy).toContainText(
      "Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy",
    );
  });
});
