import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';

test.describe('Sorting Module Tests - SauceDemo', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(); 
    
    // FIX CLAVE: Asegurar que el catálogo está completamente cargado antes de intentar ordenar
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(6);
  });

  test('Validate alphabetical sorting from A to Z (az)', async ({ page }) => {
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('az'); 

    const itemNamesLocator = page.locator('[data-test="inventory-item-name"]');
    
    // FIX CLAVE: .allTextContents() NO tiene auto-espera. Obligamos a Playwright a confirmar 
    // que los 6 nombres existen en el DOM re-renderizado antes de hacer el barrido.
    await expect(itemNamesLocator).toHaveCount(6);
    const itemNames = await itemNamesLocator.allTextContents();

    const sortedNames = [...itemNames].sort();
    expect(itemNames).toEqual(sortedNames);
  });

  test('Validate alphabetical sorting from Z to A (za)', async ({ page }) => {
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('za'); 

    const itemNamesLocator = page.locator('[data-test="inventory-item-name"]');
    await expect(itemNamesLocator).toHaveCount(6); // Estabilizador de estado
    const itemNames = await itemNamesLocator.allTextContents();
    
    const sortedNames = [...itemNames].sort().reverse();
    expect(itemNames).toEqual(sortedNames);
  });

  test('Validate price sorting from low to high (lohi)', async ({ page }) => {
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('lohi'); 

    const priceLocator = page.locator('[data-test="inventory-item-price"]');
    await expect(priceLocator).toHaveCount(6); // Estabilizador de estado
    const priceTexts = await priceLocator.allTextContents();
    
    const prices = priceTexts.map(price => parseFloat(price.replace('$', '')));
    const sortedPrices = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(sortedPrices);
  });

  test('Validate price sorting from high to low (hilo)', async ({ page }) => {
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('hilo'); 

    const priceLocator = page.locator('[data-test="inventory-item-price"]');
    await expect(priceLocator).toHaveCount(6); // Estabilizador de estado
    const priceTexts = await priceLocator.allTextContents();
    
    const prices = priceTexts.map(price => parseFloat(price.replace('$', '')));
    const sortedPrices = [...prices].sort((a, b) => b - a);

    expect(prices).toEqual(sortedPrices);
  });
});