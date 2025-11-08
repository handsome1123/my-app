import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 5 * 60 * 1000,
  globalSetup: require.resolve('./tests/setup/global-setup.ts'),
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"], ["html", { outDir: "playwright-report" }]],
  use: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "node",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
