import { Box, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import React from "react";
import { TbInbox } from "react-icons/tb";

export interface EmptyStateProps {
  icon?: React.ReactNode | React.ComponentType<{ size?: number }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  const renderIcon = () => {
    if (!icon) return <TbInbox size={28} />;
    if (typeof icon === "function") {
      const IconComp = icon as React.ComponentType<{ size?: number }>;
      return <IconComp size={28} />;
    }
    return icon;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "48px 24px",
        borderRadius: "var(--radius-lg, 14px)",
        backgroundColor: isDark
          ? "var(--surface-0, #0F1319)"
          : "var(--surface-0, #FFFFFF)",
        border: "1px dashed var(--border-medium, rgba(255, 255, 255, 0.13))",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          borderRadius: "var(--radius-md, 10px)",
          backgroundColor: isDark
            ? "var(--surface-1, #151B24)"
            : "var(--surface-1, #F1F5F9)",
          color: isDark
            ? "var(--text-secondary, #94A3B8)"
            : "var(--text-secondary, #475569)",
          marginBottom: 16,
          fontSize: 28,
        }}
      >
        {renderIcon()}
      </Box>
      <Title
        order={3}
        sx={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 8,
          color: isDark
            ? "var(--text-primary, #F8FAFC)"
            : "var(--text-primary, #0F172A)",
        }}
      >
        {title}
      </Title>
      {description && (
        <Text
          size="sm"
          sx={{
            color: isDark
              ? "var(--text-secondary, #94A3B8)"
              : "var(--text-secondary, #475569)",
            maxWidth: 400,
            marginBottom: action ? 20 : 0,
            lineHeight: 1.5,
          }}
        >
          {description}
        </Text>
      )}
      {action && <Stack mt={16}>{action}</Stack>}
    </Box>
  );
};

export default EmptyState;
