import {
  ActionIcon,
  Box,
  Center,
  CopyButton,
  Divider,
  Group,
  Loader,
  Modal,
  ScrollArea,
  SegmentedControl,
  Stack,
  Table,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import axios from "axios";
import mime from "mime-types";
import React, { useEffect, useState } from "react";
import {
  TbCheck,
  TbClock,
  TbCode,
  TbCopy,
  TbDownload,
  TbExternalLink,
  TbFile,
  TbFileCode,
  TbFileDescription,
  TbFileInfo,
  TbFileZip,
  TbInfoCircle,
  TbLink,
  TbMusic,
  TbPhoto,
  TbRotateClockwise,
  TbVideo,
  TbX,
  TbZoomIn,
  TbZoomOut,
} from "react-icons/tb";
import { FileMetaData } from "../../types/File.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";
import { Badge, BadgeVariant } from "../common/Badge";
import { Button } from "../common/Button";
import { VideoPlayer } from "./VideoPlayer";
import { AudioPlayer } from "./AudioPlayer";

export interface FilePreviewProps {
  file: FileMetaData;
  shareId: string;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

export interface FileCategoryInfo {
  type: "image" | "video" | "audio" | "pdf" | "code" | "text" | "archive" | "unknown";
  label: string;
  variant: BadgeVariant;
}

export const getFileCategory = (
  mimeType: string,
  fileName: string,
): FileCategoryInfo => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico", "avif"].includes(extension)) {
    return { type: "image", label: "Image", variant: "primary" };
  }
  if (mimeType.startsWith("video/") || ["mp4", "webm", "mov", "mkv", "avi", "wmv"].includes(extension)) {
    return { type: "video", label: "Video", variant: "info" };
  }
  if (mimeType.startsWith("audio/") || ["mp3", "wav", "ogg", "flac", "m4a", "aac"].includes(extension)) {
    return { type: "audio", label: "Audio", variant: "warning" };
  }
  if (mimeType === "application/pdf" || extension === "pdf") {
    return { type: "pdf", label: "PDF Document", variant: "danger" };
  }
  if (
    [
      "js", "jsx", "ts", "tsx", "html", "css", "scss", "json", "xml", "yaml", "yml",
      "py", "rs", "go", "java", "c", "cpp", "h", "cs", "php", "rb", "sh", "sql", "md",
    ].includes(extension)
  ) {
    return { type: "code", label: "Source Code", variant: "success" };
  }
  if (
    mimeType.startsWith("text/") ||
    ["txt", "log", "csv", "env", "ini", "conf"].includes(extension)
  ) {
    return { type: "text", label: "Plain Text", variant: "default" };
  }
  if (
    ["zip", "tar", "gz", "7z", "rar", "bz2", "xz"].includes(extension) ||
    mimeType.includes("zip") ||
    mimeType.includes("tar") ||
    mimeType.includes("archive")
  ) {
    return { type: "archive", label: "Archive", variant: "warning" };
  }

  return { type: "unknown", label: extension.toUpperCase() || "File", variant: "default" };
};

