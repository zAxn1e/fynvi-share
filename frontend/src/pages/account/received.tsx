import {
  Box,
  Group,
  Stack,
  Table,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { TbDownload, TbExternalLink, TbInbox } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import CenterLoader from "../../components/core/CenterLoader";
import Meta from "../../components/Meta";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { byteToHumanSizeString } from "../../utils/fileSize.util";

const ReceivedShares = () => {
  const t = useTranslate();
  const router = useRouter();
  const config = useConfig();
  const theme = useMantineTheme();
  const [receivedShares, setReceivedShares] = useState<any[]>();

  useEffect(() => {
    if (!config.get("share.enableUserRecipients")) {
      router.replace("/");
      return;
    }
    shareService.getReceivedShares().then((data) => setReceivedShares(data));
  }, [config, router]);

  if (!receivedShares) return <CenterLoader />;

  return (
    <Box>
      <Meta title={t("account.received-shares.title") || "Received Shares"} />

      {/* Header */}
      <Group position="apart" mb={24}>
        <Stack spacing={2}>
          <Title order={3} sx={{ letterSpacing: "-0.02em" }}>
            {t("account.received-shares.title") || "Received Shares"}
          </Title>
          <Text size="sm" color="dimmed">
            Files and shares that other Fynvi users have directly sent to you.
          </Text>
        </Stack>
      </Group>

      {receivedShares.length === 0 ? (
        <EmptyState
          icon={TbInbox}
          title={t("account.received-shares.title.empty") || "No received shares"}
          description={
            t("account.received-shares.description.empty") ||
            "You haven't received any files from other users yet."
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
                  <th>Share Name</th>
                  <th>Shared By</th>
                  <th>Files & Size</th>
                  <th>Expires</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {receivedShares.map(({ share }) => {
                  const isExpired =
                    moment(share.expiration).unix() !== 0 &&
                    moment(share.expiration).isBefore(moment());

                  return (
                    <tr key={share.id}>
                      <td>
                        <Stack spacing={2}>
                          <Text size="sm" weight={600}>
                            {share.name || share.id}
                          </Text>
                          <Text size="xs" color="dimmed" className="font-mono">
                            /share/{share.id}
                          </Text>
                        </Stack>
                      </td>
                      <td>
                        <Badge variant="default" size="sm">
                          {share.creator?.username || "Anonymous"}
                        </Badge>
                      </td>
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
                      <td>
                        <Text size="xs" color={isExpired ? "red" : "dimmed"}>
                          {moment(share.expiration).unix() === 0
                            ? "Never"
                            : moment(share.expiration).fromNow()}
                        </Text>
                      </td>
                      <td>
                        <Group position="right">
                          <Button
                            component={Link}
                            href={`/share/${share.id}`}
                            variant="secondary"
                            size="xs"
                            leftIcon={<TbExternalLink size={14} />}
                          >
                            Open Share
                          </Button>
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

export default ReceivedShares;