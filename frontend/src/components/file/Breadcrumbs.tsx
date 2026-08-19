import { Box, Group, Text, UnstyledButton } from "@mantine/core";
import React from "react";
import { TbChevronRight, TbFolder, TbHome } from "react-icons/tb";

export interface BreadcrumbItem {
  id: string;
  name: string;
  path?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (item: BreadcrumbItem, index: number) => void;
  rootLabel?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  onNavigate,
  rootLabel = "Root",
}) => {
  return (
    <Group spacing={6} align="center" sx={{ userSelect: "none" }}>
      {/* Root Breadcrumb */}
      <UnstyledButton
        onClick={() =>
          onNavigate({ id: "root", name: rootLabel, path: "/" }, -1)
        }
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 8px",
          borderRadius: "var(--radius-sm, 6px)",
          fontSize: 13,
          fontWeight: items.length === 0 ? 600 : 400,
          color:
            items.length === 0
              ? theme.colorScheme === "dark"
                ? "var(--text-primary, #F8FAFC)"
                : "var(--text-primary, #0F172A)"
              : "var(--text-secondary, #94A3B8)",
          "&:hover": {
            backgroundColor:
              theme.colorScheme === "dark"
                ? "var(--surface-1, #151B24)"
                : "var(--surface-1, #F1F5F9)",
            color: "var(--brand-primary)",
          },
        })}
      >
        <TbHome size={15} />
        <span>{rootLabel}</span>
      </UnstyledButton>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={item.id || index}>
            <TbChevronRight
              size={13}
              color="var(--text-muted, #64748B)"
              style={{ opacity: 0.7 }}
            />
            <UnstyledButton
              onClick={() => onNavigate(item, index)}
              sx={(theme) => ({
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 8px",
                borderRadius: "var(--radius-sm, 6px)",
                fontSize: 13,
                fontWeight: isLast ? 600 : 400,
                color: isLast
                  ? theme.colorScheme === "dark"
                    ? "var(--text-primary, #F8FAFC)"
                    : "var(--text-primary, #0F172A)"
                  : "var(--text-secondary, #94A3B8)",
                "&:hover": {
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? "var(--surface-1, #151B24)"
                      : "var(--surface-1, #F1F5F9)",
                  color: "var(--brand-primary)",
                },
              })}
            >
              <TbFolder size={15} />
              <span>{item.name}</span>
            </UnstyledButton>
          </React.Fragment>
        );
      })}
    </Group>
  );
};

export default Breadcrumbs;