export const FilePreviewContent: React.FC<{
  file: FileMetaData;
  shareId: string;
  onClose: () => void;
  onDownload?: () => void;
}> = ({ file, shareId, onClose, onDownload }) => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  const [activeTab, setActiveTab] = useState<"preview" | "inspect">("preview");
  const [textContent, setTextContent] = useState<string>("");
  const [loadingText, setLoadingText] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [imageRotation, setImageRotation] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
  const [thumbnailAvailable, setThumbnailAvailable] = useState(true);

  const fileUrl = `/api/shares/${shareId}/files/${file.id}?download=false`;
  const thumbnailUrl = `/api/shares/${shareId}/files/${file.id}/thumbnail`;
  const mimeType = (mime.contentType(file.name) || "application/octet-stream").split(";")[0];
  const category = getFileCategory(mimeType, file.name);
  const parsedSize = parseInt(file.size, 10) || 0;
  const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";

  useEffect(() => {
    if (category.type === "code" || category.type === "text") {
      setLoadingText(true);
      setErrorText(null);
      axios
        .get(fileUrl, { responseType: "text", timeout: 8000 })
        .then((res) => {
          const raw = typeof res.data === "string" ? res.data : JSON.stringify(res.data, null, 2);
          setTextContent(raw.slice(0, 100000));
        })
        .catch(() => {
          setErrorText("Could not load file text content directly.");
        })
        .finally(() => setLoadingText(false));
    }
  }, [fileUrl, category.type]);

  const fullShareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${fileUrl}`
      : fileUrl;

  return (
    <Box
      sx={{
        backgroundColor: isDark
          ? "var(--surface-0, #0F1319)"
          : "var(--surface-0, #FFFFFF)",
        borderRadius: "var(--radius-lg, 16px)",
        border: "1px solid var(--border-medium, rgba(255, 255, 255, 0.13))",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        maxHeight: "88vh",
      }}
    >
      {/* Top Header */}
      <Box
        p="16px 20px"
        sx={{
          borderBottom: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))",
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)",
        }}
      >
        <Stack spacing={12}>
          <Group position="apart" align="flex-start" noWrap>
            <Group spacing={12} noWrap sx={{ overflow: "hidden", flex: 1 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius-md, 10px)",
                  backgroundColor: "var(--brand-primary-subtle, rgba(37, 99, 235, 0.12))",
                  color: "var(--brand-primary, #3B82F6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {category.type === "image" && <TbPhoto size={24} />}
                {category.type === "video" && <TbVideo size={24} />}
                {category.type === "audio" && <TbMusic size={24} />}
                {category.type === "pdf" && <TbFileDescription size={24} />}
                {category.type === "code" && <TbCode size={24} />}
                {category.type === "text" && <TbFileInfo size={24} />}
                {category.type === "archive" && <TbFileZip size={24} />}
                {category.type === "unknown" && <TbFile size={24} />}
              </Box>

              <Box sx={{ overflow: "hidden", flex: 1 }}>
                <Group spacing={8} noWrap align="center">
                  <Text
                    weight={700}
                    size="md"
                    truncate
                    sx={{
                      color: isDark ? "#F8FAFC" : "#0F172A",
                      letterSpacing: "-0.01em",
                    }}
                    title={file.name}
                  >
                    {file.name}
                  </Text>
                  <Badge variant={category.variant} size="xs">
                    {category.label}
                  </Badge>
                </Group>

                <Group spacing={8} mt={2} noWrap>
                  <Text size="xs" color="dimmed" className="font-mono">
                    {byteToHumanSizeString(parsedSize)}
                  </Text>
                  <Text size="xs" color="dimmed">•</Text>
                  <Text size="xs" color="dimmed" className="font-mono">
                    {mimeType}
                  </Text>
                </Group>
              </Box>
            </Group>

            {/* Close & Action Buttons */}
            <Group spacing={6} noWrap>
              {onDownload && (
                <Button
                  size="xs"
                  variant="default"
                  onClick={onDownload}
                  leftIcon={<TbDownload size={14} />}
                >
                  Download
                </Button>
              )}
              <ActionIcon
                size="md"
                variant="subtle"
                onClick={onClose}
                aria-label="Close preview"
                sx={{
                  borderRadius: "var(--radius-md, 8px)",
                  color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
                  "&:hover": {
                    backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                    color: isDark ? "#FFFFFF" : "#000000",
                  },
                }}
              >
                <TbX size={18} />
              </ActionIcon>
            </Group>
          </Group>

          {/* Segmented Tab Switcher */}
          <SegmentedControl
            size="xs"
            fullWidth
            value={activeTab}
            onChange={(val) => setActiveTab(val as "preview" | "inspect")}
            data={[
              { label: "Visual Preview", value: "preview" },
              { label: "Inspect & Metadata", value: "inspect" },
            ]}
            styles={{
              root: {
                backgroundColor: isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.06)",
                borderRadius: "var(--radius-md, 8px)",
              },
            }}
          />
        </Stack>
      </Box>

      {/* Tab 1: Visual Preview */}
      {activeTab === "preview" && (
        <Box
          sx={{
            flex: 1,
            minHeight: 280,
            maxHeight: "calc(80vh - 110px)",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            position: "relative",
          }}
        >
          {/* Image Viewer with Progressive Loading */}
          {category.type === "image" && (
            <Stack align="center" spacing={12} sx={{ width: "100%", height: "100%", justifyContent: "center" }}>
              <Box
                sx={{
                  maxWidth: "100%",
                  maxHeight: "calc(65vh - 100px)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {/* Low-res Thumbnail / Blurred placeholder if full image is still loading */}
                {!isFullImageLoaded && thumbnailAvailable && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={thumbnailUrl}
                    alt={`${file.name} thumbnail`}
                    onError={() => setThumbnailAvailable(false)}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "calc(65vh - 100px)",
                      objectFit: "contain",
                      filter: "blur(6px)",
                      transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                      borderRadius: "var(--radius-md, 10px)",
                      opacity: 0.7,
                    }}
                  />
                )}

                {/* Original Full Resolution Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fileUrl}
                  alt={file.name}
                  onLoad={() => setIsFullImageLoaded(true)}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "calc(65vh - 100px)",
                    objectFit: "contain",
                    transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                    transition: "transform 150ms ease-out, opacity 250ms ease",
                    borderRadius: "var(--radius-md, 10px)",
                    boxShadow: "var(--shadow-md, 0 4px 14px rgba(0,0,0,0.25))",
                    position: isFullImageLoaded ? "relative" : "absolute",
                    opacity: isFullImageLoaded ? 1 : 0,
                  }}
                />

                {/* Subtle loading indicator while fetching original */}
                {!isFullImageLoaded && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 12,
                      backgroundColor: "rgba(15, 23, 42, 0.82)",
                      backdropFilter: "blur(8px)",
                      padding: "6px 14px",
                      borderRadius: "var(--radius-pill, 9999px)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      zIndex: 6,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    }}
                  >
                    <Loader size={14} color="blue" />
                    <Text size="xs" weight={500} sx={{ color: "rgba(255, 255, 255, 0.95)" }}>
                      Loading original...
                    </Text>
                  </Box>
                )}
              </Box>

              {/* Image Controls Toolbar */}
              <Group
                spacing={6}
                sx={{
                  backgroundColor: isDark ? "rgba(15, 19, 25, 0.85)" : "rgba(241, 245, 249, 0.85)",
                  backdropFilter: "blur(8px)",
                  padding: "4px 8px",
                  borderRadius: "var(--radius-pill, 9999px)",
                  border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))",
                }}
              >
                <Tooltip label="Zoom Out" withArrow>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    disabled={imageZoom <= 0.5}
                    onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
                  >
                    <TbZoomOut size={16} />
                  </ActionIcon>
                </Tooltip>
                <Text size="xs" className="font-mono" px={4}>
                  {Math.round(imageZoom * 100)}%
                </Text>
                <Tooltip label="Zoom In" withArrow>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    disabled={imageZoom >= 3}
                    onClick={() => setImageZoom((z) => Math.min(3, z + 0.25))}
                  >
                    <TbZoomIn size={16} />
                  </ActionIcon>
                </Tooltip>
                <Divider orientation="vertical" />
                <Tooltip label="Rotate 90°" withArrow>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={() => setImageRotation((r) => (r + 90) % 360)}
                  >
                    <TbRotateClockwise size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Stack>
          )}

          {/* Video Player */}
          {category.type === "video" && (
            <VideoPlayer
              src={fileUrl}
              poster={thumbnailUrl}
              fileName={file.name}
            />
          )}

          {/* Audio Player */}
          {category.type === "audio" && (
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center", py: 10 }}>
              <AudioPlayer
                src={fileUrl}
                fileName={file.name}
                fileSize={parsedSize}
              />
            </Box>
          )}

          {/* PDF Viewer */}
          {category.type === "pdf" && (
            <Box sx={{ width: "100%", height: "60vh" }}>
              <iframe
                src={fileUrl}
                title={file.name}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "var(--radius-md, 10px)",
                }}
              />
            </Box>
          )}

          {/* Code / Text Viewer */}
          {(category.type === "code" || category.type === "text") && (
            <Box
              sx={{
                width: "100%",
                height: "60vh",
                borderRadius: "var(--radius-md, 10px)",
                backgroundColor: isDark
                  ? "var(--surface-1, #151B24)"
                  : "var(--surface-1, #F1F5F9)",
                border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
                overflow: "hidden",
              }}
            >
              {loadingText ? (
                <Center sx={{ height: "100%" }}>
                  <Loader size="md" color="blue" />
                </Center>
              ) : errorText ? (
                <Center sx={{ height: "100%" }}>
                  <Text size="sm" color="dimmed">
                    {errorText}
                  </Text>
                </Center>
              ) : (
                <ScrollArea sx={{ height: "100%", padding: 14 }}>
                  <pre
                    className="font-mono"
                    style={{
                      margin: 0,
                      fontSize: 12.5,
                      lineHeight: 1.6,
                      color: isDark ? "#E2E8F0" : "#1E293B",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    <code>{textContent}</code>
                  </pre>
                </ScrollArea>
              )}
            </Box>
          )}

          {/* Archive / Unknown Viewer */}
          {(category.type === "archive" || category.type === "unknown") && (
            <Stack align="center" spacing={16} py={24}>
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  borderRadius: "var(--radius-lg, 14px)",
                  backgroundColor: isDark ? "var(--surface-1, #151B24)" : "#E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary, #94A3B8)",
                }}
              >
                {category.type === "archive" ? (
                  <TbFileZip size={34} color="#FBBF24" />
                ) : (
                  <TbFile size={34} />
                )}
              </Box>
              <Stack align="center" spacing={4}>
                <Text size="sm" weight={700}>
                  Direct preview unavailable
                </Text>
                <Text size="xs" color="dimmed" sx={{ maxWidth: 280, textAlign: "center" }}>
                  This file format cannot be rendered in-browser. Download file or inspect technical metadata.
                </Text>
              </Stack>
              <Group spacing={10}>
                {onDownload && (
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<TbDownload size={16} />}
                    onClick={onDownload}
                  >
                    Download File
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<TbInfoCircle size={16} />}
                  onClick={() => setActiveTab("inspect")}
                >
                  Inspect Metadata
                </Button>
              </Group>
            </Stack>
          )}
        </Box>
      )}

      {/* Tab 2: Inspect & Metadata (Fully Responsive for Mobile & Desktop) */}
      {activeTab === "inspect" && (
        <Box p={18} sx={{ overflowY: "auto", maxHeight: "calc(80vh - 110px)" }}>
          <Stack spacing={14}>
            {/* Top Summary Banner */}
            <Box
              p={14}
              sx={{
                backgroundColor: isDark
                  ? "var(--surface-1, #151B24)"
                  : "var(--surface-1, #F1F5F9)",
                borderRadius: "var(--radius-md, 10px)",
                border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
              }}
            >
              <Group position="apart" align="center">
                <Group spacing={10}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "var(--radius-md, 8px)",
                      backgroundColor: "var(--brand-primary-subtle, rgba(59, 130, 246, 0.15))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--brand-primary, #3B82F6)",
                    }}
                  >
                    <TbFileDescription size={22} />
                  </Box>
                  <Box>
                    <Text size="sm" weight={700}>
                      {file.name}
                    </Text>
                    <Text size="xs" color="dimmed">
                      {extension} File • {category.label}
                    </Text>
                  </Box>
                </Group>
                <Badge size="sm" variant={category.variant}>
                  {category.label}
                </Badge>
              </Group>
            </Box>

            {/* Responsive Specs Cards Grid / Key-Value List */}
            <Stack spacing={10}>
              {/* Item 1: File Name */}
              <Box
                p="12px 14px"
                sx={{
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
                  borderRadius: "var(--radius-md, 8px)",
                  border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))",
                }}
              >
                <Group position="apart" align="flex-start" noWrap>
                  <Stack spacing={2} sx={{ minWidth: 0, flex: 1 }}>
                    <Text size="xs" color="dimmed" weight={600} sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      File Name
                    </Text>
                    <Text size="sm" weight={600} sx={{ wordBreak: "break-all" }}>
                      {file.name}
                    </Text>
                  </Stack>
                  <CopyButton value={file.name}>
                    {({ copied, copy }) => (
                      <ActionIcon size="sm" variant="light" color={copied ? "green" : "blue"} onClick={copy}>
                        {copied ? <TbCheck size={14} /> : <TbCopy size={14} />}
                      </ActionIcon>
                    )}
                  </CopyButton>
                </Group>
              </Box>

              {/* Item 2: File Size */}
              <Box
                p="12px 14px"
                sx={{
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
                  borderRadius: "var(--radius-md, 8px)",
                  border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))",
                }}
              >
                <Stack spacing={2}>
                  <Text size="xs" color="dimmed" weight={600} sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    File Size
                  </Text>
                  <Text size="sm" weight={700} className="font-mono">
                    {byteToHumanSizeString(parsedSize)}{" "}
                    <Text component="span" size="xs" color="dimmed" weight={400}>
                      ({parsedSize.toLocaleString()} bytes)
                    </Text>
                  </Text>
                </Stack>
              </Box>

              {/* Item 3: MIME Content-Type */}
              <Box
                p="12px 14px"
                sx={{
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
                  borderRadius: "var(--radius-md, 8px)",
                  border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))",
                }}
              >
                <Group position="apart" align="flex-start" noWrap>
                  <Stack spacing={2} sx={{ minWidth: 0, flex: 1 }}>
                    <Text size="xs" color="dimmed" weight={600} sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      MIME Content-Type
                    </Text>
                    <Text size="sm" className="font-mono" sx={{ color: "var(--brand-primary, #3B82F6)", wordBreak: "break-all" }}>
                      {mimeType}
                    </Text>
                  </Stack>
                  <CopyButton value={mimeType}>
                    {({ copied, copy }) => (
                      <ActionIcon size="sm" variant="light" color={copied ? "green" : "blue"} onClick={copy}>
                        {copied ? <TbCheck size={14} /> : <TbCopy size={14} />}
                      </ActionIcon>
                    )}
                  </CopyButton>
                </Group>
              </Box>

              {/* Item 4: File Identifier & Share ID */}
              <Box
                p="12px 14px"
                sx={{
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
                  borderRadius: "var(--radius-md, 8px)",
                  border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))",
                }}
              >
                <Group position="apart" align="flex-start" noWrap mb={8}>
                  <Stack spacing={2} sx={{ minWidth: 0, flex: 1, pr: 8 }}>
                    <Text size="xs" color="dimmed" weight={600} sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      File ID
                    </Text>
                    <Text
                      size="xs"
                      className="font-mono"
                      color="dimmed"
                      sx={{
                        wordBreak: "break-all",
                        whiteSpace: "normal",
                        fontSize: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      {file.id}
                    </Text>
                  </Stack>
                  <CopyButton value={file.id}>
                    {({ copied, copy }) => (
                      <ActionIcon size="sm" variant="light" color={copied ? "green" : "blue"} onClick={copy}>
                        {copied ? <TbCheck size={14} /> : <TbCopy size={14} />}
                      </ActionIcon>
                    )}
                  </CopyButton>
                </Group>

                <Divider my={8} />

                <Group position="apart" align="flex-start" noWrap>
                  <Stack spacing={2} sx={{ minWidth: 0, flex: 1, pr: 8 }}>
                    <Text size="xs" color="dimmed" weight={600} sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Parent Share ID
                    </Text>
                    <Text
                      size="xs"
                      className="font-mono"
                      sx={{
                        wordBreak: "break-all",
                        whiteSpace: "normal",
                        fontSize: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      {shareId}
                    </Text>
                  </Stack>
                  <CopyButton value={shareId}>
                    {({ copied, copy }) => (
                      <ActionIcon size="sm" variant="light" color={copied ? "green" : "blue"} onClick={copy}>
                        {copied ? <TbCheck size={14} /> : <TbCopy size={14} />}
                      </ActionIcon>
                    )}
                  </CopyButton>
                </Group>
              </Box>

              {/* Item 5: Direct Stream URL */}
              <Box
                p="12px 14px"
                sx={{
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
                  borderRadius: "var(--radius-md, 8px)",
                  border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))",
                }}
              >
                <Group position="apart" align="flex-start" noWrap>
                  <Stack spacing={2} sx={{ minWidth: 0, flex: 1, pr: 8 }}>
                    <Text size="xs" color="dimmed" weight={600} sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Raw Direct Stream URL
                    </Text>
                    <Text
                      size="xs"
                      className="font-mono"
                      color="dimmed"
                      sx={{
                        wordBreak: "break-all",
                        whiteSpace: "normal",
                        fontSize: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      {fullShareUrl}
                    </Text>
                  </Stack>
                  <Group spacing={4} noWrap>
                    <CopyButton value={fullShareUrl}>
                      {({ copied, copy }) => (
                        <ActionIcon size="sm" variant="light" color={copied ? "green" : "blue"} onClick={copy} title="Copy URL">
                          {copied ? <TbCheck size={14} /> : <TbCopy size={14} />}
                        </ActionIcon>
                      )}
                    </CopyButton>
                    <ActionIcon
                      size="sm"
                      variant="light"
                      component="a"
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in Tab"
                    >
                      <TbExternalLink size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Box>
            </Stack>

            {/* Bottom Actions */}
            <Group position="apart" pt={6}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab("preview")}
              >
                Back to Preview
              </Button>

              {onDownload && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<TbDownload size={16} />}
                  onClick={onDownload}
                >
                  Download File
                </Button>
              )}
            </Group>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  shareId,
  isOpen,
  onClose,
  onDownload,
}) => {
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      size="xl"
      centered
      radius="lg"
      withCloseButton={false}
      padding={0}
      styles={{
        content: {
          backgroundColor: "transparent",
          overflow: "hidden",
        },
        body: {
          padding: "0 !important",
        },
      }}
    >
      <FilePreviewContent
        file={file}
        shareId={shareId}
        onClose={onClose}
        onDownload={onDownload}
      />
    </Modal>
  );
};

export default FilePreview;
