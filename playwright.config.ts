import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "npm run dev -- --port 3200",
    url: "http://127.0.0.1:3200",
    reuseExistingServer: false,
    // Hermetic test server: always demo mode, never real Supabase/Resend/admin credentials.
    env: { DEMO_MODE: "true", ADMIN_PASSWORD: "", NEXT_PUBLIC_SUPABASE_URL: "", SUPABASE_SERVICE_ROLE_KEY: "", RESEND_API_KEY: "" },
  },
  use: { baseURL: "http://127.0.0.1:3200", trace: "on-first-retry" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"], browserName: "chromium" } },
  ],
});
