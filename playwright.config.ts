import { defineConfig, devices } from "@playwright/test";

/** E2E tests run against the local dev server + the real dev database
 * (there's no disposable test DB yet — every test that mutates data must
 * clean up after itself). See e2e/README.md. */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
