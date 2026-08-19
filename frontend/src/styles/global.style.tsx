import { Global } from "@mantine/core";

const GlobalStyle = () => {
  return (
    <Global
      styles={(theme) => ({
        "*, *::before, *::after": {
          boxSizing: "border-box",
        },
        html: {
          overflowX: "hidden",
        },
        body: {
          backgroundColor: theme.colorScheme === "dark" ? "#0B0D11" : "#F8FAFC",
          color: theme.colorScheme === "dark" ? "#F3F4F6" : "#0F172A",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          margin: 0,
          padding: 0,
          overflowX: "hidden",
        },
        a: {
          color: "inherit",
          textDecoration: "none",
        },
        "table.md": {
          width: "100%",
          borderCollapse: "collapse",
        },
        "table.md th, table.md td": {
          padding: "8px 12px",
          borderBottom:
            theme.colorScheme === "dark"
              ? "1px solid rgba(255, 255, 255, 0.08)"
              : "1px solid rgba(15, 23, 42, 0.08)",
        },
      })}
    />
  );
};
export default GlobalStyle;
