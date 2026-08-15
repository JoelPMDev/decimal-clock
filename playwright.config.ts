import { defineConfig, devices } from '@playwright/test';

export default defineConfig({ testDir: './tests/e2e', use: { baseURL: 'http://localhost:4173', trace: 'on-first-retry' }, webServer: { command: 'npm run preview', url: 'http://localhost:4173', reuseExistingServer: true }, projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }] });