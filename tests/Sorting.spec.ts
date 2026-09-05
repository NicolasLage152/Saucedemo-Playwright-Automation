import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';
test.describe('Pruebas del módulo de Ordenamiento (Sort) - SauceDemo', () => {


test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  // Magia: una sola línea, sin variables raras.
  await loginPage.login(); 
});
  test('Validar ordenamiento alfabético de la A a la Z (az)', async ({ page }) => {
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('az'); // Name (A to Z)

    // Extraer todos los nombres de los productos visibles
    const itemNames = await page.locator('[data-test="inventory-item-name"]').allTextContents();

    // Crear una copia ordenada de forma ascendente para comparar
    const sortedNames = [...itemNames].sort();

    // Validar que el orden en la UI coincida con el orden alfabético real
    expect(itemNames).toEqual(sortedNames);
  });

  test('Validar ordenamiento alfabético de la Z a la A (za)', async ({ page }) => {
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('za'); // Name (Z to A)

    const itemNames = await page.locator('[data-test="inventory-item-name"]').allTextContents();
    
    // Crear copia y ordenar de Z a A
    const sortedNames = [...itemNames].sort().reverse();

    expect(itemNames).toEqual(sortedNames);
  });

  test('Validar ordenamiento por precio de menor a mayor (lohi)', async ({ page }) => {
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('lohi'); // Price (low to high)

    const priceTexts = await page.locator('[data-test="inventory-item-price"]').allTextContents();
    
    // Limpiar el símbolo de dólar ($) y convertir los textos a números flotantes
    const prices = priceTexts.map(price => parseFloat(price.replace('$', '')));

    // Crear una copia ordenada de menor a mayor numéricamente
    const sortedPrices = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(sortedPrices);
  });

  test('Validar ordenamiento por precio de mayor a menor (hilo)', async ({ page }) => {
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.selectOption('hilo'); // Price (high to low)

    const priceTexts = await page.locator('[data-test="inventory-item-price"]').allTextContents();
    
    const prices = priceTexts.map(price => parseFloat(price.replace('$', '')));

    // Crear una copia ordenada de mayor a menor numéricamente
    const sortedPrices = [...prices].sort((a, b) => b - a);

    expect(prices).toEqual(sortedPrices);
  });

});