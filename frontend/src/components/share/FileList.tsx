import {
  ActionIcon,
  Box,
  Center,
  Checkbox,
  Col,
  Divider,
  Grid,
  Group,
  SegmentedControl,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { useModals } from "@mantine/modals";
import mime from "mime-types";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  TbArchive,
  TbCheck,
  TbChecklist,
  TbClipboard,
  TbDownload,
  TbEye,
  TbFile,
  TbFileCode,
  TbFileDescription,
  TbFileInfo,
  TbFileZip,
  TbLayoutGrid,
  TbLayoutList,
  TbLink,
  TbMusic,
  TbPhoto,
  TbPlayerPlay,
  TbSearch,
  TbVideo,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import { ActionBar } from "../file/ActionBar";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import api from "../../services/api.service";
import shareService from "../../services/share.service";
import { FileMetaData } from "../../types/File.type";
import { Share } from "../../types/share.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { getFileCategory } from "../file/FilePreview";
import showFilePreviewModal from "./modals/showFilePreviewModal";

const getCategoryIcon = (category: string, size = 20) => {
  switch (category) {
    case "Image":
      return <TbPhoto size={size} />;
    case "Video":
      return <TbVideo size={size} />;
    case "Audio":
      return <TbMusic size={size} />;
    case "Document":
    case "PDF Document":
      return <TbFileDescription size={size} />;
    case "Source Code":
      return <TbFileCode size={size} />;
    case "Archive":
      return <TbFileZip size={size} />;
    default:
      return <TbFile size={size} />;
  }
};

const renderFileName = (name: string) => {
  const parts = name.split("/");
  if (parts.length === 1) return name;
  const fileName = parts.pop();
  const folderPath = parts.join("/");
  return (
    <span>
      <span style={{ opacity: 0.5 }}>{folderPath}/</span>
      <span style={{ fontWeight: 600 }}>{fileName}</span>
    </span>
  );
};

const MediaThumbnail: React.FC<{
  shareId: string;
  file: FileMetaData;
  category: ReturnType<typeof getFileCategory>;
}> = ({ shareId, file, category }) => {
  const [useOriginalFallback, setUseOriginalFallback] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const thumbnailUrl = `/api/shares/${shareId}/files/${file.id}/thumbnail`;
  const originalUrl = `/api/shares/${shareId}/files/${file.id}?download=false`;
  const isImage = category.type === "image";
  const isVideo = category.type === "video";

  if (hasError) {
    return (
      <Box
        sx={{
          color: "var(--brand-primary)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        {getCategoryIcon(category.label, 44)}
        <Text size="xs" color="dimmed" weight={600} className="font-mono">
          {file.name.split(".").pop()?.toUpperCase()}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={useOriginalFallback ? originalUrl : thumbnailUrl}
        alt={file.name}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!useOriginalFallback && isImage) {
            setUseOriginalFallback(true);
          } else {
            setHasError(true);
          }
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "transform 200ms ease, opacity 200ms ease",
          opacity: loaded ? 1 : 0.6,
        }}
      />
      {isVideo && (
        <Box
          sx={{
            position: "absolute",
            width: 38,
            height: 38,
            borderRadius: "50%",
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <TbPlayerPlay size={18} style={{ marginLeft: 2 }} />
        </Box>
      )}
    </Box>
  );
};

const FileList = ({
  files,
  setShare,
  share,
  isLoading,
  recipientId,
}: {
  files?: FileMetaData[];
  setShare: Dispatch<SetStateAction<Share | undefined>>;
  share: Share;
  isLoading: boolean;
  recipientId?: string;
}) => {
  const clipboard = useClipboard();
  const config = useConfig();
  const modals = useModals();
  const t = useTranslate();
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  const hasMedia = useMemo(() => {
    if (!files || files.length === 0) return false;
    return files.some((f) => {
      const mimeType = (mime.contentType(f.name) || "").split(";")[0];
      return (
        mimeType.startsWith("image/") ||
        mimeType.startsWith("video/") ||
        mimeType.startsWith("audio/") ||
        f.name.match(
          /\.(png|jpg|jpeg|gif|webp|svg|bmp|mp4|webm|mov|mkv|mp3|wav)$/i,
        )
      );
    });
  }, [files]);

  const [viewMode, setViewMode] = useState<"list" | "grid">(
    hasMedia ? "grid" : "list",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);

  useEffect(() => {
    if (hasMedia) {
      setViewMode("grid");
    }
  }, [hasMedia]);

  const filteredFiles = useMemo(() => {
    if (!files) return [];
    return files.filter((file) => {
      // Search filter
      const matchesSearch = file.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Category filter
      if (selectedCategory === "all") return true;

      const mimeType = (mime.contentType(file.name) || "").split(";")[0];
      const cat = getFileCategory(mimeType, file.name).label.toLowerCase();

      if (selectedCategory === "images") return cat.includes("image");
      if (selectedCategory === "documents")
        return cat.includes("document") || cat.includes("pdf");
      if (selectedCategory === "media")
        return cat.includes("video") || cat.includes("audio");
      if (selectedCategory === "code")
        return cat.includes("code") || cat.includes("text");
      if (selectedCategory === "archives") return cat.includes("archive");

      return true;
    });
  }, [files, searchQuery, selectedCategory]);

  const allSelected =
    filteredFiles.length > 0 &&
    filteredFiles.every((f) => selectedFileIds.includes(f.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(filteredFiles.map((f) => f.id));
    }
  };

  const toggleSelectFile = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId],
    );
  };

  const selectedFiles = useMemo(
    () => files?.filter((f) => selectedFileIds.includes(f.id)) || [],
    [files, selectedFileIds],
  );

  const selectedTotalBytes = useMemo(
    () =>
      selectedFiles.reduce((acc, f) => acc + parseInt(f.size || "0", 10), 0),
    [selectedFiles],
  );

  const downloadSelectedFiles = async () => {
    if (selectedFiles.length === 0) return;
    setIsBatchDownloading(true);
    try {
      if (selectedFiles.length === files?.length) {
        await shareService.downloadFile(share.id, "zip", recipientId);
      } else {
        for (const file of selectedFiles) {
          await shareService.downloadFile(share.id, file.id, recipientId);
        }
      }
      toast.success(
        `Downloaded ${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"}`,
      );
    } catch (e) {
      toast.axiosError(e);
    } finally {
      setIsBatchDownloading(false);
    }
  };

  const copyFileLink = (file: FileMetaData) => {
    const recipientQuery = recipientId
      ? `?recipient=${encodeURIComponent(recipientId)}`
      : "";
    const appUrl = config.get("general.appUrl");
    const defaultAppUrl = config.get("general.appUrl", true);
    const link = `${
      appUrl !== defaultAppUrl ? appUrl : window.location.origin
    }/api/shares/${share.id}/files/${file.id}${recipientQuery}`;

    if (window.isSecureContext) {
      clipboard.copy(link);
      toast.success(t("common.notify.copied-link") || "File link copied");
    } else {
      modals.openModal({
        title: t("share.modal.file-link") || "Direct File Link",
        children: (
          <Stack align="stretch">
            <TextInput variant="filled" value={link} readOnly />
          </Stack>
        ),
      });
    }
  };

  const skeletonRows = Array.from({ length: 4 }).map((_, idx) => (
    <tr key={idx}>
      <td style={{ width: 40 }}>
        <Skeleton height={16} width={16} radius="xs" />
      </td>
      <td>
        <Skeleton height={16} width="65%" radius="sm" />
      </td>
      <td>
        <Skeleton height={16} width={60} radius="sm" />
      </td>
      <td>
        <Skeleton height={16} width={50} radius="sm" />
      </td>
      <td style={{ textAlign: "right" }}>
        <Skeleton height={24} width={80} radius="sm" />
      </td>
    </tr>
  ));

  return (
    <Box>
      <Card padded={false} mb={20}>
        {/* Header Controls */}
        <Box
          p="12px 16px"
          sx={{
            borderBottom:
              "1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))",
            display: "flex",
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
            [theme.fn.smallerThan("xs")]: {
              flexDirection: "column",
              alignItems: "stretch",
            },
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 180,
              maxWidth: 320,
              [theme.fn.smallerThan("xs")]: {
                maxWidth: "100%",
              },
            }}
          >
            <TextInput
              placeholder="Search files..."
              size="xs"
              icon={<TbSearch size={14} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              sx={{ width: "100%" }}
            />
          </Box>

          <Group
            position="right"
            spacing={8}
            noWrap
            sx={{
              [theme.fn.smallerThan("xs")]: {
                justifyContent: "space-between",
                width: "100%",
              },
            }}
          >
            <SegmentedControl
              size="xs"
              value={selectedCategory}
              onChange={setSelectedCategory}
              data={[
                { label: "All", value: "all" },
                { label: "Images", value: "images" },
                { label: "Docs", value: "documents" },
                { label: "Media", value: "media" },
                { label: "Code", value: "code" },
                { label: "Archives", value: "archives" },
              ]}
              styles={{
                root: {
                  overflowX: "auto",
                },
              }}
            />

            <SegmentedControl
              size="xs"
              value={viewMode}
              onChange={(val) => setViewMode(val as "list" | "grid")}
              data={[
                {
                  value: "list",
                  label: (
                    <Center title="List View">
                      <TbLayoutList size={16} />
                    </Center>
                  ),
                },
                {
                  value: "grid",
                  label: (
                    <Center title="Grid View">
                      <TbLayoutGrid size={16} />
                    </Center>
                  ),
                },
              ]}
            />
          </Group>
        </Box>

        {/* View Mode 1: List View */}
        {viewMode === "list" && (
          <>
            {/* Desktop Table */}
            <Box
              sx={{
                display: "block",
                overflowX: "auto",
                [theme.fn.smallerThan("sm")]: {
                  display: "none",
                },
              }}
            >
              <Table verticalSpacing="sm" horizontalSpacing="md">
                <thead>
                  <tr style={{ opacity: 0.7 }}>
                    <th style={{ width: 40 }}>
                      <Checkbox
                        size="xs"
                        checked={allSelected}
                        indeterminate={
                          selectedFileIds.length > 0 && !allSelected
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    skeletonRows
                  ) : filteredFiles.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{ textAlign: "center", padding: "32px 0" }}
                      >
                        <Text size="sm" color="dimmed">
                          No matching files found
                        </Text>
                      </td>
                    </tr>
                  ) : (
                    filteredFiles.map((file) => {
                      const mimeType = (
                        mime.contentType(file.name) || ""
                      ).split(";")[0];
                      const category = getFileCategory(mimeType, file.name);
                      const isSelected = selectedFileIds.includes(file.id);

                      return (
                        <tr
                          key={file.id || file.name}
                          style={{
                            backgroundColor: isSelected
                              ? "var(--brand-primary-subtle, rgba(37, 99, 235, 0.08))"
                              : undefined,
                          }}
                        >
                          <td>
                            <Checkbox
                              size="xs"
                              checked={isSelected}
                              onChange={() => toggleSelectFile(file.id)}
                            />
                          </td>
                          <td>
                            <Group spacing={8} noWrap>
                              <Box
                                sx={{
                                  display: "flex",
                                  color: "var(--brand-primary, #3B82F6)",
                                }}
                              >
                                {getCategoryIcon(category.label, 17)}
                              </Box>
                              <Text
                                size="sm"
                                weight={600}
                                truncate
                                sx={{ maxWidth: 360, cursor: "pointer" }}
                                onClick={() =>
                                  showFilePreviewModal(
                                    share.id,
                                    file,
                                    modals,
                                    recipientId,
                                  )
                                }
                              >
                                {renderFileName(file.name)}
                              </Text>
                            </Group>
                          </td>

                          <td>
                            <Badge variant={category.variant} size="sm">
                              {category.label}
                            </Badge>
                          </td>

                          <td>
                            <Text
                              size="xs"
                              color="dimmed"
                              className="font-mono"
                            >
                              {byteToHumanSizeString(parseInt(file.size, 10))}
                            </Text>
                          </td>

                          <td>
                            <Group spacing={4} position="right" noWrap>
                              {shareService.isShareTextFile(file.name) && (
                                <Tooltip label="Copy text content" withArrow>
                                  <ActionIcon
                                    size="sm"
                                    variant="subtle"
                                    onClick={() => {
                                      api
                                        .get(
                                          `/shares/${share.id}/files/${file.id}?download=false`,
                                        )
                                        .then((res) => {
                                          if (window.isSecureContext) {
                                            clipboard.copy(
                                              typeof res.data === "string"
                                                ? res.data
                                                : JSON.stringify(
                                                    res.data,
                                                    null,
                                                    2,
                                                  ),
                                            );
                                            toast.success(
                                              "Text copied to clipboard",
                                            );
                                          }
                                        });
                                    }}
                                  >
                                    <TbClipboard size={15} />
                                  </ActionIcon>
                                </Tooltip>
                              )}

                              <Tooltip label="Preview & Inspect" withArrow>
                                <ActionIcon
                                  size="sm"
                                  variant="subtle"
                                  onClick={() =>
                                    showFilePreviewModal(
                                      share.id,
                                      file,
                                      modals,
                                      recipientId,
                                    )
                                  }
                                >
                                  <TbEye size={15} />
                                </ActionIcon>
                              </Tooltip>

                              {!share.hasPassword && (
                                <Tooltip label="Copy Direct Link" withArrow>
                                  <ActionIcon
                                    size="sm"
                                    variant="subtle"
                                    onClick={() => copyFileLink(file)}
                                  >
                                    <TbLink size={15} />
                                  </ActionIcon>
                                </Tooltip>
                              )}

                              <Tooltip label="Download File" withArrow>
                                <ActionIcon
                                  size="sm"
                                  variant="subtle"
                                  onClick={async () => {
                                    await shareService.downloadFile(
                                      share.id,
                                      file.id,
                                      recipientId,
                                    );
                                  }}
                                >
                                  <TbDownload size={15} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </Box>

            {/* Mobile Responsive List Cards */}
            <Box
              sx={{
                display: "none",
                padding: 12,
                [theme.fn.smallerThan("sm")]: {
                  display: "block",
                },
              }}
            >
              <Stack spacing={8}>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Box
                      key={i}
                      p={12}
                      sx={{
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <Skeleton height={20} width="70%" mb={8} />
                      <Skeleton height={14} width="40%" />
                    </Box>
                  ))
                ) : filteredFiles.length === 0 ? (
                  <Box py={24} sx={{ textAlign: "center" }}>
                    <Text size="sm" color="dimmed">
                      No matching files found
                    </Text>
                  </Box>
                ) : (
                  filteredFiles.map((file) => {
                    const mimeType = (mime.contentType(file.name) || "").split(
                      ";",
                    )[0];
                    const category = getFileCategory(mimeType, file.name);
                    const isSelected = selectedFileIds.includes(file.id);

                    return (
                      <Box
                        key={file.id || file.name}
                        p="10px 12px"
                        sx={{
                          backgroundColor: isSelected
                            ? "var(--brand-primary-subtle, rgba(37, 99, 235, 0.09))"
                            : isDark
                              ? "rgba(255, 255, 255, 0.02)"
                              : "rgba(0, 0, 0, 0.02)",
                          borderRadius: "var(--radius-md, 10px)",
                          border: isSelected
                            ? "1px solid var(--brand-primary)"
                            : "1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))",
                        }}
                      >
                        <Group position="apart" align="center" mb={6} noWrap>
                          <Group
                            spacing={8}
                            noWrap
                            sx={{ overflow: "hidden", flex: 1 }}
                          >
                            <Checkbox
                              size="xs"
                              checked={isSelected}
                              onChange={() => toggleSelectFile(file.id)}
                            />
                            <Box
                              sx={{
                                color: "var(--brand-primary)",
                                display: "flex",
                              }}
                            >
                              {getCategoryIcon(category.label, 16)}
                            </Box>
                            <Text
                              size="sm"
                              weight={600}
                              truncate
                              sx={{ cursor: "pointer" }}
                              onClick={() =>
                                showFilePreviewModal(
                                  share.id,
                                  file,
                                  modals,
                                  recipientId,
                                )
                              }
                            >
                              {file.name}
                            </Text>
                          </Group>
                          <Badge variant={category.variant} size="xs">
                            {category.label}
                          </Badge>
                        </Group>

                        <Group position="apart" align="center" pt={4}>
                          <Text size="xs" color="dimmed" className="font-mono">
                            {byteToHumanSizeString(parseInt(file.size, 10))}
                          </Text>

                          <Group spacing={6}>
                            <ActionIcon
                              size="sm"
                              variant="light"
                              onClick={() =>
                                showFilePreviewModal(
                                  share.id,
                                  file,
                                  modals,
                                  recipientId,
                                )
                              }
                              title="Preview"
                            >
                              <TbEye size={15} />
                            </ActionIcon>

                            {!share.hasPassword && (
                              <ActionIcon
                                size="sm"
                                variant="light"
                                onClick={() => copyFileLink(file)}
                                title="Copy Link"
                              >
                                <TbLink size={15} />
                              </ActionIcon>
                            )}

                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="blue"
                              onClick={async () => {
                                await shareService.downloadFile(
                                  share.id,
                                  file.id,
                                  recipientId,
                                );
                              }}
                              title="Download"
                            >
                              <TbDownload size={15} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </Box>
                    );
                  })
                )}
              </Stack>
            </Box>
          </>
        )}

        {/* View Mode 2: Large Grid Cards View */}
        {viewMode === "grid" && (
          <Box p={16}>
            <Grid gutter="md">
              {filteredFiles.map((file) => {
                const mimeType = (mime.contentType(file.name) || "").split(
                  ";",
                )[0];
                const category = getFileCategory(mimeType, file.name);
                const isSelected = selectedFileIds.includes(file.id);
                const isImage = mimeType.startsWith("image/");
                const fileViewUrl = `/api/shares/${share.id}/files/${file.id}?download=false`;

                return (
                  <Col key={file.id || file.name} xs={12} sm={6} md={4} lg={3}>
                    <Card
                      padded={false}
                      sx={{
                        position: "relative",
                        overflow: "hidden",
                        border: isSelected
                          ? "2px solid var(--brand-primary)"
                          : "1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))",
                        transition: "all 150ms ease",
                      }}
                    >
                      {/* Checkbox top-left */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          zIndex: 5,
                        }}
                      >
                        <Checkbox
                          size="xs"
                          checked={isSelected}
                          onChange={() => toggleSelectFile(file.id)}
                        />
                      </Box>

                      {/* Card Thumbnail / Preview Box */}
                      <Box
                        onClick={() =>
                          showFilePreviewModal(
                            share.id,
                            file,
                            modals,
                            recipientId,
                          )
                        }
                        sx={{
                          height: 160,
                          backgroundColor: isDark
                            ? "rgba(0, 0, 0, 0.3)"
                            : "rgba(0, 0, 0, 0.04)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        {category.type === "image" ||
                        category.type === "video" ? (
                          <MediaThumbnail
                            shareId={share.id}
                            file={file}
                            category={category}
                          />
                        ) : (
                          <Box
                            sx={{
                              color: "var(--brand-primary)",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            {getCategoryIcon(category.label, 44)}
                            <Text
                              size="xs"
                              color="dimmed"
                              weight={600}
                              className="font-mono"
                            >
                              {file.name.split(".").pop()?.toUpperCase()}
                            </Text>
                          </Box>
                        )}
                      </Box>

                      {/* Card Details Footer */}
                      <Box p="12px 14px">
                        <Group position="apart" mb={6} noWrap>
                          <Text
                            size="sm"
                            weight={700}
                            truncate
                            sx={{ maxWidth: 170, cursor: "pointer" }}
                            title={file.name}
                            onClick={() =>
                              showFilePreviewModal(
                                share.id,
                                file,
                                modals,
                                recipientId,
                              )
                            }
                          >
                            {file.name}
                          </Text>
                          <Badge variant={category.variant} size="xs">
                            {category.label}
                          </Badge>
                        </Group>

                        <Group position="apart" align="center" pt={4}>
                          <Text size="xs" color="dimmed" className="font-mono">
                            {byteToHumanSizeString(parseInt(file.size, 10))}
                          </Text>

                          <Group spacing={4}>
                            <Tooltip label="Preview & Inspect" withArrow>
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                onClick={() =>
                                  showFilePreviewModal(
                                    share.id,
                                    file,
                                    modals,
                                    recipientId,
                                  )
                                }
                              >
                                <TbEye size={16} />
                              </ActionIcon>
                            </Tooltip>

                            {!share.hasPassword && (
                              <Tooltip label="Copy Direct Link" withArrow>
                                <ActionIcon
                                  size="sm"
                                  variant="subtle"
                                  onClick={() => copyFileLink(file)}
                                >
                                  <TbLink size={16} />
                                </ActionIcon>
                              </Tooltip>
                            )}

                            <Tooltip label="Download File" withArrow>
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                onClick={async () => {
                                  await shareService.downloadFile(
                                    share.id,
                                    file.id,
                                    recipientId,
                                  );
                                }}
                              >
                                <TbDownload size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Group>
                      </Box>
                    </Card>
                  </Col>
                );
              })}
            </Grid>
          </Box>
        )}
      </Card>

      {/* Floating Bottom Action Bar for Bulk Selection */}
      <ActionBar
        selectedCount={selectedFileIds.length}
        totalSize={selectedTotalBytes}
        onClearSelection={() => setSelectedFileIds([])}
        onDownloadSelected={downloadSelectedFiles}
        onDeleteSelected={async () => {
          modals.openConfirmModal({
            title: "Delete selected files?",
            children: (
              <Text size="sm">
                Are you sure you want to delete {selectedFileIds.length} files
                from this share? This action cannot be undone.
              </Text>
            ),
            labels: { confirm: "Delete", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: async () => {
              try {
                for (const fileId of selectedFileIds) {
                  await shareService.removeFile(share.id, fileId);
                }
                setShare((prev) =>
                  prev
                    ? {
                        ...prev,
                        files: prev.files.filter(
                          (f: FileMetaData) => !selectedFileIds.includes(f.id),
                        ),
                      }
                    : prev,
                );
                setSelectedFileIds([]);
                toast.success("Files removed from share");
              } catch (e) {
                toast.axiosError(e);
              }
            },
          });
        }}
      />
    </Box>
  );
};

export default FileList;
