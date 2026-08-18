import { LogLevel } from "@nestjs/common";
import { existsSync } from "fs";
import { resolveDatabaseUrl } from "./utils/database-url.util";
import { resolveLogLevel } from "./utils/log-level.util";

export const CONFIG_FILE = process.env.CONFIG_FILE || "../config.yaml";

export const DATA_DIRECTORY =
  process.env.DATA_DIRECTORY || (existsSync("../data") ? "../data" : "./data");
export const SHARE_DIRECTORY = `${DATA_DIRECTORY}/uploads/shares`;

/**
 * Resolve the database URL with backward-compatible filename fallback.
 *
 * Priority:
 *   1. DATABASE_URL environment variable (explicit override)
 *   2. fynvi-share.db  — canonical new filename
 *   3. pingvin-share.db — legacy filename kept for upgrade compatibility
 *      (installations migrating from Pingvin Share X still have the old file)
 */
export const DATABASE_URL = resolveDatabaseUrl({
  dataDirectory: DATA_DIRECTORY,
  explicitUrl: process.env.DATABASE_URL,
  exists: existsSync,
});

export const CLAMAV_HOST =
  process.env.CLAMAV_HOST ||
  (process.env.NODE_ENV == "docker" ? "clamav" : "127.0.0.1");
export const CLAMAV_PORT = parseInt(process.env.CLAMAV_PORT) || 3310;

export const LOG_LEVEL_AVAILABLE: LogLevel[] = ['verbose', 'debug', 'log', 'warn', 'error', 'fatal'];
export const LOG_LEVEL_DEFAULT: LogLevel = process.env.NODE_ENV === 'development' ? "verbose" : "log";
/**
 * Log level can be set via FS_LOG_LEVEL (preferred) or the legacy PV_LOG_LEVEL
 * (kept for backward compatibility with Pingvin Share X configurations).
 */
export const LOG_LEVEL_ENV = resolveLogLevel(process.env);
