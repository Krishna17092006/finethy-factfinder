import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against a production build on port 3200 with their OWN
 * SQLite database (prisma/e2e.db), so real client data is never touched.
 * Run `npm run build` first, then `npm run test:e2e`.
 */
const PORT = 3200;
export const E2E_USER = "e2e-advisor";
export const E2E_PASS = "e2e-password-not-for-production";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [["list"]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /client-journey/ },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_URL: "file:./e2e.db",
      ADVISOR_USERNAME: E2E_USER,
      ADVISOR_PASSWORD: E2E_PASS,
      SESSION_SECRET: "e2e-session-secret-0123456789abcdef",
      APP_URL: `http://localhost:${PORT}`,
      SMTP_USER: "",
      SMTP_PASS: "",
    },
  },
});
