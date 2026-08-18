import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
  title: "Fynvi Share Documentation",
  tagline:
    "Fynvi Share is a modern, self-hosted file sharing platform with local-first storage.",
  favicon: "img/fynvishare.svg",

  url: "https://fynvi.org",
  baseUrl: "/",
  organizationName: "fynvi",
  projectName: "fynvi-share",

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/zAxn1e/fynvi-share/edit/main/docs",
        },
        blog: false,
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/fynvishare.svg",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Fynvi Share",
      logo: {
        alt: "Fynvi Share Logo",
        src: "img/fynvishare.svg",
      },
      items: [
        {
          href: "https://github.com/zAxn1e/fynvi-share",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
