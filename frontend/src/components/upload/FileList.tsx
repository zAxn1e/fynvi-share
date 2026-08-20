import {
  ActionIcon,
  Box,
  Center,
  Group,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useModals } from "@mantine/modals";
import React from "react";
import { GrUndo } from "react-icons/gr";
import { TbEdit, TbEye, TbTrash } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { FileListItem, FileMetaData } from "../../types/File.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import { HoverTip } from "../core/HoverTip";
import showFilePreviewModal from "../share/modals/showFilePreviewModal";
import showTextEditorModal from "./modals/showTextEditorModal";
import UploadProgressIndicator from "./UploadProgressIndicator";
import { FileIcon, getFileCategory } from "../../utils/fileIcon.util";
import { AudioPlayer } from "../file/AudioPlayer";

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

const getFileNameOrPath = (file: FileListItem) => {
  const pathName =
    "webkitRelativePath" in file && file.webkitRelativePath
      ? file.webkitRelativePath
      : file.name;
  return pathName.replace(/\\/g, "/").replace(/^\//, "");
};

const FileListRow = ({
  file,
  onRemove,
  onRestore,
  onEdit,
  onPreview,
}: {
  file: FileListItem;
  onRemove?: () => void;
  onRestore?: () => void;
  onEdit?: () => void;
  onPreview?: () => void;
}) => {
  const uploadable = "uploadingProgress" in file;
  const uploading = uploadable && file.uploadingProgress !== 0;
  const removable = uploadable
    ? file.uploadingProgress === 0
    : onRemove && !file.deleted;
  const restorable = onRestore && !uploadable && !!file.deleted;
  const deleted = !uploadable && !!file.deleted;

  const fileNameOrPath = getFileNameOrPath(file);
  const isTextFile = shareService.isShareTextFile(fileNameOrPath);
  const editable = isTextFile && uploadable && file.uploadingProgress === 0;

  const t = useTranslate();

  return (
    <tr
      style={{
        color: deleted ? "rgba(120, 120, 120, 0.5)" : "inherit",
        textDecoration: deleted ? "line-through" : "none",
      }}
    >
      <td>{renderFileName(fileNameOrPath)}</td>
      <td>{byteToHumanSizeString(+file.size)}</td>
      <td>
        <Group position="right" spacing="xs" noWrap>
          {onPreview && !deleted && (
            <HoverTip label={t("common.button.preview") || "Preview"}>
              <ActionIcon
                color="green"
                variant="light"
                size={25}
                onClick={onPreview}
              >
                <TbEye size={16} />
              </ActionIcon>
            </HoverTip>
          )}
          {editable && (
            <HoverTip label={t("common.button.edit")}>
              <ActionIcon
                color="blue"
                variant="light"
                size={25}
                onClick={onEdit}
              >
                <TbEdit />
              </ActionIcon>
            </HoverTip>
          )}
          {removable && (
            <HoverTip label={t("common.button.delete")}>
              <ActionIcon
                color="red"
                variant="light"
                size={25}
                onClick={onRemove}
              >
                <TbTrash />
              </ActionIcon>
            </HoverTip>
          )}
          {uploading && (
            <UploadProgressIndicator progress={file.uploadingProgress} />
          )}
          {restorable && (
            <HoverTip label={t("common.button.undo")}>
              <ActionIcon
                color="victoria"
                variant="light"
                size={25}
                onClick={onRestore}
              >
                <GrUndo />
              </ActionIcon>
            </HoverTip>
          )}
        </Group>
      </td>
    </tr>
  );
};

const FileList = <T extends FileListItem = FileListItem>({
  files,
  setFiles,
  shareId,
}: {
  files: T[];
  setFiles: (files: T[]) => void;
  shareId?: string;
}) => {
  const modals = useModals();

  const remove = (index: number) => {
    const file = files[index];
    if ("uploadingProgress" in file) {
      files.splice(index, 1);
    } else {
      files[index] = { ...file, deleted: true };
    }
    setFiles([...files]);
  };

  const restore = (index: number) => {
    const file = files[index];
    if ("uploadingProgress" in file) {
      return;
    } else {
      files[index] = { ...file, deleted: false };
    }
    setFiles([...files]);
  };

  const edit = async (index: number) => {
    const originalFile = files[index] as unknown as File;
    const text = await originalFile.text();
    showTextEditorModal(index, files, setFiles, text, modals);
  };

  const preview = (file: FileListItem) => {
    if ("id" in file && shareId) {
      showFilePreviewModal(shareId, file as unknown as FileMetaData, modals);
    } else if (file instanceof File || "type" in file) {
      const localFile = file as File;
      const mimeType = localFile.type || "";
      const category = getFileCategory(mimeType, localFile.name);
      const isImage = category.type === "image";
      const isVideo = category.type === "video";
      const isAudio = category.type === "audio";

      if (localFile instanceof File) {
        const objectUrl = URL.createObjectURL(localFile);
        modals.openModal({
          title: localFile.name,
          size: "md",
          children: (
            <Stack spacing={16} py={8}>
              {isAudio ? (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    py: 8,
                  }}
                >
                  <AudioPlayer
                    src={objectUrl}
                    fileName={localFile.name}
                    fileSize={localFile.size}
                  />
                </Box>
              ) : isVideo ? (
                <Center py={8}>
                  <video
                    src={objectUrl}
                    controls
                    playsInline
                    style={{
                      maxWidth: "100%",
                      maxHeight: "50vh",
                      borderRadius: 8,
                    }}
                  />
                </Center>
              ) : isImage ? (
                <Center py={8}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={objectUrl}
                    alt={localFile.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "60vh",
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                </Center>
              ) : (
                <Box
                  sx={{
                    backgroundColor: "rgba(0, 0, 0, 0.15)",
                    borderRadius: 8,
                    padding: "28px 16px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      backgroundColor: category.bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: category.color,
                    }}
                  >
                    <FileIcon
                      fileName={localFile.name}
                      mimeType={mimeType}
                      category={category}
                      size={28}
                    />
                  </Box>
                  <Text size="sm" weight={600}>
                    {category.label}
                  </Text>
                  <Text size="xs" color="dimmed">
                    Direct visual preview unavailable for this file format in
                    browser
                  </Text>
                </Box>
              )}
            </Stack>
          ),
        });
      }
    }
  };

  const rows = files.map((file, i) => (
    <FileListRow
      key={i}
      file={file}
      onRemove={() => remove(i)}
      onRestore={() => restore(i)}
      onEdit={() => edit(i)}
      onPreview={() => preview(file)}
    />
  ));

  return (
    <Table>
      <thead>
        <tr>
          <th>
            <FormattedMessage id="upload.filelist.name" />
          </th>
          <th>
            <FormattedMessage id="upload.filelist.size" />
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
  );
};

export default FileList;
