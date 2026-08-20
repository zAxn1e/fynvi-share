import http from "http";
import {
  getMockAdminConfigs,
  mockConfigVariables,
  mockCurrentUser,
  mockShareDetailShowcase,
  mockSharesList,
  mockStandardUser,
  mockSystemInfo,
  mockUsersList,
} from "../fixtures/demo-data";

export interface MockServerInstance {
  server: http.Server;
  port: number;
  close: () => Promise<void>;
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;

  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const key = parts.shift()?.trim();
    if (key) {
      list[key] = decodeURIComponent(parts.join("="));
    }
  });

  return list;
}

export function startMockApiServer(port: number = 8080): Promise<MockServerInstance> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const rawUrl = req.url || "/";
      const pathname = (rawUrl.split("?")[0] || "/").replace(/\/+$/, "") || "/";
      const cookies = parseCookies(req.headers.cookie);
      const hasAuth = !!cookies["access_token"];

      // CORS & JSON headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "*");

      if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
      }

      const sendJson = (data: any, status = 200) => {
        res.writeHead(status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
      };

      console.log(`[MockServer] ${req.method} ${pathname} ${hasAuth ? "(authenticated)" : "(guest)"}`);

      // 1. Current User
      if (pathname === "/api/users/me") {
        if (hasAuth) {
          sendJson(mockCurrentUser);
        } else {
          sendJson({ statusCode: 401, message: "Unauthorized" }, 401);
        }
        return;
      }

      // 2. Configs
      if (pathname === "/api/configs/isNewReleaseAvailable") {
        sendJson(true);
        return;
      }

      if (pathname.startsWith("/api/configs/admin/")) {
        const category = pathname.split("/api/configs/admin/")[1] || "general";
        sendJson(getMockAdminConfigs(category));
        return;
      }

      if (pathname === "/api/configs") {
        sendJson(mockConfigVariables);
        return;
      }

      // 3. Shares List & Subroutes
      if (
        pathname === "/api/shares" ||
        pathname === "/api/shares/my" ||
        pathname === "/api/shares/all"
      ) {
        sendJson(mockSharesList);
        return;
      }

      if (pathname === "/api/shares/received") {
        sendJson([]);
        return;
      }

      if (pathname.endsWith("/token")) {
        sendJson({ token: "demo_mock_token_2026" });
        return;
      }

      if (pathname.endsWith("/from-owner") || pathname.endsWith("/metaData")) {
        sendJson(mockShareDetailShowcase);
        return;
      }

      if (pathname === "/api/shares/demo-share-showcase") {
        sendJson(mockShareDetailShowcase);
        return;
      }

      if (pathname.startsWith("/api/shares/")) {
        const shareId = pathname.replace("/api/shares/", "");
        const found = mockSharesList.find((s) => s.id === shareId) || mockShareDetailShowcase;
        sendJson(found);
        return;
      }

      // 4. Reverse Shares
      if (pathname.startsWith("/api/reverseShares")) {
        sendJson([]);
        return;
      }

      // 5. System Info
      if (pathname === "/api/system/info") {
        sendJson(mockSystemInfo);
        return;
      }

      // 6. Users List
      if (pathname === "/api/users" || pathname.startsWith("/api/users/")) {
        sendJson(mockUsersList);
        return;
      }

      // Default fallback
      sendJson({ success: true });
    });

    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.warn(`[MockServer] Port ${port} is already in use, assuming existing server.`);
        resolve({
          server,
          port,
          close: async () => {},
        });
      } else {
        reject(err);
      }
    });

    server.listen(port, () => {
      resolve({
        server,
        port,
        close: () =>
          new Promise((res) => {
            server.close(() => res());
          }),
      });
    });
  });
}
