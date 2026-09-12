import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';
import { InventoryPage } from '../POMs/InventoryPage';

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
    await inventoryPage.sortProducts('az'); 

    // FIX CLAVE: .allTextContents() NO tiene auto-espera. Obligamos a Playwright a confirmar 
    // que los 6 nombres existen en el DOM re-renderizado antes de hacer el barrido.
    await expect(inventoryPage.itemNames).toHaveCount(6);
    const itemNames = await inventoryPage.itemNames.allTextContents();

    const sortedNames = [...itemNames].sort();
    expect(itemNames).toEqual(sortedNames);
  });

  test('Validate alphabetical sorting from Z to A (za)', async () => {
    await inventoryPage.sortProducts('za'); 

    await expect(inventoryPage.itemNames).toHaveCount(6); // Estabilizador de estado
    const itemNames = await inventoryPage.itemNames.allTextContents();
    
    const sortedNames = [...itemNames].sort().reverse();
    expect(itemNames).toEqual(sortedNames);
  });

  test('Validate price sorting from low to high (lohi)', async () => {
    await inventoryPage.sortProducts('lohi'); 

    await expect(inventoryPage.itemPrices).toHaveCount(6); // Estabilizador de estado
    const priceTexts = await inventoryPage.itemPrices.allTextContents();
    
    const prices = priceTexts.map(price => parseFloat(price.replace('$', '')));
    const sortedPrices = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(sortedPrices);
  });

  test('Validate price sorting from high to low (hilo)', async () => {
    await inventoryPage.sortProducts('hilo'); 

    await expect(inventoryPage.itemPrices).toHaveCount(6); // Estabilizador de estado
    const priceTexts = await inventoryPage.itemPrices.allTextContents();
    
    const prices = priceTexts.map(price => parseFloat(price.replace('$', '')));
    const sortedPrices = [...prices].sort((a, b) => b - a);

    expect(prices).toEqual(sortedPrices);
  });
});