import {
  Alert,
  AppShell,
  Box,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  TbCheck,
  TbDeviceFloppy,
  TbInfoCircle,
  TbSettings,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import AdminConfigInput from "../../../components/admin/configuration/AdminConfigInput";
import ConfigurationHeader from "../../../components/admin/configuration/ConfigurationHeader";
import ConfigurationNavBar from "../../../components/admin/configuration/ConfigurationNavBar";
import LogoConfigInput from "../../../components/admin/configuration/LogoConfigInput";
import TestEmailButton from "../../../components/admin/configuration/TestEmailButton";
import TestRedisButton from "../../../components/admin/configuration/TestRedisButton";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import CenterLoader from "../../../components/core/CenterLoader";
import Meta from "../../../components/Meta";
import useConfig from "../../../hooks/config.hook";
import useTranslate from "../../../hooks/useTranslate.hook";
import configService from "../../../services/config.service";
import { AdminConfig, UpdateConfig } from "../../../types/config.type";
import { camelToKebab } from "../../../utils/string.util";
import toast from "../../../utils/toast.util";

const categories = [
  "General",
  "Appearance",
  "Email",
  "Share",
  "SMTP",
  "OAuth",
  "LDAP",
  "S3",
  "Legal",
  "Cache",
];

export default function AppShellDemo() {
  const theme = useMantineTheme();
  const router = useRouter();
  const t = useTranslate();
  const isDark = theme.colorScheme === "dark";

  const [isMobileNavBarOpened, setIsMobileNavBarOpened] = useState(false);
  const isMobile = useMediaQuery("(max-width: 680px)");
  const config = useConfig();

  let categoryId = "General";
  if (
    router.query.category &&
    !categories.includes(router.query.category as string)
  ) {
    categoryId = router.query.category as string;
  }

  const [configVariables, setConfigVariables] = useState<AdminConfig[]>();
  const [updatedConfigVariables, setUpdatedConfigVariables] = useState<
    UpdateConfig[]
  >([]);
  const [optionalConfigVariables, setOptionalConfigVariables] =
    useState<AdminConfig[]>();

  const [logo, setLogo] = useState<File | null>(null);
  const [darkLogo, setDarkLogo] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isEditingAllowed = (): boolean => {
    return !configVariables || configVariables[0].allowEdit;
  };

  const saveConfigVariables = async () => {
    setIsSaving(true);
    try {
      if (logo) {
        await configService
          .changeLogo(logo)
          .then(() => {
            setLogo(null);
            toast.success(
              t("admin.config.notify.logo-success") || "Logo updated",
            );
          })
          .catch(toast.axiosError);
      }

      if (darkLogo) {
        await configService
          .changeDarkLogo(darkLogo)
          .then(() => {
            setDarkLogo(null);
            toast.success(
              t("admin.config.notify.logo-success") || "Dark logo updated",
            );
          })
          .catch(toast.axiosError);
      }

      if (updatedConfigVariables.length > 0) {
        await configService
          .updateMany(updatedConfigVariables)
          .then(() => {
            setConfigVariables((prev) =>
              prev?.map((cv) => {
                const updated = updatedConfigVariables.find(
                  (u) => u.key === cv.key,
                );
                return updated ? { ...cv, value: String(updated.value) } : cv;
              }),
            );
            setUpdatedConfigVariables([]);
            toast.success(
              t("admin.config.notify.success") ||
                "Configuration saved successfully",
            );
          })
          .catch(toast.axiosError);
        void config.refresh();
      } else {
        toast.success(
          t("admin.config.notify.no-changes") || "No changes to save",
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfigVariable = (configVariable: UpdateConfig) => {
    if (configVariable.key === "general.appUrl") {
      configVariable.value = sanitizeUrl(configVariable.value);
    }

    const index = updatedConfigVariables.findIndex(
      (item) => item.key === configVariable.key,
    );

    if (index > -1) {
      updatedConfigVariables[index] = {
        ...updatedConfigVariables[index],
        ...configVariable,
      };
    } else {
      setUpdatedConfigVariables([...updatedConfigVariables, configVariable]);
    }
  };

  const sanitizeUrl = (url: string): string => {
    return url.endsWith("/") ? url.slice(0, -1) : url;
  };

  useEffect(() => {
    configService.getByCategory(categoryId).then((configVariables) => {
      setConfigVariables(configVariables);
    });

    if (categoryId.toLowerCase() === "email") {
      configService.getByCategory("smtp").then((smtpConfigVariables) => {
        const optionalConfigVariables = smtpConfigVariables.filter(
          (configVariable) => {
            if (configVariable.key === "smtp.enabled") {
              return configVariable;
            }
          },
        );
        setOptionalConfigVariables(optionalConfigVariables);
      });
    }
  }, [categoryId]);

  return (
    <>
      <Meta title={t("admin.config.title") || "Configuration"} />
      <AppShell
        styles={{
          main: {
            background: isDark
              ? "var(--surface-0, #090B0E)"
              : "var(--surface-0, #F8FAFC)",
            color: isDark ? "#F8FAFC" : "#0F172A",
            paddingTop: "calc(var(--mantine-header-height, 64px) + 24px)",
            paddingBottom: 48,
          },
        }}
        navbar={
          <ConfigurationNavBar
            categoryId={categoryId}
            isMobileNavBarOpened={isMobileNavBarOpened}
            setIsMobileNavBarOpened={setIsMobileNavBarOpened}
          />
        }
        header={
          <ConfigurationHeader
            isMobileNavBarOpened={isMobileNavBarOpened}
            setIsMobileNavBarOpened={setIsMobileNavBarOpened}
          />
        }
      >
        <Container size="md" px={16}>
          {!configVariables ? (
            <CenterLoader />
          ) : (
            <>
              {/* Header Title Banner */}
              <Group position="apart" align="center" mb={24}>
                <Group spacing={10}>
                  <Title
                    order={2}
                    sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}
                  >
                    {t("admin.config.category." + categoryId.toLowerCase()) ||
                      categoryId}
                  </Title>
                  <Badge variant="primary" size="sm">
                    Configuration
                  </Badge>
                </Group>

                {updatedConfigVariables.length > 0 && (
                  <Badge variant="warning" size="sm">
                    {updatedConfigVariables.length} unsaved change
                    {updatedConfigVariables.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </Group>

              {!isEditingAllowed() && (
                <Alert
                  mb="lg"
                  variant="light"
                  color="yellow"
                  title={
                    t("admin.config.config-file-warning.title") ||
                    "Read-Only Settings"
                  }
                  icon={<TbInfoCircle />}
                  radius="md"
                >
                  <FormattedMessage id="admin.config.config-file-warning.description" />
                </Alert>
              )}

              {/* Configuration Settings Card */}
              {(() => {
                const customCssConfigVariable = configVariables.find(
                  (configVariable) =>
                    configVariable.key === "appearance.customCss",
                );
                const getEffectiveConfigValue = (key: string): string => {
                  const updatedValue = updatedConfigVariables.find(
                    (item) => item.key === key,
                  );
                  if (updatedValue) return updatedValue.value;

                  const configVariable = configVariables.find(
                    (item) => item.key === key,
                  );
                  return (
                    configVariable?.value ?? configVariable?.defaultValue ?? ""
                  );
                };

                const shouldShowPrimaryColorOverride =
                  getEffectiveConfigValue("appearance.themePrimaryColor") ===
                  "custom";
                const visibleConfigVariables = configVariables.filter(
                  (configVariable) =>
                    configVariable.key !== "appearance.customCss",
                );

                return (
                  <Card padded>
                    <Stack spacing={24}>
                      {visibleConfigVariables.map((configVariable, idx) => {
                        if (
                          configVariable.key ===
                            "appearance.themePrimaryColorOverride" &&
                          !shouldShowPrimaryColorOverride
                        ) {
                          return null;
                        }

                        return (
                          <Box key={configVariable.key}>
                            {idx > 0 && <Divider mb={20} />}
                            <Group position="apart" align="flex-start">
                              <Stack
                                style={{ maxWidth: isMobile ? "100%" : "42%" }}
                                spacing={4}
                              >
                                <Text size="sm" weight={600}>
                                  <FormattedMessage
                                    id={`admin.config.${camelToKebab(
                                      configVariable.key,
                                    )}`}
                                  />
                                </Text>

                                <Text
                                  sx={{
                                    whiteSpace: "pre-line",
                                    lineHeight: 1.5,
                                  }}
                                  color="dimmed"
                                  size="xs"
                                >
                                  <FormattedMessage
                                    id={`admin.config.${camelToKebab(
                                      configVariable.key,
                                    )}.description`}
                                    values={{ br: <br /> }}
                                  />
                                </Text>
                              </Stack>

                              <Box style={{ width: isMobile ? "100%" : "52%" }}>
                                <AdminConfigInput
                                  key={configVariable.key}
                                  configVariable={configVariable}
                                  updateConfigVariable={updateConfigVariable}
                                  allConfigVariables={configVariables}
                                  updatedConfigVariables={
                                    updatedConfigVariables
                                  }
                                  optionalConfigVariables={
                                    optionalConfigVariables
                                  }
                                />
                              </Box>
                            </Group>
                          </Box>
                        );
                      })}

                      {categoryId.toLowerCase() === "general" && (
                        <Box pt={10}>
                          <Divider mb={20} />
                          <LogoConfigInput
                            logo={logo}
                            setLogo={setLogo}
                            darkLogo={darkLogo}
                            setDarkLogo={setDarkLogo}
                          />
                        </Box>
                      )}

                      {categoryId.toLowerCase() === "appearance" &&
                        customCssConfigVariable && (
                          <Box pt={10}>
                            <Divider mb={20} />
                            <Group position="apart" align="flex-start">
                              <Stack
                                style={{ maxWidth: isMobile ? "100%" : "42%" }}
                                spacing={4}
                              >
                                <Text size="sm" weight={600}>
                                  <FormattedMessage
                                    id={`admin.config.${camelToKebab(
                                      customCssConfigVariable.key,
                                    )}`}
                                  />
                                </Text>

                                <Text
                                  sx={{
                                    whiteSpace: "pre-line",
                                    lineHeight: 1.5,
                                  }}
                                  color="dimmed"
                                  size="xs"
                                >
                                  <FormattedMessage
                                    id={`admin.config.${camelToKebab(
                                      customCssConfigVariable.key,
                                    )}.description`}
                                    values={{ br: <br /> }}
                                  />
                                </Text>
                              </Stack>

                              <Box style={{ width: isMobile ? "100%" : "52%" }}>
                                <AdminConfigInput
                                  key={customCssConfigVariable.key}
                                  configVariable={customCssConfigVariable}
                                  updateConfigVariable={updateConfigVariable}
                                  allConfigVariables={configVariables}
                                  updatedConfigVariables={
                                    updatedConfigVariables
                                  }
                                  optionalConfigVariables={
                                    optionalConfigVariables
                                  }
                                />
                              </Box>
                            </Group>
                          </Box>
                        )}
                    </Stack>
                  </Card>
                );
              })()}

              {/* Bottom Action Buttons Bar */}
              <Group mt={24} position="right" spacing={12}>
                {categoryId.toLowerCase() === "smtp" && (
                  <TestEmailButton
                    configVariablesChanged={updatedConfigVariables.length !== 0}
                    saveConfigVariables={saveConfigVariables}
                  />
                )}
                {categoryId.toLowerCase() === "cache" && (
                  <TestRedisButton
                    configVariablesChanged={updatedConfigVariables.length !== 0}
                    saveConfigVariables={saveConfigVariables}
                  />
                )}
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<TbDeviceFloppy size={18} />}
                  onClick={saveConfigVariables}
                  loading={isSaving}
                >
                  <FormattedMessage id="common.button.save" />
                </Button>
              </Group>
            </>
          )}
        </Container>
      </AppShell>
    </>
  );
}
