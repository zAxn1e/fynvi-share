import { BrowserContext, Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import {
  getMockAdminConfigs,
  mockConfigVariables,
  mockCurrentUser,
  mockShareDetailShowcase,
  mockSharesList,
  mockStandardUser,
  mockSystemInfo,
  mockUsersList,
} from "../fixtures/demo-data";

export interface MockOptions {
  authenticated?: boolean;
  isAdmin?: boolean;
  user?: typeof mockCurrentUser;
  configOverrides?: Record<string, string>;
  shares?: typeof mockSharesList;
  shareDetail?: typeof mockShareDetailShowcase;
}

export interface AuthOptions {
  authenticated?: boolean;
  isAdmin?: boolean;
  colorScheme?: "dark" | "light";
  language?: string;
}

export interface CaptureConfig {
  name: string;
  variant: "desktop" | "mobile";
  theme: "dark" | "light";
  fullPage?: boolean;
}

/**
 * Creates a mock JWT string that satisfies jwtDecode<{ exp: number; isAdmin: boolean }>
 */
export function createMockJwtToken(options?: {
  isAdmin?: boolean;
  username?: string;
  email?: string;
}): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    id: "usr_demo_admin_01",
    username: options?.username || "Alex Rivera",
    email: options?.email || "alex.rivera@fynvi.io",
    isAdmin: options?.isAdmin !== false,
    exp: Math.floor(new Date("2030-01-01T00:00:00Z").getTime() / 1000),
  };

  const b64 = (obj: any) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  return `${b64(header)}.${b64(payload)}.mockSignatureFynviShareDemo2026`;
}

/**
 * Injects deterministic cookies (auth token, theme colorScheme, locale) into browser context
 */
export async function injectAuthSession(
  context: BrowserContext,
  options: AuthOptions = {},
): Promise<void> {
  const {
    authenticated = true,
    isAdmin = true,
    colorScheme = "dark",
    language = "en-US",
  } = options;

  await context.clearCookies();

  const cookies = [
    {
      name: "mantine-color-scheme",
      value: colorScheme,
      url: "http://localhost:3000",
    },
    {
      name: "language",
      value: language,
      url: "http://localhost:3000",
    },
  ];

  if (authenticated) {
    const token = createMockJwtToken({ isAdmin });
    cookies.push(
      {
        name: "access_token",
        value: token,
        url: "http://localhost:3000",
      },
      {
        name: "refresh_token",
        value: token,
        url: "http://localhost:3000",
      },
    );
  }

  await context.addCookies(cookies);
}

/**
 * SVG placeholder generator for media thumbnails in demo views
 */
function createSvgThumbnail(label: string, color: string = "#3B82F6"): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172A" />
        <stop offset="50%" stop-color="#1E293B" />
        <stop offset="100%" stop-color="#0B0F17" />
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}" />
        <stop offset="100%" stop-color="#1D4ED8" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" rx="8" />
    <circle cx="200" cy="110" r="36" fill="url(#accent)" opacity="0.8" />
    <path d="M192 98 L214 110 L192 122 Z" fill="#FFFFFF" />
    <text x="200" y="180" fill="#E2E8F0" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="14" font-weight="600" text-anchor="middle">${label}</text>
    <text x="200" y="202" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="11" text-anchor="middle">4K Ultra HD • 60 FPS • ProRes</text>
  </svg>`;
}

/**
 * Intercepts all `/api/**` network routes with deterministic mock fixtures
 */
