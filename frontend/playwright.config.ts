import { defineConfig, devices } from '@playwright/test';

const frontendServer = {
  command: 'npm start -- --port 4201',
  url: 'http://localhost:4201',
  reuseExistingServer: !process.env['CI'],
  timeout: 120_000,
};

const backendServer = {
  command: 'mvn --batch-mode --no-transfer-progress spring-boot:run',
  cwd: '../backend',
  url: 'http://localhost:8080/v3/api-docs',
  reuseExistingServer: !process.env['CI'],
  timeout: 180_000,
};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  workers: 1,
  reporter: process.env['CI']
    ? [['line'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4201',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [backendServer, frontendServer],
});
