import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Carga las variables desde el archivo .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
reporter: [['html', { open: 'never' }]],

  use: {
    // Definimos la URL base global
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry',

    // Evidencias visuales para el reporte HTML
    screenshot: 'only-on-failure', // Adjunta captura si falla un test
    video: 'retain-on-failure',     // Graba video si falla un test
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});