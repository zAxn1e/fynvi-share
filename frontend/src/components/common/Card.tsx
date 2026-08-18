import { Box, BoxProps, CSSObject } from "@mantine/core";
import React from "react";

export interface CardProps extends BoxProps {
  interactive?: boolean;
  padded?: boolean;
  level?: 0 | 1 | 2 | "glass";
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  interactive = false,
  padded = true,
  level = 1,
  sx,
  children,
  ...props
}) => {
  return (
    <Box
      sx={[
        (theme): CSSObject => {
          const isDark = theme.colorScheme === "dark";

          let surfaceBg = isDark ? "var(--surface-1, #151B24)" : "var(--surface-0, #FFFFFF)";
          let borderVal = "1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))";
          let backdropVal = "none";

          if (level === 0) {
            surfaceBg = isDark ? "var(--surface-0, #0F1319)" : "var(--surface-0, #FFFFFF)";
          } else if (level === 2) {
            surfaceBg = isDark ? "var(--surface-2, #1C2430)" : "var(--surface-1, #F1F5F9)";
            borderVal = "1px solid var(--border-medium, rgba(255, 255, 255, 0.13))";
          } else if (level === "glass") {
            surfaceBg = "var(--glass-bg, rgba(15, 19, 25, 0.75))";
            backdropVal = "blur(var(--glass-blur, 16px))";
            borderVal = "1px solid var(--glass-border, rgba(255, 255, 255, 0.09))";
          }

          return {
            backgroundColor: surfaceBg,
            backgroundImage: isDark
              ? "linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)"
              : "none",
            backdropFilter: backdropVal,
            WebkitBackdropFilter: backdropVal,
            border: borderVal,
            borderRadius: "var(--radius-lg, 14px)",
            padding: padded ? "20px 24px" : 0,
            boxShadow: isDark
              ? "var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.3)), inset 0 1px 0 rgba(255, 255, 255, 0.04)"
              : "var(--shadow-sm, 0 1px 3px rgba(15, 23, 42, 0.06))",
            transition: "all var(--transition-fast, 150ms cubic-bezier(0.16, 1, 0.3, 1))",
            ...(interactive && {
              cursor: "pointer",
              "&:hover": {
                borderColor: "var(--border-strong, rgba(255, 255, 255, 0.22))",
                transform: "translateY(-1px)",
                boxShadow: isDark
                  ? "var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.35)), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                  : "var(--shadow-md, 0 4px 14px rgba(15, 23, 42, 0.08))",
              },
              "&:active": {
                transform: "translateY(0)",
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

export default Card;
