import { defineConfig, devices } from "@playwright/test";
import path from "path";

/**
 * Playwright Configuration for Fynvi Share Product Demo Screenshots & Video Generation
 *
 * Deterministic Viewports:
 * - Desktop: 1440 × 900 @2x scale factor (Retina High-DPI)
 * - Mobile: 390 × 844 @2x scale factor (iPhone 14/15 size)
 * - Themes: Dark & Light
 * - Video: 1440 × 900 @60fps interactive walkthrough
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // Ensure predictable sequence and avoid port collisions
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // Single worker prevents Next.js dev server overload during screenshot rendering
  reporter: [["list"]],
  outputDir: "./e2e/test-results",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "off",
    video: "off",
    screenshot: "off",
    locale: "en-US",
    timezoneId: "UTC",
  },
  projects: [
    {
      name: "desktop-dark",
      testMatch: /.*product-demo\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
        colorScheme: "dark",
      },
    },
    {
      name: "desktop-light",
      testMatch: /.*product-demo\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
        colorScheme: "light",
      },
    },
    {
      name: "mobile-dark",
      testMatch: /.*product-demo\.spec\.ts/,
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        colorScheme: "dark",
      },
    },
    {
      name: "mobile-light",
      testMatch: /.*product-demo\.spec\.ts/,
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        colorScheme: "light",
      },
    },
    {
      name: "video",
      testMatch: /.*product-demo-video\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
        colorScheme: "dark",
        video: {
          mode: "on",
          size: { width: 1440, height: 900 },
        },
      },
    },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120 * 1000,
    cwd: path.resolve(__dirname),
  },
});
