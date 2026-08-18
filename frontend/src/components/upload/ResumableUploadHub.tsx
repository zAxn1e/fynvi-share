import { ActionIcon, Badge, Group, Paper, Progress, Text } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import React, { useRef, useState } from "react";
import {
  TbAlertCircle,
  TbCheck,
  TbCloudUpload,
  TbPlayerPause,
  TbPlayerPlay,
  TbRefresh,
  TbTrash,
} from "react-icons/tb";
import shareService from "../../services/share.service";

export interface ResumableUploadHubProps {
  shareId: string;
  folderId?: string;
  onUploadComplete?: () => void;
}

interface UploadItem {
  id: string;
  file: File;
  sessionId?: string;
  progress: number;
  speed: string;
  eta: string;
  status: "PENDING" | "UPLOADING" | "PAUSED" | "COMPLETED" | "FAILED";
  errorMessage?: string;
  uploadedBytes: number;
  isPaused: boolean;
}

export const ResumableUploadHub: React.FC<ResumableUploadHubProps> = ({
  shareId,
  folderId,
  onUploadComplete,
}) => {
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const isPausedRef = useRef<Record<string, boolean>>({});

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDrop = (files: File[]) => {
    const newItems: UploadItem[] = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      progress: 0,
      speed: "0 KB/s",
      eta: "--",
      status: "PENDING",
      uploadedBytes: 0,
      isPaused: false,
    }));

    setQueue((prev) => [...prev, ...newItems]);
    newItems.forEach((item) => startUpload(item));
  };

  const startUpload = async (item: UploadItem) => {
    try {
      setQueue((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "UPLOADING" } : i)),
      );

      // 1. Create Upload Session
      const session = await shareService.createUploadSession(
        shareId,
        item.file.name,
        item.file.size,
        item.file.type || "application/octet-stream",
        folderId,
      );

      const sessionId = session.id;
      const chunkSize = session.chunkSize || 10 * 1024 * 1024;
      const totalChunks = session.totalChunks;

      setQueue((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, sessionId } : i)),
      );

      // 2. Fetch Session Status for Resume capability
      const statusRes = await shareService.getUploadSessionStatus(sessionId);
      const receivedChunksSet = new Set<number>(statusRes.receivedChunks || []);

      let startTime = Date.now();
      let lastUploadedBytes = receivedChunksSet.size * chunkSize;

      // 3. Upload Missing Chunks
      for (let index = 0; index < totalChunks; index++) {
        if (isPausedRef.current[item.id]) {
          setQueue((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, status: "PAUSED" } : i,
            ),
          );
          return;
        }

        if (receivedChunksSet.has(index)) {
          continue;
        }

        const start = index * chunkSize;
        const end = Math.min(start + chunkSize, item.file.size);
        const chunkBlob = item.file.slice(start, end);

        await shareService.uploadChunkSession(
          sessionId,
          index,
          chunkBlob,
          undefined,
          (progressEvent) => {
            const currentChunkBytes = progressEvent.loaded || 0;
            const totalUploadedBytes = start + currentChunkBytes;
            const progress = Math.min(
              100,
              Math.round((totalUploadedBytes / item.file.size) * 100),
            );

            const now = Date.now();
            const elapsedSec = (now - startTime) / 1000;
            let speedStr = "0 KB/s";
            let etaStr = "--";

            if (elapsedSec > 0.5) {
              const bytesDiff = totalUploadedBytes - lastUploadedBytes;
              const bytesPerSec = bytesDiff / elapsedSec;
              speedStr = `${formatSize(bytesPerSec)}/s`;

              const remainingBytes = item.file.size - totalUploadedBytes;
              const remainingSec = Math.ceil(remainingBytes / (bytesPerSec || 1));
              etaStr = `${remainingSec}s`;
            }

            setQueue((prev) =>
              prev.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      progress,
                      uploadedBytes: totalUploadedBytes,
                      speed: speedStr,
                      eta: etaStr,
                    }
                  : i,
              ),
            );
          },
        );
      }

      // 4. Complete Session & Finalize File
      await shareService.completeUploadSession(sessionId);

      setQueue((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                progress: 100,
                status: "COMPLETED",
                speed: "--",
                eta: "Done",
              }
            : i,
        ),
      );

      onUploadComplete?.();
    } catch (e: any) {
      setQueue((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: "FAILED",
                errorMessage: e?.response?.data?.message || String(e),
              }
            : i,
        ),
      );
    }
  };

  const togglePause = (id: string) => {
    const currentPaused = isPausedRef.current[id] || false;
    const nextPaused = !currentPaused;
    isPausedRef.current[id] = nextPaused;

    setQueue((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (nextPaused) {
            return { ...item, status: "PAUSED", isPaused: true };
          } else {
            const updated = { ...item, status: "UPLOADING" as const, isPaused: false };
            startUpload(updated);
            return updated;
          }
        }
        return item;
      }),
    );
  };

  const removeQueueItem = (id: string) => {
    isPausedRef.current[id] = true;
    setQueue((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Drag and Drop Zone */}
      <Dropzone
        onDrop={handleDrop}
        radius="md"
        padding="xl"
      >
        <Group position="center" spacing="md" style={{ pointerEvents: "none" }}>
          <TbCloudUpload size={48} color="var(--brand-primary, #3B82F6)" />
          <div>
            <Text size="lg" weight={700} style={{ color: "var(--text-primary, #F8FAFC)" }}>
              Drag & drop files here to upload
            </Text>
            <Text size="sm" style={{ color: "var(--text-secondary, #94A3B8)" }}>
              Supports large files, chunked streaming & instant pause/resume
            </Text>
          </div>
        </Group>
      </Dropzone>

      {/* Upload Queue Queue List */}
      {queue.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Text weight={600} size="sm" sx={{ color: "var(--text-muted)" }}>
            UPLOAD QUEUE ({queue.length})
          </Text>

          {queue.map((item) => (
            <Paper
              key={item.id}
              radius="md"
              p="md"
              sx={(theme) => ({
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? "var(--surface-1, #151B24)"
                    : "var(--surface-1, #F1F5F9)",
                borderRadius: "var(--radius-md, 10px)",
                border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
              })}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <div>
                  <Text weight={600} size="sm" sx={{ color: "var(--text-primary)" }}>
                    {item.file.name}
                  </Text>
                  <Text size="xs" color="dimmed">
                    {formatSize(item.file.size)} • {item.speed} • ETA: {item.eta}
                  </Text>
                </div>

                <Group spacing="xs">
                  {item.status === "UPLOADING" && (
                    <Badge color="blue" variant="light">Uploading</Badge>
                  )}
                  {item.status === "PAUSED" && (
                    <Badge color="yellow" variant="light">Paused</Badge>
                  )}
                  {item.status === "COMPLETED" && (
                    <Badge color="green" variant="light">Completed</Badge>
                  )}
                  {item.status === "FAILED" && (
                    <Badge color="red" variant="light">Failed</Badge>
                  )}

                  {(item.status === "UPLOADING" || item.status === "PAUSED") && (
                    <ActionIcon
                      variant="subtle"
                      onClick={() => togglePause(item.id)}
                      title={item.status === "PAUSED" ? "Resume Upload" : "Pause Upload"}
                    >
                      {item.status === "PAUSED" ? (
                        <TbPlayerPlay size={18} color="var(--brand-primary)" />
                      ) : (
                        <TbPlayerPause size={18} color="var(--state-warning, #F59E0B)" />
                      )}
                    </ActionIcon>
                  )}

                  {item.status === "FAILED" && (
                    <ActionIcon
                      variant="subtle"
                      onClick={() => startUpload(item)}
                      title="Retry Upload"
                    >
                      <TbRefresh size={18} color="var(--brand-primary)" />
                    </ActionIcon>
                  )}

                  <ActionIcon
                    variant="subtle"
                    onClick={() => removeQueueItem(item.id)}
                    title="Remove"
                  >
                    <TbTrash size={18} color="var(--state-danger, #EF4444)" />
                  </ActionIcon>
                </Group>
              </div>

              {/* Progress Bar */}
              <Progress
                value={item.progress}
                size="xs"
                radius="xl"
                styles={{
                  bar: {
                    background:
                      item.status === "FAILED"
                        ? "var(--state-danger, #EF4444)"
                        : item.status === "COMPLETED"
                          ? "var(--state-success, #10B981)"
                          : "var(--brand-gradient)",
                  },
                }}
              />

              {item.errorMessage && (
                <Text
                  size="xs"
                  color="red"
                  style={{ marginTop: "0.375rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                >
                  <TbAlertCircle size={14} /> {item.errorMessage}
                </Text>
              )}
            </Paper>
          ))}
        </div>
      )}
    </div>
  );
};
