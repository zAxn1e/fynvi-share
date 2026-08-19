import {
  ColorScheme,
  ColorSchemeProvider,
  Container,
  DEFAULT_THEME,
  MantineThemeOverride,
  MantineProvider,
  Stack,
} from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import axios from "axios";
import { getCookie, setCookie } from "cookies-next";
import moment from "moment";
import "moment/min/locales";
import { GetServerSidePropsContext } from "next";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { IntlProvider } from "react-intl";
import Header from "../components/header/Header";
import { AppShell } from "../components/layout/AppShell";
import { ConfigContext } from "../hooks/config.hook";
import { UserContext } from "../hooks/user.hook";
import { LOCALES } from "../i18n/locales";
import authService from "../services/auth.service";
import configService from "../services/config.service";
import userService from "../services/user.service";
import GlobalStyle from "../styles/global.style";
import globalStyle from "../styles/mantine.style";
import "../styles/design-system.css";
import Config from "../types/config.type";
import { CurrentUser } from "../types/user.type";
import i18nUtil from "../utils/i18n.util";
import userPreferences from "../utils/userPreferences.util";
import Footer from "../components/footer/Footer";
import { getDefaultConfig } from "../utils/defaultConfig.util";

const excludeDefaultLayoutRoutes = ["/admin/config/[category]"];
const availableMantineColors = [
  "dark",
  "gray",
  "red",
  "pink",
  "grape",
  "violet",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "green",
  "lime",
  "yellow",
  "orange",
  "victoria",
] as const;
const availableMantineRadii = ["xs", "sm", "md", "lg", "xl"] as const;
const hexColorPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const normalizeHexColor = (value: string): string | null => {
  if (!hexColorPattern.test(value)) return null;
  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  return value.toLowerCase();
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
});

const rgbToHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b]
    .map((channel) =>
      Math.min(255, Math.max(0, Math.round(channel)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;

const mixHexColors = (
  baseHex: string,
  mixHex: string,
  weight: number,
): string => {
  const base = hexToRgb(baseHex);
  const mix = hexToRgb(mixHex);
  const inverseWeight = 1 - weight;

  return rgbToHex(
    base.r * inverseWeight + mix.r * weight,
    base.g * inverseWeight + mix.g * weight,
    base.b * inverseWeight + mix.b * weight,
  );
};

const createMantineScaleFromHex = (hex: string) =>
  [
    mixHexColors(hex, "#ffffff", 0.92),
    mixHexColors(hex, "#ffffff", 0.82),
    mixHexColors(hex, "#ffffff", 0.68),
    mixHexColors(hex, "#ffffff", 0.54),
    mixHexColors(hex, "#ffffff", 0.36),
    hex,
    mixHexColors(hex, "#000000", 0.1),
    mixHexColors(hex, "#000000", 0.22),
    mixHexColors(hex, "#000000", 0.34),
    mixHexColors(hex, "#000000", 0.46),
  ] as [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];

function App({ Component, pageProps }: AppProps) {
  const systemTheme = useColorScheme(pageProps.colorScheme);
  const router = useRouter();

  const [colorScheme, setColorScheme] = useState<ColorScheme>(systemTheme);

  const [user, setUser] = useState<CurrentUser | null>(pageProps.user);
  const [route, setRoute] = useState<string>(pageProps.route);

  const [configVariables, setConfigVariables] = useState<Config[]>(
    pageProps.configVariables,
  );
  const getStringConfigValue = (key: string, fallback = ""): string => {
    const config = configVariables?.find((item) => item.key === key);
    return (config?.value ?? config?.defaultValue ?? fallback).trim();
  };

  const customCss = getStringConfigValue("appearance.customCss");
  const themePrimaryColorRaw = getStringConfigValue(
    "appearance.themePrimaryColor",
    "victoria",
  );
  const themePrimaryColorOverrideRaw = getStringConfigValue(
    "appearance.themePrimaryColorOverride",
  );
  const themeRadiusRaw = getStringConfigValue("appearance.themeRadius", "sm");
  const themeColorSchemeRaw = getStringConfigValue(
    "appearance.themeColorScheme",
    "system",
  );

  const normalizedPrimaryColorOverrideHex = normalizeHexColor(
    themePrimaryColorOverrideRaw,
  );
  const useCustomPrimaryColor = themePrimaryColorRaw === "custom";

  const effectivePrimaryHex = useCustomPrimaryColor
    ? normalizedPrimaryColorOverrideHex
    : null;

  const themePrimaryColor = effectivePrimaryHex
    ? "adminPrimary"
    : (availableMantineColors as readonly string[]).includes(
          themePrimaryColorRaw,
        )
      ? themePrimaryColorRaw
      : "victoria";

  const themeRadius = (availableMantineRadii as readonly string[]).includes(
    themeRadiusRaw,
  )
    ? themeRadiusRaw
    : "sm";

  const adminDefaultColorScheme =
    themeColorSchemeRaw === "light" || themeColorSchemeRaw === "dark"
      ? themeColorSchemeRaw
      : "system";

  const adminTheme: MantineThemeOverride = {
    ...(effectivePrimaryHex
      ? {
          colors: {
            adminPrimary: createMantineScaleFromHex(effectivePrimaryHex),
          },
        }
      : {}),
    primaryColor: themePrimaryColor,
    defaultRadius: themeRadius,
  };

  const mergedTheme: MantineThemeOverride = {
    ...globalStyle,
    ...adminTheme,
    colorScheme,
    colors: {
      ...(globalStyle.colors ?? {}),
      ...(adminTheme.colors ?? {}),
    },
  };

  useEffect(() => {
    setRoute(router.pathname);
  }, [router.pathname]);

  useEffect(() => {
    const interval = setInterval(
      async () => await authService.refreshAccessToken(),
      2 * 60 * 1000, // 2 minutes
    );

    if (typeof window !== "undefined" && "caches" in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (
            key === "pages" ||
            key === "start-url" ||
            key === "apis" ||
            key === "pages-rsc" ||
            key === "pages-rsc-prefetch"
          ) {
            caches.delete(key);
          }
        });
      });
    }

    return () => clearInterval(interval);
  }, []);

  const activeLanguageCode = pageProps.language || "en-US";

  const currentLocale = i18nUtil.getLocaleByCode(activeLanguageCode);
  const intlMessages = {
    ...LOCALES.ENGLISH.messages,
    ...(currentLocale?.messages || {}),
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cookieLanguage = getCookie("language");
      if (!cookieLanguage) {
        if (!pageProps.isConfigFallback && pageProps.language) {
          i18nUtil.setLanguageCookie(pageProps.language);
        }
      } else if (
        pageProps.language &&
        pageProps.language !== cookieLanguage &&
        !pageProps.isConfigFallback
      ) {
        // synchronize
      }

      document.documentElement.dir = currentLocale.direction ?? "ltr";
      document.documentElement.lang = currentLocale.code;
      moment.locale(currentLocale.code);
    }
  }, [currentLocale, pageProps.language, pageProps.isConfigFallback]);

  useEffect(() => {
    const userColorPreference = userPreferences.get("colorScheme");
    const colorScheme = user
      ? userColorPreference === "system"
        ? systemTheme
        : userColorPreference
      : adminDefaultColorScheme === "system"
        ? systemTheme
        : adminDefaultColorScheme;

    toggleColorScheme(colorScheme);
  }, [adminDefaultColorScheme, systemTheme, user]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute(
        "data-mantine-color-scheme",
        colorScheme,
      );
      document.documentElement.setAttribute("data-color-scheme", colorScheme);
      document.documentElement.style.colorScheme = colorScheme;
      document.body.className =
        colorScheme === "dark"
          ? "fynvi-dark theme-dark"
          : "fynvi-light theme-light";
    }
  }, [colorScheme]);

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextScheme =
      value !== undefined ? value : colorScheme === "dark" ? "light" : "dark";
    setColorScheme(nextScheme);
    setCookie("mantine-color-scheme", nextScheme, {
      sameSite: "lax",
    });
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute(
        "data-mantine-color-scheme",
        nextScheme,
      );
      document.documentElement.setAttribute("data-color-scheme", nextScheme);
      document.documentElement.style.colorScheme = nextScheme;
      document.body.className =
        nextScheme === "dark"
          ? "fynvi-dark theme-dark"
          : "fynvi-light theme-light";
    }
  };

  const primaryPalette =
    mergedTheme.colors?.[themePrimaryColor] ||
    (DEFAULT_THEME.colors as Record<string, string[]>)[themePrimaryColor] ||
    DEFAULT_THEME.colors.blue;

  const primary0 = primaryPalette[0] || "#EFF6FF";
  const primary4 = primaryPalette[4] || "#60A5FA";
  const primary5 = primaryPalette[5] || "#3B82F6";
  const primary6 = effectivePrimaryHex || primaryPalette[6] || "#2563EB";
  const primary7 = primaryPalette[7] || "#1D4ED8";
  const primary8 = primaryPalette[8] || "#1E40AF";
  const primaryRgbObj = hexColorPattern.test(primary6)
    ? hexToRgb(normalizeHexColor(primary6) || "#2563eb")
    : { r: 37, g: 99, b: 235 };
  const primaryRgb = `${primaryRgbObj.r}, ${primaryRgbObj.g}, ${primaryRgbObj.b}`;

  const isExcludedLayout =
    router.pathname.startsWith("/admin/config") ||
    excludeDefaultLayoutRoutes.includes(router.pathname) ||
    excludeDefaultLayoutRoutes.includes(route);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </Head>
      <IntlProvider
        messages={intlMessages}
        locale={currentLocale.code}
        defaultLocale={LOCALES.ENGLISH.code}
      >
        <MantineProvider withGlobalStyles withNormalizeCSS theme={mergedTheme}>
          <style
            id="dynamic-theme-vars"
            dangerouslySetInnerHTML={{
              __html: `
            :root,
            [data-mantine-color-scheme="dark"],
            [data-mantine-color-scheme="light"],
            html,
            body {
              --brand-primary: ${primary6} !important;
              --brand-primary-hover: ${primary7} !important;
              --brand-primary-light: ${primary0} !important;
              --brand-primary-subtle: rgba(${primaryRgb}, 0.12) !important;
              --brand-primary-rgb: ${primaryRgb} !important;
              --brand-gradient: linear-gradient(135deg, ${primary5} 0%, ${primary6} 55%, ${primary8} 100%) !important;
              --brand-gradient-vertical: linear-gradient(180deg, ${primary5} 0%, ${primary6} 100%) !important;
              --brand-glow: radial-gradient(circle at center, rgba(${primaryRgb}, 0.22) 0%, rgba(${primaryRgb}, 0.05) 50%, transparent 80%) !important;
              --brand-glow-header: radial-gradient(ellipse 70% 40% at 50% -10%, rgba(${primaryRgb}, 0.15), transparent 70%) !important;
              --border-focus: rgba(${primaryRgb}, 0.5) !important;

              --radius-xs: 4px;
              --radius-sm: ${themeRadius === "xs" ? "4px" : themeRadius === "sm" ? "8px" : themeRadius === "md" ? "12px" : themeRadius === "lg" ? "16px" : "20px"};
              --radius-md: ${themeRadius === "xs" ? "6px" : themeRadius === "sm" ? "10px" : themeRadius === "md" ? "14px" : themeRadius === "lg" ? "18px" : "24px"};
              --radius-lg: ${themeRadius === "xs" ? "8px" : themeRadius === "sm" ? "14px" : themeRadius === "md" ? "18px" : themeRadius === "lg" ? "24px" : "32px"};
              --radius-xl: ${themeRadius === "xs" ? "12px" : themeRadius === "sm" ? "20px" : themeRadius === "md" ? "26px" : themeRadius === "lg" ? "32px" : "40px"};

              --fynvi-brand-gradient: var(--brand-gradient);
              --fynvi-brand-glow: var(--brand-glow);
              --fynvi-primary: var(--brand-primary);
              --fynvi-primary-hover: var(--brand-primary-hover);
              --fynvi-primary-subtle: var(--brand-primary-subtle);
            }
          `,
            }}
          />
          {customCss && (
            <style
              id="admin-custom-css"
              dangerouslySetInnerHTML={{
                __html: customCss.replace(/<\/style/gi, "<\\/style"),
              }}
            />
          )}
          <ColorSchemeProvider
            colorScheme={colorScheme}
            toggleColorScheme={toggleColorScheme}
          >
            <GlobalStyle />
            <Notifications />
            <ModalsProvider>
              <ConfigContext.Provider
                value={{
                  configVariables,
                  refresh: async () => {
                    setConfigVariables(await configService.list());
                  },
                }}
              >
                <UserContext.Provider
                  value={{
                    user,
                    refreshUser: async () => {
                      const user = await userService.getCurrentUser();
                      setUser(user);
                      return user;
                    },
                  }}
                >
                  {isExcludedLayout ? (
                    <Component {...pageProps} />
                  ) : (
                    <AppShell>
                      <Component {...pageProps} />
                    </AppShell>
                  )}
                </UserContext.Provider>
              </ConfigContext.Provider>
            </ModalsProvider>
          </ColorSchemeProvider>
        </MantineProvider>
      </IntlProvider>
    </>
  );
}

