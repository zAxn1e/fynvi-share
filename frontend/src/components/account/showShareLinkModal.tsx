import {
  ActionIcon,
  Box,
  CopyButton,
  Group,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { ModalsContextProps } from "@mantine/modals/lib/context";
import { TbCheck, TbCopy, TbExternalLink, TbLink } from "react-icons/tb";
import { translateOutsideContext } from "../../hooks/useTranslate.hook";
import { Button } from "../common/Button";

const showShareLinkModal = (
  modals: ModalsContextProps,
  shareId: string,
  appUrl: string,
  defaultAppUrl: string,
) => {
  const t = translateOutsideContext();
  const link = `${appUrl !== defaultAppUrl ? appUrl : window.location.origin}/s/${shareId}`;

  return modals.openModal({
    title: t("account.shares.modal.share-link") || "Share Public Link",
    centered: true,
    radius: "md",
    children: (
      <Stack spacing={16} py={6}>
        <Text size="xs" color="dimmed">
          Anyone with this link can view and download files from this share
          (unless password-protected).
        </Text>

        <Group spacing={8} noWrap align="center">
          <TextInput
            variant="filled"
            value={link}
            readOnly
            icon={<TbLink size={16} />}
            sx={{ flex: 1 }}
          />

          <CopyButton value={link}>
            {({ copied, copy }) => (
              <Button
                variant={copied ? "primary" : "secondary"}
                size="sm"
                leftIcon={copied ? <TbCheck size={16} /> : <TbCopy size={16} />}
                onClick={copy}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </CopyButton>
        </Group>

        <Group position="right" pt={8}>
          <Button
            variant="subtle"
            size="xs"
            component="a"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            leftIcon={<TbExternalLink size={14} />}
          >
            Open Share in New Tab
          </Button>
        </Group>
      </Stack>
    ),
  });
};

export default showShareLinkModal;
