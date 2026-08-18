import {
  Badge,
  Box,
  Button,
  Checkbox,
  Collapse,
  Divider,
  Flex,
  Group,
  NumberInput,
  PasswordInput,
  Progress,
  Stack,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { ModalsContextProps } from "@mantine/modals/lib/context";
import moment from "moment";
import React, { useState } from "react";
import {
  TbChevronDown,
  TbChevronRight,
  TbEye,
  TbInfinity,
  TbLock,
  TbLockOpen,
  TbShieldCheck,
  TbShieldLock,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import { translateOutsideContext } from "../../hooks/useTranslate.hook";
import shareService from "../../services/share.service";
import { MyShare, UpdateShare } from "../../types/share.type";
import { Timespan } from "../../types/timespan.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";
import { ExpirationPicker } from "../common/ExpirationPicker";
import CopyTextField from "../upload/CopyTextField";
import QRCode from "./QRCode";

const showShareInformationsModal = (
  modals: ModalsContextProps,
  share: MyShare,
  maxShareSize: number,
  appUrl: string,
  defaultAppUrl: string,
  maxExpiration?: Timespan,
  onShareUpdated?: (share: MyShare) => void,
  initiallyEditing = false,
) => {
  const t = translateOutsideContext();

  return modals.openModal({
    title: t("account.shares.modal.share-informations") || "Share Information",
    size: "lg",
    children: (
      <Body
        share={share}
        maxShareSize={maxShareSize}
        appUrl={appUrl}
        defaultAppUrl={defaultAppUrl}
        maxExpiration={maxExpiration}
        onShareUpdated={onShareUpdated}
        initiallyEditing={initiallyEditing}
      />
    ),
  });
};

const Body = ({
  share,
  maxShareSize,
  appUrl,
  defaultAppUrl,
  maxExpiration,
  onShareUpdated,
  initiallyEditing,
}: {
  share: MyShare;
  maxShareSize: number;
  appUrl: string;
  defaultAppUrl: string;
  maxExpiration?: Timespan;
  onShareUpdated?: (share: MyShare) => void;
  initiallyEditing: boolean;
}) => {
  const t = translateOutsideContext();
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  const [currentShare, setCurrentShare] = useState(share);
  const [showQR, setShowQR] = useState(false);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(initiallyEditing);

  const handleToggleQR = () => {
    setShowQR(!showQR);
  };

  const link = `${appUrl !== defaultAppUrl ? appUrl : window.location.origin}/s/${currentShare.id}`;

  const resolvedMaxShareSize = currentShare.creator?.shareSizeLimit
    ? parseInt(currentShare.creator.shareSizeLimit)
    : maxShareSize;

  const shareSizeRatio =
    resolvedMaxShareSize > 0 ? currentShare.size / resolvedMaxShareSize : 0;

  const formattedShareSize = byteToHumanSizeString(currentShare.size);
  const formattedMaxShareSize = byteToHumanSizeString(resolvedMaxShareSize);
  const shareSizeProgress = shareSizeRatio * 100;

  const formattedCreatedAt = moment(currentShare.createdAt).format("LLL");
  const formattedExpiration =
    moment(currentShare.expiration).unix() === 0
      ? "Never (Permanent)"
      : moment(currentShare.expiration).format("LLL");

  const security = currentShare.security ?? {
    passwordProtected: false,
    maxViews: undefined,
    restrictToRecipients: false,
  };

  const hasMaxViews =
    typeof security.maxViews === "number" && security.maxViews > 0;

  if (isEditing) {
    return (
      <EditShareBody
        share={currentShare}
        maxExpiration={maxExpiration}
        onCancel={() => setIsEditing(false)}
        onShareUpdated={(updatedShare) => {
          setCurrentShare(updatedShare);
          onShareUpdated?.(updatedShare);
          setIsEditing(false);
        }}
      />
    );
  }

  return (
    <Stack align="stretch" spacing="md">
      {/* Share Overview Attributes */}
      <Stack spacing={8}>
        <Group position="apart">
          <Text size="sm" color="dimmed">
            <FormattedMessage id="account.shares.table.id" />:
          </Text>
          <Text size="sm" weight={600} className="font-mono">
            {currentShare.id}
          </Text>
        </Group>

        <Group position="apart">
          <Text size="sm" color="dimmed">
            <FormattedMessage id="account.shares.table.name" />:
          </Text>
          <Text size="sm" weight={600}>
            {currentShare.name || "-"}
          </Text>
        </Group>

        {currentShare.description && (
          <Group position="apart" align="flex-start">
            <Text size="sm" color="dimmed">
              <FormattedMessage id="account.shares.table.description" />:
            </Text>
            <Text size="sm" sx={{ maxWidth: "65%", textAlign: "right" }}>
              {currentShare.description}
            </Text>
          </Group>
        )}

        {currentShare.recipients && currentShare.recipients.length > 0 && (
          <Group position="apart">
            <Text size="sm" color="dimmed">
              <FormattedMessage id="upload.modal.accordion.email.title" />:
            </Text>
            <Text size="sm" weight={500}>
              {currentShare.recipients.join(", ")}
            </Text>
          </Group>
        )}

        <Group position="apart">
          <Text size="sm" color="dimmed">
            <FormattedMessage id="account.shares.table.createdAt" />:
          </Text>
          <Text size="sm">{formattedCreatedAt}</Text>
        </Group>

        <Group position="apart">
          <Text size="sm" color="dimmed">
            <FormattedMessage id="account.shares.table.expiresAt" />:
          </Text>
          <Text size="sm" weight={500}>
            {formattedExpiration}
          </Text>
        </Group>
      </Stack>

      {/* Share Link & QR */}
      <Divider />
      <CopyTextField link={link} toggleQR={handleToggleQR} />
      <Collapse in={showQR}>
        <QRCode link={link} />
      </Collapse>

      {/* Security & Access Protection Panel with Show/Hide toggle */}
      <Box
        p={14}
        sx={{
          backgroundColor: isDark
            ? "var(--surface-1, #151B24)"
            : "var(--surface-1, #F1F5F9)",
          borderRadius: "var(--radius-md, 10px)",
          border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
        }}
      >
        <UnstyledButton
          onClick={() => setShowSecurityDetails((s) => !s)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Group spacing={8}>
            <TbShieldLock size={18} color="var(--brand-primary, #3B82F6)" />
            <Text size="sm" weight={600}>
              Security & View Limits
            </Text>
          </Group>
          <Group spacing={6}>
            <Badge
              size="sm"
              variant="outline"
              color={security.passwordProtected ? "blue" : "gray"}
            >
              {security.passwordProtected ? "Password Protected" : "Open Access"}
            </Badge>
            {showSecurityDetails ? (
              <TbChevronDown size={16} />
            ) : (
              <TbChevronRight size={16} />
            )}
          </Group>
        </UnstyledButton>

        <Collapse in={showSecurityDetails}>
          <Stack spacing={8} mt={12} pt={10} sx={{ borderTop: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))" }}>
            <Group position="apart">
              <Group spacing={6}>
                {security.passwordProtected ? (
                  <TbLock size={15} color="#3B82F6" />
                ) : (
                  <TbLockOpen size={15} color="#94A3B8" />
                )}
                <Text size="xs" color="dimmed">
                  Password Protection
                </Text>
              </Group>
              <Text size="xs" weight={600}>
                {security.passwordProtected ? "Enabled" : "None"}
              </Text>
            </Group>

            <Group position="apart">
              <Group spacing={6}>
                <TbEye size={15} color="#06B6D4" />
                <Text size="xs" color="dimmed">
                  View Count & Limit
                </Text>
              </Group>
              <Group spacing={4}>
                <Text size="xs" weight={600} className="font-mono">
                  {currentShare.views ?? 0} views
                </Text>
                <Text size="xs" color="dimmed">
                  {hasMaxViews
                    ? `/ ${security.maxViews} max views`
                    : "(No Limit)"}
                </Text>
              </Group>
            </Group>
          </Stack>
        </Collapse>
      </Box>

      {/* Storage Size Ratio */}
      <Divider />
      <Group position="apart">
        <Text size="sm" color="dimmed">
          <FormattedMessage id="account.shares.table.size" />:
        </Text>
        <Text size="sm" weight={600} className="font-mono">
          {formattedShareSize} / {formattedMaxShareSize} ({shareSizeProgress.toFixed(1)}%)
        </Text>
      </Group>

      <Flex align="center" justify="center">
        {shareSizeRatio < 0.1 && (
          <Text size="xs" style={{ marginRight: "4px" }}>
            {formattedShareSize}
          </Text>
        )}
        <Progress
          value={shareSizeProgress}
          label={shareSizeRatio >= 0.1 ? formattedShareSize : ""}
          style={{
            width: shareSizeRatio < 0.1 ? "70%" : "80%",
          }}
          size="xl"
          radius="xl"
        />
        <Text size="xs" style={{ marginLeft: "4px" }}>
          {formattedMaxShareSize}
        </Text>
      </Flex>

      <Button variant="light" onClick={() => setIsEditing(true)}>
        {t("common.button.edit") || "Edit Share"}
      </Button>
    </Stack>
  );
};

const EditShareBody = ({
  share,
  maxExpiration,
  onCancel,
  onShareUpdated,
}: {
  share: MyShare;
  maxExpiration?: Timespan;
  onCancel: () => void;
  onShareUpdated: (share: MyShare) => void;
}) => {
  const t = translateOutsideContext();
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSecuritySection, setShowSecuritySection] = useState(true);

  const isPermanentShare = moment(share.expiration).unix() === 0;
  const security = share.security ?? {
    passwordProtected: false,
    maxViews: undefined,
    restrictToRecipients: false,
  };

  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .transform((value) => value || undefined)
      .min(3, t("common.error.too-short", { length: 3 }))
      .max(30, t("common.error.too-long", { length: 30 })),
    description: yup
      .string()
      .transform((value) => value || undefined)
      .max(512, t("common.error.too-long", { length: 512 })),
    password: yup
      .string()
      .transform((value) => value || undefined)
      .min(3, t("common.error.too-short", { length: 3 }))
      .max(30, t("common.error.too-long", { length: 30 })),
    maxViews: yup
      .number()
      .nullable()
      .transform((value) => (value === 0 ? null : value || undefined))
      .min(0, "Max views cannot be negative"),
  });

  const form = useForm({
    initialValues: {
      name: share.name || "",
      description: share.description || "",
      expiration: isPermanentShare ? "never" : moment(share.expiration).toISOString(),
      never_expires: isPermanentShare,
      password: "",
      removePassword: false,
      maxViews: security.maxViews ?? undefined,
    },
    validate: yupResolver(validationSchema),
  });

  const onSubmit = form.onSubmit(async (values) => {
    let expirationIso: string = "never";

    if (!values.never_expires && values.expiration !== "never") {
      let expMoment: moment.Moment;
      if (values.expiration.includes("-")) {
        const parts = values.expiration.split("-");
        const num = parseInt(parts[0]);
        const unit = parts[1] as moment.unitOfTime.DurationConstructor;
        expMoment = moment().add(num, unit);
      } else {
        expMoment = moment(values.expiration);
      }

      if (!expMoment.isValid()) {
        form.setFieldError("expiration", t("common.error.field-required") || "Invalid date");
        return;
      }

      if (
        maxExpiration &&
        maxExpiration.value !== 0 &&
        expMoment.isAfter(moment().add(maxExpiration.value, maxExpiration.unit))
      ) {
        form.setFieldError(
          "expiration",
          t("upload.modal.expires.error.too-long", {
            max: moment
              .duration(maxExpiration.value, maxExpiration.unit)
              .humanize(),
          }),
        );
        return;
      }

      expirationIso = expMoment.toISOString();
    }

    const resolvedMaxViews =
      values.maxViews === 0 || !values.maxViews ? null : values.maxViews;

    const updateShare: UpdateShare = {
      name: values.name || null,
      description: values.description || null,
      expiration: expirationIso,
      security: {
        password: values.password || undefined,
        removePassword: values.removePassword,
        maxViews: resolvedMaxViews,
      },
    };

    setIsSubmitting(true);
    try {
      const updatedShare = await shareService.update(share.id, updateShare);
      toast.success(t("share.edit.notify.save-success") || "Share updated successfully");
      onShareUpdated(updatedShare);
    } catch (e) {
      toast.axiosError(e);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <Stack align="stretch" spacing="md">
        {/* Name & Description */}
        <TextInput
          variant="filled"
          label={t("account.shares.table.name") || "Share Title"}
          placeholder={t(
            "upload.modal.accordion.name-and-description.name.placeholder",
          ) || "Enter a name for this share"}
          {...form.getInputProps("name")}
        />

        <Textarea
          variant="filled"
          label={t("account.shares.table.description") || "Description"}
          placeholder={t(
            "upload.modal.accordion.name-and-description.description.placeholder",
          ) || "Add notes or a description for recipients"}
          minRows={2}
          {...form.getInputProps("description")}
        />

        {/* Modern Expiration Picker */}
        <Box>
          <Text size="sm" weight={500} mb={6}>
            {t("account.shares.table.expiresAt") || "Expiration Schedule"}
          </Text>
          <ExpirationPicker
            value={form.values.expiration}
            onChange={(val, isNever) => {
              form.setFieldValue("expiration", val);
              form.setFieldValue("never_expires", isNever);
            }}
            maxExpiration={maxExpiration}
            allowNever={!maxExpiration || maxExpiration.value === 0}
          />
        </Box>

        <Divider />

        {/* Security & Access Protection Panel (Show/Hide Toggle) */}
        <Box
          p={14}
          sx={{
            backgroundColor: isDark
              ? "var(--surface-1, #151B24)"
              : "var(--surface-1, #F1F5F9)",
            borderRadius: "var(--radius-md, 10px)",
            border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
          }}
        >
          <UnstyledButton
            onClick={() => setShowSecuritySection((s) => !s)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Group spacing={8}>
              <TbShieldLock size={18} color="var(--brand-primary, #3B82F6)" />
              <Text size="sm" weight={600}>
                Security & Access Restrictions
              </Text>
            </Group>
            <Group spacing={6}>
              <Text size="xs" color="dimmed">
                {showSecuritySection ? "Hide Options" : "Show Options"}
              </Text>
              {showSecuritySection ? (
                <TbChevronDown size={16} />
              ) : (
                <TbChevronRight size={16} />
              )}
            </Group>
          </UnstyledButton>

          <Collapse in={showSecuritySection}>
            <Stack spacing={12} mt={12} pt={10} sx={{ borderTop: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))" }}>
              {/* Password Protection */}
              <Box>
                <PasswordInput
                  variant="filled"
                  label={t("upload.modal.accordion.security.password.label") || "Password Protection"}
                  placeholder={
                    security.passwordProtected
                      ? t("account.shares.modal.edit.password.keep") || "Keep current password (leave blank)"
                      : t("upload.modal.accordion.security.password.placeholder") || "Set an optional password"
                  }
                  autoComplete="new-password"
                  disabled={form.values.removePassword}
                  {...form.getInputProps("password")}
                />

                {security.passwordProtected && (
                  <Checkbox
                    mt={8}
                    label={t("account.shares.modal.edit.password.remove") || "Remove password protection"}
                    {...form.getInputProps("removePassword", { type: "checkbox" })}
                  />
                )}
              </Box>

              {/* Max Views (0 or empty = no limit) */}
              <Box>
                <NumberInput
                  min={0}
                  type="number"
                  variant="filled"
                  placeholder="0 (or leave blank for no limit)"
                  label={
                    t("upload.modal.accordion.security.max-views.label") ||
                    "Max Views (0 or empty = Unlimited)"
                  }
                  description="Set to 0 or leave empty to allow unlimited views"
                  {...form.getInputProps("maxViews")}
                />
              </Box>
            </Stack>
          </Collapse>
        </Box>

        {/* Modal Actions */}
        <Group position="right" mt={8}>
          <Button variant="default" onClick={onCancel}>
            {t("common.button.cancel") || "Cancel"}
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {t("common.button.save") || "Save Changes"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default showShareInformationsModal;
