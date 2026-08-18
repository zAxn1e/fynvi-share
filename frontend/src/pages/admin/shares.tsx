import {
  Box,
  Group,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useModals } from "@mantine/modals";
import { useEffect, useState } from "react";
import { TbFolders, TbRefresh, TbSearch } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import DiskUsage from "../../components/admin/shares/DiskUsage";
import ManageShareTable from "../../components/admin/shares/ManageShareTable";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import Meta from "../../components/Meta";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { MyShare } from "../../types/share.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";

const Shares = () => {
  const [shares, setShares] = useState<MyShare[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const modals = useModals();
  const t = useTranslate();
  const theme = useMantineTheme();

  const getShares = () => {
    setIsLoading(true);
    shareService.list().then((data) => {
      setShares(data);
      setIsLoading(false);
    });
  };

  const deleteShare = (share: MyShare) => {
    modals.openConfirmModal({
      title: t("admin.shares.edit.delete.title", {
        id: share.id,
      }) || `Delete share ${share.id}?`,
      children: (
        <Text size="sm">
          <FormattedMessage id="admin.shares.edit.delete.description" />
        </Text>
      ),
      labels: {
        confirm: t("common.button.delete") || "Delete",
        cancel: t("common.button.cancel") || "Cancel",
      },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        shareService
          .remove(share.id)
          .then(() => setShares((prev) => prev.filter((v) => v.id !== share.id)))
          .catch(toast.axiosError);
      },
    });
  };

  useEffect(() => {
    getShares();
  }, []);

  const filteredShares = shares.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.id?.toLowerCase().includes(q) ||
      s.name?.toLowerCase().includes(q) ||
      s.creator?.username?.toLowerCase().includes(q)
    );
  });

  const totalSize = shares.reduce((acc, s) => acc + (s.size || 0), 0);

  return (
    <Box>
      <Meta title={t("admin.shares.title") || "Global Shares"} />

      {/* Header */}
      <Group position="apart" align="flex-start" mb={24}>
        <Stack spacing={4}>
          <Group spacing={10}>
            <Title order={2} sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
              <FormattedMessage id="admin.shares.title" />
            </Title>
            <Badge variant="primary" size="md">
              {shares.length} Total Shares
            </Badge>
          </Group>
          <Text size="sm" color="dimmed">
            Inspect all active files, view access counts, manage expirations, and remove shares across the platform ({byteToHumanSizeString(totalSize)} total).
          </Text>
        </Stack>

        <Group spacing={10}>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<TbRefresh size={16} />}
            onClick={getShares}
            loading={isLoading}
          >
            Refresh
          </Button>
          <DiskUsage />
        </Group>
      </Group>

      {/* Main Table Card */}
      <Card padded>
        <Group position="apart" mb={16}>
          <TextInput
            placeholder="Search by share ID, title, or creator username..."
            icon={<TbSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            size="sm"
            sx={{ width: 340, maxWidth: "100%" }}
          />
          <Text size="xs" color="dimmed">
            Showing {filteredShares.length} of {shares.length} shares
          </Text>
        </Group>

        <ManageShareTable
          shares={filteredShares}
          updateShare={(updatedShare) =>
            setShares(
              shares.map((share) =>
                share.id === updatedShare.id ? updatedShare : share,
              ),
            )
          }
          deleteShare={deleteShare}
          isLoading={isLoading}
        />
      </Card>
      <Space h="xl" />
    </Box>
  );
};

export default Shares;
