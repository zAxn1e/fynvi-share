import {
  Box,
  Group,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useModals } from "@mantine/modals";
import { useEffect, useState } from "react";
import { TbPlus, TbRefresh, TbSearch, TbUsers } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import ManageUserTable from "../../components/admin/users/ManageUserTable";
import showCreateUserModal from "../../components/admin/users/showCreateUserModal";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import Meta from "../../components/Meta";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import userService from "../../services/user.service";
import User from "../../types/user.type";
import toast from "../../utils/toast.util";

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const config = useConfig();
  const modals = useModals();
  const t = useTranslate();
  const theme = useMantineTheme();

  const getUsers = () => {
    setIsLoading(true);
    userService.list().then((data) => {
      setUsers(data);
      setIsLoading(false);
    });
  };

  const deleteUser = (user: User) => {
    modals.openConfirmModal({
      title:
        t("admin.users.edit.delete.title", {
          username: user.username,
        }) || `Delete user @${user.username}?`,
      children: (
        <Text size="sm">
          <FormattedMessage id="admin.users.edit.delete.description" />
        </Text>
      ),
      labels: {
        confirm: t("common.button.delete") || "Delete",
        cancel: t("common.button.cancel") || "Cancel",
      },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        userService
          .remove(user.id)
          .then(() => setUsers((prev) => prev.filter((v) => v.id !== user.id)))
          .catch(toast.axiosError);
      },
    });
  };

  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const adminCount = users.filter((u) => u.isAdmin).length;

  return (
    <Box>
      <Meta title={t("admin.users.title") || "User Accounts"} />

      {/* Header */}
      <Group position="apart" align="flex-start" mb={24}>
        <Stack spacing={4}>
          <Group spacing={10}>
            <Title order={2} sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
              <FormattedMessage id="admin.users.title" />
            </Title>
            <Badge variant="primary" size="md">
              {users.length} Users ({adminCount} Admins)
            </Badge>
          </Group>
          <Text size="sm" color="dimmed">
            Manage registered accounts, grant administrator rights, customize
            upload quota limits, or reset credentials.
          </Text>
        </Stack>

        <Group spacing={10}>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<TbRefresh size={16} />}
            onClick={getUsers}
            loading={isLoading}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              showCreateUserModal(modals, config.get("smtp.enabled"), getUsers)
            }
            leftIcon={<TbPlus size={18} />}
          >
            <FormattedMessage id="common.button.create" />
          </Button>
        </Group>
      </Group>

      {/* Main Table Card */}
      <Card padded>
        <Group position="apart" mb={16}>
          <TextInput
            placeholder="Search by username or email address..."
            icon={<TbSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            size="sm"
            sx={{ width: 340, maxWidth: "100%" }}
          />
          <Text size="xs" color="dimmed">
            Showing {filteredUsers.length} of {users.length} registered users
          </Text>
        </Group>

        <ManageUserTable
          users={filteredUsers}
          getUsers={getUsers}
          deleteUser={deleteUser}
          isLoading={isLoading}
        />
      </Card>
      <Space h="xl" />
    </Box>
  );
};

export default Users;
