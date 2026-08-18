import {
  ActionIcon,
  Box,
  Center,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useModals } from "@mantine/modals";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  TbClock,
  TbCopy,
  TbEdit,
  TbFile,
  TbFiles,
  TbFolders,
  TbLock,
  TbPlusMinus,
  TbShare,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import showShareLinkModal from "../../../components/account/showShareLinkModal";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import Meta from "../../../components/Meta";
import DownloadAllButton from "../../../components/share/DownloadAllButton";
import FileList from "../../../components/share/FileList";
import showEnterPasswordModal from "../../../components/share/showEnterPasswordModal";
import showErrorModal from "../../../components/share/showErrorModal";
import showShareInformationsModal from "../../../components/share/showShareInformationsModal";
import useConfig from "../../../hooks/config.hook";
import useTranslate from "../../../hooks/useTranslate.hook";
import useUser from "../../../hooks/user.hook";
import shareService from "../../../services/share.service";
import { MyShare, Share as ShareType } from "../../../types/share.type";
import { byteToHumanSizeString } from "../../../utils/fileSize.util";
import { getQueryString } from "../../../utils/router.util";
import toast from "../../../utils/toast.util";
import moment from "moment";

export function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: { shareId: context.params!.shareId },
  };
}

const Share = ({ shareId }: { shareId: string }) => {
  const modals = useModals();
  const router = useRouter();
  const [share, setShare] = useState<ShareType>();
  const [isRestricted, setIsRestricted] = useState(false);
  const { user } = useUser();
  const config = useConfig();
  const t = useTranslate();

  const isOwner = !!user && !!share && share.creator?.id === user.id;
  const isOwnerOrAdmin =
    !!user && !!share && (share.creator?.id === user.id || user.isAdmin);
  const recipientId = getQueryString(router.query.recipient);

  const handleEditClick = async () => {
    try {
      const myShares = await shareService.getMyShares();
      const myShare = myShares.find((s) => s.id === shareId);
      if (!myShare) return;
      showShareInformationsModal(
        modals,
        myShare,
        parseInt(config.get("share.maxSize")),
        config.get("general.appUrl"),
        config.get("general.appUrl", true),
        user?.isAdmin
          ? { value: 0, unit: "days" }
          : config.get("share.maxExpiration"),
        (updatedShare: MyShare) => {
          setShare((prev) =>
            prev
              ? {
                  ...prev,
                  name: updatedShare.name,
                  description: updatedShare.description,
                  expiration: updatedShare.expiration,
                  hasPassword:
                    updatedShare.security?.passwordProtected ??
                    prev.hasPassword,
                }
              : prev,
          );
        },
        true,
      );
    } catch (e) {
      toast.axiosError(e);
    }
  };

  const getShareToken = async (password?: string) => {
    await shareService
      .getShareToken(shareId, password)
      .then(() => {
        modals.closeAll();
        getFiles();
      })
      .catch((e) => {
        const { error } = e.response?.data || {};
        if (error === "share_max_views_exceeded") {
          showErrorModal(
            modals,
            t("share.error.visitor-limit-exceeded.title"),
            t("share.error.visitor-limit-exceeded.description"),
            "go-home",
          );
        } else if (error === "share_password_required") {
          showEnterPasswordModal(modals, getShareToken);
        } else {
          toast.axiosError(e);
        }
      });
  };

  const getFiles = async () => {
    shareService
      .get(shareId)
      .then((s) => {
        setShare(s);
      })
      .catch((e) => {
        const { error } = e.response?.data || {};
        if (e.response?.status === 404) {
          if (error === "share_removed") {
            showErrorModal(
              modals,
              t("share.error.removed.title"),
              e.response.data.message,
              "go-home",
            );
          } else {
            showErrorModal(
              modals,
              t("share.error.not-found.title"),
              t("share.error.not-found.description"),
              "go-home",
            );
          }
        } else if (
          e.response?.status === 403 &&
          error === "share_restricted_to_recipients"
        ) {
          setIsRestricted(true);
        } else if (e.response?.status === 403 && error === "private_share") {
          showErrorModal(
            modals,
            t("share.error.access-denied.title"),
            t("share.error.access-denied.description"),
          );
        } else if (error === "share_password_required") {
          showEnterPasswordModal(modals, getShareToken);
        } else if (error === "share_token_required") {
          getShareToken();
        } else {
          showErrorModal(
            modals,
            t("common.error"),
            t("common.error.unknown"),
            "go-home",
          );
        }
      });
  };

  useEffect(() => {
    getFiles();
  }, [shareId]);

  if (isRestricted) {
    return (
      <Center style={{ height: "60vh" }}>
        <Stack align="center" spacing="md" sx={{ textAlign: "center" }}>
          <Title order={3}>
            <FormattedMessage id="share.error.restricted.title" defaultMessage="Access Restricted" />
          </Title>
          <Text color="dimmed" size="sm" sx={{ maxWidth: 400 }}>
            <FormattedMessage
              id="share.error.restricted.description"
              defaultMessage="This share is restricted to specific recipients. Please sign in with the recipient account."
            />
          </Text>
          <Button
            component={Link}
            href={`/auth/signIn?redirect=/share/${shareId}`}
            variant="primary"
            size="sm"
          >
            <FormattedMessage id="share.error.restricted.button" defaultMessage="Sign In to Access" />
          </Button>
        </Stack>
      </Center>
    );
  }

  const totalSize =
    share?.files?.reduce(
      (total: number, file: { size: string }) => total + parseInt(file.size),
      0,
    ) || 0;

  const isExpired =
    share &&
    moment(share.expiration).unix() !== 0 &&
    moment(share.expiration).isBefore(moment());

  return (
    <Box>
      <Meta
        title={share?.name || `Share #${shareId}`}
        description={share?.description || "Download files shared with Fynvi"}
      />

      {/* Hero Header Card */}
      <Card mb={24} padded>
        <Group position="apart" align="flex-start">
          <Stack spacing={8} sx={{ maxWidth: "70%" }}>
            <Group spacing={8}>
              <Title order={2} sx={{ fontSize: 24, letterSpacing: "-0.02em" }}>
                {share?.name || `Share #${share?.id || shareId}`}
              </Title>
              {share?.hasPassword && (
                <Tooltip label="Password protected" withArrow>
                  <Box sx={{ display: "flex", color: "#F59E0B" }}>
                    <TbLock size={18} />
                  </Box>
                </Tooltip>
              )}
            </Group>

            {share?.description && (
              <Text size="sm" color="dimmed" sx={{ whiteSpace: "pre-wrap" }}>
                {share.description}
              </Text>
            )}

            <Group spacing={12} pt={4}>
              <Group spacing={4}>
                <TbFiles size={15} color="#9CA3AF" />
                <Text size="xs" color="dimmed" className="font-mono">
                  {share?.files?.length || 0} file{share?.files?.length === 1 ? "" : "s"} • {byteToHumanSizeString(totalSize)}
                </Text>
              </Group>

              {share?.expiration && (
                <Group spacing={4}>
                  <TbClock size={15} color="#9CA3AF" />
                  <Text size="xs" color={isExpired ? "red" : "dimmed"}>
                    {moment(share.expiration).unix() === 0
                      ? "Never expires"
                      : `Expires ${moment(share.expiration).fromNow()}`}
                  </Text>
                </Group>
              )}
            </Group>
          </Stack>

          <Group spacing={8}>
            {isOwner && (
              <Tooltip label="Append / Edit Files" withArrow>
                <Button
                  component={Link}
                  href={`/share/${shareId}/edit`}
                  variant="secondary"
                  size="sm"
                  leftIcon={<TbPlusMinus size={15} />}
                >
                  Edit Files
                </Button>
              </Tooltip>
            )}

            {isOwnerOrAdmin && (
              <Tooltip label="Share Settings" withArrow>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<TbEdit size={15} />}
                  onClick={handleEditClick}
                >
                  Settings
                </Button>
              </Tooltip>
            )}

            {share && share.files && share.files.length > 1 && (
              <DownloadAllButton shareId={shareId} recipientId={recipientId} />
            )}
          </Group>
        </Group>
      </Card>

      {/* File List */}
      <FileList
        files={share?.files}
        setShare={setShare}
        share={share!}
        isLoading={!share}
        recipientId={recipientId}
      />
    </Box>
  );
};

export default Share;
