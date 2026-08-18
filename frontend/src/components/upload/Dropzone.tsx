import {
  Box,
  Group,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  TbCloudUpload,
  TbFilePlus,
  TbFolderPlus,
} from "react-icons/tb";
import useTranslate from "../../hooks/useTranslate.hook";
import { FileUpload } from "../../types/File.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";
import { Button } from "../common/Button";

export interface DropzoneProps {
  onFilesChanged: (files: FileUpload[]) => void;
  maxShareSize?: number;
  currentFilesSize?: number;
  isUploading?: boolean;
  title?: string;
}

export interface DropzoneRef {
  openFilePicker: () => void;
  openFolderPicker: () => void;
}

const traverseDirectory = async (entry: any, path = ""): Promise<File[]> => {
  if (entry.isFile) {
    return new Promise((resolve) => {
      entry.file((file: File) => {
        const relativePath = path ? `${path}/${file.name}` : file.name;
        Object.defineProperty(file, "webkitRelativePath", {
          value: relativePath,
          writable: true,
          configurable: true,
        });
        resolve([file]);
      });
    });
  } else if (entry.isDirectory) {
    const dirReader = entry.createReader();
    const readEntries = (): Promise<any[]> => {
      return new Promise((resolve) => {
        dirReader.readEntries(
          (entries: any[]) => resolve(entries),
          () => resolve([])
        );
      });
    };

    let entries: any[] = [];
    let readBatch = await readEntries();
    while (readBatch.length > 0) {
      entries = entries.concat(readBatch);
      readBatch = await readEntries();
    }

    const files: File[] = [];
    for (const childEntry of entries) {
      const childFiles = await traverseDirectory(
        childEntry,
        path ? `${path}/${entry.name}` : entry.name
      );
      files.push(...childFiles);
    }
    return files;
  }
  return [];
};

