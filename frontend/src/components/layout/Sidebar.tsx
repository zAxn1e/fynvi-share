import {
  ActionIcon,
  Box,
  Collapse,
  Group,
  Progress,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  TbArrowsExchange,
  TbChevronDown,
  TbChevronRight,
  TbCloudUpload,
  TbFolder,
  TbFolders,
  TbInbox,
  TbLayoutDashboard,
  TbLock,
  TbLogout,
  TbMoon,
  TbPlus,
  TbServer,
  TbSettings,
  TbShieldLock,
  TbSun,
  TbUsers,
} from "react-icons/tb";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import systemService, { SystemInfo } from "../../services/system.service";
import { User } from "../../types/user.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import Logo from "../Logo";
import { Button } from "../common/Button";

export interface SidebarProps {
  user?: User | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenUpload?: () => void;
}

interface NavItem {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  href: string;
  badge?: React.ReactNode;
  exact?: boolean;
  show?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  collapsed = false,
  onToggleCollapse,
  onOpenUpload,
}) => {
  const router = useRouter();
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = theme.colorScheme === "dark";
  const t = useTranslate();
  const config = useConfig();

  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.isAdmin) {
      systemService
        .getSystemInfo()
        .then((info) => setSystemInfo(info))
        .catch(() => {});
    }
  }, [user]);

  const navItems: NavItem[] = [
    {
      icon: TbLayoutDashboard,
      label: t("navbar.home") || "Overview",
      href: "/",
      exact: true,
      show: true,
    },
    {
      icon: TbCloudUpload,
      label: t("navbar.upload") || "Upload",
      href: "/upload",
      show: true,
    },
    {
      icon: TbFolders,
      label: t("navbar.links.shares") || "My Shares",
      href: "/account/shares",
      show: !!user,
    },
    {
      icon: TbArrowsExchange,
      label: t("navbar.links.reverse") || "Reverse Shares",
      href: "/account/reverseShares",
      show: !!user,
    },
    {
      icon: TbInbox,
      label: t("navbar.links.received") || "Received Shares",
      href: "/account/received",
      show: false,
    },
    {
      icon: TbSettings,
      label: t("navbar.avatar.account") || "Account",
      href: "/account",
      exact: true,
      show: !!user,
    },
  ];

  const adminNavItems: NavItem[] = [
    {
      icon: TbServer,
      label: t("navbar.avatar.admin") || "Admin Center",
      href: "/admin",
      exact: true,
      show: !!user?.isAdmin,
    },
    {
      icon: TbUsers,
      label: t("admin.users.title") || "Users",
      href: "/admin/users",
      show: !!user?.isAdmin,
    },
    {
      icon: TbFolder,
      label: t("admin.shares.title") || "All Shares",
      href: "/admin/shares",
      show: !!user?.isAdmin,
    },
  ];

  const isActive = (item: NavItem) => {
    if (item.exact) {
      return router.pathname === item.href;
    }
    return router.pathname.startsWith(item.href);
  };

  const calculateDiskUsage = () => {
    if (!systemInfo || !systemInfo.total) return null;
    const { total, used } = systemInfo;
    const percentage = total > 0 ? Math.round((used / total) * 100) : 0;
    return {
      usedFormatted: byteToHumanSizeString(used),
      totalFormatted: byteToHumanSizeString(total),
      percentage,
    };
  };

  const diskUsage = calculateDiskUsage();

  return (
    <Box
      component="aside"
      sx={{
        width: collapsed ? 76 : 260,
        height: "100dvh",
        maxHeight: "100dvh",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: "var(--surface-0, #0F1319)",
        borderRight: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
        display: "flex",
        flexDirection: "column",
        padding: collapsed ? "20px 10px" : "20px 16px",
        transition: "width var(--transition-normal, 250ms cubic-bezier(0.16, 1, 0.3, 1))",
        zIndex: 100,
        userSelect: "none",
        overflow: "hidden",
        [theme.fn.smallerThan("md")]: {
          display: "none",
        },
      }}
    >
      {/* Top Header Fixed */}
      <Box sx={{ flexShrink: 0, mb: 16 }}>
        {/* Brand & Collapse Toggle */}
        <Group
          position={collapsed ? "center" : "apart"}
          align="center"
          mb={collapsed ? 16 : 20}
          px={collapsed ? 0 : 6}
        >
          <Link href="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center" }}>
            <Logo height={32} />
          </Link>
        </Group>

        {/* Quick Upload Action */}
        {!collapsed && onOpenUpload && (
          <Button
            variant="primary"
            fullWidth
            leftIcon={<TbPlus size={16} />}
            onClick={onOpenUpload}
            size="sm"
          >
            {t("navbar.upload") || "New Share"}
          </Button>
        )}
      </Box>

      {/* Middle Scrollable Navigation List */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: collapsed ? 0 : 2,
        }}
      >
        <Stack spacing={4}>
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const active = isActive(item);
              const Icon = item.icon;

              const buttonContent = (
                <UnstyledButton
                  component={Link}
                  href={item.href}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "flex-start",
                    gap: 12,
                    width: "100%",
                    padding: collapsed ? "10px" : "10px 12px",
                    borderRadius: "var(--radius-md, 10px)",
                    backgroundColor: active
                      ? isDark
                        ? "var(--brand-primary-subtle, rgba(59, 130, 246, 0.12))"
                        : "var(--brand-primary-subtle, rgba(37, 99, 235, 0.08))"
                      : "transparent",
                    color: active
                      ? "var(--brand-primary)"
                      : isDark
                        ? "var(--text-secondary, #94A3B8)"
                        : "var(--text-secondary, #475569)",
                    fontWeight: active ? 600 : 500,
                    fontSize: 14,
                    transition: "all var(--transition-fast, 150ms cubic-bezier(0.16, 1, 0.3, 1))",
                    border: active
                      ? "1px solid var(--border-focus, rgba(59, 130, 246, 0.3))"
                      : "1px solid transparent",
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
                  <Icon size={20} />
                  {!collapsed && <span>{item.label}</span>}
                </UnstyledButton>
              );

              return collapsed ? (
                <Tooltip
                  key={item.href}
                  label={item.label}
                  position="right"
                  withArrow
                >
                  {buttonContent}
                </Tooltip>
              ) : (
                <Box key={item.href}>{buttonContent}</Box>
              );
            })}

          {/* Admin Group Accordion */}
          {user?.isAdmin && !collapsed && (
            <Box mt={12}>
              <UnstyledButton
                onClick={() => setAdminMenuOpen((o) => !o)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md, 10px)",
                  color: isDark
                    ? "var(--text-muted, #64748B)"
                    : "var(--text-muted, #94A3B8)",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                <span>{t("navbar.avatar.admin") || "System Administration"}</span>
                {adminMenuOpen ? (
                  <TbChevronDown size={14} />
                ) : (
                  <TbChevronRight size={14} />
                )}
              </UnstyledButton>

              <Collapse in={adminMenuOpen}>
                <Stack spacing={2} mt={4} pl={8}>
                  {adminNavItems
                    .filter((item) => item.show)
                    .map((item) => {
                      const active = isActive(item);
                      const Icon = item.icon;
                      return (
                        <UnstyledButton
                          key={item.href}
                          component={Link}
                          href={item.href}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "var(--radius-sm, 6px)",
                            backgroundColor: active
                              ? isDark
                                ? "var(--brand-primary-subtle, rgba(59, 130, 246, 0.12))"
                                : "var(--brand-primary-subtle, rgba(37, 99, 235, 0.08))"
                              : "transparent",
                            color: active
                              ? "var(--brand-primary)"
                              : isDark
                                ? "var(--text-secondary, #94A3B8)"
                                : "var(--text-secondary, #475569)",
                            fontSize: 13,
                            fontWeight: active ? 600 : 500,
                            "&:hover": {
                              backgroundColor: isDark
                                ? "var(--surface-2, #1C2430)"
                                : "var(--surface-2, #E2E8F0)",
                            },
                          }}
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </UnstyledButton>
                      );
                    })}
                </Stack>
              </Collapse>
            </Box>
          )}
        </Stack>
      </Box>

      {/* Bottom Profile / Quota Section Fixed at Bottom */}
      <Box sx={{ flexShrink: 0, pt: 16 }}>
        {/* System Disk Usage Storage Bar */}
        {diskUsage && !collapsed && (
          <Box
            mb={16}
            p={12}
            sx={{
              backgroundColor: isDark
                ? "var(--surface-1, #151B24)"
                : "var(--surface-1, #F1F5F9)",
              borderRadius: "var(--radius-md, 10px)",
              border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
            }}
          >
            <Group position="apart" mb={6}>
              <Text size="xs" weight={600}>
                Disk Quota
              </Text>
              <Text size="xs" color="dimmed" className="font-mono">
                {diskUsage.percentage}%
              </Text>
            </Group>
            <Progress
              value={diskUsage.percentage}
              size="xs"
              radius="xl"
              styles={{
                bar: {
                  background:
                    diskUsage.percentage > 85
                      ? "var(--state-danger, #EF4444)"
                      : "var(--brand-gradient)",
                },
              }}
            />
            <Text
              size="xs"
              color="dimmed"
              mt={6}
              className="font-mono"
              sx={{ fontSize: 11 }}
            >
              {diskUsage.usedFormatted} of {diskUsage.totalFormatted}
            </Text>
          </Box>
        )}

        {/* Quick Theme Switcher */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            marginBottom: 8,
          }}
        >
          {collapsed ? (
            <Tooltip
              label={colorScheme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
              position="right"
              withArrow
            >
              <ActionIcon
                size="md"
                variant="subtle"
                onClick={() => toggleColorScheme()}
                sx={{
                  borderRadius: "var(--radius-md, 8px)",
                  color: isDark ? "#F8FAFC" : "#0F172A",
                }}
              >
                {colorScheme === "dark" ? <TbSun size={18} /> : <TbMoon size={18} />}
              </ActionIcon>
            </Tooltip>
          ) : (
            <UnstyledButton
              onClick={() => toggleColorScheme()}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 10px",
                width: "100%",
                borderRadius: "var(--radius-md, 8px)",
                backgroundColor: isDark
                  ? "var(--surface-1, #151B24)"
                  : "var(--surface-1, #F1F5F9)",
                border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
                color: isDark ? "#F8FAFC" : "#0F172A",
                fontSize: 12,
                fontWeight: 500,
                transition: "all 150ms ease",
                "&:hover": {
                  borderColor: "var(--brand-primary)",
                },
              }}
            >
              {colorScheme === "dark" ? <TbSun size={16} /> : <TbMoon size={16} />}
              <span>{colorScheme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </UnstyledButton>
          )}
        </Box>

        {/* User Session Quick Profile */}
        {user ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "space-between",
              padding: collapsed ? "8px" : "10px 12px",
              borderRadius: "var(--radius-md, 10px)",
              backgroundColor: isDark
                ? "var(--surface-1, #151B24)"
                : "var(--surface-1, #F1F5F9)",
              border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
            }}
          >
            <Group spacing={10} noWrap>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--brand-gradient)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Box>
              {!collapsed && (
                <Box sx={{ overflow: "hidden" }}>
                  <Text
                    size="sm"
                    weight={600}
                    sx={{
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user.username}
                  </Text>
                  <Text size="xs" color="dimmed" sx={{ fontSize: 11 }}>
                    {user.isAdmin ? "Administrator" : "Standard User"}
                  </Text>
                </Box>
              )}
            </Group>
          </Box>
        ) : (
          !collapsed && (
            <Group spacing={8}>
              <Button
                component={Link}
                href="/auth/signIn"
                variant="secondary"
                size="xs"
                fullWidth
              >
                {t("navbar.signin") || "Sign In"}
              </Button>
            </Group>
          )
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;
