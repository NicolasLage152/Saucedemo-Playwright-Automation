import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Sorting Module Tests - SauceDemo', () => {
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

  test('Validate alphabetical sorting from A to Z (az)', async () => {
    // First get the unsorted names, sort them in JS
    const initialNames = await inventoryPage.itemNames.allTextContents();
    const expectedSortedNames = [...initialNames].sort();

    // Trigger the sort action
    await inventoryPage.sortProducts('az'); 

    // Use Web-First assertion to retry until the DOM matches the sorted array
    await expect(inventoryPage.itemNames).toHaveText(expectedSortedNames);
  });

  test('Validate alphabetical sorting from Z to A (za)', async () => {
    const initialNames = await inventoryPage.itemNames.allTextContents();
    const expectedSortedNames = [...initialNames].sort().reverse();

    await inventoryPage.sortProducts('za'); 

    await expect(inventoryPage.itemNames).toHaveText(expectedSortedNames);
  });

  test('Validate price sorting from low to high (lohi)', async () => {
    const initialPriceTexts = await inventoryPage.itemPrices.allTextContents();
    
    // Sort the original strings based on their numerical value
    const expectedSortedTexts = [...initialPriceTexts].sort((a, b) => {
      const priceA = parseFloat(a.replace('$', ''));
      const priceB = parseFloat(b.replace('$', ''));
      return priceA - priceB;
    });

    await inventoryPage.sortProducts('lohi'); 

    await expect(inventoryPage.itemPrices).toHaveText(expectedSortedTexts);
  });

  test('Validate price sorting from high to low (hilo)', async () => {
    const initialPriceTexts = await inventoryPage.itemPrices.allTextContents();
    
    // Sort the original strings based on their numerical value (descending)
    const expectedSortedTexts = [...initialPriceTexts].sort((a, b) => {
      const priceA = parseFloat(a.replace('$', ''));
      const priceB = parseFloat(b.replace('$', ''));
      return priceB - priceA;
    });

    await inventoryPage.sortProducts('hilo'); 

    await expect(inventoryPage.itemPrices).toHaveText(expectedSortedTexts);
  });
});