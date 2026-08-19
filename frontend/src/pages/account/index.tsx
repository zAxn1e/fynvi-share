import {
  ActionIcon,
  Box,
  Center,
  Divider,
  Group,
  PasswordInput,
  SegmentedControl,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { useModals } from "@mantine/modals";
import React, { useEffect, useState } from "react";
import {
  TbAlertTriangle,
  TbAuth2Fa,
  TbKey,
  TbLanguage,
  TbLock,
  TbPalette,
  TbShieldCheck,
  TbTrash,
  TbUser,
  TbWorld,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import { ApiKeyManager } from "../../components/account/ApiKeyManager";
import LanguagePicker from "../../components/account/LanguagePicker";
import showEnableTotpModal from "../../components/account/showEnableTotpModal";
import ThemeSwitcher from "../../components/account/ThemeSwitcher";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import Meta from "../../components/Meta";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import useUser from "../../hooks/user.hook";
import authService from "../../services/auth.service";
import userService from "../../services/user.service";
import { getOAuthIcon, getOAuthUrl, unlinkOAuth } from "../../utils/oauth.util";
import toast from "../../utils/toast.util";

const Account = () => {
  const [oauth, setOAuth] = useState<string[]>([]);
  const [oauthStatus, setOAuthStatus] = useState<Record<
    string,
    {
      provider: string;
      providerUsername: string;
    }
  > | null>(null);

  const [activeTab, setActiveTab] = useState<string | null>("profile");
  const { user, refreshUser } = useUser();
  const modals = useModals();
  const t = useTranslate();
  const config = useConfig();

  const accountForm = useForm({
    initialValues: {
      username: user?.username,
      email: user?.email,
    },
    validate: yupResolver(
      yup.object().shape({
        email: yup.string().email(t("common.error.invalid-email")),
        username: yup
          .string()
          .min(3, t("common.error.too-short", { length: 3 })),
      }),
    ),
  });

  const passwordForm = useForm({
    initialValues: {
      oldPassword: "",
      password: "",
    },
    validate: yupResolver(
      yup.object().shape({
        oldPassword: yup.string().when([], {
          is: () => !!user?.hasPassword,
          then: (schema) =>
            schema
              .min(8, t("common.error.too-short", { length: 8 }))
              .required(t("common.error.field-required")),
          otherwise: (schema) => schema.notRequired(),
        }),
        password: yup
          .string()
          .min(8, t("common.error.too-short", { length: 8 }))
          .required(t("common.error.field-required")),
      }),
    ),
  });

  const enableTotpForm = useForm({
    initialValues: {
      password: "",
    },
    validate: yupResolver(
      yup.object().shape({
        password: yup
          .string()
          .min(8, t("common.error.too-short", { length: 8 }))
          .required(t("common.error.field-required")),
      }),
    ),
  });

  const disableTotpForm = useForm({
    initialValues: {
      password: "",
      code: "",
    },
    validate: yupResolver(
      yup.object().shape({
        password: yup.string().min(8),
        code: yup
          .string()
          .min(6, t("common.error.exact-length", { length: 6 }))
          .max(6, t("common.error.exact-length", { length: 6 }))
          .matches(/^[0-9]+$/, { message: t("common.error.invalid-number") }),
      }),
    ),
  });

  const refreshOAuthStatus = () => {
    authService
      .getOAuthStatus()
      .then((data) => {
        setOAuthStatus(data.data);
      })
      .catch(toast.axiosError);
  };

  useEffect(() => {
    authService
      .getAvailableOAuth()
      .then((data) => {
        setOAuth(data.data);
      })
      .catch(toast.axiosError);
    refreshOAuthStatus();
  }, []);

  return (
    <Box>
      <Meta title={t("account.title") || "Account Settings"} />

      {/* Header */}
      <Stack spacing={2} mb={24}>
        <Title order={3} sx={{ letterSpacing: "-0.02em" }}>
          {t("account.title") || "Settings"}
        </Title>
        <Text size="sm" color="dimmed">
          Manage your profile credentials, authentication methods, API keys, and
          workspace preferences.
        </Text>
      </Stack>

      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List mb={24}>
          <Tabs.Tab value="profile" icon={<TbUser size={15} />}>
            Profile
          </Tabs.Tab>
          <Tabs.Tab value="security" icon={<TbLock size={15} />}>
            Security & 2FA
          </Tabs.Tab>
          {oauth.length > 0 && (
            <Tabs.Tab value="oauth" icon={<TbWorld size={15} />}>
              OAuth
            </Tabs.Tab>
          )}
          <Tabs.Tab value="apikeys" icon={<TbKey size={15} />}>
            API Keys
          </Tabs.Tab>
          <Tabs.Tab value="preferences" icon={<TbPalette size={15} />}>
            Preferences
          </Tabs.Tab>
        </Tabs.List>

        {/* Profile Tab */}
        <Tabs.Panel value="profile">
          <Card mb={24} padded>
            <Stack spacing={16}>
              <Group position="apart">
                <Stack spacing={2}>
                  <Text size="sm" weight={600}>
                    Personal Information
                  </Text>
                  <Text size="xs" color="dimmed">
                    Update your display name and email address for system
                    notifications.
                  </Text>
                </Stack>
                {user?.isLdap && <Badge variant="info">{t("account.ldapAccount")}</Badge>}
              </Group>

              <form
                onSubmit={accountForm.onSubmit((values) =>
                  userService
                    .updateCurrentUser({
                      username: values.username,
                      email: values.email,
                    })
                    .then(() => toast.success(t("account.notify.info.success")))
                    .catch(toast.axiosError),
                )}
              >
                <Stack spacing={12}>
                  <TextInput
                    label={t("account.card.info.username") || "Username"}
                    disabled={user?.isLdap}
                    size="sm"
                    {...accountForm.getInputProps("username")}
                  />
                  <TextInput
                    label={t("account.card.info.email") || "Email"}
                    disabled={user?.isLdap}
                    size="sm"
                    {...accountForm.getInputProps("email")}
                  />
                  {!user?.isLdap && (
                    <Group position="right" mt={8}>
                      <Button variant="primary" size="sm" type="submit">
                        <FormattedMessage
                          id="common.button.save"
                          defaultMessage="Save Changes"
                        />
                      </Button>
                    </Group>
                  )}
                </Stack>
              </form>
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Security & Password Tab */}
        <Tabs.Panel value="security">
          <Stack spacing={24}>
            {!user?.isLdap && (
              <Card padded>
                <Stack spacing={16}>
                  <Stack spacing={2}>
                    <Text size="sm" weight={600}>
                      {t("account.card.password.title") || "Change Password"}
                    </Text>
                    <Text size="xs" color="dimmed">
                      Ensure your account uses a strong, unique password with at
                      least 8 characters.
                    </Text>
                  </Stack>

                  <form
                    onSubmit={passwordForm.onSubmit((values) =>
                      authService
                        .updatePassword(values.oldPassword, values.password)
                        .then(async () => {
                          refreshUser();
                          toast.success(t("account.notify.password.success"));
                          passwordForm.reset();
                        })
                        .catch(toast.axiosError),
                    )}
                  >
                    <Stack spacing={12}>
                      {user?.hasPassword ? (
                        <PasswordInput
                          label={
                            t("account.card.password.old") || "Current Password"
                          }
                          size="sm"
                          {...passwordForm.getInputProps("oldPassword")}
                        />
                      ) : (
                        <Text size="xs" color="dimmed">
                          <FormattedMessage
                            id="account.card.password.noPasswordSet"
                            defaultMessage="No password is set currently."
                          />
                        </Text>
                      )}
                      <PasswordInput
                        label={t("account.card.password.new") || "New Password"}
                        size="sm"
                        {...passwordForm.getInputProps("password")}
                      />
                      <Group position="right" mt={8}>
                        <Button variant="primary" size="sm" type="submit">
                          <FormattedMessage
                            id="common.button.save"
                            defaultMessage="Update Password"
                          />
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                </Stack>
              </Card>
            )}

            {/* TOTP 2FA Section */}
            <Card padded>
              <Stack spacing={16}>
                <Group position="apart">
                  <Stack spacing={2}>
                    <Text size="sm" weight={600}>
                      Two-Factor Authentication (2FA)
                    </Text>
                    <Text size="xs" color="dimmed">
                      Protect your account with Time-based One-Time Passwords
                      (TOTP) from apps like Google Authenticator or 1Password.
                    </Text>
                  </Stack>
                  <Badge
                    variant={user?.totpVerified ? "success" : "default"}
                    dot
                  >
                    {user?.totpVerified ? "Enabled" : "Disabled"}
                  </Badge>
                </Group>

                {user?.totpVerified ? (
                  <form
                    onSubmit={disableTotpForm.onSubmit((values) => {
                      authService
                        .disableTOTP(values.code, values.password)
                        .then(() => {
                          toast.success(t("account.notify.totp.disable"));
                          values.password = "";
                          values.code = "";
                          refreshUser();
                        })
                        .catch(toast.axiosError);
                    })}
                  >
                    <Stack spacing={12}>
                      <PasswordInput
                        label={t("account.card.password.title") || "Password"}
                        size="sm"
                        {...disableTotpForm.getInputProps("password")}
                      />
                      <TextInput
                        label={
                          t("account.modal.totp.code") ||
                          "Current 6-Digit TOTP Code"
                        }
                        placeholder="123456"
                        size="sm"
                        {...disableTotpForm.getInputProps("code")}
                      />
                      <Group position="right" mt={8}>
                        <Button variant="danger" size="sm" type="submit">
                          Disable 2FA
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                ) : (
                  <form
                    onSubmit={enableTotpForm.onSubmit((values) => {
                      authService
                        .enableTOTP(values.password)
                        .then((result) => {
                          showEnableTotpModal(modals, refreshUser, {
                            qrCode: result.qrCode,
                            secret: result.totpSecret,
                            password: values.password,
                          });
                          values.password = "";
                        })
                        .catch(toast.axiosError);
                    })}
                  >
                    <Stack spacing={12}>
                      <PasswordInput
                        label={
                          t("account.card.password.title") ||
                          "Confirm Password to setup 2FA"
                        }
                        size="sm"
                        {...enableTotpForm.getInputProps("password")}
                      />
                      <Group position="right" mt={8}>
                        <Button
                          variant="primary"
                          size="sm"
                          type="submit"
                          leftIcon={<TbShieldCheck size={16} />}
                        >
                          Setup 2FA
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                )}
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        {/* OAuth Tab */}
        {oauth.length > 0 && (
          <Tabs.Panel value="oauth">
            <Card padded>
              <Stack spacing={16}>
                <Stack spacing={2}>
                  <Text size="sm" weight={600}>
                    Connected OAuth Providers
                  </Text>
                  <Text size="xs" color="dimmed">
                    Link external authentication accounts for 1-click single
                    sign-on.
                  </Text>
                </Stack>

                <Stack spacing={12}>
                  {oauth.map((provider) => (
                    <Group
                      key={provider}
                      position="apart"
                      p="12px 16px"
                      sx={{
                        borderRadius: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      <Group spacing={10}>
                        {getOAuthIcon(provider)}
                        <Stack spacing={0}>
                          <Text
                            size="sm"
                            weight={500}
                            sx={{ textTransform: "capitalize" }}
                          >
                            {provider}
                          </Text>
                          <Text size="xs" color="dimmed">
                            {oauthStatus?.[provider]
                              ? oauthStatus[provider].providerUsername
                              : "Not connected"}
                          </Text>
                        </Stack>
                      </Group>

                      {oauthStatus?.[provider] ? (
                        <Button
                          variant="danger"
                          size="xs"
                          onClick={() => {
                            modals.openConfirmModal({
                              title: t("account.modal.unlink.title"),
                              children: (
                                <Text size="sm">
                                  {t("account.modal.unlink.description")}
                                </Text>
                              ),
                              labels: {
                                confirm: t("account.card.oauth.unlink"),
                                cancel: t("common.button.cancel"),
                              },
                              confirmProps: { color: "red" },
                              onConfirm: () => {
                                unlinkOAuth(provider)
                                  .then(() => {
                                    toast.success(
                                      t(
                                        "account.notify.oauth.unlinked.success",
                                      ),
                                    );
                                    refreshOAuthStatus();
                                  })
                                  .catch(toast.axiosError);
                              },
                            });
                          }}
                        >
                          {t("account.card.oauth.unlink") || "Disconnect"}
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="xs"
                          component="a"
                          href={getOAuthUrl(
                            config.get("general.appUrl") !==
                              config.get("general.appUrl", true)
                              ? config.get("general.appUrl")
                              : window.location.origin,
                            provider,
                          )}
                        >
                          {t("account.card.oauth.link") || "Connect"}
                        </Button>
                      )}
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Tabs.Panel>
        )}

        {/* API Keys Tab */}
        <Tabs.Panel value="apikeys">
          <ApiKeyManager />
        </Tabs.Panel>

        {/* Preferences Tab */}
        <Tabs.Panel value="preferences">
          <Stack spacing={24}>
            <Card padded>
              <Stack spacing={12}>
                <Text size="sm" weight={600}>
                  <FormattedMessage
                    id="account.card.language.title"
                    defaultMessage="Language"
                  />
                </Text>
                <LanguagePicker />
              </Stack>
            </Card>

            <Card padded>
              <Stack spacing={12}>
                <Text size="sm" weight={600}>
                  <FormattedMessage
                    id="account.card.color.title"
                    defaultMessage="Appearance & Theme"
                  />
                </Text>
                <ThemeSwitcher />
              </Stack>
            </Card>

            {/* Danger Zone */}
            <Card padded sx={{ borderColor: "rgba(239, 68, 68, 0.25)" }}>
              <Group position="apart">
                <Stack spacing={2}>
                  <Group spacing={6}>
                    <TbAlertTriangle size={16} color="#EF4444" />
                    <Text size="sm" weight={600} color="red">
                      Delete Account
                    </Text>
                  </Group>
                  <Text size="xs" color="dimmed">
                    Permanently delete your account and all associated file
                    shares.
                  </Text>
                </Stack>

                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<TbTrash size={16} />}
                  onClick={() =>
                    modals.openConfirmModal({
                      title: t("account.modal.delete.title"),
                      children: (
                        <Text size="sm">
                          <FormattedMessage id="account.modal.delete.description" />
                        </Text>
                      ),
                      labels: {
                        confirm: t("common.button.delete"),
                        cancel: t("common.button.cancel"),
                      },
                      confirmProps: { color: "red" },
                      onConfirm: async () => {
                        await userService
                          .removeCurrentUser()
                          .then(() => window.location.reload())
                          .catch(toast.axiosError);
                      },
                    })
                  }
                >
                  <FormattedMessage
                    id="account.button.delete"
                    defaultMessage="Delete Account"
                  />
                </Button>
              </Group>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
};

export default Account;