export async function setupMockRoutes(
  page: Page,
  options: MockOptions = {},
): Promise<void> {
  const {
    authenticated = true,
    isAdmin = true,
    user = isAdmin ? mockCurrentUser : mockStandardUser,
    configOverrides = {},
    shares = mockSharesList,
    shareDetail = mockShareDetailShowcase,
  } = options;

  const resolvedConfigs = mockConfigVariables.map((cfg) => {
    if (configOverrides[cfg.key] !== undefined) {
      return { ...cfg, value: configOverrides[cfg.key] };
    }
    return cfg;
  });

  // Unified Mock Route Interceptor for all /api requests
  await page.route("**/*", async (route) => {
    const rawUrl = route.request().url();
    if (!rawUrl.includes("/api/")) {
      await route.continue();
      return;
    }
    const pathname =
      (rawUrl.split("/api/")[1]
        ? "/api/" + rawUrl.split("/api/")[1].split("?")[0]
        : "/"
      ).replace(/\/+$/, "") || "/";
    const method = route.request().method();

    if (method === "OPTIONS") {
      await route.fulfill({ status: 200 });
      return;
    }

    // 1. Current user
    if (pathname === "/api/users/me") {
      if (authenticated) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(user),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ statusCode: 401, message: "Unauthorized" }),
        });
      }
      return;
    }

    // 2. Configs
    if (pathname === "/api/configs/isNewReleaseAvailable") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(true),
      });
      return;
    }

    if (pathname.startsWith("/api/configs/admin/")) {
      const category = pathname.split("/api/configs/admin/")[1] || "general";
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(getMockAdminConfigs(category)),
      });
      return;
    }

    if (pathname === "/api/configs") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(resolvedConfigs),
      });
      return;
    }

    // 3. Shares List
    if (
      pathname === "/api/shares" ||
      pathname === "/api/shares/my" ||
      pathname === "/api/shares/all"
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(shares),
      });
      return;
    }

    if (pathname === "/api/shares/received" || pathname.startsWith("/api/reverseShares")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
      return;
    }

    if (pathname.endsWith("/token")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ token: "demo_mock_token_2026" }),
      });
      return;
    }

    if (pathname.endsWith("/thumbnail")) {
      await route.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        body: createSvgThumbnail("Media Preview"),
      });
      return;
    }

    if (
      pathname === "/api/shares/demo-share-showcase" ||
      pathname.endsWith("/from-owner") ||
      pathname.endsWith("/metaData")
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(shareDetail),
      });
      return;
    }

    if (pathname.startsWith("/api/shares/")) {
      const shareId = pathname.replace("/api/shares/", "");
      const matched = shares.find((s) => s.id === shareId) || shareDetail;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(matched),
      });
      return;
    }

    // 4. System info
    if (pathname === "/api/system/info") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSystemInfo),
      });
      return;
    }

    // 5. Users list
    if (pathname === "/api/users" || pathname.startsWith("/api/users/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockUsersList),
      });
      return;
    }

    // Fallback
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });


}

/**
 * Injects CSS and browser script overrides to freeze animations and stabilize layouts
 */
export async function stabilizePage(page: Page): Promise<void> {
  // Deterministic Fixed Date (2026-08-20T12:00:00Z)
  const FIXED_TIME = new Date("2026-08-20T12:00:00.000Z").getTime();
  await page.addInitScript(`{
    const _Date = Date;
    const fixedTime = ${FIXED_TIME};
    Date.now = () => fixedTime;
  }`);

  // Emulate reduced motion preference (freezes WaveCanvas & CSS transitions)
  await page.emulateMedia({ reducedMotion: "reduce" });

  // Injected CSS for clean screenshot rendering
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      ::-webkit-scrollbar {
        display: none !important;
        width: 0px !important;
        height: 0px !important;
      }
      * {
        caret-color: transparent !important;
      }
      #__next-build-watcher, [data-nextjs-toast], nextjs-portal {
        display: none !important;
      }
    `,
  });

  // Wait for web fonts to load
  await page.evaluate(() => document.fonts.ready);

  // Wait for images to complete loading
  await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll("img"));
    return Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      }),
    );
  });

  // Brief stabilization pause for React layout paint
  await page.waitForTimeout(300);
}

/**
 * Captures polished screenshot and saves it to predictable path
 */
export async function captureScreenshot(
  page: Page,
  config: CaptureConfig,
): Promise<string> {
  const { name, variant, theme, fullPage = false } = config;

  const targetDir = path.resolve(
    __dirname,
    "../../../screenshots",
    variant,
    theme,
  );

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, `${name}.png`);

  await page.screenshot({
    path: filePath,
    fullPage,
    animations: "disabled",
  });

  return filePath;
}
