import { test as setup } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import path from 'path';

// Path resolves to <project-root>/.auth/storageState.json
export const STORAGE_STATE = path.join(__dirname, '..', '..', '.auth', 'storageState.json');

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login();
  await page.waitForURL(/.*inventory\.html/);
  await page.context().storageState({ path: STORAGE_STATE });
});
