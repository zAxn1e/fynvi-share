import {
  ActionIcon,
  Box,
  Group,
  Modal,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import React, { useEffect, useState } from "react";
import {
  TbCheck,
  TbCopy,
  TbDownload,
  TbKey,
  TbPlus,
  TbTrash,
} from "react-icons/tb";
import api from "../../services/api.service";
import toast from "../../utils/toast.util";
import { Button } from "../common/Button";
import { Card } from "../common/Card";

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string | null;
}

export const ApiKeyManager: React.FC = () => {
  const clipboard = useClipboard({ timeout: 2000 });
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchKeys = async () => {
    try {
      const res = await api.get("api-keys");
      setKeys(res.data || []);
    } catch (e) {
      toast.axiosError(e);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async () => {
    if (!keyName.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("api-keys", { name: keyName.trim() });
      setNewRawKey(res.data.rawKey);
      setKeyName("");
      await fetchKeys();
    } catch (e) {
      toast.axiosError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await api.delete(`api-keys/${id}`);
      toast.success("API key revoked successfully");
      await fetchKeys();
    } catch (e) {
      toast.axiosError(e);
    }
  };

  const handleDownloadShareX = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const sxcu = {
      Version: "15.0.0",
      Name: "Fynvi Share",
      DestinationType: "ImageUploader, TextUploader, FileUploader",
      RequestMethod: "POST",
      RequestURL: `${origin}/api/shares/upload-api`,
      Headers: {
        Authorization: "Bearer <YOUR_API_KEY_HERE>",
      },
      Body: "MultipartFormData",
      FileFormName: "file",
      URL: "$json:shareUrl$",
      ErrorMessage: "$json:message$",
    };

    const blob = new Blob([JSON.stringify(sxcu, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fynvi-share.sxcu";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card padded>
      <Group position="apart" mb="md">
        <div>
          <Text weight={600} size="md">
            API Keys & Integrations
          </Text>
          <Text size="xs" color="dimmed">
            Manage long-lived API keys for ShareX, CLI, and custom scripts.
          </Text>
        </div>
        <Group spacing={8}>
          <Button
            leftIcon={<TbDownload size={15} />}
            variant="secondary"
            size="xs"
            onClick={() => handleDownloadShareX()}
          >
            Download ShareX Config
          </Button>
          <Button
            leftIcon={<TbPlus size={15} />}
            variant="primary"
            size="xs"
            onClick={() => setIsModalOpen(true)}
          >
            Generate Key
          </Button>
        </Group>
      </Group>

      {keys.length === 0 ? (
        <Text size="sm" color="dimmed" py={12}>
          No active API keys found. Click &quot;Generate Key&quot; to create
          one.
        </Text>
      ) : (
        <Table highlightOnHover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Key Prefix</th>
              <th>Created</th>
              <th>Last Used</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id}>
                <td>
                  <Text size="sm" weight={500}>
                    {key.name}
                  </Text>
                </td>
                <td>
                  <code className="font-mono">{key.prefix}...</code>
                </td>
                <td>
                  <Text size="xs" color="dimmed">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </Text>
                </td>
                <td>
                  <Text size="xs" color="dimmed">
                    {key.lastUsedAt
                      ? new Date(key.lastUsedAt).toLocaleDateString()
                      : "Never"}
                  </Text>
                </td>
                <td>
                  <Tooltip label="Revoke Key" withArrow>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => handleDeleteKey(key.id)}
                      aria-label="Revoke key"
                    >
                      <TbTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Generate Key Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNewRawKey(null);
        }}
        title="Generate New API Key"
        centered
        radius="lg"
      >
        <Stack spacing={16}>
          {!newRawKey ? (
            <>
              <TextInput
                label="Key Name / Label"
                placeholder="e.g. Desktop ShareX, CLI Tool"
                value={keyName}
                onChange={(e) => setKeyName(e.currentTarget.value)}
                autoFocus
              />
              <Group position="right">
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="xs"
                  loading={loading}
                  onClick={handleCreateKey}
                >
                  Generate
                </Button>
              </Group>
            </>
          ) : (
            <>
              <Text size="sm" color="dimmed">
                Please copy your API key now. You will not be able to see it
                again!
              </Text>
              <TextInput
                readOnly
                value={newRawKey}
                rightSection={
                  <ActionIcon
                    onClick={() => {
                      clipboard.copy(newRawKey);
                      toast.success("API key copied to clipboard");
                    }}
                  >
                    {clipboard.copied ? (
                      <TbCheck size={16} color="#10B981" />
                    ) : (
                      <TbCopy size={16} />
                    )}
                  </ActionIcon>
                }
              />
              <Group position="right">
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewRawKey(null);
                  }}
                >
                  Done
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>
    </Card>
  );
};

export default ApiKeyManager;
