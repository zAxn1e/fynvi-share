import {
  Anchor,
  Box,
  Center,
  Divider,
  Group,
  Loader,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import useUser from "../../hooks/user.hook";
import authService from "../../services/auth.service";
import { getOAuthIcon, getOAuthUrl } from "../../utils/oauth.util";
import { safeRedirectPath } from "../../utils/router.util";
import toast from "../../utils/toast.util";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import Logo from "../Logo";

const SignInForm = ({ redirectPath }: { redirectPath: string }) => {
  const config = useConfig();
  const router = useRouter();
  const t = useTranslate();
  const { refreshUser } = useUser();

  const [oauthProviders, setOauthProviders] = useState<string[] | null>(null);
  const [isRedirectingToOauthProvider, setIsRedirectingToOauthProvider] =
    useState(false);

  const validationSchema = yup.object().shape({
    emailOrUsername: yup.string().required(t("common.error.field-required")),
    password: yup.string().required(t("common.error.field-required")),
  });

  const form = useForm({
    initialValues: {
      emailOrUsername: "",
      password: "",
    },
    validate: yupResolver(validationSchema),
  });

  const signIn = async (email: string, password: string) => {
    await authService
      .signIn(email.trim(), password.trim())
      .then(async (response) => {
        if (response.data["loginToken"]) {
          router.replace({
            pathname: "/auth/totp",
            query: {
              token: response.data["loginToken"],
              redirect: redirectPath,
            },
          });
        } else {
          await refreshUser();
          router.replace(safeRedirectPath(redirectPath));
        }
      })
      .catch(toast.axiosError);
  };

  useEffect(() => {
    authService
      .getAvailableOAuth()
      .then((data) => {
        setOauthProviders(data.data);
      })
      .catch(toast.axiosError);
  }, []);

  return (
    <Box sx={{ maxWidth: 400, margin: "20px auto" }}>
      <Stack align="center" spacing={12} mb={24}>
        <Logo width={42} height={42} />
        <Title order={3} sx={{ letterSpacing: "-0.02em" }}>
          <FormattedMessage id="signin.title" defaultMessage="Sign In" />
        </Title>
        <Text size="xs" color="dimmed">
          Enter your credentials to access your Fynvi workspace.
        </Text>
      </Stack>

      <Card padded>
        <form
          onSubmit={form.onSubmit((values) =>
            signIn(values.emailOrUsername, values.password),
          )}
        >
          <Stack spacing={14}>
            <TextInput
              label={t("signin.input.email-or-username") || "Email or Username"}
              size="sm"
              {...form.getInputProps("emailOrUsername")}
            />

            <Box>
              <Group position="apart" mb={4}>
                <Text size="xs" weight={500}>
                  {t("signin.input.password") || "Password"}
                </Text>
                {config.get("smtp.enabled") && (
                  <Anchor
                    component={Link}
                    href="/auth/resetPassword"
                    size="xs"
                    color="dimmed"
                  >
                    <FormattedMessage
                      id="signin.button.forgot-password"
                      defaultMessage="Forgot password?"
                    />
                  </Anchor>
                )}
              </Group>
              <PasswordInput size="sm" {...form.getInputProps("password")} />
            </Box>

            <Button variant="primary" size="sm" type="submit" mt={8}>
              <FormattedMessage
                id="signin.button.submit"
                defaultMessage="Sign in"
              />
            </Button>
          </Stack>
        </form>

        {oauthProviders && oauthProviders.length > 0 && (
          <>
            <Divider my="md" label="Or continue with" labelPosition="center" />
            <Stack spacing={8}>
              {oauthProviders.map((provider) => (
                <Button
                  key={provider}
                  variant="secondary"
                  size="sm"
                  component="a"
                  leftIcon={getOAuthIcon(provider)}
                  href={getOAuthUrl(
                    config.get("general.appUrl") !==
                      config.get("general.appUrl", true)
                      ? config.get("general.appUrl")
                      : window.location.origin,
                    provider,
                  )}
                  onClick={() => setIsRedirectingToOauthProvider(true)}
                >
                  {isRedirectingToOauthProvider ? (
                    <Loader size="xs" />
                  ) : (
                    t(
                      `signIn.oauth.${provider.toLowerCase()}`,
                      { provider },
                      provider,
                    )
                  )}
                </Button>
              ))}
            </Stack>
          </>
        )}
      </Card>

      {config.get("share.allowRegistration") && (
        <Center mt={20}>
          <Text size="xs" color="dimmed">
            Don&apos;t have an account?{" "}
            <Anchor component={Link} href="/auth/signUp" size="xs" weight={500}>
              Create one
            </Anchor>
          </Text>
        </Center>
      )}
    </Box>
  );
};

export default SignInForm;