export const Dropzone = forwardRef<DropzoneRef, DropzoneProps>(
  (
    {
      onFilesChanged,
      maxShareSize = 0,
      currentFilesSize = 0,
      isUploading = false,
      title,
    },
    ref
  ) => {
    const theme = useMantineTheme();
    const isDark = theme.colorScheme === "dark";
    const t = useTranslate();

    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const folderInputRef = useRef<HTMLInputElement | null>(null);

    useImperativeHandle(ref, () => ({
      openFilePicker: () => fileInputRef.current?.click(),
      openFolderPicker: () => folderInputRef.current?.click(),
    }));

    const processFiles = (files: File[]) => {
      let newFilesSize = 0;
      const mappedFiles: FileUpload[] = [];

      for (const file of files) {
        if (
          maxShareSize &&
          currentFilesSize + newFilesSize + file.size > maxShareSize
        ) {
          toast.error(
            t("upload.notify.max-size-limit", {
              size: byteToHumanSizeString(maxShareSize),
            }) || `Total files size exceeds maximum limit of ${byteToHumanSizeString(maxShareSize)}`
          );
          break;
        }
        newFilesSize += file.size;
        const fileUpload = Object.assign(file, { uploadingProgress: 0 }) as FileUpload;
        mappedFiles.push(fileUpload);
      }

      if (mappedFiles.length > 0) {
        onFilesChanged(mappedFiles);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isUploading) setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (isUploading) return;

      const items = e.dataTransfer.items;
      if (items && items.length > 0) {
        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (typeof item.webkitGetAsEntry === "function") {
            const entry = item.webkitGetAsEntry();
            if (entry) {
              const extracted = await traverseDirectory(entry);
              files.push(...extracted);
              continue;
            }
          }
          const file = item.getAsFile();
          if (file) files.push(file);
        }
        if (files.length > 0) {
          processFiles(files);
          return;
        }
      }

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(Array.from(e.dataTransfer.files));
      }
    };

    // Global clipboard paste listener
    useEffect(() => {
      const handlePaste = (e: ClipboardEvent) => {
        if (isUploading) return;
        const target = e.target as HTMLElement;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }

        if (e.clipboardData && e.clipboardData.files.length > 0) {
          const files = Array.from(e.clipboardData.files);
          processFiles(files);
          toast.info(
            `Pasted ${files.length} file${files.length > 1 ? "s" : ""} from clipboard.`
          );
        }
      };

      window.addEventListener("paste", handlePaste);
      return () => window.removeEventListener("paste", handlePaste);
    }, [isUploading, currentFilesSize, maxShareSize]);

    return (
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={(theme) => {
          const isDark = theme.colorScheme === "dark";
          return {
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
            borderRadius: "var(--radius-xl, 20px)",
            backgroundColor: isDragOver
              ? isDark
                ? "var(--brand-primary-subtle, rgba(59, 130, 246, 0.12))"
                : "var(--brand-primary-subtle, rgba(37, 99, 235, 0.08))"
              : isDark
                ? "var(--surface-0, #0F1319)"
                : "var(--surface-0, #FFFFFF)",
            backgroundImage: isDragOver
              ? "radial-gradient(ellipse at center, var(--brand-primary-subtle, rgba(59, 130, 246, 0.2)), transparent 70%)"
              : isDark
                ? "linear-gradient(180deg, rgba(255, 255, 255, 0.025) 0%, transparent 100%)"
                : "none",
            border: `2px dashed ${
              isDragOver
                ? "var(--brand-primary, #3B82F6)"
                : isDark
                  ? "var(--border-medium, rgba(255, 255, 255, 0.13))"
                  : "var(--border-medium, rgba(15, 23, 42, 0.12))"
            }`,
            boxShadow: isDragOver
              ? "0 0 28px var(--brand-primary-subtle, rgba(59, 130, 246, 0.3)), inset 0 0 20px var(--brand-primary-subtle, rgba(59, 130, 246, 0.1))"
              : "var(--shadow-sm, 0 1px 3px rgba(15, 23, 42, 0.06)), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
            transition: "all var(--transition-normal, 250ms cubic-bezier(0.16, 1, 0.3, 1))",
            cursor: isUploading ? "not-allowed" : "pointer",
            overflow: "hidden",
          };
        }}
        onClick={() => {
          if (!isUploading && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files) {
              processFiles(Array.from(e.target.files));
              e.target.value = "";
            }
          }}
        />
        <input
          type="file"
          ref={folderInputRef}
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files) {
              processFiles(Array.from(e.target.files));
              e.target.value = "";
            }
          }}
        />

        {/* Center Icon */}
        <Box
          sx={(theme) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: "var(--radius-lg, 14px)",
            backgroundColor: isDragOver
              ? "var(--brand-primary)"
              : isDark
                ? "var(--brand-primary-subtle, rgba(59, 130, 246, 0.15))"
                : "var(--brand-primary-subtle, rgba(37, 99, 235, 0.10))",
            color: isDragOver ? "#FFFFFF" : "var(--brand-primary)",
            marginBottom: 16,
            transition: "all var(--transition-fast, 150ms cubic-bezier(0.16, 1, 0.3, 1))",
            transform: isDragOver ? "scale(1.08)" : "scale(1)",
          })}
        >
          <TbCloudUpload size={32} />
        </Box>

        {/* Primary Message */}
        <Stack align="center" spacing={4} sx={{ textAlign: "center", marginBottom: 20 }}>
          <Text
            sx={{
              fontSize: 16,
              fontWeight: 600,
              color: isDark
                ? "var(--text-primary, #F8FAFC)"
                : "var(--text-primary, #0F172A)",
            }}
          >
            {title || t("upload.dropzone.title") || "Drop files here or click to browse"}
          </Text>
          <Text
            size="sm"
            sx={{
              color: "var(--text-secondary, #94A3B8)",
              maxWidth: 420,
            }}
          >
            {t("upload.dropzone.subtitle") ||
              "Support for any file type, folders, and clipboard paste (Ctrl+V)"}
          </Text>
        </Stack>

        {/* Button Controls */}
        <Group
          spacing={12}
          onClick={(e) => e.stopPropagation()}
          sx={{ zIndex: 2 }}
        >
          <Button
            size="sm"
            variant="primary"
            leftIcon={<TbFilePlus size={16} />}
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {t("upload.button.select-files") || "Select Files"}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            leftIcon={<TbFolderPlus size={16} />}
            disabled={isUploading}
            onClick={() => folderInputRef.current?.click()}
          >
            {t("upload.button.select-folder") || "Select Folder"}
          </Button>
        </Group>

        {maxShareSize > 0 && (
          <Text
            size="xs"
            sx={{
              marginTop: 16,
              color: "var(--text-muted, #64748B)",
            }}
            className="font-mono"
          >
            Maximum share size: {byteToHumanSizeString(maxShareSize)}
          </Text>
        )}
      </Box>
    );
  }
);

Dropzone.displayName = "Dropzone";
export default Dropzone;
