import { ModalsContextProps } from "@mantine/modals/lib/context";
import shareService from "../../../services/share.service";
import { FileMetaData } from "../../../types/File.type";
import { FilePreviewContent } from "../../file/FilePreview";

const showFilePreviewModal = (
  shareId: string,
  file: FileMetaData,
  modals: ModalsContextProps,
  recipientId?: string,
) => {
  return modals.openModal({
    size: "xl",
    centered: true,
    withCloseButton: false,
    padding: 0,
    radius: "lg",
    styles: {
      content: {
        backgroundColor: "transparent !important",
        overflow: "hidden",
        boxShadow: "none",
      },
      body: {
        padding: "0 !important",
      },
    },
    children: (
      <FilePreviewContent
        shareId={shareId}
        file={file}
        onClose={() => modals.closeAll()}
        onDownload={() => {
          shareService.downloadFile(shareId, file.id, recipientId);
        }}
      />
    ),
  });
};

export default showFilePreviewModal;
