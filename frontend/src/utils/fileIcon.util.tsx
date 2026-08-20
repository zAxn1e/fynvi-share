import React from "react";
import {
  TbArchive,
  TbFile,
  TbFile3D,
  TbFileCode,
  TbFileDatabase,
  TbFileDescription,
  TbFileInfo,
  TbFileMusic,
  TbFileSpreadsheet,
  TbFileText,
  TbFileTypeCsv,
  TbFileTypeDoc,
  TbFileTypeDocx,
  TbFileTypePdf,
  TbFileTypePpt,
  TbFileTypeXls,
  TbFileTypeZip,
  TbFileTypography,
  TbFileVector,
  TbFileZip,
  TbHeadphones,
  TbMovie,
  TbMusic,
  TbPhoto,
  TbVideo,
} from "react-icons/tb";
import { BadgeVariant } from "../components/common/Badge";

export type FileCategoryType =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "code"
  | "text"
  | "archive"
  | "database"
  | "model"
  | "font"
  | "binary"
  | "unknown";

export interface FileCategoryInfo {
  type: FileCategoryType;
  label: string;
  variant: BadgeVariant;
  color: string;
  bgColor: string;
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    className?: string;
    style?: React.CSSProperties;
  }>;
}

const AUDIO_EXTENSIONS = new Set([
  "flac",
  "mp3",
  "wav",
  "ogg",
  "m4a",
  "aac",
  "wma",
  "alac",
  "aiff",
  "aif",
  "opus",
  "mid",
  "midi",
  "ac3",
  "dts",
  "amr",
  "mka",
  "ape",
  "pcm",
  "dsd",
]);

const VIDEO_EXTENSIONS = new Set([
  "mp4",
  "webm",
  "mkv",
  "avi",
  "mov",
  "wmv",
  "flv",
  "m4v",
  "mts",
  "m2ts",
  "3gp",
  "3g2",
  "vob",
  "ogv",
  "divx",
  "rm",
  "rmvb",
  "asf",
]);

const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "jpe",
  "jfif",
  "gif",
  "webp",
  "svg",
  "svgz",
  "bmp",
  "ico",
  "avif",
  "tiff",
  "tif",
  "heic",
  "heif",
  "raw",
  "cr2",
  "nef",
  "psd",
  "ai",
  "eps",
]);

const PDF_EXTENSIONS = new Set(["pdf"]);

const DOCUMENT_EXTENSIONS = new Set([
  "doc",
  "docx",
  "odt",
  "rtf",
  "pages",
  "epub",
  "mobi",
  "azw3",
  "djvu",
]);

const SPREADSHEET_EXTENSIONS = new Set([
  "xls",
  "xlsx",
  "csv",
  "tsv",
  "ods",
  "numbers",
  "parquet",
  "xlsm",
  "xlsb",
]);

const PRESENTATION_EXTENSIONS = new Set([
  "ppt",
  "pptx",
  "odp",
  "key",
  "pps",
  "ppsx",
]);

const CODE_EXTENSIONS = new Set([
  "js",
  "mjs",
  "cjs",
  "jsx",
  "ts",
  "mts",
  "cts",
  "tsx",
  "html",
  "htm",
  "css",
  "scss",
  "sass",
  "less",
  "json",
  "json5",
  "xml",
  "yaml",
  "yml",
  "toml",
  "py",
  "rs",
  "go",
  "java",
  "c",
  "cpp",
  "cc",
  "cxx",
  "h",
  "hpp",
  "cs",
  "php",
  "rb",
  "sh",
  "bash",
  "zsh",
  "bat",
  "cmd",
  "ps1",
  "sql",
  "lua",
  "swift",
  "kt",
  "kts",
  "dart",
  "vue",
  "svelte",
  "dockerfile",
  "graphql",
  "prisma",
  "asm",
  "v",
  "zig",
]);

const TEXT_EXTENSIONS = new Set([
  "txt",
  "md",
  "markdown",
  "log",
  "env",
  "ini",
  "conf",
  "cfg",
  "nfo",
  "rst",
  "tex",
]);

