export default async function globalTeardown() {
  const mockServer = (globalThis as any).__MOCK_SERVER__;
  if (mockServer && typeof mockServer.close === "function") {
    console.log("\n==> Stopping in-process Mock API Server...");
    await mockServer.close();
    console.log("==> Mock API Server stopped.");
  }
}
