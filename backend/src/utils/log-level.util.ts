type LogLevelEnvironment = Record<string, string | undefined>;

export function resolveLogLevel({
  FS_LOG_LEVEL,
  PV_LOG_LEVEL,
}: LogLevelEnvironment): string {
  return FS_LOG_LEVEL || PV_LOG_LEVEL || "";
}
