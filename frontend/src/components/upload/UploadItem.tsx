import {
  ActionIcon,
  Box,
  Group,
  Progress,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import React from "react";
import {
  TbAlertCircle,
  TbCheck,
  TbEye,
  TbFile,
  TbFileCode,
  TbFileDescription,
  TbFileZip,
  TbMovie,
  TbMusic,
  TbPhoto,
  TbPlayerPause,
  TbPlayerPlay,
  TbRefresh,
  TbTrash,
} from "react-icons/tb";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import { Badge, BadgeVariant } from "../common/Badge";

export interface UploadItemState {
  id: string;
  name: string;
  size: number;
  progress: number;
  uploadedBytes?: number;
  speed?: string;
  eta?: string;
  previewUrl?: string;
  file?: File;
  status:
    | "WAITING"
    | "UPLOADING"
    | "PAUSED"
    | "RETRYING"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED";
  errorMessage?: string;
}

export interface UploadItemProps {
  item: UploadItemState;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
  onInspect?: (item: UploadItemState) => void;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext)) {
    return <TbPhoto size={18} color="#60A5FA" />;
  }
  if (["mp4", "webm", "mkv", "avi", "mov"].includes(ext)) {
    return <TbMovie size={18} color="#A78BFA" />;
  }
  if (["mp3", "wav", "flac", "ogg", "m4a"].includes(ext)) {
    return <TbMusic size={18} color="#34D399" />;
  }
  if (["zip", "tar", "gz", "7z", "rar"].includes(ext)) {
    return <TbFileZip size={18} color="#FBBF24" />;
  }
  if (
    [
      "js",
      "ts",
      "jsx",
      "tsx",
      "py",
      "json",
      "html",
      "css",
      "yaml",
      "yml",
    ].includes(ext)
  ) {
    return <TbFileCode size={18} color="#F472B6" />;
  }
  if (["pdf", "txt", "md", "doc", "docx"].includes(ext)) {
    return <TbFileDescription size={18} color="#9CA3AF" />;
  }
  return <TbFile size={18} color="#9CA3AF" />;
};

