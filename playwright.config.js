const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tools/learning-kpi-dashboard/test/e2e',
  timeout: 60000,
  retries: 1,
  use: {
    baseURL: process.env.BASE_URL || 'https://opencodefirebase.web.app',
    headless: true,
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ],
});
