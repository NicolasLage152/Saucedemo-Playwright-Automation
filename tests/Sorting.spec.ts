import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';
test.describe('Pruebas del módulo de Ordenamiento (Sort) - SauceDemo', () => {


test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  await loginPage.login(); 
});
  test('Validar ordenamiento alfabético de la A a la Z (az)', async ({ page }) => {
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('az'); // Name (A to Z)

    const itemNames = await page.locator('[data-test="inventory-item-name"]').allTextContents();

    const sortedNames = [...itemNames].sort();

    expect(itemNames).toEqual(sortedNames);
  });

  test('Validar ordenamiento alfabético de la Z a la A (za)', async ({ page }) => {
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('za'); // Name (Z to A)

    const itemNames = await page.locator('[data-test="inventory-item-name"]').allTextContents();
    
    const sortedNames = [...itemNames].sort().reverse();

    expect(itemNames).toEqual(sortedNames);
  });

  test('Validar ordenamiento por precio de menor a mayor (lohi)', async ({ page }) => {
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('lohi'); 

    const priceTexts = await page.locator('[data-test="inventory-item-price"]').allTextContents();
    
    const prices = priceTexts.map(price => parseFloat(price.replace('$', '')));

    const sortedPrices = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(sortedPrices);
  });

  test('Validar ordenamiento por precio de mayor a menor (hilo)', async ({ page }) => {
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('hilo'); 

    const priceTexts = await page.locator('[data-test="inventory-item-price"]').allTextContents();
    
    const prices = priceTexts.map(price => parseFloat(price.replace('$', '')));

    const sortedPrices = [...prices].sort((a, b) => b - a);

    expect(prices).toEqual(sortedPrices);
  });

});