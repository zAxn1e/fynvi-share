import { Box, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";
import React, { useState } from "react";
import useUser from "../../hooks/user.hook";
import { WaveCanvas, WaveState } from "../common/WaveCanvas";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export interface AppShellProps {
  children: React.ReactNode;
  waveState?: WaveState;
  uploadSpeed?: number;
  uploadProgress?: number;
  onOpenUpload?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  waveState = "idle",
  uploadSpeed = 0,
  uploadProgress = 0,
  onOpenUpload,
}) => {
  const { user } = useUser();
  const router = useRouter();
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpened, setMobileNavOpened] = useState(false);

  const isHomePage = router.pathname === "/";

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "stretch",
        backgroundColor: isDark ? "var(--surface-0, #090B0E)" : "var(--surface-0, #F8FAFC)",
        color: isDark ? "var(--text-primary, #F8FAFC)" : "var(--text-primary, #0F172A)",
        position: "relative",
      }}
    >
      {/* Ambient Primary Glow Header Fade */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 480,
          background: "var(--brand-glow-header)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Dynamic Background Harmonic Waves */}
      <WaveCanvas
        state={waveState}
        speed={uploadSpeed}
        progress={uploadProgress}
      />

      {/* Desktop Sidebar Navigation (Hidden on homepage) */}
      {!isHomePage && (
        <Sidebar
          user={user}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
          onOpenUpload={onOpenUpload}
        />
      )}

      {/* Mobile Drawer Navigation */}
      <MobileNav
        opened={mobileNavOpened}
        onClose={() => setMobileNavOpened(false)}
        user={user}
        onOpenUpload={onOpenUpload}
      />

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          position: "relative",
          zIndex: 1,
          marginLeft: isHomePage ? 0 : sidebarCollapsed ? 76 : 260,
          transition: "margin-left var(--transition-normal, 250ms cubic-bezier(0.16, 1, 0.3, 1))",
          [theme.fn.smallerThan("md")]: {
            marginLeft: 0,
          },
        }}
      >
        {/* Topbar Header */}
        <Topbar
          user={user}
          onOpenUpload={onOpenUpload}
          onOpenMobileNav={() => setMobileNavOpened(true)}
        />

        {/* Dynamic Page Container */}
        <Box
          component="main"
          sx={{
            flex: 1,
            padding: "24px 32px",
            maxWidth: 1400,
            width: "100%",
            margin: "0 auto",
            [theme.fn.smallerThan("md")]: {
              padding: "16px",
            },
            [theme.fn.smallerThan("xs")]: {
              padding: "12px 10px",
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppShell;
