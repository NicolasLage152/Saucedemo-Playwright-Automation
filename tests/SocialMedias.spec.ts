import { test, expect } from '@playwright/test';
import { LoginPage } from '../POMs/Login';

test.describe('Pruebas del Footer y Redes Sociales - SauceDemo', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    // Magia: una sola línea, sin variables raras.
    await loginPage.login(); 
  });

  test('Validar enlaces de redes sociales y texto de copyright en el footer', async ({ page }) => {
    const twitterLink = page.locator('.social_twitter a');
    await expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/saucelabs');

    const facebookLink = page.locator('.social_facebook a');
    await expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/saucelabs');

    const linkedInLink = page.locator('.social_linkedin a');
    await expect(linkedInLink).toHaveAttribute('href', 'https://www.linkedin.com/company/sauce-labs/');

    const footerCopy = page.locator('.footer_copy');
    await expect(footerCopy).toBeVisible();
    await expect(footerCopy).toHaveText('© 2026 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy');
  });
});