export const UploadItem: React.FC<UploadItemProps> = ({
  item,
  onPause,
  onResume,
  onRetry,
  onRemove,
  onInspect,
}) => {
  const getStatusBadge = (): {
    label: string;
    variant: BadgeVariant;
    dot?: boolean;
  } => {
    switch (item.status) {
      case "WAITING":
        return { label: "Waiting", variant: "default" };
      case "UPLOADING":
        return { label: "Uploading", variant: "primary", dot: true };
      case "PAUSED":
        return { label: "Paused", variant: "warning" };
      case "RETRYING":
        return { label: "Retrying", variant: "warning", dot: true };
      case "PROCESSING":
        return { label: "Processing", variant: "info", dot: true };
      case "COMPLETED":
        return { label: "Completed", variant: "success" };
      case "FAILED":
        return { label: "Failed", variant: "danger" };
      case "CANCELLED":
        return { label: "Cancelled", variant: "default" };
      default:
        return { label: item.status, variant: "default" };
    }
  };

  const badge = getStatusBadge();
  const isFailed = item.status === "FAILED";
  const isCompleted = item.status === "COMPLETED";
  const isUploading = item.status === "UPLOADING";
  const isPaused = item.status === "PAUSED";

  const transferred = item.uploadedBytes
    ? byteToHumanSizeString(item.uploadedBytes)
    : byteToHumanSizeString((item.size * (item.progress || 0)) / 100);

  return (
    <Box
      sx={(theme) => {
        const isDark = theme.colorScheme === "dark";
        return {
          padding: "10px 14px",
          borderRadius: "var(--radius-md, 10px)",
          backgroundColor: isDark
            ? "var(--surface-1, #151B24)"
            : "var(--surface-0, #FFFFFF)",
          border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
          transition:
            "all var(--transition-fast, 150ms cubic-bezier(0.16, 1, 0.3, 1))",
          "&:hover": {
            backgroundColor: isDark
              ? "var(--surface-2, #1C2430)"
              : "var(--surface-1, #F1F5F9)",
          },
        };
      }}
    >
      <Group position="apart" align="center" noWrap mb={6}>
        <Group spacing={10} noWrap sx={{ overflow: "hidden", maxWidth: "65%" }}>
          {item.previewUrl ? (
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 6,
                overflow: "hidden",
                flexShrink: 0,
                border:
                  "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
                position: "relative",
              }}
            >
              {item.file?.type.startsWith("video/") ||
              item.name.match(/\.(mp4|webm|mov|mkv|avi)$/i) ? (
                <video
                  src={item.previewUrl}
                  muted
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.previewUrl}
                  alt={item.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </Box>
          ) : (
            <Box
              sx={(theme) => ({
                width: 32,
                height: 32,
                borderRadius: 6,
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? "var(--surface-2, #1C2430)"
                    : "var(--surface-1, #F1F5F9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              })}
            >
              {getFileIcon(item.name)}
            </Box>
          )}

          <Box sx={{ overflow: "hidden" }}>
            <Text
              size="sm"
              sx={{
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.name}
            </Text>
            <Group spacing={6}>
              <Text
                size="xs"
                color="dimmed"
                className="font-mono"
                sx={{ fontSize: 11 }}
              >
                {transferred} / {byteToHumanSizeString(item.size)}
              </Text>
              {item.speed && (
                <>
                  <Text size="xs" color="dimmed">
                    •
                  </Text>
                  <Text
                    size="xs"
                    color="blue"
                    className="font-mono"
                    sx={{ fontSize: 11 }}
                  >
                    {item.speed}
                  </Text>
                </>
              )}
              {item.eta && (
                <>
                  <Text size="xs" color="dimmed">
                    •
                  </Text>
                  <Text
                    size="xs"
                    color="dimmed"
                    className="font-mono"
                    sx={{ fontSize: 11 }}
                  >
                    ETA {item.eta}
                  </Text>
                </>
              )}
            </Group>
          </Box>
        </Group>

        <Group spacing={6} noWrap>
          <Badge variant={badge.variant} size="sm" dot={badge.dot}>
            {badge.label}
          </Badge>

          {isUploading && onPause && (
            <Tooltip label="Pause" withArrow>
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={() => onPause(item.id)}
                aria-label="Pause upload"
              >
                <TbPlayerPause size={14} />
              </ActionIcon>
            </Tooltip>
          )}

          {isPaused && onResume && (
            <Tooltip label="Resume" withArrow>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="blue"
                onClick={() => onResume(item.id)}
                aria-label="Resume upload"
              >
                <TbPlayerPlay size={14} />
              </ActionIcon>
            </Tooltip>
          )}

          {isFailed && onRetry && (
            <Tooltip label="Retry" withArrow>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="yellow"
                onClick={() => onRetry(item.id)}
                aria-label="Retry upload"
              >
                <TbRefresh size={14} />
              </ActionIcon>
            </Tooltip>
          )}

          {onInspect && (
            <Tooltip label="Inspect Details" withArrow>
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={() => onInspect(item)}
                aria-label="Inspect chunk details"
              >
                <TbEye size={14} />
              </ActionIcon>
            </Tooltip>
          )}

          {onRemove && (
            <Tooltip label="Remove from list" withArrow>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="red"
                onClick={() => onRemove(item.id)}
                aria-label="Remove item"
              >
                <TbTrash size={14} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>

      {/* Progress Bar */}
      <Progress
        value={item.progress}
        size="xs"
        radius="xl"
        styles={{
          bar: {
            background: isFailed
              ? "var(--state-danger, #EF4444)"
              : isCompleted
                ? "var(--state-success, #10B981)"
                : isPaused
                  ? "var(--state-warning, #F59E0B)"
                  : "var(--brand-gradient)",
          },
        }}
      />

      {item.errorMessage && (
        <Group spacing={4} mt={4}>
          <TbAlertCircle size={12} color="#EF4444" />
          <Text size="xs" color="red" sx={{ fontSize: 11 }}>
            {item.errorMessage}
          </Text>
        </Group>
      )}
    </Box>
  );
};

export default UploadItem;
