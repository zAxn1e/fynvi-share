import {
  Box,
  Divider,
  Drawer,
  Group,
  Stack,
  Text,
  UnstyledButton,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import {
  TbArrowsExchange,
  TbCloudUpload,
  TbFolders,
  TbHome,
  TbInbox,
  TbLogout,
  TbMoon,
  TbServer,
  TbSettings,
  TbShieldLock,
  TbSun,
  TbUsers,
  TbX,
} from "react-icons/tb";
import useTranslate from "../../hooks/useTranslate.hook";
import authService from "../../services/auth.service";
import { User } from "../../types/user.type";
import Logo from "../Logo";
import { Button } from "../common/Button";
import { LanguageMenu } from "../common/LanguageMenu";

export interface MobileNavProps {
  opened: boolean;
  onClose: () => void;
  user?: User | null;
  onOpenUpload?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  opened,
  onClose,
  user,
  onOpenUpload,
}) => {
  const router = useRouter();
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = theme.colorScheme === "dark";
  const t = useTranslate();

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return router.pathname === href;
    }
    return router.pathname.startsWith(href);
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      size="280px"
      padding="md"
      withCloseButton={false}
      styles={{
        content: {
          backgroundColor: isDark ? "var(--surface-0, #0F1319)" : "var(--surface-0, #FFFFFF)",
          borderRight: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
        },
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          {/* Header */}
          <Group position="apart" align="center" mb={24}>
            <Logo height={30} />
            <UnstyledButton
              onClick={onClose}
              sx={{
                padding: 6,
                borderRadius: "var(--radius-md, 10px)",
                color: "var(--text-secondary, #94A3B8)",
              }}
            >
              <TbX size={20} />
            </UnstyledButton>
          </Group>

          {/* Quick Upload Action */}
          {onOpenUpload && (
            <Box mb={20}>
              <Button
                variant="primary"
                fullWidth
                leftIcon={<TbCloudUpload size={18} />}
                onClick={() => {
                  onClose();
                  onOpenUpload();
                }}
              >
                {t("navbar.upload") || "Upload Files"}
              </Button>
            </Box>
          )}

          {/* Navigation Links */}
          <Stack spacing={6}>
            <UnstyledButton
              component={Link}
              href="/"
              onClick={onClose}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: "var(--radius-md, 10px)",
                backgroundColor: isActive("/", true)
                  ? isDark
                    ? "var(--surface-1, #151B24)"
                    : "var(--surface-1, #F1F5F9)"
                  : "transparent",
                color: isActive("/", true)
                  ? "var(--brand-primary)"
                  : isDark
                    ? "var(--text-secondary, #94A3B8)"
                    : "var(--text-secondary, #475569)",
                fontWeight: isActive("/", true) ? 600 : 500,
              }}
            >
              <TbHome size={18} />
              <span>{t("navbar.home") || "Overview"}</span>
            </UnstyledButton>

            <UnstyledButton
              component={Link}
              href="/upload"
              onClick={onClose}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: "var(--radius-md, 10px)",
                backgroundColor: isActive("/upload")
                  ? isDark
                    ? "var(--surface-1, #151B24)"
                    : "var(--surface-1, #F1F5F9)"
                  : "transparent",
                color: isActive("/upload")
                  ? "var(--brand-primary)"
                  : isDark
                    ? "var(--text-secondary, #94A3B8)"
                    : "var(--text-secondary, #475569)",
                fontWeight: isActive("/upload") ? 600 : 500,
              }}
            >
              <TbCloudUpload size={18} />
              <span>{t("navbar.upload") || "Upload"}</span>
            </UnstyledButton>

            {user && (
              <>
                <UnstyledButton
                  component={Link}
                  href="/account/shares"
                  onClick={onClose}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md, 10px)",
                    backgroundColor: isActive("/account/shares")
                      ? isDark
                        ? "var(--surface-1, #151B24)"
                        : "var(--surface-1, #F1F5F9)"
                      : "transparent",
                    color: isActive("/account/shares")
                      ? isDark
                        ? "var(--brand-primary, #60A5FA)"
                        : "var(--brand-primary, #2563EB)"
                      : isDark
                        ? "var(--text-secondary, #94A3B8)"
                        : "var(--text-secondary, #475569)",
                    fontWeight: isActive("/account/shares") ? 600 : 500,
                  }}
                >
                  <TbFolders size={18} />
                  <span>{t("navbar.links.shares") || "My Shares"}</span>
                </UnstyledButton>

                <UnstyledButton
                  component={Link}
                  href="/account/reverseShares"
                  onClick={onClose}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md, 10px)",
                    backgroundColor: isActive("/account/reverseShares")
                      ? isDark
                        ? "var(--surface-1, #151B24)"
                        : "var(--surface-1, #F1F5F9)"
                      : "transparent",
                    color: isActive("/account/reverseShares")
                      ? isDark
                        ? "var(--brand-primary, #60A5FA)"
                        : "var(--brand-primary, #2563EB)"
                      : isDark
                        ? "var(--text-secondary, #94A3B8)"
                        : "var(--text-secondary, #475569)",
                    fontWeight: isActive("/account/reverseShares") ? 600 : 500,
                  }}
                >
                  <TbArrowsExchange size={18} />
                  <span>{t("navbar.links.reverse") || "Reverse Shares"}</span>
                </UnstyledButton>

                <UnstyledButton
                  component={Link}
                  href="/account"
                  onClick={onClose}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md, 10px)",
                    backgroundColor: isActive("/account", true)
                      ? isDark
                        ? "var(--surface-1, #151B24)"
                        : "var(--surface-1, #F1F5F9)"
                      : "transparent",
                    color: isActive("/account", true)
                      ? isDark
                        ? "var(--brand-primary, #60A5FA)"
                        : "var(--brand-primary, #2563EB)"
                      : isDark
                        ? "var(--text-secondary, #94A3B8)"
                        : "var(--text-secondary, #475569)",
                    fontWeight: isActive("/account", true) ? 600 : 500,
                  }}
                >
                  <TbSettings size={18} />
                  <span>{t("navbar.avatar.account") || "Account Settings"}</span>
                </UnstyledButton>
              </>
            )}

            {user?.isAdmin && (
              <>
                <Divider my={8} />
                <Text size="xs" color="dimmed" px={12} weight={600}>
                  ADMINISTRATION
                </Text>
                <UnstyledButton
                  component={Link}
                  href="/admin"
                  onClick={onClose}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md, 10px)",
                    color: isActive("/admin")
                      ? "var(--brand-primary, #60A5FA)"
                      : "var(--text-secondary, #94A3B8)",
                  }}
                >
                  <TbServer size={18} />
                  <span>{t("navbar.avatar.admin") || "Admin Center"}</span>
                </UnstyledButton>
              </>
            )}
          </Stack>
        </Box>

        {/* Footer / User Profile & Settings */}
        <Box pt={16}>
          {/* Mobile Utility Controls: Theme & Language */}
          <Group position="apart" mb={14} px={4}>
            <Group spacing={8}>
              <LanguageMenu variant="button" size="xs" />
            </Group>
            <UnstyledButton
              onClick={() => toggleColorScheme()}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: "var(--radius-md, 10px)",
                backgroundColor: isDark
                  ? "var(--surface-2, #1C2430)"
                  : "var(--surface-2, #E2E8F0)",
                color: isDark ? "#F8FAFC" : "#0F172A",
                fontSize: 12,
                fontWeight: 500,
                border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))",
              }}
            >
              {colorScheme === "dark" ? <TbSun size={15} /> : <TbMoon size={15} />}
              <span>{colorScheme === "dark" ? "Light" : "Dark"}</span>
            </UnstyledButton>
          </Group>

          <Divider mb={16} />
          {user ? (
            <Group position="apart">
              <Group spacing={10}>
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
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Box>
                <Box>
                  <Text size="sm" weight={600}>
                    {user.username}
                  </Text>
                  <Text size="xs" color="dimmed">
                    {user.email || (user.isAdmin ? "Administrator" : "User")}
                  </Text>
                </Box>
              </Group>

              <UnstyledButton
                onClick={() => {
                  authService.signOut();
                  window.location.href = "/";
                }}
                sx={{
                  color: "var(--state-danger, #EF4444)",
                  padding: 6,
                  borderRadius: "var(--radius-md, 10px)",
                }}
              >
                <TbLogout size={20} />
              </UnstyledButton>
            </Group>
          ) : (
            <Button
              component={Link}
              href="/auth/signIn"
              variant="secondary"
              fullWidth
              onClick={onClose}
            >
              {t("navbar.signin") || "Sign In"}
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default MobileNav;
