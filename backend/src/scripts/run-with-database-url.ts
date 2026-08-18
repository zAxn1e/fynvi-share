import { spawn } from "child_process";
import { existsSync } from "fs";
import { DATA_DIRECTORY } from "../constants";
import { resolveDatabaseUrl } from "../utils/database-url.util";

const [command, ...args] = process.argv.slice(2);

if (!command) {
  throw new Error("A command is required.");
}

const child = spawn(command, args, {
  env: {
    ...process.env,
    DATABASE_URL: resolveDatabaseUrl({
      dataDirectory: DATA_DIRECTORY,
      explicitUrl: process.env.DATABASE_URL,
      exists: existsSync,
    }),
  },
  shell: process.platform === "win32",
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 1));