const ARCHIVE_EXTENSIONS = new Set([
  "zip",
  "tar",
  "gz",
  "tgz",
  "7z",
  "rar",
  "bz2",
  "tbz2",
  "xz",
  "txz",
  "zst",
  "iso",
  "dmg",
  "pkg",
  "deb",
  "rpm",
  "cab",
  "arj",
  "lzh",
]);

const DATABASE_EXTENSIONS = new Set([
  "db",
  "sqlite",
  "sqlite3",
  "mdb",
  "accdb",
  "frm",
  "ibd",
]);

const MODEL_3D_EXTENSIONS = new Set([
  "blend",
  "obj",
  "fbx",
  "stl",
  "gltf",
  "glb",
  "dwg",
  "dxf",
  "step",
  "stp",
  "dae",
  "3ds",
  "ply",
]);

const FONT_EXTENSIONS = new Set(["ttf", "otf", "woff", "woff2", "eot", "fon"]);

const BINARY_EXTENSIONS = new Set([
  "exe",
  "msi",
  "dll",
  "bin",
  "apk",
  "appxbundle",
  "appx",
  "app",
  "elf",
  "so",
  "dylib",
  "img",
]);

/**
 * Classifies any file based on its MIME type and file name/extension.
 */
export const getFileCategory = (
  mimeType: string = "",
  fileName: string = "",
): FileCategoryInfo => {
  const normalizedMime = (mimeType || "").toLowerCase().trim();
  const hasDot = fileName.includes(".");
  const extension = hasDot
    ? fileName.split(".").pop()?.toLowerCase() || ""
    : "";

  // 1. Audio
  if (
    normalizedMime.startsWith("audio/") ||
    (extension && (AUDIO_EXTENSIONS.has(extension) || extension === "flac"))
  ) {
    const extLabel = extension ? `${extension.toUpperCase()} Audio` : "Audio";
    return {
      type: "audio",
      label: extLabel,
      variant: "warning",
      color: "#10B981", // Emerald Green
      bgColor: "rgba(16, 185, 129, 0.12)",
      icon: TbMusic,
    };
  }

  // 2. Video
  if (normalizedMime.startsWith("video/") || VIDEO_EXTENSIONS.has(extension)) {
    return {
      type: "video",
      label: "Video",
      variant: "info",
      color: "#8B5CF6", // Violet / Purple
      bgColor: "rgba(139, 92, 246, 0.12)",
      icon: TbVideo,
    };
  }

  // 3. Image
  if (normalizedMime.startsWith("image/") || IMAGE_EXTENSIONS.has(extension)) {
    return {
      type: "image",
      label: "Image",
      variant: "primary",
      color: "#3B82F6", // Blue
      bgColor: "rgba(59, 130, 246, 0.12)",
      icon: TbPhoto,
    };
  }

  // 4. PDF Document
  if (normalizedMime === "application/pdf" || PDF_EXTENSIONS.has(extension)) {
    return {
      type: "pdf",
      label: "PDF Document",
      variant: "danger",
      color: "#EF4444", // Red
      bgColor: "rgba(239, 68, 68, 0.12)",
      icon: TbFileTypePdf,
    };
  }

  // 5. Spreadsheets / Tables
  if (
    normalizedMime.includes("spreadsheet") ||
    normalizedMime.includes("excel") ||
    normalizedMime.includes("csv") ||
    SPREADSHEET_EXTENSIONS.has(extension)
  ) {
    return {
      type: "spreadsheet",
      label: "Spreadsheet",
      variant: "success",
      color: "#059669", // Green
      bgColor: "rgba(5, 150, 105, 0.12)",
      icon: TbFileSpreadsheet,
    };
  }

  // 6. Presentations
  if (
    normalizedMime.includes("presentation") ||
    normalizedMime.includes("powerpoint") ||
    PRESENTATION_EXTENSIONS.has(extension)
  ) {
    return {
      type: "presentation",
      label: "Presentation",
      variant: "warning",
      color: "#F97316", // Orange
      bgColor: "rgba(249, 115, 22, 0.12)",
      icon: TbFileTypePpt,
    };
  }

  // 7. Word / Office Documents
  if (
    normalizedMime.includes("word") ||
    normalizedMime.includes("officedocument.wordprocessing") ||
    DOCUMENT_EXTENSIONS.has(extension)
  ) {
    return {
      type: "document",
      label: "Document",
      variant: "primary",
      color: "#2563EB", // Royal Blue
      bgColor: "rgba(37, 99, 235, 0.12)",
      icon: TbFileDescription,
    };
  }

  // 8. Source Code
  if (
    normalizedMime.includes("javascript") ||
    normalizedMime.includes("typescript") ||
    normalizedMime.includes("json") ||
    normalizedMime.includes("xml") ||
    CODE_EXTENSIONS.has(extension)
  ) {
    return {
      type: "code",
      label: "Source Code",
      variant: "info",
      color: "#EC4899", // Pink / Fuchsia
      bgColor: "rgba(236, 72, 153, 0.12)",
      icon: TbFileCode,
    };
  }

  // 9. Plain Text / Notes
  if (normalizedMime.startsWith("text/") || TEXT_EXTENSIONS.has(extension)) {
    return {
      type: "text",
      label: "Plain Text",
      variant: "default",
      color: "#94A3B8", // Slate Gray
      bgColor: "rgba(148, 163, 184, 0.12)",
      icon: TbFileText,
    };
  }

  // 10. Archives / Compressed
  if (
    normalizedMime.includes("zip") ||
    normalizedMime.includes("tar") ||
    normalizedMime.includes("compressed") ||
    normalizedMime.includes("archive") ||
    ARCHIVE_EXTENSIONS.has(extension)
  ) {
    return {
      type: "archive",
      label: "Archive",
      variant: "warning",
      color: "#F59E0B", // Amber
      bgColor: "rgba(245, 158, 11, 0.12)",
      icon: TbFileZip,
    };
  }

  // 11. Database
  if (DATABASE_EXTENSIONS.has(extension)) {
    return {
      type: "database",
      label: "Database",
      variant: "info",
      color: "#06B6D4", // Cyan
      bgColor: "rgba(6, 182, 212, 0.12)",
      icon: TbFileDatabase,
    };
  }

  // 12. 3D & CAD Models
  if (MODEL_3D_EXTENSIONS.has(extension)) {
    return {
      type: "model",
      label: "3D Model",
      variant: "info",
      color: "#14B8A6", // Teal
      bgColor: "rgba(20, 184, 166, 0.12)",
      icon: TbFile3D,
    };
  }

  // 13. Fonts
  if (normalizedMime.startsWith("font/") || FONT_EXTENSIONS.has(extension)) {
    return {
      type: "font",
      label: "Font",
      variant: "default",
      color: "#A855F7", // Purple
      bgColor: "rgba(168, 85, 247, 0.12)",
      icon: TbFileTypography,
    };
  }

  // 14. Executables & Binaries
  if (BINARY_EXTENSIONS.has(extension)) {
    return {
      type: "binary",
      label: "Binary / App",
      variant: "danger",
      color: "#E11D48", // Rose Red
      bgColor: "rgba(225, 29, 72, 0.12)",
      icon: TbFile,
    };
  }

  // 15. Default Unknown File
  const fallbackLabel = extension ? `${extension.toUpperCase()} File` : "File";
  return {
    type: "unknown",
    label: fallbackLabel,
    variant: "default",
    color: "#94A3B8", // Neutral Slate
    bgColor: "rgba(148, 163, 184, 0.10)",
    icon: TbFile,
  };
};

export interface FileIconProps {
  fileName?: string;
  mimeType?: string;
  category?: FileCategoryInfo;
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Universal File Icon Component that renders the accurate icon and color
 * for any file based on its name or mimeType.
 */
export const FileIcon: React.FC<FileIconProps> = ({
  fileName = "",
  mimeType = "",
  category: propCategory,
  size = 18,
  color,
  className,
  style,
}) => {
  const category = propCategory || getFileCategory(mimeType, fileName);
  const IconComponent = category.icon;
  const iconColor = color || category.color;

  return (
    <IconComponent
      size={size}
      color={iconColor}
      className={className}
      style={style}
    />
  );
};

export default FileIcon;
