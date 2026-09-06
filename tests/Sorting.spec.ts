import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';
test.describe('Sorting Module Tests - SauceDemo', () => {


test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  await loginPage.login(); 
});
  test('Validate alphabetical sorting from A to Z (az)', async ({ page }) => {
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('az'); // Name (A to Z)

    const itemNames = await page.locator('[data-test="inventory-item-name"]').allTextContents();

    const sortedNames = [...itemNames].sort();

    expect(itemNames).toEqual(sortedNames);
  });

  test('Validate alphabetical sorting from Z to A (za)', async ({ page }) => {
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('za'); // Name (Z to A)

    const itemNames = await page.locator('[data-test="inventory-item-name"]').allTextContents();
    
    const sortedNames = [...itemNames].sort().reverse();

    expect(itemNames).toEqual(sortedNames);
  });

  test('Validate price sorting from low to high (lohi)', async ({ page }) => {
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('lohi'); 

    const priceTexts = await page.locator('[data-test="inventory-item-price"]').allTextContents();
    
    const prices = priceTexts.map(price => parseFloat(price.replace('$', '')));

    const sortedPrices = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(sortedPrices);
  });

  test('Validate price sorting from high to low (hilo)', async ({ page }) => {
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('hilo'); 

    const priceTexts = await page.locator('[data-test="inventory-item-price"]').allTextContents();
    
    const prices = priceTexts.map(price => parseFloat(price.replace('$', '')));

    const sortedPrices = [...prices].sort((a, b) => b - a);

    expect(prices).toEqual(sortedPrices);
  });

});