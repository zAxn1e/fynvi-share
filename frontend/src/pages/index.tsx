import {
  ActionIcon,
  Avatar,
  Box,
  Col,
  Divider,
  Grid,
  Group,
  Progress,
  Stack,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useModals } from "@mantine/modals";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  TbArrowsExchange,
  TbBolt,
  TbCheck,
  TbChevronRight,
  TbClock,
  TbCloudUpload,
  TbCopy,
  TbDownload,
  TbExternalLink,
  TbEye,
  TbFileCode,
  TbFileZip,
  TbFolders,
  TbLock,
  TbPhoto,
  TbPlus,
  TbServer,
  TbShieldCheck,
  TbSparkles,
  TbUsers,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import showShareLinkModal from "../components/account/showShareLinkModal";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import Logo from "../components/Logo";
import Meta from "../components/Meta";
import { Dropzone } from "../components/upload/Dropzone";
import useConfig from "../hooks/config.hook";
import useTranslate from "../hooks/useTranslate.hook";
import useUser from "../hooks/user.hook";
import pendingUploadService from "../services/pendingUpload.service";
import shareService from "../services/share.service";
import systemService, { SystemInfo } from "../services/system.service";
import { FileUpload } from "../types/File.type";
import { MyShare } from "../types/share.type";
import { byteToHumanSizeString } from "../utils/fileSize.util";
import toast from "../utils/toast.util";

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  const config = useConfig();
  const modals = useModals();
  const t = useTranslate();
  const theme = useMantineTheme();

  const [shares, setShares] = useState<MyShare[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const appName = config.get("general.appName") || "Fynvi Share";
  const allowRegistration = config.get("share.allowRegistration");
  const primaryColor = theme.colors[theme.primaryColor]?.[6] || "var(--brand-primary)";
  const isDark = theme.colorScheme === "dark";

  useEffect(() => {
    if (user) {
      Promise.all([
        shareService.getMyShares().then((data) => setShares(data)),
        user.isAdmin
          ? systemService.getSystemInfo().then((info) => setSystemInfo(info))
          : Promise.resolve(),
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleFilesAddedFromHome = (files: FileUpload[]) => {
    if (files.length > 0) {
      pendingUploadService.setPendingFiles(files);
      router.push("/upload");
    }
  };

  // Global paste handler on Home page
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const pastedFiles: FileUpload[] = [];

      if (clipboardData.files && clipboardData.files.length > 0) {
        for (let i = 0; i < clipboardData.files.length; i++) {
          const file = clipboardData.files[i] as FileUpload;
          if (file) {
            file.uploadingProgress = 0;
            pastedFiles.push(file);
          }
        }
      } else if (clipboardData.items && clipboardData.items.length > 0) {
        for (let i = 0; i < clipboardData.items.length; i++) {
          const item = clipboardData.items[i];
          if (item && item.kind === "file") {
            const file = item.getAsFile();
            if (file) {
              const fileName =
                file.name && file.name !== "image.png"
                  ? file.name
                  : `pasted-image-${Date.now()}-${i + 1}.png`;
              const safeFile = new File([file], fileName, {
                type: file.type || "image/png",
              }) as FileUpload;
              safeFile.uploadingProgress = 0;
              pastedFiles.push(safeFile);
            }
          }
        }
      }

      if (pastedFiles.length > 0) {
        pendingUploadService.setPendingFiles(pastedFiles);
        router.push("/upload");
      }
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, [router]);

  const totalUploadedBytes = shares.reduce((acc, s) => acc + (s.size || 0), 0);
  const totalViews = shares.reduce((acc, s) => acc + (s.views || 0), 0);
  const activeShares = shares.filter(
    (s) =>
      moment(s.expiration).unix() === 0 ||
      moment(s.expiration).isAfter(moment()),
  );

  const usedBytes = systemInfo?.used || totalUploadedBytes;
  const totalBytes =
    systemInfo?.total ||
    (user?.shareSizeLimit ? parseInt(user.shareSizeLimit) : 0);
  const usedPercent =
    totalBytes > 0
      ? Math.min(100, Math.round((usedBytes / totalBytes) * 100))
      : 0;

  // Guest / Public Landing Page
  if (!user) {
    return (
      <Box py={32} sx={{ position: "relative", overflow: "hidden" }}>
        <Meta
          title="Home"
          description="Fast, secure, and customizable self-hosted file sharing with instant media previews and end-to-end chunk uploads."
        />

        {/* Hero Section */}
        <Stack
          align="center"
          spacing={20}
          sx={{
            textAlign: "center",
            maxWidth: 740,
            margin: "0 auto 36px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              padding: "4px 14px",
              borderRadius: 20,
              backgroundColor: "var(--brand-primary-subtle, rgba(37, 99, 235, 0.12))",
              border: "1px solid var(--border-focus, rgba(59, 130, 246, 0.3))",
              color: "var(--brand-primary)",
              fontSize: 13,
              fontWeight: 600,
              alignItems: "center",
              gap: 6,
            }}
          >
            <TbSparkles size={15} />
            <span>Fast, Secure & Self-Hosted File Sharing</span>
          </Box>

          <Stack spacing={10} align="center">
            <Title
              order={1}
              sx={{
                fontSize: 38,
                letterSpacing: "-0.03em",
                fontWeight: 800,
                lineHeight: 1.15,
                "@media (max-width: 768px)": {
                  fontSize: 28,
                },
              }}
            >
              Share files seamlessly with{" "}
              <span style={{ color: primaryColor }}>{appName}</span>
            </Title>
            <Text
              size="md"
              color="dimmed"
              sx={{ maxWidth: 580, lineHeight: 1.6 }}
            >
              End-to-end resumable chunk transfers, instant in-browser media previews, password protection, and custom link expirations.
            </Text>
          </Stack>

          <Group spacing={12} pt={4}>
            <Button
              component={Link}
              href="/auth/signIn"
              variant="secondary"
              size="md"
            >
              Sign In
            </Button>

            {allowRegistration && (
              <Button
                component={Link}
                href="/auth/signUp"
                variant="subtle"
                size="md"
              >
                Create Account
              </Button>
            )}
          </Group>
        </Stack>

        {/* Direct In-Landing Dropzone */}
        <Box sx={{ maxWidth: 800, margin: "0 auto 48px", position: "relative", zIndex: 1 }}>
          <Dropzone
            onFilesChanged={handleFilesAddedFromHome}
            title="Drop files or click here to upload immediately"
          />
        </Box>

        {/* Feature Highlights Grid */}
        <Box sx={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Grid gutter="lg">
            <Col xs={12} sm={4}>
              <Card padded>
                <Stack spacing={12}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      backgroundColor: isDark
                        ? "rgba(37, 99, 235, 0.14)"
                        : "rgba(37, 99, 235, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: primaryColor,
                    }}
                  >
                    <TbBolt size={22} />
                  </Box>
                  <Text size="sm" weight={600}>
                    Resumable Chunk Engine
                  </Text>
                  <Text size="xs" color="dimmed" sx={{ lineHeight: 1.5 }}>
                    Upload large files and full directories reliably with automatic chunk retries and live speed metrics.
                  </Text>
                </Stack>
              </Card>
            </Col>

            <Col xs={12} sm={4}>
              <Card padded>
                <Stack spacing={12}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      backgroundColor: isDark
                        ? "rgba(16, 185, 129, 0.14)"
                        : "rgba(16, 185, 129, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#10B981",
                    }}
                  >
                    <TbShieldCheck size={22} />
                  </Box>
                  <Text size="sm" weight={600}>
                    Privacy & Password Locks
                  </Text>
                  <Text size="xs" color="dimmed" sx={{ lineHeight: 1.5 }}>
                    Set custom expiration timers, view limits, and bcrypt password protection for every shared link.
                  </Text>
                </Stack>
              </Card>
            </Col>

            <Col xs={12} sm={4}>
              <Card padded>
                <Stack spacing={12}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      backgroundColor: isDark
                        ? "rgba(245, 158, 11, 0.14)"
                        : "rgba(245, 158, 11, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#F59E0B",
                    }}
                  >
                    <TbPhoto size={22} />
                  </Box>
                  <Text size="sm" weight={600}>
                    Rich In-Browser Inspector
                  </Text>
                  <Text size="xs" color="dimmed" sx={{ lineHeight: 1.5 }}>
                    Preview images, HTML5 video, audio, PDFs, and code directly with detailed metadata inspection.
                  </Text>
                </Stack>
              </Card>
            </Col>
          </Grid>
        </Box>
      </Box>
    );
  }

  // Authenticated Dashboard
  return (
    <Box sx={{ position: "relative" }}>
      <Meta
        title="Home"
        description={`${appName} dashboard and active shares overview.`}
      />

      {/* Subtle Ambient Glow */}
      <Box
        sx={{
          position: "absolute",
          top: -40,
          right: -60,
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, rgba(37, 99, 235, 0) 70%)"
            : "radial-gradient(circle, rgba(37, 99, 235, 0.06) 0%, rgba(37, 99, 235, 0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Header Banner */}
      <Group position="apart" mb={24} noWrap sx={{ overflow: "hidden", position: "relative", zIndex: 1 }}>
        <Group spacing={14} noWrap sx={{ overflow: "hidden" }}>
          <Avatar
            radius="md"
            size="md"
            color={theme.primaryColor}
            sx={{ fontWeight: 700 }}
          >
            {user.username.substring(0, 2).toUpperCase()}
          </Avatar>
          <Stack spacing={1} sx={{ overflow: "hidden" }}>
            <Group spacing={8}>
              <Title order={3} sx={{ letterSpacing: "-0.02em" }}>
                Welcome back, {user.username}
              </Title>
              {user.isAdmin && (
                <Badge variant="primary" size="sm">
                  Admin
                </Badge>
              )}
            </Group>
            <Text size="xs" color="dimmed">
              Manage your active shares, inspect files, or drop files below to upload immediately.
            </Text>
          </Stack>
        </Group>

        <Group spacing={8} noWrap>
          <Button
            component={Link}
            href="/account/reverseShares"
            variant="secondary"
            size="xs"
            leftIcon={<TbArrowsExchange size={14} />}
          >
            Reverse Share
          </Button>
        </Group>
      </Group>

      {/* Inline Quick Upload Dropzone */}
      <Box mb={24} sx={{ position: "relative", zIndex: 1 }}>
        <Dropzone
          onFilesChanged={handleFilesAddedFromHome}
          title="Drag & drop files or click here to start a new share"
          maxShareSize={
            user.shareSizeLimit
              ? parseInt(user.shareSizeLimit)
              : parseInt(config.get("share.maxSize"))
          }
        />
      </Box>

      {/* Bento Metric Cards */}
      <Grid gutter="md" mb={28} sx={{ position: "relative", zIndex: 1 }}>
        <Col xs={12} sm={4}>
          <Card padded>
            <Group position="apart">
              <Stack spacing={4}>
                <Text size="xs" color="dimmed" weight={500}>
                  Active Shares
                </Text>
                <Text size="xl" weight={700} className="font-mono">
                  {activeShares.length}
                </Text>
                <Text size="xs" color="dimmed">
                  {shares.length - activeShares.length} expired
                </Text>
              </Stack>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: isDark
                    ? "rgba(37, 99, 235, 0.14)"
                    : "rgba(37, 99, 235, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: primaryColor,
                }}
              >
                <TbFolders size={24} />
              </Box>
            </Group>
          </Card>
        </Col>

        <Col xs={12} sm={4}>
          <Card padded>
            <Group position="apart">
              <Stack spacing={4}>
                <Text size="xs" color="dimmed" weight={500}>
                  Total Link Views
                </Text>
                <Text size="xl" weight={700} className="font-mono">
                  {totalViews.toLocaleString()}
                </Text>
                <Text size="xs" color="dimmed">
                  Across all shared items
                </Text>
              </Stack>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: isDark
                    ? "rgba(16, 185, 129, 0.14)"
                    : "rgba(16, 185, 129, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#10B981",
                }}
              >
                <TbEye size={24} />
              </Box>
            </Group>
          </Card>
        </Col>

        <Col xs={12} sm={4}>
          <Card padded>
            <Group position="apart">
              <Stack spacing={4}>
                <Text size="xs" color="dimmed" weight={500}>
                  Storage Capacity
                </Text>
                <Text size="xl" weight={700} className="font-mono">
                  {byteToHumanSizeString(totalUploadedBytes)}
                </Text>
                <Text size="xs" color="dimmed">
                  {totalBytes > 0 ? `${usedPercent}% quota used` : "Unlimited quota"}
                </Text>
              </Stack>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: isDark
                    ? "rgba(245, 158, 11, 0.14)"
                    : "rgba(245, 158, 11, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#F59E0B",
                }}
              >
                <TbServer size={24} />
              </Box>
            </Group>
          </Card>
        </Col>
      </Grid>

      {/* Recent Shares Section */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Group position="apart" mb={14}>
          <Text size="sm" weight={600}>
            Recent Active Shares
          </Text>
          {shares.length > 0 && (
            <Button
              component={Link}
              href="/account/shares"
              variant="subtle"
              size="xs"
              rightIcon={<TbChevronRight size={14} />}
            >
              View All Shares ({shares.length})
            </Button>
          )}
        </Group>

        {shares.length === 0 ? (
          <EmptyState
            icon={TbFolders}
            title="No shares created yet"
            description="Drag files into the dropzone above or paste anywhere to share files."
          />
        ) : (
          <Stack spacing={8}>
            {shares.slice(0, 5).map((share) => {
              const isExpired =
                moment(share.expiration).unix() !== 0 &&
                moment(share.expiration).isBefore(moment());

              return (
                <Card key={share.id} padded={false} interactive>
                  <Group position="apart" p="14px 18px" noWrap>
                    <Group spacing={14} noWrap sx={{ overflow: "hidden" }}>
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: 8,
                          backgroundColor: isDark
                            ? "rgba(37, 99, 235, 0.14)"
                            : "rgba(37, 99, 235, 0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: primaryColor,
                          flexShrink: 0,
                        }}
                      >
                        <TbFolders size={20} />
                      </Box>
                      <Stack spacing={2} sx={{ overflow: "hidden" }}>
                        <Group spacing={6} noWrap>
                          <Text
                            size="sm"
                            weight={600}
                            truncate
                            sx={{ maxWidth: 280 }}
                          >
                            {share.name || `Share #${share.id}`}
                          </Text>
                          {share.security?.passwordProtected && (
                            <Tooltip label="Password protected" withArrow>
                              <Box
                                sx={{
                                  display: "flex",
                                  color: "#F59E0B",
                                  flexShrink: 0,
                                }}
                              >
                                <TbLock size={14} />
                              </Box>
                            </Tooltip>
                          )}
                        </Group>
                        <Text
                          size="xs"
                          color="dimmed"
                          className="font-mono"
                        >
                          {share.files?.length || 0} file
                          {share.files?.length === 1 ? "" : "s"} •{" "}
                          {byteToHumanSizeString(share.size || 0)}
                        </Text>
                      </Stack>
                    </Group>

                    <Group spacing={12} noWrap sx={{ flexShrink: 0 }}>
                      <Group spacing={4}>
                        <TbClock size={14} color="#9CA3AF" />
                        <Text size="xs" color={isExpired ? "red" : "dimmed"}>
                          {moment(share.expiration).unix() === 0
                            ? "Never expires"
                            : moment(share.expiration).fromNow()}
                        </Text>
                      </Group>

                      <Badge
                        variant={isExpired ? "danger" : "success"}
                        size="sm"
                        dot
                      >
                        {isExpired ? "Expired" : "Active"}
                      </Badge>

                      <Tooltip label="Copy Link" withArrow>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          onClick={() => {
                            showShareLinkModal(
                              modals,
                              share.id,
                              config.get("general.appUrl"),
                              config.get("general.appUrl", true),
                            );
                          }}
                        >
                          <TbCopy size={15} />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label="Open Share" withArrow>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          component={Link}
                          href={`/share/${share.id}`}
                        >
                          <TbExternalLink size={15} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
