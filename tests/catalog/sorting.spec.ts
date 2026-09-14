import { test, expect } from "@fixtures/baseTest";
import {
  NAMES_A_TO_Z,
  NAMES_Z_TO_A,
  PRICES_LOW_TO_HIGH,
  PRICES_HIGH_TO_LOW,
} from "@fixtures/testData";

/**
 * Auth-gated suite: session is injected via storageState (auth.setup.ts).
 */
test.describe("Sorting Module – Catalog Ordering", () => {
  test.beforeEach(async ({ page, inventoryPage }) => {
    await page.goto("/inventory.html");
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
  });

  test("Validate alphabetical sorting from A to Z (az)", async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortProducts("az");
    await expect(inventoryPage.itemNames).toHaveText(NAMES_A_TO_Z);
  });

  test("Validate alphabetical sorting from Z to A (za)", async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortProducts("za");
    await expect(inventoryPage.itemNames).toHaveText(NAMES_Z_TO_A);
  });

  test("Validate price sorting from low to high (lohi)", async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortProducts("lohi");
    await expect(inventoryPage.itemPrices).toHaveText(PRICES_LOW_TO_HIGH);
  });

  test("Validate price sorting from high to low (hilo)", async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortProducts("hilo");
    await expect(inventoryPage.itemPrices).toHaveText(PRICES_HIGH_TO_LOW);
  });
});
