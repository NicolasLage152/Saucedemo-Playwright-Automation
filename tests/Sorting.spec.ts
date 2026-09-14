import { test, expect } from '@fixtures/baseTest';

/**
 * Auth-gated suite: session is injected via storageState (auth.setup.ts).
 */
test.describe('Sorting Module – Catalog Ordering', () => {
  test.beforeEach(async ({ page, inventoryPage }) => {
    await page.goto('/inventory.html');
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
  });

  test('Validate alphabetical sorting from A to Z (az)', async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortProducts('az');
    await expect(inventoryPage.itemNames).toHaveText([
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Onesie',
      'Test.allTheThings() T-Shirt (Red)',
    ]);
  });

  test('Validate alphabetical sorting from Z to A (za)', async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortProducts('za');
    await expect(inventoryPage.itemNames).toHaveText([
      'Test.allTheThings() T-Shirt (Red)',
      'Sauce Labs Onesie',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Bike Light',
      'Sauce Labs Backpack',
    ]);
  });

  test('Validate price sorting from low to high (lohi)', async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortProducts('lohi');
    await expect(inventoryPage.itemPrices).toHaveText([
      '$7.99',
      '$9.99',
      '$15.99',
      '$15.99',
      '$29.99',
      '$49.99',
    ]);
  });

  test('Validate price sorting from high to low (hilo)', async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortProducts('hilo');
    await expect(inventoryPage.itemPrices).toHaveText([
      '$49.99',
      '$29.99',
      '$15.99',
      '$15.99',
      '$9.99',
      '$7.99',
    ]);
  });
});
