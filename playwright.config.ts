import { defineConfig, devices } from '@playwright/test';

const previewHost = '127.0.0.1';
const previewPort = Number(process.env.PLAYWRIGHT_PORT ?? 4176);
const previewUrl = `http://${previewHost}:${previewPort}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  webServer: {
    command: `npm run preview -- --host ${previewHost} --port ${previewPort}`,
    url: previewUrl,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  use: {
    baseURL: previewUrl,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
      },
    },
  ],
});
