import { Box } from "@mantine/core";
import React from "react";

export interface LogoProps {
  height?: number;
  width?: number;
  size?: number;
  className?: string;
}

export const LogoIcon = ({ size = 32 }: { size?: number }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src="/logo.svg"
    alt="Fynvi Logo"
    width={size}
    height={size}
    style={{
      display: "block",
      objectFit: "contain",
      width: size,
      height: size,
    }}
  />
);

export const FynviLogoIcon = LogoIcon;

const Logo = ({ height = 32, width = 32, size, className }: LogoProps) => {
  const finalSize = size || Math.max(height || 32, width || 32);

  return (
    <Box
      className={className}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 0,
      }}
    >
      <LogoIcon size={finalSize} />
    </Box>
  );
};

export default Logo;
