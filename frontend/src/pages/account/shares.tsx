import {
  ActionIcon,
  Box,
  Group,
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { useModals } from "@mantine/modals";
import moment from "moment";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { FaUserLock } from "react-icons/fa";
import {
  TbClock,
  TbCopy,
  TbEdit,
  TbExternalLink,
  TbEye,
  TbFolders,
  TbInfoCircle,
  TbLock,
  TbPlus,
  TbSearch,
  TbTrash,
  TbUsers,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import showShareLinkModal from "../../components/account/showShareLinkModal";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import CenterLoader from "../../components/core/CenterLoader";
import Meta from "../../components/Meta";
import showShareInformationsModal from "../../components/share/showShareInformationsModal";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import useUser from "../../hooks/user.hook";
import shareService from "../../services/share.service";
import { MyShare } from "../../types/share.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";

const MyShares = () => {
  const modals = useModals();
  const clipboard = useClipboard();
  const config = useConfig();
  const { user } = useUser();
  const t = useTranslate();
  const theme = useMantineTheme();

  const [shares, setShares] = useState<MyShare[]>();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const refreshShares = () => {
    shareService.getMyShares().then((data) => setShares(data));
  };

  useEffect(() => {
    refreshShares();
  }, []);

  const filteredShares = useMemo(() => {
    if (!shares) return [];
    return shares.filter((share) => {
      // Search
      const matchesSearch =
        share.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (share.name && share.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      // Status filter
      const isExpired =
        moment(share.expiration).unix() !== 0 &&
        moment(share.expiration).isBefore(moment());
      const isExpiringSoon =
        !isExpired &&
        moment(share.expiration).unix() !== 0 &&
        moment(share.expiration).isBefore(moment().add(24, "hours"));

      if (statusFilter === "active") return !isExpired;
      if (statusFilter === "expiring") return isExpiringSoon;
      if (statusFilter === "expired") return isExpired;
      if (statusFilter === "password") return !!share.security?.passwordProtected;

      return true;
    });
  }, [shares, searchQuery, statusFilter]);

  if (!shares) return <CenterLoader />;

  return (
    <Box>
      <Meta title={t("account.shares.title") || "My Shares"} />

      {/* Header */}
      <Group position="apart" mb={24}>
        <Stack spacing={2}>
          <Title order={3} sx={{ letterSpacing: "-0.02em" }}>
            {t("account.shares.title") || "My Shares"}
          </Title>
          <Text size="sm" color="dimmed">
            Manage your active shares, view access metrics, or update share settings.
          </Text>
        </Stack>

        <Button
          component={Link}
          href="/upload"
          variant="primary"
          size="sm"
          leftIcon={<TbPlus size={16} />}
        >
          {t("account.shares.button.create") || "New Share"}
        </Button>
      </Group>

      {/* Filters & Search Toolbar */}
      {shares.length > 0 && (
        <Group position="apart" mb={16}>
          <TextInput
            placeholder="Search by share name or ID..."
            size="xs"
            icon={<TbSearch size={14} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 280 }}
          />

          <SegmentedControl
            size="xs"
            value={statusFilter}
            onChange={setStatusFilter}
            data={[
              { label: `All (${shares.length})`, value: "all" },
              { label: "Active", value: "active" },
              { label: "Expiring Soon", value: "expiring" },
              { label: "Expired", value: "expired" },
              { label: "Password", value: "password" },
            ]}
          />
        </Group>
      )}

      {/* Main Content Area */}
      {shares.length === 0 ? (
        <EmptyState
          icon={TbFolders}
          title={t("account.shares.title.empty") || "No shares yet"}
          description={
            t("account.shares.description.empty") ||
            "You haven't created any file shares yet. Start by uploading files."
          }
          action={
            <Button
              component={Link}
              href="/upload"
              variant="primary"
              size="sm"
              leftIcon={<TbPlus size={16} />}
            >
              {t("account.shares.button.create") || "Create First Share"}
            </Button>
          }
        />
      ) : filteredShares.length === 0 ? (
        <EmptyState
          icon={TbSearch}
          title="No shares match your filter"
          description="Try changing your search query or selecting a different status filter."
          action={
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <Box
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === "dark" ? "#11141A" : "#FFFFFF",
            border:
              theme.colorScheme === "dark"
                ? "1px solid rgba(255, 255, 255, 0.08)"
                : "1px solid rgba(15, 23, 42, 0.08)",
            borderRadius: 10,
            overflow: "hidden",
          })}
        >
          <Box sx={{ overflowX: "auto" }}>
            <Table verticalSpacing="sm" horizontalSpacing="md">
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? "rgba(255, 255, 255, 0.02)"
                        : "#F8FAFC",
                  }}
                >
                  <th style={{ width: "25%" }}>Share</th>
                  <th>Files & Size</th>
                  <th>Views</th>
                  <th>Expiration</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShares.map((share) => {
                  const isExpired =
                    moment(share.expiration).unix() !== 0 &&
                    moment(share.expiration).isBefore(moment());
                  const isExpiringSoon =
                    !isExpired &&
                    moment(share.expiration).unix() !== 0 &&
                    moment(share.expiration).isBefore(moment().add(24, "hours"));

                  return (
                    <tr key={share.id}>
                      {/* Name & ID */}
                      <td>
                        <Stack spacing={2}>
                          <Group spacing={6} noWrap>
                            <Link
                              href={`/share/${share.id}`}
                              style={{ textDecoration: "none" }}
                            >
                              <Text
                                size="sm"
                                weight={600}
                                sx={{
                                  letterSpacing: "-0.01em",
                                  "&:hover": { color: "var(--brand-primary)" },
                                }}
                              >
                                {share.name || share.id}
                              </Text>
                            </Link>
                            {share.security?.passwordProtected && (
                              <Tooltip label="Password protected" withArrow>
                                <Box sx={{ display: "flex", color: "#F59E0B" }}>
                                  <TbLock size={14} />
                                </Box>
                              </Tooltip>
                            )}
                            {share.security?.restrictToRecipients && (
                              <Tooltip label="Restricted to recipients" withArrow>
                                <Box sx={{ display: "flex", color: "#60A5FA" }}>
                                  <FaUserLock size={12} />
                                </Box>
                              </Tooltip>
                            )}
                          </Group>
                          <Text size="xs" color="dimmed" className="font-mono">
                            /share/{share.id}
                          </Text>
                        </Stack>
                      </td>

                      {/* Files & Size */}
                      <td>
                        <Stack spacing={2}>
                          <Text size="sm" weight={500}>
                            {share.files?.length || 0} file{share.files?.length === 1 ? "" : "s"}
                          </Text>
                          <Text size="xs" color="dimmed" className="font-mono">
                            {byteToHumanSizeString(share.size || 0)}
                          </Text>
                        </Stack>
                      </td>

                      {/* Views */}
                      <td>
                        <Group spacing={4}>
                          <TbEye size={14} color="#9CA3AF" />
                          <Text size="sm" className="font-mono">
                            {share.views}
                            {share.security?.maxViews ? ` / ${share.security.maxViews}` : ""}
                          </Text>
                        </Group>
                      </td>

                      {/* Expiration */}
                      <td>
                        <Group spacing={6}>
                          <TbClock size={14} color="#9CA3AF" />
                          <Text size="xs" color={isExpired ? "red" : isExpiringSoon ? "yellow" : "dimmed"}>
                            {moment(share.expiration).unix() === 0
                              ? "Never"
                              : moment(share.expiration).fromNow()}
                          </Text>
                        </Group>
                      </td>

                      {/* Status Badge */}
                      <td>
                        {isExpired ? (
                          <Badge variant="danger" size="sm" dot>
                            Expired
                          </Badge>
                        ) : isExpiringSoon ? (
                          <Badge variant="warning" size="sm" dot>
                            Expiring Soon
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm" dot>
                            Active
                          </Badge>
                        )}
                      </td>

                      {/* Action Shortcuts */}
                      <td>
                        <Group spacing={4} position="right">
                          <Tooltip label="Copy Link" withArrow>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              onClick={() => {
                                showShareLinkModal(
                                  modals,
                                  share.id,
                                  config.get("general.appUrl"),
                                  config.get("general.appUrl", true),
                                );
                              }}
                            >
                              <TbCopy size={15} />
                            </ActionIcon>
                          </Tooltip>

                          <Tooltip label="Open Recipient View" withArrow>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              component={Link}
                              href={`/share/${share.id}`}
                              target="_blank"
                            >
                              <TbExternalLink size={15} />
                            </ActionIcon>
                          </Tooltip>

                          <Tooltip label="Edit Share" withArrow>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              component={Link}
                              href={`/share/${share.id}/edit`}
                            >
                              <TbEdit size={15} />
                            </ActionIcon>
                          </Tooltip>

                          <Tooltip label="Share Details" withArrow>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              onClick={() => {
                                showShareInformationsModal(
                                  modals,
                                  share,
                                  parseInt(config.get("share.maxSize")),
                                  config.get("general.appUrl"),
                                  config.get("general.appUrl", true),
                                  user?.isAdmin
                                    ? { value: 0, unit: "days" }
                                    : config.get("share.maxExpiration"),
                                  refreshShares,
                                );
                              }}
                            >
                              <TbInfoCircle size={15} />
                            </ActionIcon>
                          </Tooltip>

                          <Tooltip label="Delete Share" withArrow>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              color="red"
                              onClick={() => {
                                modals.openConfirmModal({
                                  title: "Delete Share",
                                  children: (
                                    <Text size="sm">
                                      Are you sure you want to permanently delete this share and all its files?
                                    </Text>
                                  ),
                                  labels: { confirm: "Delete", cancel: "Cancel" },
                                  confirmProps: { color: "red" },
                                  onConfirm: async () => {
                                    try {
                                      await shareService.remove(share.id);
                                      toast.success("Share deleted successfully");
                                      refreshShares();
                                    } catch (e) {
                                      toast.axiosError(e);
                                    }
                                  },
                                });
                              }}
                            >
                              <TbTrash size={15} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MyShares;
