import {
  Box,
  Col,
  Grid,
  Group,
  Progress,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  TbAdjustmentsHorizontal,
  TbArrowRight,
  TbBucket,
  TbCloudUpload,
  TbDatabase,
  TbFolders,
  TbMail,
  TbPalette,
  TbRefresh,
  TbServer,
  TbSettings,
  TbShieldCheck,
  TbUsers,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import Meta from "../../components/Meta";
import useTranslate from "../../hooks/useTranslate.hook";
import configService from "../../services/config.service";
import shareService from "../../services/share.service";
import systemService, { SystemInfo } from "../../services/system.service";
import userService from "../../services/user.service";
import { MyShare } from "../../types/share.type";
import User from "../../types/user.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";

const Admin = () => {
  const t = useTranslate();
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [shares, setShares] = useState<MyShare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      configService
        .isNewReleaseAvailable()
        .then((available) => setIsUpdateAvailable(available))
        .catch(() => {}),
      systemService
        .getSystemInfo()
        .then((info) => setSystemInfo(info))
        .catch(() => {}),
      userService
        .list()
        .then((data) => setUsers(data))
        .catch(() => {}),
      shareService
        .list()
        .then((data) => setShares(data))
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const totalUploadedBytes = shares.reduce((acc, s) => acc + (s.size || 0), 0);
  const usedBytes = systemInfo?.used || totalUploadedBytes;
  const totalBytes = systemInfo?.total || 1;
  const usedPercent = Math.min(100, Math.round((usedBytes / totalBytes) * 100));

  const adminCount = users.filter((u) => u.isAdmin).length;

  return (
    <Box>
      <Meta title={t("admin.title") || "Admin Center"} />

      {/* Header Banner */}
      <Group position="apart" mb={28} align="flex-start">
        <Stack spacing={4}>
          <Group spacing={10}>
            <Title order={2} sx={{ letterSpacing: "-0.02em", fontWeight: 800 }}>
              {t("admin.title") || "System Administration"}
            </Title>
            <Badge variant="primary" size="md">
              Control Panel
            </Badge>
          </Group>
          <Text size="sm" color="dimmed">
            Manage system instances, global user accounts, file shares, security
            policies, and server configurations.
          </Text>
        </Stack>

        <Group spacing={10}>
          {isUpdateAvailable && (
            <Button
              component="a"
              href="https://github.com/zAxn1e/fynvi-share/releases/latest"
              target="_blank"
              variant="warning"
              size="sm"
              leftIcon={<TbRefresh size={16} />}
            >
              Update Available
            </Button>
          )}

          <Button
            component={Link}
            href="/admin/config/general"
            variant="secondary"
            size="sm"
            leftIcon={<TbSettings size={16} />}
          >
            All Settings
          </Button>
        </Group>
      </Group>

      {/* Metrics Row */}
      <Grid gutter="md" mb={28}>
        {/* Total Users Metric */}
        <Col xs={12} sm={6} md={3}>
          <Card padded sx={{ height: "100%" }}>
            <Group position="apart" mb={10}>
              <Text size="xs" weight={600} color="dimmed">
                REGISTERED USERS
              </Text>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm, 6px)",
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--brand-primary, #3B82F6)",
                }}
              >
                <TbUsers size={18} />
              </Box>
            </Group>
            <Text size="xl" weight={800} className="font-mono">
              {loading ? "..." : users.length}
            </Text>
            <Text size="xs" color="dimmed" mt={4}>
              {adminCount} administrator account{adminCount !== 1 ? "s" : ""}
            </Text>
          </Card>
        </Col>

        {/* Global Shares Metric */}
        <Col xs={12} sm={6} md={3}>
          <Card padded sx={{ height: "100%" }}>
            <Group position="apart" mb={10}>
              <Text size="xs" weight={600} color="dimmed">
                GLOBAL SHARES
              </Text>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm, 6px)",
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#10B981",
                }}
              >
                <TbFolders size={18} />
              </Box>
            </Group>
            <Text size="xl" weight={800} className="font-mono">
              {loading ? "..." : shares.length}
            </Text>
            <Text size="xs" color="dimmed" mt={4}>
              {byteToHumanSizeString(totalUploadedBytes)} active files
            </Text>
          </Card>
        </Col>

        {/* Storage Usage Metric */}
        <Col xs={12} sm={6} md={3}>
          <Card padded sx={{ height: "100%" }}>
            <Group position="apart" mb={10}>
              <Text size="xs" weight={600} color="dimmed">
                STORAGE OCCUPIED
              </Text>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm, 6px)",
                  backgroundColor: "rgba(245, 158, 11, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#F59E0B",
                }}
              >
                <TbDatabase size={18} />
              </Box>
            </Group>
            <Text size="xl" weight={800} className="font-mono">
              {usedPercent}%
            </Text>
            <Text size="xs" color="dimmed" mt={4}>
              {byteToHumanSizeString(usedBytes)} of{" "}
              {byteToHumanSizeString(totalBytes)}
            </Text>
          </Card>
        </Col>

        {/* Server Status Metric */}
        <Col xs={12} sm={6} md={3}>
          <Card padded sx={{ height: "100%" }}>
            <Group position="apart" mb={10}>
              <Text size="xs" weight={600} color="dimmed">
                SYSTEM HEALTH
              </Text>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm, 6px)",
                  backgroundColor: "rgba(6, 182, 212, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#06B6D4",
                }}
              >
                <TbShieldCheck size={18} />
              </Box>
            </Group>
            <Group spacing={8} align="center">
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                  boxShadow: "0 0 8px #10B981",
                }}
              />
              <Text size="md" weight={700}>
                Online & Healthy
              </Text>
            </Group>
            <Text size="xs" color="dimmed" mt={4} className="font-mono">
              Version v{process.env.VERSION || "0.1.0"}
            </Text>
          </Card>
        </Col>
      </Grid>

      {/* Storage Quota Detailed Progress Card */}
      {systemInfo && (
        <Card mb={28} padded>
          <Group position="apart" mb={12}>
            <Group spacing={10}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "var(--radius-md, 10px)",
                  backgroundColor:
                    "var(--brand-primary-subtle, rgba(59, 130, 246, 0.12))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--brand-primary, #3B82F6)",
                }}
              >
                <TbServer size={22} />
              </Box>
              <Stack spacing={2}>
                <Text size="sm" weight={600}>
                  Host Disk Space Capacity
                </Text>
                <Text size="xs" color="dimmed">
                  {byteToHumanSizeString(usedBytes)} used ({usedPercent}%) •{" "}
                  {byteToHumanSizeString(Math.max(0, totalBytes - usedBytes))}{" "}
                  free space remaining
                </Text>
              </Stack>
            </Group>

            <Text size="sm" weight={700} className="font-mono">
              {byteToHumanSizeString(usedBytes)} /{" "}
              {byteToHumanSizeString(totalBytes)}
            </Text>
          </Group>

          <Progress
            value={usedPercent}
            size="md"
            radius="xl"
            styles={{
              bar: {
                background:
                  usedPercent > 85
                    ? "var(--state-danger, #EF4444)"
                    : "var(--brand-gradient, linear-gradient(135deg, #3B82F6 0%, #2563EB 100%))",
              },
            }}
          />
        </Card>
      )}

      {/* Main Administrative Modules Grid */}
      <Title order={4} mb={16} sx={{ fontWeight: 700 }}>
        Administrative Modules
      </Title>

      <Grid gutter="lg" mb={32}>
        {/* Users Management */}
        <Col xs={12} sm={6} md={4}>
          <Card interactive padded sx={{ height: "100%" }}>
            <Link
              href="/admin/users"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Stack spacing={14} justify="space-between" sx={{ flex: 1 }}>
                <Box>
                  <Group position="apart" mb={12}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "var(--radius-md, 10px)",
                        backgroundColor: "rgba(59, 130, 246, 0.14)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--brand-primary, #3B82F6)",
                      }}
                    >
                      <TbUsers size={24} />
                    </Box>
                    <Badge variant="primary" size="sm">
                      {users.length} Users
                    </Badge>
                  </Group>
                  <Text size="sm" weight={700} mb={4}>
                    {t("admin.button.users") || "User Management"}
                  </Text>
                  <Text size="xs" color="dimmed" sx={{ lineHeight: 1.5 }}>
                    Create accounts, modify storage limits, reset passwords, or
                    manage administrator permissions.
                  </Text>
                </Box>

                <Group
                  spacing={6}
                  sx={{
                    color: "var(--brand-primary, #3B82F6)",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <span>{t("admin.quickActions.users")}</span>
                  <TbArrowRight size={15} />
                </Group>
              </Stack>
            </Link>
          </Card>
        </Col>

        {/* Global Shares */}
        <Col xs={12} sm={6} md={4}>
          <Card interactive padded sx={{ height: "100%" }}>
            <Link
              href="/admin/shares"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Stack spacing={14} justify="space-between" sx={{ flex: 1 }}>
                <Box>
                  <Group position="apart" mb={12}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "var(--radius-md, 10px)",
                        backgroundColor: "rgba(16, 185, 129, 0.14)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#10B981",
                      }}
                    >
                      <TbFolders size={24} />
                    </Box>
                    <Badge variant="success" size="sm">
                      {shares.length} Shares
                    </Badge>
                  </Group>
                  <Text size="sm" weight={700} mb={4}>
                    {t("admin.button.shares") || "Global Shares"}
                  </Text>
                  <Text size="xs" color="dimmed" sx={{ lineHeight: 1.5 }}>
                    Inspect active shares across all users, inspect stored
                    files, check expiration dates, or delete shares.
                  </Text>
                </Box>

                <Group
                  spacing={6}
                  sx={{ color: "#10B981", fontSize: 13, fontWeight: 600 }}
                >
                  <span>{t("admin.quickActions.shares")}</span>
                  <TbArrowRight size={15} />
                </Group>
              </Stack>
            </Link>
          </Card>
        </Col>

        {/* Appearance & Branding */}
        <Col xs={12} sm={6} md={4}>
          <Card interactive padded sx={{ height: "100%" }}>
            <Link
              href="/admin/config/appearance"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Stack spacing={14} justify="space-between" sx={{ flex: 1 }}>
                <Box>
                  <Group position="apart" mb={12}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "var(--radius-md, 10px)",
                        backgroundColor: "rgba(139, 92, 246, 0.14)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#8B5CF6",
                      }}
                    >
                      <TbPalette size={24} />
                    </Box>
                    <Badge variant="outline" color="violet" size="sm">
                      Theme
                    </Badge>
                  </Group>
                  <Text size="sm" weight={700} mb={4}>
                    Appearance & Themes
                  </Text>
                  <Text size="xs" color="dimmed" sx={{ lineHeight: 1.5 }}>
                    Customize brand primary color, radius scales, default
                    light/dark mode, and upload animation styles.
                  </Text>
                </Box>

                <Group
                  spacing={6}
                  sx={{ color: "#8B5CF6", fontSize: 13, fontWeight: 600 }}
                >
                  <span>{t("admin.quickActions.colors")}</span>
                  <TbArrowRight size={15} />
                </Group>
              </Stack>
            </Link>
          </Card>
        </Col>

        {/* General & Security Configurations */}
        <Col xs={12} sm={6} md={4}>
          <Card interactive padded sx={{ height: "100%" }}>
            <Link
              href="/admin/config/general"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Stack spacing={14} justify="space-between" sx={{ flex: 1 }}>
                <Box>
                  <Group position="apart" mb={12}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "var(--radius-md, 10px)",
                        backgroundColor: "rgba(245, 158, 11, 0.14)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#F59E0B",
                      }}
                    >
                      <TbAdjustmentsHorizontal size={24} />
                    </Box>
                    <Badge variant="warning" size="sm">
                      Settings
                    </Badge>
                  </Group>
                  <Text size="sm" weight={700} mb={4}>
                    General & App Settings
                  </Text>
                  <Text size="xs" color="dimmed" sx={{ lineHeight: 1.5 }}>
                    Set application name, base URL, default language,
                    registration policies, and share expiration defaults.
                  </Text>
                </Box>

                <Group
                  spacing={6}
                  sx={{ color: "#F59E0B", fontSize: 13, fontWeight: 600 }}
                >
                  <span>{t("admin.quickActions.general")}</span>
                  <TbArrowRight size={15} />
                </Group>
              </Stack>
            </Link>
          </Card>
        </Col>

        {/* SMTP & Email */}
        <Col xs={12} sm={6} md={4}>
          <Card interactive padded sx={{ height: "100%" }}>
            <Link
              href="/admin/config/smtp"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Stack spacing={14} justify="space-between" sx={{ flex: 1 }}>
                <Box>
                  <Group position="apart" mb={12}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "var(--radius-md, 10px)",
                        backgroundColor: "rgba(6, 182, 212, 0.14)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#06B6D4",
                      }}
                    >
                      <TbMail size={24} />
                    </Box>
                    <Badge variant="outline" color="cyan" size="sm">
                      SMTP
                    </Badge>
                  </Group>
                  <Text size="sm" weight={700} mb={4}>
                    Email & Notifications
                  </Text>
                  <Text size="xs" color="dimmed" sx={{ lineHeight: 1.5 }}>
                    Configure outbound SMTP relay host, test email deliveries,
                    and share notification templates.
                  </Text>
                </Box>

                <Group
                  spacing={6}
                  sx={{ color: "#06B6D4", fontSize: 13, fontWeight: 600 }}
                >
                  <span>{t("admin.quickActions.email")}</span>
                  <TbArrowRight size={15} />
                </Group>
              </Stack>
            </Link>
          </Card>
        </Col>

        {/* Storage Backend (S3) */}
        <Col xs={12} sm={6} md={4}>
          <Card interactive padded sx={{ height: "100%" }}>
            <Link
              href="/admin/config/s3"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Stack spacing={14} justify="space-between" sx={{ flex: 1 }}>
                <Box>
                  <Group position="apart" mb={12}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "var(--radius-md, 10px)",
                        backgroundColor: "rgba(236, 72, 153, 0.14)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#EC4899",
                      }}
                    >
                      <TbBucket size={24} />
                    </Box>
                    <Badge variant="outline" color="pink" size="sm">
                      S3 Storage
                    </Badge>
                  </Group>
                  <Text size="sm" weight={700} mb={4}>
                    Object Storage (S3)
                  </Text>
                  <Text size="xs" color="dimmed" sx={{ lineHeight: 1.5 }}>
                    Connect Amazon S3, MinIO, Cloudflare R2, or Wasabi buckets
                    for scalable distributed file storage.
                  </Text>
                </Box>

                <Group
                  spacing={6}
                  sx={{ color: "#EC4899", fontSize: 13, fontWeight: 600 }}
                >
                  <span>{t("admin.quickActions.s3")}</span>
                  <TbArrowRight size={15} />
                </Group>
              </Stack>
            </Link>
          </Card>
        </Col>
      </Grid>
    </Box>
  );
};

export default Admin;
