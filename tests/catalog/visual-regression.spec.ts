import { test, expect } from "@fixtures/baseTest";

/**
 * Visual Regression suite – Catalog UI snapshots.
 *
 * Uses Playwright's built-in `toHaveScreenshot()` for pixel-level comparison.
 * Snapshots are stored in tests/catalog/__snapshots__/ and committed to VCS so
 * CI can detect unintended layout regressions across browsers.
 *
 * To regenerate golden baselines run:
 *   npx playwright test visual-regression --update-snapshots
 */
test.describe("Visual Regression – Catalog & Product Card Layout", () => {
  // Skip visual regression in CI due to OS-level font rendering and anti-aliasing differences
  test.skip(
    !!process.env.CI,
    "Visual regression tests are OS-dependent and should be run locally or via Docker",
  );

  test.beforeEach(async ({ page }) => {
    await page.goto("/inventory.html");
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test("Catalog page layout matches baseline snapshot", async ({ page }) => {
    // Wait for all product cards to be visible before snapshotting
    await page.locator(".inventory_item").first().waitFor({ state: "visible" });
    await page.locator(".inventory_item").last().waitFor({ state: "visible" });

    await expect(page).toHaveScreenshot("catalog-full-page.png", {
      fullPage: true,
      // Mask dynamic elements that could cause false positives
      mask: [page.locator(".shopping_cart_badge")],
      maxDiffPixelRatio: 0.02, // Allow 2% pixel diff tolerance for anti-aliasing
    });
  });

  test("Individual product card layout matches baseline snapshot", async ({
    inventoryPage,
  }) => {
    const firstCard = inventoryPage.inventoryItems.first();
    await firstCard.waitFor({ state: "visible" });

    await expect(firstCard).toHaveScreenshot("product-card-default.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("Product card layout updates correctly after adding to cart", async ({
    page,
    inventoryPage,
  }) => {
    const firstCard = inventoryPage.inventoryItems.first();
    const addButton = firstCard.locator("button", { hasText: "Add to cart" });

    await addButton.click();
    // Web-first assertion guards the snapshot — button must become "Remove" first
    await expect(
      firstCard.locator("button", { hasText: "Remove" }),
    ).toBeVisible();

    await expect(firstCard).toHaveScreenshot("product-card-in-cart.png", {
      maxDiffPixelRatio: 0.02,
    });

    await expect(inventoryPage.navbar.cartBadge).toHaveText("1");
    await expect(page.locator(".shopping_cart_badge")).toHaveScreenshot(
      "cart-badge-count-1.png",
      { maxDiffPixelRatio: 0.02 },
    );
  });
});
