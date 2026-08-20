import { MockServerInstance, startMockApiServer } from "./helpers/mock-server";

let mockServer: MockServerInstance | null = null;

export default async function globalSetup() {
  console.log("\n==> Starting in-process Mock API Server on port 8080 for SSR & Middleware...");
  mockServer = await startMockApiServer(8080);
  (globalThis as any).__MOCK_SERVER__ = mockServer;
  console.log("==> Mock API Server is listening on http://localhost:8080");
}
