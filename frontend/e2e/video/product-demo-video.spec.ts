import { expect, test } from "@playwright/test";
import fs from "fs";
import path from "path";
import {
  injectAuthSession,
  setupMockRoutes,
  stabilizePage,
} from "../helpers/screenshot.helper";

test.describe("Product Demo Interactive Video Walkthrough", () => {
  test("Record Full Desktop Product Tour", async ({ context, page }) => {
    test.setTimeout(90000);

    // 1. Start with Public Landing Page (Dark mode)
    await injectAuthSession(context, {
      authenticated: false,
      colorScheme: "dark",
    });
    await setupMockRoutes(page, {
      authenticated: false,
    });

    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Smooth scroll down to view feature cards
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: "smooth" }));
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await page.waitForTimeout(1000);

    // 2. Sign In to Dashboard (Authenticated state)
    await injectAuthSession(context, {
      authenticated: true,
      isAdmin: true,
      colorScheme: "dark",
    });
    await setupMockRoutes(page, {
      authenticated: true,
      isAdmin: true,
    });

    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    // Hover over Bento metric cards
    const bentoCards = page.locator(".mantine-Paper-root");
    if ((await bentoCards.count()) > 2) {
      await bentoCards.nth(1).hover();
      await page.waitForTimeout(800);
      await bentoCards.nth(2).hover();
      await page.waitForTimeout(800);
    }

    // 3. Navigate to Upload Page & Queue Files
    await page.goto("/upload", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const fileInput = page.locator("input[type=\"file\"]").first();
    await fileInput.setInputFiles([
      {
        name: "4K_Cinematic_Showreel.mp4",
        mimeType: "video/mp4",
        buffer: Buffer.from("demo_video_bytes_stream_data"),
      },
      {
        name: "Brand_Guidelines_2026.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("demo_pdf_bytes_stream_data"),
      },
      {
        name: "Ambient_Soundtrack_Lossless.flac",
        mimeType: "audio/flac",
        buffer: Buffer.from("demo_audio_bytes_stream_data"),
      },
      {
        name: "Source_Release_v2.0.tar.gz",
        mimeType: "application/gzip",
        buffer: Buffer.from("demo_archive_bytes_stream_data"),
      },
    ]);

    await page.waitForTimeout(2000);

    // 4. Open Share Showcase (with Video Sample & Audio Player)
    await page.goto("/share/demo-share-showcase", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Hover over share items (4K Video, Audio, Image)
    const fileRows = page.locator("table tbody tr, .mantine-Paper-root");
    if ((await fileRows.count()) > 1) {
      await fileRows.nth(0).hover();
      await page.waitForTimeout(1000);
      await fileRows.nth(1).hover();
      await page.waitForTimeout(1000);
    }

    // 5. Navigate to Administration Center
    await page.goto("/admin", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Scroll through Admin modules
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await page.waitForTimeout(1000);

    // Close page to flush video stream
    const videoObj = page.video();
    await page.close();

    if (videoObj) {
      const videoPath = await videoObj.path();
      const outputDir = path.resolve(__dirname, "../../../screenshots/videos");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const targetPath = path.join(outputDir, "product-demo-desktop.webm");
      if (fs.existsSync(videoPath)) {
        fs.copyFileSync(videoPath, targetPath);
        console.log(`\n==> Interactive video demo saved to: ${targetPath}`);
      }
    }
  });
});
