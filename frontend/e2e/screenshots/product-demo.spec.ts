import { expect, test } from "@playwright/test";
import {
  captureScreenshot,
  injectAuthSession,
  setupMockRoutes,
  stabilizePage,
} from "../helpers/screenshot.helper";

test.describe("Product Demo Screenshots", () => {
  test.beforeEach(async ({ context, page }, testInfo) => {
    const isDark = testInfo.project.name.includes("dark");
    await injectAuthSession(context, {
      authenticated: true,
      isAdmin: true,
      colorScheme: isDark ? "dark" : "light",
    });
  });

  test("01-landing: Public Landing Page", async ({ context, page }, testInfo) => {
    const isDark = testInfo.project.name.includes("dark");
    const isMobile = testInfo.project.name.includes("mobile");
    const variant = isMobile ? "mobile" : "desktop";
    const theme = isDark ? "dark" : "light";

    // Configure as unauthenticated guest
    await injectAuthSession(context, {
      authenticated: false,
      colorScheme: theme,
    });
    await setupMockRoutes(page, {
      authenticated: false,
    });

    await page.goto("/", { waitUntil: "networkidle" });
    await stabilizePage(page);

    // Verify hero and features are rendered
    await expect(page.locator("h1")).toBeVisible();

    await captureScreenshot(page, {
      name: "01-landing",
      variant,
      theme,
      fullPage: false,
    });
  });

  test("02-dashboard: Authenticated User Dashboard", async ({ page }, testInfo) => {
    const isDark = testInfo.project.name.includes("dark");
    const isMobile = testInfo.project.name.includes("mobile");
    const variant = isMobile ? "mobile" : "desktop";
    const theme = isDark ? "dark" : "light";

    await setupMockRoutes(page, {
      authenticated: true,
      isAdmin: true,
    });

    await page.goto("/", { waitUntil: "networkidle" });
    await stabilizePage(page);

    // Verify dashboard welcome and metrics
    await expect(page.getByText("Welcome back, Alex Rivera")).toBeVisible();
    await expect(page.getByText("Cinematic Production Assets 2026")).toBeVisible();

    await captureScreenshot(page, {
      name: "02-dashboard",
      variant,
      theme,
      fullPage: false,
    });
  });

  test("03-upload: File Upload & Queue State", async ({ page }, testInfo) => {
    const isDark = testInfo.project.name.includes("dark");
    const isMobile = testInfo.project.name.includes("mobile");
    const variant = isMobile ? "mobile" : "desktop";
    const theme = isDark ? "dark" : "light";

    await setupMockRoutes(page, {
      authenticated: true,
      isAdmin: true,
    });

    await page.goto("/upload", { waitUntil: "networkidle" });

    // Upload realistic mock files into the dropzone
    const fileInput = page.locator("input[type=\"file\"]").first();
    await fileInput.setInputFiles([
      {
        name: "4K_Cinematic_Showreel.mp4",
        mimeType: "video/mp4",
        buffer: Buffer.from("video_sample_stream_demo_buffer_data"),
      },
      {
        name: "Brand_Guidelines_2026.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("pdf_sample_stream_demo_buffer_data"),
      },
      {
        name: "Ambient_Soundtrack_Lossless.flac",
        mimeType: "audio/flac",
        buffer: Buffer.from("audio_sample_stream_demo_buffer_data"),
      },
      {
        name: "Source_Release_v2.0.tar.gz",
        mimeType: "application/gzip",
        buffer: Buffer.from("archive_sample_stream_demo_buffer_data"),
      },
    ]);

    // Enhance queue state with simulated upload progress and live speed metrics
    await page.evaluate(() => {
      // Find rendered upload items and apply demo progress details
      const items = document.querySelectorAll(".mantine-Progress-root");
      if (items.length > 0) {
        // First item (video): in progress with speed and eta
        const speedText = document.createElement("span");
        speedText.innerText = "45.2 MB/s • ~8s remaining";
      }
    });

    await stabilizePage(page);

    await expect(page.getByText("4K_Cinematic_Showreel.mp4")).toBeVisible();

    await captureScreenshot(page, {
      name: "03-upload",
      variant,
      theme,
      fullPage: false,
    });
  });

  test("04-share-view: Share Showcase with Video Sample", async ({ page }, testInfo) => {
    const isDark = testInfo.project.name.includes("dark");
    const isMobile = testInfo.project.name.includes("mobile");
    const variant = isMobile ? "mobile" : "desktop";
    const theme = isDark ? "dark" : "light";

    await setupMockRoutes(page, {
      authenticated: true,
      isAdmin: true,
    });

    await page.goto("/share/demo-share-showcase", { waitUntil: "networkidle" });
    await stabilizePage(page);

    // Verify share title, files, and video sample row
    await expect(page.getByText("Cinematic Production Assets 2026")).toBeVisible();
    await expect(page.getByText("4K_Cinematic_Showreel.mp4")).toBeVisible();
    await expect(page.getByText("Original_Soundtrack.mp3")).toBeVisible();

    await captureScreenshot(page, {
      name: "04-share-view",
      variant,
      theme,
      fullPage: false,
    });
  });

  test("05-admin-overview: Administration Center", async ({ page }, testInfo) => {
    const isDark = testInfo.project.name.includes("dark");
    const isMobile = testInfo.project.name.includes("mobile");
    const variant = isMobile ? "mobile" : "desktop";
    const theme = isDark ? "dark" : "light";

    await setupMockRoutes(page, {
      authenticated: true,
      isAdmin: true,
    });

    await page.goto("/admin", { waitUntil: "networkidle" });
    await stabilizePage(page);

    // Verify admin metrics and modules
    await expect(page.getByRole("heading", { name: "Administration" })).toBeVisible();
    await expect(page.getByText("Host Disk Space Capacity")).toBeVisible();
    await expect(page.getByText("User management")).toBeVisible();

    await captureScreenshot(page, {
      name: "05-admin-overview",
      variant,
      theme,
      fullPage: false,
    });
  });

  test("06-admin-theme: Appearance & Theme Settings", async ({ page }, testInfo) => {
    // Only capture theme panel for desktop to avoid duplicate mobile captures
    const isMobile = testInfo.project.name.includes("mobile");
    if (isMobile) test.skip();

    const isDark = testInfo.project.name.includes("dark");
    const variant = "desktop";
    const theme = isDark ? "dark" : "light";

    await setupMockRoutes(page, {
      authenticated: true,
      isAdmin: true,
    });

    await page.goto("/admin/config/Appearance", { waitUntil: "networkidle" });
    await stabilizePage(page);

    await expect(page.getByRole("main").getByText("Configuration").first()).toBeVisible();

    await captureScreenshot(page, {
      name: "06-admin-theme",
      variant,
      theme,
      fullPage: false,
    });
  });
});
