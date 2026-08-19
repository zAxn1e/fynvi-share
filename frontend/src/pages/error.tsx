import { Box, Container, Group, Stack, Text, Title } from "@mantine/core";
import { useRouter } from "next/router";
import React from "react";
import { TbAlertTriangle, TbHome } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import { Button } from "../components/common/Button";
import Meta from "../components/Meta";
import useTranslate from "../hooks/useTranslate.hook";

export default function Error() {
  const t = useTranslate();
  const router = useRouter();

  const params = router.query.params
    ? (router.query.params as string).split(",").map((param) => {
        return t(`error.param.${param}`);
      })
    : [];

  return (
    <>
      <Meta title={t("error.title") || "Application Error"} />
      <Container size="sm" sx={{ paddingTop: 80, paddingBottom: 80 }}>
        <Stack align="center" spacing={16} sx={{ textAlign: "center" }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "var(--fynvi-radius-lg)",
              backgroundColor: "var(--fynvi-state-danger-bg)",
              color: "var(--fynvi-state-danger)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TbAlertTriangle size={36} />
          </Box>

          <Title order={2} sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
            {t("error.description") || "Something went wrong"}
          </Title>

          <Text size="sm" color="dimmed" sx={{ maxWidth: 420 }}>
            <FormattedMessage
              id={`error.msg.${router.query.error || "default"}`}
              values={Object.fromEntries(
                params.map((value, key) => [key.toString(), value]),
              )}
            />
          </Text>

          <Group position="center" mt={24}>
            <Button
              onClick={() => router.push("/")}
              variant="primary"
              leftIcon={<TbHome size={16} />}
            >
              <FormattedMessage
                id="common.button.go-home"
                defaultMessage="Back to Overview"
              />
            </Button>
          </Group>
        </Stack>
      </Container>
    </>
  );
}
