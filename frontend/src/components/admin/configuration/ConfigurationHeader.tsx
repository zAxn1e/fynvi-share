import {
  ActionIcon,
  Box,
  Burger,
  Group,
  Header,
  MediaQuery,
  Text,
  useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { TbArrowLeft, TbSettings } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import useConfig from "../../../hooks/config.hook";
import { Button } from "../../common/Button";
import Logo from "../../Logo";

const ConfigurationHeader = ({
  isMobileNavBarOpened,
  setIsMobileNavBarOpened,
}: {
  isMobileNavBarOpened: boolean;
  setIsMobileNavBarOpened: Dispatch<SetStateAction<boolean>>;
}) => {
  const config = useConfig();
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  return (
    <Header
      height={64}
      p="0 24px"
      sx={{
        backgroundColor: "var(--glass-bg, rgba(15, 19, 25, 0.75))",
        backdropFilter: "blur(var(--glass-blur, 16px))",
        WebkitBackdropFilter: "blur(var(--glass-blur, 16px))",
        borderBottom: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Group position="apart" w="100%">
        <Group spacing={14}>
          <Link href="/" passHref style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center" }}>
            <Logo height={30} width={30} />
          </Link>
          <Text size="sm" weight={600} sx={{ [theme.fn.smallerThan("xs")]: { display: "none" } }}>
            {config.get("general.appName") || "Fynvi Share"}
          </Text>
          <Text size="sm" color="dimmed">
            /
          </Text>
          <Text size="sm" color="dimmed">
            Configuration
          </Text>
        </Group>

        <Group spacing={10}>
          <Button
            variant="secondary"
            size="xs"
            component={Link}
            href="/admin"
            leftIcon={<TbArrowLeft size={15} />}
          >
            <FormattedMessage id="common.button.go-back" />
          </Button>

          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <Burger
              opened={isMobileNavBarOpened}
              onClick={() => setIsMobileNavBarOpened((o) => !o)}
              size="sm"
            />
          </MediaQuery>
        </Group>
      </Group>
    </Header>
  );
};

export default ConfigurationHeader;
