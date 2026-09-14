import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { InventoryPage } from "../pages/InventoryPage";

test.describe("Sorting Module Tests - SauceDemo", () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login();

    // FIX CLAVE: Asegurar que el catálogo está completamente cargado antes de intentar ordenar
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
  });

  test("Validate alphabetical sorting from A to Z (az)", async () => {
    // First get the unsorted names, sort them in JS
    // We expect the array of text contents to eventually match the statically known sorted array
    await inventoryPage.sortProducts("az");
    await expect(inventoryPage.itemNames).toHaveText([
      "Sauce Labs Backpack",
      "Sauce Labs Bike Light",
      "Sauce Labs Bolt T-Shirt",
      "Sauce Labs Fleece Jacket",
      "Sauce Labs Onesie",
      "Test.allTheThings() T-Shirt (Red)",
    ]);
  });

  test("Validate alphabetical sorting from Z to A (za)", async () => {
    await inventoryPage.sortProducts("za");
    await expect(inventoryPage.itemNames).toHaveText([
      "Test.allTheThings() T-Shirt (Red)",
      "Sauce Labs Onesie",
      "Sauce Labs Fleece Jacket",
      "Sauce Labs Bolt T-Shirt",
      "Sauce Labs Bike Light",
      "Sauce Labs Backpack",
    ]);
  });

  test("Validate price sorting from low to high (lohi)", async () => {
    await inventoryPage.sortProducts("lohi");
    await expect(inventoryPage.itemPrices).toHaveText([
      "$7.99",
      "$9.99",
      "$15.99",
      "$15.99",
      "$29.99",
      "$49.99",
    ]);
  });

  test("Validate price sorting from high to low (hilo)", async () => {
    await inventoryPage.sortProducts("hilo");
    await expect(inventoryPage.itemPrices).toHaveText([
      "$49.99",
      "$29.99",
      "$15.99",
      "$15.99",
      "$9.99",
      "$7.99",
    ]);
  });
});
