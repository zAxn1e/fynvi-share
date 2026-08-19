import {
  Anchor,
  Box,
  Center,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import useUser from "../../hooks/user.hook";
import authService from "../../services/auth.service";
import toast from "../../utils/toast.util";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import Logo from "../Logo";

const SignUpForm = () => {
  const config = useConfig();
  const router = useRouter();
  const t = useTranslate();
  const { refreshUser } = useUser();

  const validationSchema = yup.object().shape({
    email: yup.string().email(t("common.error.invalid-email")).required(),
    username: yup
      .string()
      .min(3, t("common.error.too-short", { length: 3 }))
      .required(t("common.error.field-required")),
    password: yup
      .string()
      .min(8, t("common.error.too-short", { length: 8 }))
      .required(t("common.error.field-required")),
  });

  const form = useForm({
    initialValues: {
      email: "",
      username: "",
      password: "",
    },
    validate: yupResolver(validationSchema),
  });

  const signUp = async (email: string, username: string, password: string) => {
    await authService
      .signUp(email.trim(), username.trim(), password.trim())
      .then(async (response) => {
        if (response.data.verificationRequired) {
          router.replace({
            pathname: "/auth/verify/info",
            query: { email: email.trim() },
          });
        } else {
          const user = await refreshUser();
          if (user?.isAdmin) {
            router.replace("/admin/intro");
          } else {
            router.replace("/upload");
          }
        }
      })
      .catch(toast.axiosError);
  };

  return (
    <Box sx={{ maxWidth: 400, margin: "20px auto" }}>
      <Stack align="center" spacing={12} mb={24}>
        <Logo width={42} height={42} />
        <Title order={3} sx={{ letterSpacing: "-0.02em" }}>
          <FormattedMessage id="signup.title" defaultMessage="Create Account" />
        </Title>
        <Text size="xs" color="dimmed">
          Sign up to get your own private file sharing workspace.
        </Text>
      </Stack>

      <Card padded>
        <form
          onSubmit={form.onSubmit((values) =>
            signUp(values.email, values.username, values.password),
          )}
        >
          <Stack spacing={14}>
            <TextInput
              label={t("signup.input.username") || "Username"}
              placeholder="johndoe"
              size="sm"
              {...form.getInputProps("username")}
            />
            <TextInput
              label={t("signup.input.email") || "Email"}
              placeholder="john@example.com"
              size="sm"
              {...form.getInputProps("email")}
            />
            <PasswordInput
              label={t("signup.input.password") || "Password"}
              size="sm"
              {...form.getInputProps("password")}
            />

            <Button variant="primary" size="sm" type="submit" mt={8}>
              <FormattedMessage
                id="signup.button.submit"
                defaultMessage="Let's get started"
              />
            </Button>
          </Stack>
        </form>
      </Card>

      <Center mt={20}>
        <Text size="xs" color="dimmed">
          <FormattedMessage
            id="signup.description"
            defaultMessage="Already have an account?"
          />{" "}
          <Anchor component={Link} href="/auth/signIn" size="xs" weight={500}>
            <FormattedMessage
              id="signup.button.signin"
              defaultMessage="Sign in"
            />
          </Anchor>
        </Text>
      </Center>
    </Box>
  );
};

export default SignUpForm;
