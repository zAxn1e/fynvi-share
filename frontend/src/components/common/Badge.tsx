import { Box, BoxProps } from "@mantine/core";
import React from "react";

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "glass"
  | "outline";

export interface BadgeProps extends BoxProps {
  variant?: BadgeVariant;
  color?: string;
  size?: "xs" | "sm" | "md";
  dot?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  size = "sm",
  dot = false,
  pulse = false,
  children,
  sx,
  ...props
}) => {
  return (
    <Box
      sx={[
        (theme) => {
          const isDark = theme.colorScheme === "dark";

          const sizeStyles = {
            xs: {
              padding: "2px 8px",
              fontSize: 11,
              height: 20,
              gap: 4,
            },
            sm: {
              padding: "3px 10px",
              fontSize: 12,
              height: 24,
              gap: 6,
            },
            md: {
              padding: "5px 12px",
              fontSize: 13,
              height: 28,
              gap: 8,
            },
          }[size];

          let variantStyles = {};
          let dotColor = "currentColor";

          switch (variant) {
            case "primary":
              variantStyles = {
                backgroundColor: isDark
                  ? "var(--brand-primary-subtle, rgba(59, 130, 246, 0.15))"
                  : "var(--brand-primary-subtle, rgba(37, 99, 235, 0.10))",
                color: "var(--brand-primary)",
                border: "1px solid var(--border-focus, rgba(59, 130, 246, 0.3))",
              };
              dotColor = "var(--brand-primary)";
              break;
            case "success":
              variantStyles = {
                backgroundColor: isDark
                  ? "var(--state-success-bg, rgba(16, 185, 129, 0.15))"
                  : "var(--state-success-bg, rgba(16, 185, 129, 0.12))",
                color: isDark ? "#34D399" : "#059669",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              };
              dotColor = "#10B981";
              break;
            case "warning":
              variantStyles = {
                backgroundColor: isDark
                  ? "var(--state-warning-bg, rgba(245, 158, 11, 0.15))"
                  : "var(--state-warning-bg, rgba(245, 158, 11, 0.12))",
                color: isDark ? "#FBBF24" : "#D97706",
                border: "1px solid rgba(245, 158, 11, 0.3)",
              };
              dotColor = "#F59E0B";
              break;
            case "danger":
              variantStyles = {
                backgroundColor: isDark
                  ? "var(--state-danger-bg, rgba(239, 68, 68, 0.15))"
                  : "var(--state-danger-bg, rgba(239, 68, 68, 0.12))",
                color: isDark ? "#F87171" : "#DC2626",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              };
              dotColor = "#EF4444";
              break;
            case "info":
              variantStyles = {
                backgroundColor: isDark
                  ? "var(--state-info-bg, rgba(6, 182, 212, 0.15))"
                  : "var(--state-info-bg, rgba(6, 182, 212, 0.12))",
                color: isDark ? "#22D3EE" : "#0891B2",
                border: "1px solid rgba(6, 182, 212, 0.3)",
              };
              dotColor = "#06B6D4";
              break;
            case "glass":
              variantStyles = {
                backgroundColor: "var(--glass-bg, rgba(15, 19, 25, 0.75))",
                backdropFilter: "blur(var(--glass-blur, 16px))",
                WebkitBackdropFilter: "blur(var(--glass-blur, 16px))",
                color: isDark ? "var(--text-primary, #F8FAFC)" : "var(--text-primary, #0F172A)",
                border: "1px solid var(--glass-border, rgba(255, 255, 255, 0.09))",
              };
              dotColor = isDark ? "#F8FAFC" : "#0F172A";
              break;
            case "outline":
              variantStyles = {
                backgroundColor: "transparent",
                color: isDark ? "var(--text-primary, #F8FAFC)" : "var(--text-primary, #0F172A)",
                border: "1px solid var(--border-medium, rgba(255, 255, 255, 0.18))",
              };
              dotColor = isDark ? "#F8FAFC" : "#0F172A";
              break;
            case "default":
            default:
              variantStyles = {
                backgroundColor: isDark ? "var(--surface-2, #1C2430)" : "var(--surface-2, #E2E8F0)",
                color: isDark ? "var(--text-secondary, #94A3B8)" : "var(--text-secondary, #475569)",
                border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))",
              };
              dotColor = isDark ? "#94A3B8" : "#64748B";
              break;
          }

          return {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 500,
            borderRadius: "var(--radius-pill, 9999px)",
            fontFamily: "var(--font-sans, inherit)",
            whiteSpace: "nowrap",
            ...sizeStyles,
            ...variantStyles,
            ...(dot && {
              "&::before": {
                content: "\"\"",
                display: "inline-block",
                width: size === "xs" ? 5 : 6,
                height: size === "xs" ? 5 : 6,
                borderRadius: "50%",
                backgroundColor: dotColor,
                ...(pulse && {
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%": { opacity: 1, transform: "scale(1)" },
                    "50%": { opacity: 0.4, transform: "scale(0.85)" },
                    "100%": { opacity: 1, transform: "scale(1)" },
                  },
                }),
              },
            }),
          };
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {children}
    </Box>
  );
};

export default Badge;
