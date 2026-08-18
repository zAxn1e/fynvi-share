import { FileUpload } from "../types/File.type";

let pendingFiles: FileUpload[] = [];

export const pendingUploadService = {
  setPendingFiles: (files: FileUpload[]) => {
    pendingFiles = files;
  },
  getPendingFiles: (): FileUpload[] => {
    const files = [...pendingFiles];
    pendingFiles = [];
    return files;
  },
  hasPendingFiles: (): boolean => {
    return pendingFiles.length > 0;
  },
};

export default pendingUploadService;
