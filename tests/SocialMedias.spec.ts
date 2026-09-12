import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';

test.describe('Footer and Social Media Tests - SauceDemo', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    await loginPage.login(); 
    
    // FIX CLAVE: Confirmar que el login terminó y el catálogo principal cargó antes de ir al footer
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  });

  test('Validate social media links and copyright text in the footer', async ({ page }) => {
    const footer = page.locator('[data-test="footer"]');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();

    const twitterLink = page.locator('[data-test="social-x"]');
    await expect(twitterLink).toBeVisible();
    await expect(twitterLink).toHaveAttribute('href', 'https://x.com/saucelabs');

    const facebookLink = page.locator('[data-test="social-facebook"]');
    await expect(facebookLink).toBeVisible();
    await expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/saucelabs');

    const linkedInLink = page.locator('[data-test="social-linkedin"]');
    await expect(linkedInLink).toBeVisible();
    await expect(linkedInLink).toHaveAttribute('href', 'https://www.linkedin.com/company/sauce-labs/');

    const footerCopy = page.locator('[data-test="footer-copy"]');
    await expect(footerCopy).toBeVisible();
    await expect(footerCopy).toContainText('Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy');
  });
});