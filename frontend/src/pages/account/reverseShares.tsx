import {
  Accordion,
  ActionIcon,
  Anchor,
  Box,
  Group,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { useModals } from "@mantine/modals";
import moment from "moment";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  TbArrowsExchange,
  TbClock,
  TbCopy,
  TbExternalLink,
  TbPlus,
  TbTrash,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import showReverseShareLinkModal from "../../components/account/showReverseShareLinkModal";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import CenterLoader from "../../components/core/CenterLoader";
import Meta from "../../components/Meta";
import showCreateReverseShareModal from "../../components/share/modals/showCreateReverseShareModal";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import useUser from "../../hooks/user.hook";
import shareService from "../../services/share.service";
import { MyReverseShare } from "../../types/share.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";

const ReverseShares = () => {
  const modals = useModals();
  const clipboard = useClipboard();
  const t = useTranslate();
  const theme = useMantineTheme();
  const config = useConfig();
  const { user } = useUser();

  const appUrl = config.get("general.appUrl");
  const defaultAppUrl = config.get("general.appUrl", true);
  const userMaxShareSize = user?.shareSizeLimit
    ? parseInt(user.shareSizeLimit)
    : parseInt(config.get("share.maxSize"));

  const [reverseShares, setReverseShares] = useState<MyReverseShare[]>();

  const getReverseShares = () => {
    shareService
      .getMyReverseShares()
      .then((shares) => setReverseShares(shares));
  };

  useEffect(() => {
    getReverseShares();
  }, []);

  if (!reverseShares) return <CenterLoader />;

  return (
    <Box>
      <Meta title={t("account.reverseShares.title") || "Reverse Shares"} />

      {/* Header */}
      <Group position="apart" mb={24}>
        <Stack spacing={2}>
          <Title order={3} sx={{ letterSpacing: "-0.02em" }}>
            {t("account.reverseShares.title") || "Reverse Shares"}
          </Title>
          <Text size="sm" color="dimmed">
            Create unique, secure upload links that allow external people to
            send files directly to your account.
          </Text>
        </Stack>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<TbPlus size={16} />}
          onClick={() =>
            showCreateReverseShareModal(
              modals,
              config.get("smtp.enabled"),
              user?.isAdmin
                ? { value: 0, unit: "days" }
                : config.get("share.maxExpiration"),
              config.get("share.defaultExpiration"),
              config.get("share.reverseShareSimpleOnly"),
              appUrl,
              defaultAppUrl,
              userMaxShareSize,
              getReverseShares,
              config.get("share.shareIdLength"),
            )
          }
        >
          {t("common.button.create") || "New Upload Link"}
        </Button>
      </Group>

      {/* Content */}
      {reverseShares.length === 0 ? (
        <EmptyState
          icon={TbArrowsExchange}
          title={
            t("account.reverseShares.title.empty") || "No upload links yet"
          }
          description={
            t("account.reverseShares.description.empty") ||
            "Create a reverse share link so clients and friends can send files directly to you."
          }
          action={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<TbPlus size={16} />}
              onClick={() =>
                showCreateReverseShareModal(
                  modals,
                  config.get("smtp.enabled"),
                  user?.isAdmin
                    ? { value: 0, unit: "days" }
                    : config.get("share.maxExpiration"),
                  config.get("share.defaultExpiration"),
                  config.get("share.reverseShareSimpleOnly"),
                  appUrl,
                  defaultAppUrl,
                  userMaxShareSize,
                  getReverseShares,
                  config.get("share.shareIdLength"),
                )
              }
            >
              Create Upload Link
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
                  <th>Token / Link</th>
                  <th>Uploads Received</th>
                  <th>Remaining Uses</th>
                  <th>Max Size Limit</th>
                  <th>Expires</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reverseShares.map((reverseShare) => {
                  const isExpired =
                    moment(reverseShare.shareExpiration).unix() !== 0 &&
                    moment(reverseShare.shareExpiration).isBefore(moment());

                  return (
                    <tr key={reverseShare.id}>
                      <td>
                        <Stack spacing={2}>
                          <Text size="sm" weight={600} className="font-mono">
                            {reverseShare.token}
                          </Text>
                          <Text size="xs" color="dimmed" className="font-mono">
                            /upload/{reverseShare.token}
                          </Text>
                        </Stack>
                      </td>

                      <td>
                        <Text size="sm" weight={500}>
                          {reverseShare.shares.length} upload
                          {reverseShare.shares.length === 1 ? "" : "s"}
                        </Text>
                      </td>

                      <td>
                        <Badge variant="default" size="sm">
                          {reverseShare.remainingUses} left
                        </Badge>
                      </td>

                      <td>
                        <Text size="xs" color="dimmed" className="font-mono">
                          {byteToHumanSizeString(
                            parseInt(reverseShare.maxShareSize),
                          )}
                        </Text>
                      </td>

                      <td>
                        <Group spacing={6}>
                          <TbClock size={14} color="#9CA3AF" />
                          <Text size="xs" color={isExpired ? "red" : "dimmed"}>
                            {moment(reverseShare.shareExpiration).unix() === 0
                              ? "Never"
                              : moment(reverseShare.shareExpiration).fromNow()}
                          </Text>
                        </Group>
                      </td>

                      <td>
                        <Group spacing={4} position="right">
                          <Tooltip label="Copy Link" withArrow>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              onClick={() => {
                                showReverseShareLinkModal(
                                  modals,
                                  reverseShare.token,
                                  appUrl,
                                  defaultAppUrl,
                                );
                              }}
                            >
                              <TbCopy size={15} />
                            </ActionIcon>
                          </Tooltip>

                          <Tooltip label="Open Upload Portal" withArrow>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              component={Link}
                              href={`/upload/${reverseShare.token}`}
                              target="_blank"
                            >
                              <TbExternalLink size={15} />
                            </ActionIcon>
                          </Tooltip>

                          <Tooltip label="Delete Link" withArrow>
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              color="red"
                              onClick={() => {
                                modals.openConfirmModal({
                                  title: "Delete Upload Link",
                                  children: (
                                    <Text size="sm">
                                      Are you sure you want to delete this
                                      reverse share upload link?
                                    </Text>
                                  ),
                                  labels: {
                                    confirm: "Delete",
                                    cancel: "Cancel",
                                  },
                                  confirmProps: { color: "red" },
                                  onConfirm: async () => {
                                    try {
                                      await shareService.removeReverseShare(
                                        reverseShare.id,
                                      );
                                      toast.success("Upload link deleted");
                                      getReverseShares();
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

export default ReverseShares;
