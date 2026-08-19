import {
  Box,
  Button,
  Group,
  MediaQuery,
  Navbar,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import {
  TbAdjustmentsHorizontal,
  TbArrowLeft,
  TbAt,
  TbBinaryTree,
  TbBucket,
  TbMail,
  TbPalette,
  TbScale,
  TbServerBolt,
  TbSettings,
  TbShare,
  TbSocial,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";

export const categories = [
  { name: "General", icon: <TbSettings size={18} /> },
  { name: "Appearance", icon: <TbPalette size={18} /> },
  { name: "Email", icon: <TbMail size={18} /> },
  { name: "Share", icon: <TbShare size={18} /> },
  { name: "SMTP", icon: <TbAt size={18} /> },
  { name: "OAuth", icon: <TbSocial size={18} /> },
  { name: "LDAP", icon: <TbBinaryTree size={18} /> },
  { name: "S3", icon: <TbBucket size={18} /> },
  { name: "Legal", icon: <TbScale size={18} /> },
  { name: "Cache", icon: <TbServerBolt size={18} /> },
];

const ConfigurationNavBar = ({
  categoryId,
  isMobileNavBarOpened,
  setIsMobileNavBarOpened,
}: {
  categoryId: string;
  isMobileNavBarOpened: boolean;
  setIsMobileNavBarOpened: Dispatch<SetStateAction<boolean>>;
}) => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  return (
    <Navbar
      p="16px 12px"
      hiddenBreakpoint="sm"
      hidden={!isMobileNavBarOpened}
      width={{ sm: 220, lg: 260 }}
      sx={{
        backgroundColor: "var(--surface-0, #0F1319)",
        borderRight:
          "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
        [theme.fn.smallerThan("sm")]: {
          height: "calc(100dvh - 64px)",
          maxHeight: "calc(100dvh - 64px)",
          overflowY: "auto",
        },
      }}
    >
      <Navbar.Section grow component={ScrollArea}>
        <Text
          size="xs"
          color="dimmed"
          px={10}
          mb={10}
          weight={600}
          sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
        >
          <FormattedMessage id="admin.config.title" />
        </Text>
        <Stack spacing={4}>
          {categories.map((category) => {
            const isActive =
              categoryId.toLowerCase() === category.name.toLowerCase();

            return (
              <UnstyledButton
                key={category.name}
                component={Link}
                href={`/admin/config/${category.name.toLowerCase()}`}
                onClick={() => setIsMobileNavBarOpened(false)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "var(--radius-md, 10px)",
                  backgroundColor: isActive
                    ? isDark
                      ? "var(--brand-primary-subtle, rgba(59, 130, 246, 0.14))"
                      : "var(--brand-primary-subtle, rgba(37, 99, 235, 0.09))"
                    : "transparent",
                  color: isActive
                    ? "var(--brand-primary, #3B82F6)"
                    : isDark
                      ? "var(--text-secondary, #94A3B8)"
                      : "var(--text-secondary, #475569)",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 13,
                  border: isActive
                    ? "1px solid var(--border-focus, rgba(59, 130, 246, 0.3))"
                    : "1px solid transparent",
                  transition: "all var(--transition-fast, 150ms ease)",
                  "&:hover": {
                    backgroundColor: isDark
                      ? "var(--surface-2, #1C2430)"
                      : "var(--surface-2, #E2E8F0)",
                    color: isDark ? "#FFFFFF" : "#0F172A",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {category.icon}
                </Box>
                <span>
                  <FormattedMessage
                    id={`admin.config.category.${category.name.toLowerCase()}`}
                  />
                </span>
              </UnstyledButton>
            );
          })}
        </Stack>
      </Navbar.Section>

      <MediaQuery largerThan="sm" styles={{ display: "none" }}>
        <Navbar.Section pt={12}>
          <Button
            fullWidth
            variant="light"
            component={Link}
            href="/admin"
            leftIcon={<TbArrowLeft size={16} />}
          >
            <FormattedMessage id="common.button.go-back" />
          </Button>
        </Navbar.Section>
      </MediaQuery>
    </Navbar>
  );
};

export default ConfigurationNavBar;
