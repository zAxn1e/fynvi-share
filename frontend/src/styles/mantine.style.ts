import { MantineThemeOverride } from "@mantine/core";

const mantineTheme: MantineThemeOverride = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif",
  fontFamilyMonospace:
    "ui-monospace, SFMono-Regular, \"JetBrains Mono\", Menlo, Monaco, Consolas, monospace",
  defaultRadius: "sm",
  colors: {
    // Primary blue color scale
    victoria: [
      "#EFF6FF",
      "#DBEAFE",
      "#BFDBFE",
      "#93C5FD",
      "#60A5FA",
      "#3B82F6",
      "#2563EB",
      "#1D4ED8",
      "#1E40AF",
      "#172554",
    ],
    dark: [
      "#F3F4F6", // text primary
      "#9CA3AF", // text secondary
      "#6B7280", // text muted
      "#282F3D", // surface 3
      "#1E232E", // surface 2
      "#161A22", // surface 1
      "#11141A", // surface 0
      "#0B0D11", // canvas background
      "#080A0E",
      "#040507",
    ],
  },
  primaryColor: "victoria",
  components: {
    Modal: {
      styles: (theme) => ({
        content: {
          backgroundColor:
            theme.colorScheme === "dark" ? "#0F1319" : "#FFFFFF",
          border:
            theme.colorScheme === "dark"
              ? "1px solid rgba(255, 255, 255, 0.09)"
              : "1px solid rgba(15, 23, 42, 0.09)",
          borderRadius: 14,
          maxWidth: "calc(100vw - 20px)",
          boxShadow:
            theme.colorScheme === "dark"
              ? "0 24px 48px -12px rgba(0, 0, 0, 0.75)"
              : "0 24px 48px -12px rgba(15, 23, 42, 0.14)",
          overflow: "hidden",
        },
        header: {
          backgroundColor: "transparent",
          padding: "16px 20px 12px",
          borderBottom:
            theme.colorScheme === "dark"
              ? "1px solid rgba(255, 255, 255, 0.06)"
              : "1px solid rgba(15, 23, 42, 0.06)",
        },
        body: {
          padding: 20,
          [theme.fn.smallerThan("xs")]: {
            padding: 14,
          },
        },
        title: {
          fontSize: theme.fontSizes.md,
          fontWeight: 700,
          letterSpacing: "-0.01em",
        },
      }),
    },
    Paper: {
      styles: (theme) => ({
        root: {
          backgroundColor:
            theme.colorScheme === "dark" ? "#11141A" : "#FFFFFF",
          borderColor:
            theme.colorScheme === "dark"
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(15, 23, 42, 0.08)",
        },
      }),
    },
    Button: {
      styles: () => ({
        root: {
          fontWeight: 500,
          transition: "all 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        },
      }),
    },
    TextInput: {
      styles: (theme) => ({
        input: {
          backgroundColor:
            theme.colorScheme === "dark" ? "#161A22" : "#F8FAFC",
          borderColor:
            theme.colorScheme === "dark"
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(15, 23, 42, 0.12)",
          "&:focus": {
            borderColor: "var(--brand-primary, #3B82F6)",
          },
        },
      }),
    },
    PasswordInput: {
      styles: (theme) => ({
        input: {
          backgroundColor:
            theme.colorScheme === "dark" ? "#161A22" : "#F8FAFC",
          borderColor:
            theme.colorScheme === "dark"
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(15, 23, 42, 0.12)",
          "&:focus": {
            borderColor: "var(--brand-primary, #3B82F6)",
          },
        },
      }),
    },
  },
};

export default mantineTheme;