// Fetch user and config variables on server side when the first request is made
// These will get passed as a page prop to the App component and stored in the contexts
App.getInitialProps = async ({ ctx }: { ctx: GetServerSidePropsContext }) => {
  let pageProps: {
    user?: CurrentUser;
    configVariables?: Config[];
    route?: string;
    colorScheme: ColorScheme;
    language?: string;
    isConfigFallback?: boolean;
  } = {
    route: ctx.resolvedUrl,
    colorScheme:
      (getCookie("mantine-color-scheme", ctx) as ColorScheme) ?? "light",
  };

  if (ctx.req) {
    const apiURL = process.env.API_URL || "http://localhost:8080";
    const cookieHeader = ctx.req.headers.cookie;

    pageProps.user = await axios(`${apiURL}/api/users/me`, {
      headers: { cookie: cookieHeader },
    })
      .then((res) => res.data)
      .catch(() => null);

    try {
      pageProps.configVariables = (
        await axios(`${apiURL}/api/configs`, {
          timeout: 1000,
        })
      ).data;
    } catch (e) {
      pageProps.configVariables = getDefaultConfig();
      pageProps.isConfigFallback = true;
    }

    pageProps.route = ctx.req.url;

    const requestLanguage = i18nUtil.getLanguageFromAcceptHeader(
      ctx.req.headers["accept-language"],
    );

    const defaultLanguage = pageProps.configVariables?.find(
      (item) => item.key === "general.defaultLanguage",
    )?.value;

    pageProps.language =
      ctx.req.cookies["language"] ||
      defaultLanguage ||
      requestLanguage ||
      "en-US";
  } else {
    // Client-side navigation: resolve language from cookie or navigator
    const cookieLanguage = getCookie("language", ctx) as string;
    pageProps.language =
      cookieLanguage ||
      (typeof navigator !== "undefined" ? navigator.language : "en-US");
  }
  return { pageProps };
};

export default App;
