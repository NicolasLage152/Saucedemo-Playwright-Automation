import { test, expect } from "@fixtures/baseTest";

/**
 * Auth-gated suite: session is injected via storageState (auth.setup.ts).
 */
test.describe("Footer & Social Media Links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/inventory.html");
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test("Validate social media links and copyright text in the footer", async ({
    inventoryPage,
  }) => {
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
