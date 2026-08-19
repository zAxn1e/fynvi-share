import { Box, Container, Group, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import React from "react";
import { TbArrowLeft, TbHome } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import { Button } from "../components/common/Button";
import Meta from "../components/Meta";

const ErrorNotFound = () => {
  return (
    <>
      <Meta title="404 — Not Found" />
      <Container size="sm" sx={{ paddingTop: 80, paddingBottom: 80 }}>
        <Stack align="center" spacing={16} sx={{ textAlign: "center" }}>
          <Text
            sx={{
              fontWeight: 900,
              fontSize: 120,
              lineHeight: 1,
              letterSpacing: "-0.05em",
              background: "var(--fynvi-brand-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            404
          </Text>

          <Title order={2} sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
            <FormattedMessage
              id="404.description"
              defaultMessage="Page not found"
            />
          </Title>

          <Text size="sm" color="dimmed" sx={{ maxWidth: 400 }}>
            The resource, share, or page you are looking for might have been
            removed, expired, or is temporarily unavailable.
          </Text>

          <Group position="center" mt={24}>
            <Button
              component={Link}
              href="/"
              variant="primary"
              leftIcon={<TbHome size={16} />}
            >
              <FormattedMessage
                id="404.button.home"
                defaultMessage="Back to Overview"
              />
            </Button>
          </Group>
        </Stack>
      </Container>
    </>
  );
};

export default ErrorNotFound;
