import {
  Button as MantineButton,
  ButtonProps as MantineButtonProps,
  CSSObject,
} from "@mantine/core";
import React, { forwardRef } from "react";

export interface ButtonProps extends MantineButtonProps {
  variant?:
    | "primary"
    | "secondary"
    | "subtle"
    | "ghost"
    | "danger"
    | "warning"
    | "glass";
  component?: any;
  href?: string;
  target?: string;
  download?: string;
  onClick?: (e?: any) => void;
  children: React.ReactNode;
  [key: string]: any;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", sx, children, ...props }, ref) => {
    return (
      <MantineButton
        ref={ref}
        sx={[
          (theme): CSSObject => {
            const isDark = theme.colorScheme === "dark";

            let customStyles: CSSObject = {};

            if (variant === "primary") {
              customStyles = {
                background:
                  "var(--brand-gradient-vertical, var(--brand-gradient, linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)))",
                color: "#FFFFFF",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                boxShadow: isDark
                  ? "0 1px 2px rgba(0, 0, 0, 0.25), 0 2px 8px var(--brand-primary-subtle, rgba(37, 99, 235, 0.25)), inset 0 1px 0 rgba(255, 255, 255, 0.25)"
                  : "0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(37, 99, 235, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                "&:hover": {
                  filter: "brightness(1.06)",
                  transform: "translateY(-1px)",
                  boxShadow: isDark
                    ? "0 4px 14px var(--brand-primary-subtle, rgba(37, 99, 235, 0.4)), inset 0 1px 0 rgba(255, 255, 255, 0.35)"
                    : "0 4px 12px rgba(37, 99, 235, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.35)",
                },
                "&:active": {
                  transform: "translateY(0)",
                  filter: "brightness(0.96)",
                  boxShadow:
                    "0 1px 2px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.2)",
                },
              };
            } else if (variant === "secondary") {
              customStyles = {
                backgroundColor: isDark
                  ? "var(--surface-1, #151B24)"
                  : "var(--surface-1, #F1F5F9)",
                backgroundImage: isDark
                  ? "linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)"
                  : "none",
                color: isDark
                  ? "var(--text-primary, #F8FAFC)"
                  : "var(--text-primary, #0F172A)",
                border:
                  "1px solid var(--border-medium, rgba(255, 255, 255, 0.13))",
                boxShadow: isDark
                  ? "0 1px 2px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                  : "0 1px 2px rgba(0, 0, 0, 0.04)",
                "&:hover": {
                  backgroundColor: isDark
                    ? "var(--surface-2, #1C2430)"
                    : "var(--surface-2, #E2E8F0)",
                  borderColor:
                    "var(--border-strong, rgba(255, 255, 255, 0.22))",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
              };
            } else if (variant === "subtle" || variant === "ghost") {
              customStyles = {
                backgroundColor: "transparent",
                color: isDark
                  ? "var(--text-secondary, #94A3B8)"
                  : "var(--text-secondary, #475569)",
                "&:hover": {
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.06)"
                    : "rgba(15, 23, 42, 0.05)",
                  color: isDark
                    ? "var(--text-primary, #F8FAFC)"
                    : "var(--text-primary, #0F172A)",
                },
              };
            } else if (variant === "glass") {
              customStyles = {
                background: "var(--glass-bg, rgba(15, 19, 25, 0.75))",
                backgroundImage:
                  "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)",
                backdropFilter: "blur(var(--glass-blur, 16px))",
                WebkitBackdropFilter: "blur(var(--glass-blur, 16px))",
                color: isDark
                  ? "var(--text-primary, #F8FAFC)"
                  : "var(--text-primary, #0F172A)",
                border:
                  "1px solid var(--glass-border, rgba(255, 255, 255, 0.09))",
                boxShadow:
                  "0 1px 2px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                "&:hover": {
                  borderColor:
                    "var(--border-strong, rgba(255, 255, 255, 0.22))",
                  transform: "translateY(-1px)",
                },
              };
            } else if (variant === "danger") {
              customStyles = {
                backgroundColor: isDark
                  ? "var(--state-danger-bg, rgba(239, 68, 68, 0.12))"
                  : "#FEE2E2",
                color: isDark ? "#F87171" : "#DC2626",
                border: isDark
                  ? "1px solid rgba(239, 68, 68, 0.3)"
                  : "1px solid rgba(220, 38, 38, 0.2)",
                "&:hover": {
                  backgroundColor: isDark
                    ? "rgba(239, 68, 68, 0.25)"
                    : "#FCA5A5",
                },
              };
            } else if (variant === "warning") {
              customStyles = {
                backgroundColor: isDark
                  ? "var(--state-warning-bg, rgba(245, 158, 11, 0.12))"
                  : "#FEF3C7",
                color: isDark ? "#FBBF24" : "#D97706",
                border: isDark
                  ? "1px solid rgba(245, 158, 11, 0.3)"
                  : "1px solid rgba(217, 119, 6, 0.2)",
                "&:hover": {
                  backgroundColor: isDark
                    ? "rgba(245, 158, 11, 0.25)"
                    : "#FDE68A",
                },
              };
            }

            return {
              fontWeight: 500,
              borderRadius: "var(--radius-md, 10px)",
              fontFamily: "var(--font-sans, inherit)",
              transition:
                "all var(--transition-fast, 150ms cubic-bezier(0.16, 1, 0.3, 1))",
              ...customStyles,
            };
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      >
        {children}
      </MantineButton>
    );
  },
);

Button.displayName = "Button";
export default Button;
