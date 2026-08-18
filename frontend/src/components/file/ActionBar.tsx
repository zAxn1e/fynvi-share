import {
  ActionIcon,
  Box,
  Group,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import React from "react";
import {
  TbCheck,
  TbDownload,
  TbFolderPlus,
  TbShare,
  TbTrash,
  TbX,
} from "react-icons/tb";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";

export interface ActionBarProps {
  selectedCount: number;
  totalSize?: number;
  onDownloadSelected?: () => void;
  onShareSelected?: () => void;
  onMoveSelected?: () => void;
  onDeleteSelected?: () => void;
  onClearSelection?: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  selectedCount,
  totalSize = 0,
  onDownloadSelected,
  onShareSelected,
  onMoveSelected,
  onDeleteSelected,
  onClearSelection,
}) => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  if (selectedCount === 0) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "10px 18px",
        backgroundColor: "var(--glass-bg, rgba(15, 19, 25, 0.85))",
        backdropFilter: "blur(var(--glass-blur, 16px))",
        WebkitBackdropFilter: "blur(var(--glass-blur, 16px))",
        border: "1px solid var(--glass-border, rgba(255, 255, 255, 0.12))",
        borderRadius: "var(--radius-pill, 9999px)",
        boxShadow: isDark
          ? "0 8px 30px rgba(0, 0, 0, 0.45)"
          : "0 8px 30px rgba(15, 23, 42, 0.15)",
        zIndex: 900,
        transition: "all var(--transition-normal, 250ms cubic-bezier(0.16, 1, 0.3, 1))",
        animation: "slideUp 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        "@keyframes slideUp": {
          "0%": {
            opacity: 0,
            transform: "translate(-50%, 20px)",
          },
          "100%": {
            opacity: 1,
            transform: "translate(-50%, 0)",
          },
        },
      }}
    >
      {/* Selection counter */}
      <Group spacing={8} align="center">
        <Badge variant="primary" size="sm">
          {selectedCount} selected
        </Badge>
        {totalSize > 0 && (
          <Text size="xs" color="dimmed" className="font-mono" sx={{ fontSize: 11 }}>
            ({byteToHumanSizeString(totalSize)})
          </Text>
        )}
      </Group>

      {/* Action buttons */}
      <Group spacing={8}>
        {onDownloadSelected && (
          <Button
            size="xs"
            variant="secondary"
            leftIcon={<TbDownload size={14} />}
            onClick={onDownloadSelected}
          >
            Download
          </Button>
        )}

        {onShareSelected && (
          <Button
            size="xs"
            variant="secondary"
            leftIcon={<TbShare size={14} />}
            onClick={onShareSelected}
          >
            Share
          </Button>
        )}

        {onMoveSelected && (
          <Button
            size="xs"
            variant="secondary"
            leftIcon={<TbFolderPlus size={14} />}
            onClick={onMoveSelected}
          >
            Move
          </Button>
        )}

        {onDeleteSelected && (
          <Button
            size="xs"
            variant="danger"
            leftIcon={<TbTrash size={14} />}
            onClick={onDeleteSelected}
          >
            Delete
          </Button>
        )}
      </Group>

      {/* Clear selection button */}
      {onClearSelection && (
        <Tooltip label="Clear Selection" withArrow>
          <ActionIcon
            size="sm"
            variant="subtle"
            onClick={onClearSelection}
            aria-label="Clear selection"
            sx={{
              color: "var(--text-secondary, #94A3B8)",
              "&:hover": {
                color: "var(--text-primary, #F8FAFC)",
              },
            }}
          >
            <TbX size={16} />
          </ActionIcon>
        </Tooltip>
      )}
    </Box>
  );
};

export default ActionBar;
