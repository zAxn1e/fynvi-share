import {
  ActionIcon,
  Box,
  Group,
  Menu,
  Text,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { getCookie } from "cookies-next";
import React, { useEffect, useState } from "react";
import { TbCheck, TbLanguage } from "react-icons/tb";
import { LOCALES, Locale } from "../../i18n/locales";
import i18nUtil from "../../utils/i18n.util";

export interface LanguageMenuProps {
  variant?: "icon" | "button" | "compact";
  size?: "xs" | "sm" | "md";
}

export const LanguageMenu: React.FC<LanguageMenuProps> = ({
  variant = "icon",
  size = "sm",
}) => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  const [currentCode, setCurrentCode] = useState<string>("en-US");

  useEffect(() => {
    const cookieLang = getCookie("language")?.toString();
    if (cookieLang) {
      const matched = i18nUtil.getLocaleByCode(cookieLang);
      setCurrentCode(matched.code);
    } else if (typeof navigator !== "undefined") {
      const matched = i18nUtil.getLocaleByCode(navigator.language);
      setCurrentCode(matched.code);
    }
  }, []);

  const handleSelectLanguage = (locale: Locale) => {
    i18nUtil.setLanguageCookie(locale.code);
    setCurrentCode(locale.code);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const currentLocale = i18nUtil.getLocaleByCode(currentCode);

  const languageList = Object.values(LOCALES);

  return (
    <Menu
      shadow="md"
      width={240}
      position="bottom-end"
      transitionProps={{ transition: "pop-top-right" }}
      styles={{
        dropdown: {
          backgroundColor: isDark ? "var(--surface-1, #13171F)" : "#FFFFFF",
          borderColor: "var(--border-subtle, rgba(255, 255, 255, 0.08))",
          borderRadius: "var(--radius-md, 12px)",
          padding: 6,
        },
      }}
    >
      <Menu.Target>
        {variant === "button" ? (
          <UnstyledButton
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: "var(--radius-md, 10px)",
              backgroundColor: isDark
                ? "var(--surface-2, #1C2430)"
                : "var(--surface-2, #E2E8F0)",
              color: isDark ? "#F8FAFC" : "#0F172A",
              fontSize: 13,
              fontWeight: 500,
              border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))",
              transition: "all var(--transition-fast, 150ms ease)",
              "&:hover": {
                backgroundColor: isDark
                  ? "var(--surface-3, #283342)"
                  : "var(--surface-3, #CBD5E1)",
              },
            }}
          >
            <TbLanguage size={16} color="var(--brand-primary)" />
            <span>{currentLocale.name}</span>
          </UnstyledButton>
        ) : (
          <ActionIcon
            variant="subtle"
            size={size === "xs" ? 28 : size === "sm" ? 34 : 38}
            title={`Language: ${currentLocale.name}`}
            aria-label="Switch Language"
            sx={{
              borderRadius: "var(--radius-md, 10px)",
              color: isDark ? "var(--text-secondary, #94A3B8)" : "var(--text-secondary, #475569)",
              "&:hover": {
                color: isDark ? "#FFFFFF" : "#0F172A",
                backgroundColor: isDark
                  ? "var(--surface-2, #1C2430)"
                  : "var(--surface-2, #E2E8F0)",
              },
            }}
          >
            <TbLanguage size={size === "xs" ? 16 : 18} />
          </ActionIcon>
        )}
      </Menu.Target>

      <Menu.Dropdown>
        <Text
          size="xs"
          weight={600}
          color="dimmed"
          px={10}
          py={6}
          sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          Select Language ({languageList.length})
        </Text>
        <Box sx={{ maxHeight: 280, overflowY: "auto", overflowX: "hidden" }}>
          {languageList.map((locale) => {
            const isSelected = locale.code === currentLocale.code;
            return (
              <Menu.Item
                key={locale.code}
                onClick={() => handleSelectLanguage(locale)}
                sx={{
                  borderRadius: "var(--radius-sm, 6px)",
                  fontSize: 13,
                  fontWeight: isSelected ? 600 : 400,
                  backgroundColor: isSelected
                    ? isDark
                      ? "var(--brand-primary-subtle, rgba(59, 130, 246, 0.15))"
                      : "var(--brand-primary-subtle, rgba(37, 99, 235, 0.08))"
                    : "transparent",
                  color: isSelected
                    ? "var(--brand-primary)"
                    : isDark
                      ? "#F8FAFC"
                      : "#0F172A",
                }}
                rightSection={
                  isSelected ? <TbCheck size={16} color="var(--brand-primary)" /> : null
                }
              >
                <Group spacing={8}>
                  <Text size="sm">{locale.name}</Text>
                  <Text size="xs" color="dimmed" className="font-mono">
                    {locale.code.split("-")[0].toUpperCase()}
                  </Text>
                </Group>
              </Menu.Item>
            );
          })}
        </Box>
      </Menu.Dropdown>
    </Menu>
  );
};

export default LanguageMenu;
