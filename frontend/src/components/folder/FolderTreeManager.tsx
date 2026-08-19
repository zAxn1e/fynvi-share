import {
  Breadcrumbs,
  Button,
  Group,
  Modal,
  Paper,
  Text,
  TextInput,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { TbFolder, TbFolderPlus, TbHome } from "react-icons/tb";
import api from "../../services/api.service";

export interface FolderItem {
  id: string;
  name: string;
  parentId?: string | null;
  files?: any[];
  children?: FolderItem[];
}

export interface FolderTreeManagerProps {
  shareId: string;
  onSelectFolder?: (folderId: string | undefined) => void;
}

export const FolderTreeManager: React.FC<FolderTreeManagerProps> = ({
  shareId,
  onSelectFolder,
}) => {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(
    undefined,
  );
  const [folderPath, setFolderPath] = useState<FolderItem[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchFolders = async () => {
    try {
      const res = await api.get(`shares/${shareId}/folders`);
      setFolders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch folders", err);
    }
  };

  useEffect(() => {
    if (shareId) {
      fetchFolders();
    }
  }, [shareId]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setLoading(true);
    try {
      await api.post(`shares/${shareId}/folders`, {
        name: newFolderName.trim(),
        parentId: currentFolderId,
      });
      setNewFolderName("");
      setIsModalOpen(false);
      await fetchFolders();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to create folder");
    } finally {
      setLoading(false);
    }
  };

  const currentLevelFolders = folders.filter((f) =>
    currentFolderId ? f.parentId === currentFolderId : !f.parentId,
  );

  const navigateToFolder = (folder?: FolderItem) => {
    if (!folder) {
      setCurrentFolderId(undefined);
      setFolderPath([]);
      onSelectFolder?.(undefined);
    } else {
      setCurrentFolderId(folder.id);
      onSelectFolder?.(folder.id);

      // Build breadcrumb path
      const path: FolderItem[] = [folder];
      let curr = folder;
      while (curr.parentId) {
        const parent = folders.find((f) => f.id === curr.parentId);
        if (parent) {
          path.unshift(parent);
          curr = parent;
        } else {
          break;
        }
      }
      setFolderPath(path);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Header & Breadcrumb Bar */}
      <Group position="apart">
        <Breadcrumbs>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigateToFolder(undefined);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              color: currentFolderId
                ? "var(--text-secondary)"
                : "var(--brand-primary)",
              fontWeight: 600,
            }}
          >
            <TbHome size={16} /> Root
          </a>
          {folderPath.map((item, idx) => (
            <a
              key={item.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigateToFolder(item);
              }}
              style={{
                color:
                  idx === folderPath.length - 1
                    ? "var(--brand-primary)"
                    : "var(--text-secondary)",
                fontWeight: 600,
              }}
            >
              {item.name}
            </a>
          ))}
        </Breadcrumbs>

        <Button
          leftIcon={<TbFolderPlus size={18} />}
          variant="light"
          size="xs"
          onClick={() => setIsModalOpen(true)}
        >
          New Folder
        </Button>
      </Group>

      {/* Folders Grid */}
      {currentLevelFolders.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {currentLevelFolders.map((folder) => (
            <Paper
              key={folder.id}
              onClick={() => navigateToFolder(folder)}
              sx={(theme) => ({
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.875rem 1rem",
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? "var(--surface-1, #151B24)"
                    : "var(--surface-1, #F1F5F9)",
                borderRadius: "var(--radius-md, 10px)",
                border:
                  "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
                transition: "all 150ms ease",
                "&:hover": {
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? "var(--surface-2, #1C2430)"
                      : "var(--surface-2, #E2E8F0)",
                },
              })}
            >
              <TbFolder size={24} color="var(--brand-primary)" />
              <div>
                <Text
                  weight={600}
                  size="sm"
                  sx={{ color: "var(--text-primary)" }}
                >
                  {folder.name}
                </Text>
                <Text size="xs" color="dimmed">
                  {folder.files?.length || 0} items
                </Text>
              </div>
            </Paper>
          ))}
        </div>
      )}

      {/* New Folder Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Folder"
        centered
        radius="lg"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <TextInput
            label="Folder Name"
            placeholder="e.g. Documents, Screenshots"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.currentTarget.value)}
            autoFocus
          />
          <Group position="right">
            <Button variant="subtle" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="filled"
              loading={loading}
              onClick={handleCreateFolder}
            >
              Create
            </Button>
          </Group>
        </div>
      </Modal>
    </div>
  );
};
