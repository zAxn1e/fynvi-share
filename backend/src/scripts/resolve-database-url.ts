import { existsSync } from "fs";
import { DATA_DIRECTORY } from "../constants";
import { resolveDatabaseUrl } from "../utils/database-url.util";

console.log(
  resolveDatabaseUrl({
    dataDirectory: DATA_DIRECTORY,
    explicitUrl: process.env.DATABASE_URL,
    exists: existsSync,
  }),
);
