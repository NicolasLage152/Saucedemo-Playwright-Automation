import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const STORAGE_STATE = path.join(__dirname, '.auth', 'storageState.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],

  use: {
    baseURL: process.env.TEST_ENV ?? 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // ── Setup project: runs once, captures session ─────────────────────────
    {
      name: 'setup',
      testMatch: /.*auth\/auth\.setup\.ts/,
    },

    // ── Browser projects: depend on setup, reuse storageState ──────────────
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
      testIgnore: /.*auth\/auth\.setup\.ts/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
      testIgnore: /.*auth\/auth\.setup\.ts/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
      testIgnore: /.*auth\/auth\.setup\.ts/,
    },
  ],
});
