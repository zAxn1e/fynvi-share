import {
  ActionIcon,
  Box,
  Collapse,
  Group,
  Progress,
  Stack,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import React, { useState } from "react";
import {
  TbChevronDown,
  TbChevronUp,
  TbPlayerPause,
  TbPlayerPlay,
  TbRefresh,
  TbTrash,
  TbX,
} from "react-icons/tb";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { UploadItem, UploadItemState } from "./UploadItem";

export interface UploadDrawerProps {
  items: UploadItemState[];
  isOpen?: boolean;
  onClose?: () => void;
  onPauseAll?: () => void;
  onResumeAll?: () => void;
  onCancelAll?: () => void;
  onRetryFailed?: () => void;
  onPauseItem?: (id: string) => void;
  onResumeItem?: (id: string) => void;
  onRetryItem?: (id: string) => void;
  onRemoveItem?: (id: string) => void;
  onInspectItem?: (item: UploadItemState) => void;
}

export const UploadDrawer: React.FC<UploadDrawerProps> = ({
  items,
  isOpen = true,
  onClose,
  onPauseAll,
  onResumeAll,
  onCancelAll,
  onRetryFailed,
  onPauseItem,
  onResumeItem,
  onRetryItem,
  onRemoveItem,
  onInspectItem,
}) => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";
  const [expanded, setExpanded] = useState(true);

  if (!isOpen || items.length === 0) return null;

  // Aggregate statistics
  const totalFiles = items.length;
  const completedFiles = items.filter((i) => i.status === "COMPLETED").length;
  const failedFiles = items.filter((i) => i.status === "FAILED").length;
  const uploadingFiles = items.filter((i) => i.status === "UPLOADING").length;
  const pausedFiles = items.filter((i) => i.status === "PAUSED").length;

  const totalBytes = items.reduce((sum, item) => sum + item.size, 0);
  const uploadedBytes = items.reduce((sum, item) => {
    if (item.status === "COMPLETED") return sum + item.size;
    return (
      sum + (item.uploadedBytes || (item.size * (item.progress || 0)) / 100)
    );
  }, 0);

  const overallProgress =
    totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0;
  const isAllComplete = completedFiles === totalFiles;
  const hasFailed = failedFiles > 0;
  const isAnyUploading = uploadingFiles > 0;
  const isAnyPaused = pausedFiles > 0;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 440,
        maxWidth: "calc(100vw - 48px)",
        backgroundColor: "var(--glass-bg, rgba(15, 19, 25, 0.75))",
        backdropFilter: "blur(var(--glass-blur, 16px))",
        WebkitBackdropFilter: "blur(var(--glass-blur, 16px))",
        border: "1px solid var(--border-medium, rgba(255, 255, 255, 0.13))",
        borderRadius: "var(--radius-xl, 20px)",
        boxShadow: isDark
          ? "var(--shadow-lg, 0 12px 32px rgba(0, 0, 0, 0.5))"
          : "var(--shadow-lg, 0 12px 32px rgba(15, 23, 42, 0.12))",
        zIndex: 1000,
        overflow: "hidden",
        transition:
          "all var(--transition-normal, 250ms cubic-bezier(0.16, 1, 0.3, 1))",
        [theme.fn.smallerThan("xs")]: {
          bottom: 12,
          right: 12,
          maxWidth: "calc(100vw - 24px)",
        },
      }}
    >
      {/* Header bar */}
      <Box
        p="14px 18px"
        sx={{
          backgroundColor: isDark
            ? "var(--surface-1, #151B24)"
            : "var(--surface-1, #F1F5F9)",
          borderBottom: expanded
            ? "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))"
            : "none",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Group position="apart" align="center">
          <Group spacing={10}>
            <Text size="sm" weight={600}>
              {isAllComplete
                ? "Uploads Completed"
                : `Uploading (${completedFiles}/${totalFiles})`}
            </Text>
            {hasFailed && (
              <Badge variant="danger" size="xs">
                {failedFiles} failed
              </Badge>
            )}
            {isAllComplete && (
              <Badge variant="success" size="xs">
                Done
              </Badge>
            )}
          </Group>

          <Group spacing={6} onClick={(e) => e.stopPropagation()}>
            {isAnyUploading && onPauseAll && (
              <Tooltip label="Pause all" withArrow>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={onPauseAll}
                  aria-label="Pause all uploads"
                >
                  <TbPlayerPause size={15} />
                </ActionIcon>
              </Tooltip>
            )}

            {isAnyPaused && onResumeAll && (
              <Tooltip label="Resume all" withArrow>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="blue"
                  onClick={onResumeAll}
                  aria-label="Resume all uploads"
                >
                  <TbPlayerPlay size={15} />
                </ActionIcon>
              </Tooltip>
            )}

            {hasFailed && onRetryFailed && (
              <Tooltip label="Retry failed" withArrow>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="yellow"
                  onClick={onRetryFailed}
                  aria-label="Retry failed uploads"
                >
                  <TbRefresh size={15} />
                </ActionIcon>
              </Tooltip>
            )}

            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={() => setExpanded(!expanded)}
              aria-label="Toggle drawer expansion"
            >
              {expanded ? (
                <TbChevronDown size={15} />
              ) : (
                <TbChevronUp size={15} />
              )}
            </ActionIcon>

            {onClose && (
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={onClose}
                aria-label="Close upload drawer"
              >
                <TbX size={15} />
              </ActionIcon>
            )}
          </Group>
        </Group>

        {/* Global Progress Bar in Header */}
        <Box mt={10}>
          <Progress
            value={overallProgress}
            size="xs"
            radius="xl"
            styles={{
              bar: {
                background: hasFailed
                  ? "var(--state-danger, #EF4444)"
                  : isAllComplete
                    ? "var(--state-success, #10B981)"
                    : "var(--brand-gradient)",
              },
            }}
          />
          <Group position="apart" mt={4}>
            <Text
              size="xs"
              color="dimmed"
              className="font-mono"
              sx={{ fontSize: 11 }}
            >
              {byteToHumanSizeString(uploadedBytes)} of{" "}
              {byteToHumanSizeString(totalBytes)}
            </Text>
            <Text
              size="xs"
              color="dimmed"
              className="font-mono"
              sx={{ fontSize: 11 }}
            >
              {overallProgress}%
            </Text>
          </Group>
        </Box>
      </Box>

      {/* Expandable Body */}
      <Collapse in={expanded}>
        {/* Bulk Action Controls */}
        <Box
          px={16}
          py={8}
          sx={{
            backgroundColor: isDark
              ? "rgba(15, 19, 25, 0.4)"
              : "rgba(241, 245, 249, 0.5)",
            borderBottom:
              "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
          }}
        >
          <Group position="apart">
            <Group spacing={8}>
              {onPauseAll && isAnyUploading && (
                <Button
                  size="xs"
                  variant="subtle"
                  leftIcon={<TbPlayerPause size={13} />}
                  onClick={onPauseAll}
                >
                  Pause All
                </Button>
              )}
              {onResumeAll && isAnyPaused && (
                <Button
                  size="xs"
                  variant="subtle"
                  leftIcon={<TbPlayerPlay size={13} />}
                  onClick={onResumeAll}
                >
                  Resume All
                </Button>
              )}
              {onRetryFailed && hasFailed && (
                <Button
                  size="xs"
                  variant="subtle"
                  leftIcon={<TbRefresh size={13} />}
                  onClick={onRetryFailed}
                >
                  Retry Failed
                </Button>
              )}
            </Group>

            {onCancelAll && (
              <Button
                size="xs"
                variant="subtle"
                color="red"
                leftIcon={<TbTrash size={13} />}
                onClick={onCancelAll}
              >
                Clear All
              </Button>
            )}
          </Group>
        </Box>

        {/* Scrollable File List */}
        <Box sx={{ maxHeight: 260, overflowY: "auto" }}>
          <Stack spacing={0}>
            {items.map((item) => (
              <UploadItem
                key={item.id}
                item={item}
                onPause={() => onPauseItem && onPauseItem(item.id)}
                onResume={() => onResumeItem && onResumeItem(item.id)}
                onRetry={() => onRetryItem && onRetryItem(item.id)}
                onRemove={() => onRemoveItem && onRemoveItem(item.id)}
                onInspect={() => onInspectItem && onInspectItem(item)}
              />
            ))}
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default UploadDrawer;
