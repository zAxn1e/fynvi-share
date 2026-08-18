import {
  ActionIcon,
  Avatar,
  Box,
  Divider,
  Group,
  Menu,
  Text,
  Tooltip,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  TbArrowsExchange,
  TbCloudUpload,
  TbFolders,
  TbInbox,
  TbLogout,
  TbMenu2,
  TbMoon,
  TbPlus,
  TbSearch,
  TbServer,
  TbSettings,
  TbShieldLock,
  TbSun,
  TbUser,
} from "react-icons/tb";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import authService from "../../services/auth.service";
import { User } from "../../types/user.type";
import Logo from "../Logo";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { LanguageMenu } from "../common/LanguageMenu";

export interface TopbarProps {
  user?: User | null;
  onOpenUpload?: () => void;
  onOpenMobileNav?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  user,
  onOpenUpload,
  onOpenMobileNav,
}) => {
  const router = useRouter();
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const t = useTranslate();
  const config = useConfig();

  const appName = config.get("general.appName") || "Fynvi Share";
  const isDark = theme.colorScheme === "dark";

  const getPageTitle = () => {
    const path = router.pathname;
    if (path === "/") return t("navbar.home") || "Overview";
    if (path === "/upload") return t("navbar.upload") || "Upload";
    if (path.startsWith("/account/shares"))
      return t("navbar.links.shares") || "My Shares";
    if (path.startsWith("/account/reverseShares"))
      return t("navbar.links.reverse") || "Reverse Shares";
    if (path.startsWith("/account/received"))
      return t("navbar.links.received") || "Received Shares";
    if (path.startsWith("/account"))
      return t("navbar.avatar.account") || "Account Settings";
    if (path.startsWith("/admin"))
      return t("navbar.avatar.admin") || "Admin Center";
    if (path.startsWith("/share/") || path.startsWith("/s/"))
      return "Share Viewer";
    return "";
  };

  return (
    <Box
      component="header"
      sx={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        backgroundColor: "var(--glass-bg, rgba(15, 19, 25, 0.75))",
        backdropFilter: "blur(var(--glass-blur, 16px))",
        WebkitBackdropFilter: "blur(var(--glass-blur, 16px))",
        borderBottom: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
        position: "sticky",
        top: 0,
        zIndex: 90,
        [theme.fn.smallerThan("md")]: {
          padding: "0 16px",
        },
      }}
    >
      {/* Left: Mobile hamburger + Breadcrumbs / Title */}
      <Group spacing={14}>
        {/* Mobile Navigation Trigger */}
        <Box
          sx={{
            display: "none",
            [theme.fn.smallerThan("md")]: {
              display: "flex",
              alignItems: "center",
              gap: 8,
            },
          }}
        >
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={onOpenMobileNav}
            aria-label="Open Navigation Drawer"
            sx={{
              borderRadius: "var(--radius-md, 10px)",
              color: isDark ? "var(--text-primary, #F8FAFC)" : "var(--text-primary, #0F172A)",
              "&:hover": {
                backgroundColor: isDark
                  ? "var(--surface-2, #1C2430)"
                  : "var(--surface-2, #E2E8F0)",
              },
            }}
          >
            <TbMenu2 size={22} />
          </ActionIcon>
          <Box
            component={Link}
            href="/"
            sx={{ display: "flex", alignItems: "center", textDecoration: "none" }}
          >
            <Logo height={28} width={28} />
          </Box>
        </Box>

        {/* Desktop Logo on Homepage */}
        {router.pathname === "/" && (
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              [theme.fn.smallerThan("md")]: {
                display: "none",
              },
            }}
          >
            <Logo height={30} width={30} />
          </Box>
        )}

        {/* Page Context Breadcrumb */}
        <Group spacing={8} align="center">
          <Text
            component={Link}
            href="/"
            size="sm"
            color="dimmed"
            sx={{
              fontWeight: 500,
              textDecoration: "none",
              cursor: "pointer",
              "&:hover": {
                color: isDark ? "#FFFFFF" : "#000000",
              },
              [theme.fn.smallerThan("sm")]: {
                display: "none",
              },
            }}
          >
            {appName}
          </Text>
          <Text
            size="sm"
            color="dimmed"
            sx={{
              [theme.fn.smallerThan("sm")]: {
                display: "none",
              },
            }}
          >
            /
          </Text>
          <Text
            size="sm"
            sx={{
              fontWeight: 600,
              color: isDark
                ? "var(--text-primary, #F8FAFC)"
                : "var(--text-primary, #0F172A)",
            }}
          >
            {getPageTitle()}
          </Text>
        </Group>
      </Group>

      {/* Right Controls: Actions, Search, Theme Toggle, User Profile */}
      <Group spacing={12}>
        {/* Quick Upload CTA (if handler provided) */}
        {onOpenUpload && (
          <Button
            size="xs"
            variant="primary"
            leftIcon={<TbCloudUpload size={16} />}
            onClick={onOpenUpload}
            sx={{
              [theme.fn.smallerThan("xs")]: {
                display: "none",
              },
            }}
          >
            {t("navbar.upload") || "Upload"}
          </Button>
        )}

        {/* Language Switcher */}
        <LanguageMenu variant="icon" size="sm" />

        {/* Color Scheme Switcher */}
        <Tooltip
          label={
            colorScheme === "dark"
              ? "Switch to Light Mode"
              : "Switch to Dark Mode"
          }
          withArrow
        >
          <ActionIcon
            variant="subtle"
            size="md"
            onClick={() => toggleColorScheme()}
            aria-label="Toggle Color Scheme"
            sx={{
              borderRadius: "var(--radius-md, 10px)",
              color: isDark
                ? "var(--text-secondary, #94A3B8)"
                : "var(--text-secondary, #475569)",
              "&:hover": {
                backgroundColor: isDark
                  ? "var(--surface-2, #1C2430)"
                  : "var(--surface-2, #E2E8F0)",
                color: isDark
                  ? "var(--text-primary, #F8FAFC)"
                  : "var(--text-primary, #0F172A)",
              },
            }}
          >
            {colorScheme === "dark" ? <TbSun size={18} /> : <TbMoon size={18} />}
          </ActionIcon>
        </Tooltip>

        {/* User Profile Menu or Sign In Button */}
        {user ? (
          <Menu
            position="bottom-end"
            shadow="md"
            width={220}
            transitionProps={{ transition: "pop-top-right" }}
            radius="md"
          >
            <Menu.Target>
              <UnstyledButton
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 8px",
                  borderRadius: "var(--radius-md, 10px)",
                  transition: "background var(--transition-fast, 150ms cubic-bezier(0.16, 1, 0.3, 1))",
                  "&:hover": {
                    backgroundColor: isDark
                      ? "var(--surface-1, #151B24)"
                      : "var(--surface-1, #F1F5F9)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "var(--brand-gradient)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Box>
                <Text
                  size="sm"
                  weight={500}
                  sx={{
                    [theme.fn.smallerThan("xs")]: {
                      display: "none",
                    },
                  }}
                >
                  {user.username}
                </Text>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown
              sx={{
                backgroundColor: "var(--surface-1, #151B24)",
                border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
              }}
            >
              <Box p={8}>
                <Text size="xs" color="dimmed">
                  Signed in as
                </Text>
                <Text size="sm" weight={600} sx={{ lineHeight: 1.2 }}>
                  {user.username}
                </Text>
                {user.email && (
                  <Text size="xs" color="dimmed" sx={{ fontSize: 11 }}>
                    {user.email}
                  </Text>
                )}
                {user.isAdmin && (
                  <Badge variant="primary" size="xs" mt={6}>
                    Administrator
                  </Badge>
                )}
              </Box>

              <Divider />

              <Menu.Item
                icon={<TbFolders size={16} />}
                component={Link}
                href="/account/shares"
              >
                {t("navbar.links.shares") || "My Shares"}
              </Menu.Item>
              <Menu.Item
                icon={<TbArrowsExchange size={16} />}
                component={Link}
                href="/account/reverseShares"
              >
                {t("navbar.links.reverse") || "Reverse Shares"}
              </Menu.Item>
              <Menu.Item
                icon={<TbSettings size={16} />}
                component={Link}
                href="/account"
              >
                {t("navbar.avatar.account") || "Account Settings"}
              </Menu.Item>

              {user.isAdmin && (
                <>
                  <Divider />
                  <Menu.Item
                    icon={<TbServer size={16} />}
                    component={Link}
                    href="/admin"
                  >
                    {t("navbar.avatar.admin") || "Admin Center"}
                  </Menu.Item>
                </>
              )}

              <Divider />

              <Menu.Item
                color="red"
                icon={<TbLogout size={16} />}
                onClick={() => {
                  authService.signOut();
                  window.location.href = "/";
                }}
              >
                {t("navbar.avatar.signout") || "Sign Out"}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Button
            component={Link}
            href="/auth/signIn"
            variant="secondary"
            size="xs"
          >
            {t("navbar.signin") || "Sign In"}
          </Button>
        )}
      </Group>
    </Box>
  );
};

const UnstyledButton = Box;
export default Topbar;
