import { Box, Group, Stack, Text, Title } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { cleanNotifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import { useRouter } from "next/router";
import pLimit from "p-limit";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { TbCloudUpload, TbShare } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import { Button } from "../../components/common/Button";
import Meta from "../../components/Meta";
import showCompletedUploadModal from "../../components/upload/modals/showCompletedUploadModal";
import showCreateUploadModal from "../../components/upload/modals/showCreateUploadModal";
import { Dropzone } from "../../components/upload/Dropzone";
import {
  UploadItem,
  UploadItemState,
} from "../../components/upload/UploadItem";
import { AudioPlayer } from "../../components/file/AudioPlayer";
import useConfig from "../../hooks/config.hook";
import useConfirmLeave from "../../hooks/confirm-leave.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import useUser from "../../hooks/user.hook";
import shareService from "../../services/share.service";
import pendingUploadService from "../../services/pendingUpload.service";
import { FileUpload } from "../../types/File.type";
import { CreateShare, Share } from "../../types/share.type";
import { filterDuplicateFiles, getNormalizedFileName } from "../../utils/file.util";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";

const promiseLimit = pLimit(3);
let errorToastShown = false;
let createdShare: Share;

const Upload = ({
  maxShareSize,
  isReverseShare = false,
  simplified,
}: {
  maxShareSize?: number;
  isReverseShare: boolean;
  simplified: boolean;
}) => {
  const modals = useModals();
  const router = useRouter();

  const [files, setFiles] = useState<FileUpload[]>([]);
  const [uploadItems, setUploadItems] = useState<UploadItemState[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const config = useConfig();
  const chunkSize = useRef<number | null>(null);
  const { user } = useUser();
  const t = useTranslate();

  const autoOpenCreateUploadModal =
    router.query.autoOpenCreateUploadModal === "true";

  useConfirmLeave({
    message: t("upload.notify.confirm-leave"),
    enabled: isUploading,
  });

  const currentFilesSize = useMemo(() => {
    return files.reduce((acc, file) => acc + file.size, 0);
  }, [files]);

  maxShareSize ??= user?.shareSizeLimit
    ? parseInt(user.shareSizeLimit)
    : parseInt(config.get("share.maxSize") || "1073741824");

  useEffect(() => {
    if (config.get("share.chunkSize")) {
      chunkSize.current = config.get("share.chunkSize");
    }
  }, [config]);

  // Check if any files were passed from home page or elsewhere
  useEffect(() => {
    if (pendingUploadService.hasPendingFiles()) {
      const passedFiles = pendingUploadService.getPendingFiles();
      if (passedFiles.length > 0) {
        setFiles(passedFiles);
        if (autoOpenCreateUploadModal) {
          showCreateUploadModalCallback(passedFiles);
        }
      }
    }
  }, []);

  // Convert FileUpload items to UploadItemState
  useEffect(() => {
    setUploadItems((prevItems) => {
      return files.map((file, idx) => {
        const id = (file as any).id || `${file.name}-${file.size}-${idx}`;
        const existing = prevItems.find((p) => p.name === file.name && p.size === file.size);
        const progress = file.uploadingProgress ?? 0;
        let status: UploadItemState["status"] = "WAITING";
        if (progress === -1) status = "FAILED";
        else if (progress >= 100) status = "COMPLETED";
        else if (isUploading && progress > 0) status = "UPLOADING";

        let previewUrl = existing?.previewUrl;
        if (!previewUrl && typeof window !== "undefined" && file instanceof File) {
          const isImageOrMedia =
            file.type.startsWith("image/") ||
            file.type.startsWith("video/") ||
            file.type.startsWith("audio/") ||
            file.name.match(/\.(png|jpg|jpeg|gif|webp|svg|bmp|mp4|webm|mov|mkv|avi|mp3|wav|ogg|flac|m4a|aac)$/i);
          if (isImageOrMedia) {
            try {
              previewUrl = URL.createObjectURL(file);
            } catch (err) {
              console.debug(err);
            }
          }
        }

        return {
          id,
          name: getNormalizedFileName(file),
          size: file.size,
          progress: progress === -1 ? 0 : progress,
          uploadedBytes: (file.size * Math.max(0, progress)) / 100,
          speed: existing?.speed,
          eta: existing?.eta,
          previewUrl,
          file: file instanceof File ? file : undefined,
          status: existing?.status === "PAUSED" ? "PAUSED" : status,
          errorMessage: progress === -1 ? "Chunk upload failed. Retrying..." : undefined,
        };
      });
    });
  }, [files, isUploading]);

  const handleInspectQueuedFile = (item: UploadItemState) => {
    const isVideo =
      item.file?.type.startsWith("video/") ||
      item.name.match(/\.(mp4|webm|mov|mkv|avi)$/i);
    const isAudio =
      item.file?.type.startsWith("audio/") ||
      item.name.match(/\.(mp3|wav|ogg|flac|m4a|aac|opus)$/i);

    modals.openModal({
      title: `Queued File: ${item.name}`,
      size: isAudio ? "md" : "md",
      children: (
        <Stack spacing={16}>
          {item.previewUrl ? (
            isAudio ? (
              <Box sx={{ width: "100%", display: "flex", justifyContent: "center", py: 8 }}>
                <AudioPlayer
                  src={item.previewUrl}
                  fileName={item.name}
                  fileSize={item.size}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  backgroundColor: "rgba(0, 0, 0, 0.25)",
                  borderRadius: 8,
                  padding: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  maxHeight: "50vh",
                  overflow: "hidden",
                }}
              >
                {isVideo ? (
                  <video
                    src={item.previewUrl}
                    controls
                    playsInline
                    style={{
                      maxWidth: "100%",
                      maxHeight: "45vh",
                      borderRadius: 6,
                    }}
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "45vh",
                      objectFit: "contain",
                      borderRadius: 6,
                    }}
                  />
                )}
              </Box>
            )
          ) : (
            <Box
              sx={{
                backgroundColor: "rgba(0, 0, 0, 0.15)",
                borderRadius: 8,
                padding: "32px 16px",
                textAlign: "center",
              }}
            >
              <Text size="sm" color="dimmed">
                No visual thumbnail preview for this file type
              </Text>
            </Box>
          )}

          <Box
            p={14}
            sx={(theme) => ({
              backgroundColor:
                theme.colorScheme === "dark"
                  ? "rgba(255, 255, 255, 0.04)"
                  : "rgba(15, 23, 42, 0.04)",
              borderRadius: 8,
            })}
          >
            <Stack spacing={8}>
              <Group position="apart">
                <Text size="xs" color="dimmed">
                  File Name
                </Text>
                <Text size="xs" weight={600} truncate sx={{ maxWidth: 220 }}>
                  {item.name}
                </Text>
              </Group>

              <Group position="apart">
                <Text size="xs" color="dimmed">
                  File Size
                </Text>
                <Text size="xs" className="font-mono">
                  {byteToHumanSizeString(item.size)} ({item.size.toLocaleString()} bytes)
                </Text>
              </Group>

              <Group position="apart">
                <Text size="xs" color="dimmed">
                  Status
                </Text>
                <Text size="xs" weight={600}>
                  {item.status} ({item.progress}%)
                </Text>
              </Group>
            </Stack>
          </Box>
        </Stack>
      ),
    });
  };

  const uploadFiles = async (share: CreateShare, filesToUpload: FileUpload[]) => {
    setIsUploading(true);

    try {
      const isRev = router.pathname !== "/upload";
      const totalSize = filesToUpload.reduce((acc, file) => acc + file.size, 0);
      createdShare = await shareService.create(
        { ...share, size: totalSize },
        isRev,
      );
    } catch (e) {
      toast.axiosError(e);
      setIsUploading(false);
      return;
    }

    const fileUploadPromises = filesToUpload.map(async (file, fileIndex) =>
      promiseLimit(async () => {
        let fileId: string | undefined;

        const setFileProgress = (progress: number) => {
          setFiles((prev) =>
            prev.map((f, cbIdx) => {
              if (fileIndex === cbIdx) {
                f.uploadingProgress = progress;
              }
              return f;
            }),
          );
        };

        setFileProgress(1);

        const currentChunkSize = chunkSize.current || 10485760;
        let chunks = Math.ceil(file.size / currentChunkSize);
        if (chunks === 0) chunks++;

        let lastUploadedTime = Date.now();
        let lastLoadedBytes = 0;

        for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
          const from = chunkIndex * currentChunkSize;
          const to = from + currentChunkSize;
          const blob = file.slice(from, to);

          try {
            await shareService
              .uploadFile(
                createdShare.id,
                blob,
                {
                  id: fileId,
                  name: getNormalizedFileName(file),
                },
                chunkIndex,
                chunks,
                (progressEvent) => {
                  if (progressEvent.total && file.size > 0) {
                    const chunkProgress = progressEvent.loaded / progressEvent.total;
                    const uploadedBytesBeforeThisChunk = chunkIndex * currentChunkSize;
                    const uploadedBytesInThisChunk = blob.size * chunkProgress;
                    const totalUploaded = uploadedBytesBeforeThisChunk + uploadedBytesInThisChunk;
                    const overallPercent = (totalUploaded / file.size) * 100;

                    // Compute live speed
                    const now = Date.now();
                    const timeDiff = (now - lastUploadedTime) / 1000;
                    if (timeDiff >= 0.5) {
                      const bytesDiff = totalUploaded - lastLoadedBytes;
                      const speedBytesPerSec = bytesDiff / timeDiff;
                      const speedFormatted = `${byteToHumanSizeString(speedBytesPerSec)}/s`;
                      const remainingBytes = file.size - totalUploaded;
                      const etaSec = speedBytesPerSec > 0 ? Math.ceil(remainingBytes / speedBytesPerSec) : 0;
                      const etaFormatted = etaSec > 0 ? `~${etaSec}s remaining` : "";

                      setUploadItems((prev) =>
                        prev.map((item, idx) =>
                          idx === fileIndex
                            ? { ...item, speed: speedFormatted, eta: etaFormatted }
                            : item,
                        ),
                      );

                      lastUploadedTime = now;
                      lastLoadedBytes = totalUploaded;
                    }

                    setFileProgress(Math.min(overallPercent, 99.9));
                  }
                },
              )
              .then((response) => {
                fileId = response.id;
              });

            setFileProgress(((chunkIndex + 1) / chunks) * 100);
          } catch (e) {
            if (
              e instanceof AxiosError &&
              e.response?.data.error === "unexpected_chunk_index"
            ) {
              chunkIndex = e.response.data.expectedChunkIndex - 1;
              continue;
            } else {
              setFileProgress(-1);
              await new Promise((resolve) => setTimeout(resolve, 5000));
              chunkIndex = -1;
              continue;
            }
          }
        }
      }),
    );

    Promise.all(fileUploadPromises);
  };

  const showCreateUploadModalCallback = (filesToModal: FileUpload[]) => {
    showCreateUploadModal(
      modals,
      {
        isUserSignedIn: !!user,
        isReverseShare,
        appUrl: config.get("general.appUrl"),
        defaultAppUrl: config.get("general.appUrl", true),
        allowUnauthenticatedShares: config.get("share.allowUnauthenticatedShares"),
        enableEmailRecepients: config.get("email.enableShareEmailRecipients"),
        enableUserRecipients: config.get("share.enableUserRecipients"),
        maxExpiration: user?.isAdmin
          ? { value: 0, unit: "days" }
          : config.get("share.maxExpiration"),
        defaultExpiration: config.get("share.defaultExpiration"),
        shareIdLength: config.get("share.shareIdLength"),
        simplified,
      },
      filesToModal,
      uploadFiles,
    );
  };

  const handleDropzoneFilesChanged = (newFiles: FileUpload[]) => {
    const filtered = filterDuplicateFiles(newFiles, files, (normalizedName) =>
      toast.error(
        t("upload.notify.duplicate-skipped", { name: normalizedName }),
      ),
    );
    if (filtered.length === 0) return;

    if (autoOpenCreateUploadModal) {
      setFiles(filtered);
      showCreateUploadModalCallback(filtered);
    } else {
      setFiles((oldArr) => [...oldArr, ...filtered]);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (modals.modals.length > 0) return;
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      if (clipboardData.getData("text/plain")) {
        const pastedText = clipboardData.getData("text/plain");
        if (!pastedText) return;

        const safeName = pastedText
          .substring(0, 50)
          .replace(/[^a-zA-Z0-9 ]/g, "")
          .trim();
        const fileName = `${safeName || "clipboard_paste"}.txt`;
        const file = new File([pastedText], fileName, { type: "text/plain" });
        const fileUpload = file as FileUpload;
        fileUpload.uploadingProgress = 0;

        const filtered = filterDuplicateFiles([fileUpload], files, (normalizedName) =>
          toast.error(
            t("upload.notify.duplicate-skipped", { name: normalizedName }),
          ),
        );
        if (filtered.length === 0) return;

        if (autoOpenCreateUploadModal) {
          setFiles(filtered);
          showCreateUploadModalCallback(filtered);
        } else {
          setFiles((oldArr) => [...oldArr, ...filtered]);
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [autoOpenCreateUploadModal, modals.modals.length, files]);

  useEffect(() => {
    const fileErrorCount = files.filter((file) => file.uploadingProgress === -1).length;

    if (fileErrorCount > 0) {
      if (!errorToastShown) {
        toast.error(t("upload.notify.count-failed", { count: fileErrorCount }), {
          withCloseButton: false,
          autoClose: false,
        });
      }
      errorToastShown = true;
    } else {
      cleanNotifications();
      errorToastShown = false;
    }

    if (
      files.length > 0 &&
      files.every((file) => file.uploadingProgress >= 100) &&
      fileErrorCount === 0
    ) {
      shareService
        .completeShare(createdShare.id)
        .then((share) => {
          setIsUploading(false);
          showCompletedUploadModal(
            modals,
            share,
            config.get("general.appUrl"),
            config.get("general.appUrl", true),
          );
          setFiles([]);
        })
        .catch(() => toast.error(t("upload.notify.generic-error")));
    }
  }, [files]);

  return (
    <Box>
      <Meta title={t("upload.title") || "Upload Files"} />

      {/* Header Bar */}
      <Group position="apart" mb={24}>
        <Stack spacing={2}>
          <Title order={3} sx={{ letterSpacing: "-0.02em" }}>
            {t("upload.title") || "Upload Files"}
          </Title>
          <Text size="sm" color="dimmed">
            {files.length > 0
              ? `${files.length} file${files.length > 1 ? "s" : ""} selected (${byteToHumanSizeString(currentFilesSize)})`
              : "Drag and drop files or folders to create a secure share link."}
          </Text>
        </Stack>

        {files.length > 0 && (
          <Button
            size="sm"
            variant="primary"
            leftIcon={<TbShare size={16} />}
            disabled={files.length === 0 || isUploading}
            onClick={() => showCreateUploadModalCallback(files)}
          >
            {t("upload.button.create") || "Create Share"}
          </Button>
        )}
      </Group>

      {/* Dropzone */}
      <Dropzone
        title={
          !autoOpenCreateUploadModal && files.length > 0
            ? t("share.edit.append-upload")
            : undefined
        }
        maxShareSize={maxShareSize}
        currentFilesSize={currentFilesSize}
        onFilesChanged={handleDropzoneFilesChanged}
        isUploading={isUploading}
      />

      {/* Upload Items Queue */}
      {uploadItems.length > 0 && (
        <Stack spacing={8} mt={16}>
          <Group position="apart" mb={4}>
            <Text size="sm" weight={600}>
              Queued Files ({uploadItems.length})
            </Text>
            {!isUploading && (
              <Text
                size="xs"
                color="dimmed"
                sx={{ cursor: "pointer", "&:hover": { color: "#EF4444" } }}
                onClick={() => setFiles([])}
              >
                Clear all
              </Text>
            )}
          </Group>

          {uploadItems.map((item, idx) => (
            <UploadItem
              key={item.id || idx}
              item={item}
              onInspect={handleInspectQueuedFile}
              onRemove={isUploading ? undefined : () => handleRemoveFile(idx)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default Upload;
