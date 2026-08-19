import * as path from "path";

const CANONICAL_DATABASE_FILENAME = "fynvi-share.db";
const LEGACY_DATABASE_FILENAME = "pingvin-share.db";

type DatabaseUrlOptions = {
  dataDirectory: string;
  explicitUrl?: string;
  exists?: (path: string) => boolean;
};

function sqliteUrl(databasePath: string): string {
  const absolutePath = path.resolve(databasePath);

  return `file:${absolutePath.replace(/\\/g, "/")}?connection_limit=1`;
}

export function resolveDatabaseUrl({
  dataDirectory,
  explicitUrl,
  exists = () => false,
}: DatabaseUrlOptions): string {
  if (explicitUrl) return explicitUrl;

  const canonicalDatabase = path.join(
    dataDirectory,
    CANONICAL_DATABASE_FILENAME,
  );
  if (exists(canonicalDatabase)) {
    return sqliteUrl(canonicalDatabase);
  }

  const legacyDatabase = path.join(dataDirectory, LEGACY_DATABASE_FILENAME);
  if (exists(legacyDatabase)) {
    return sqliteUrl(legacyDatabase);
  }

  return sqliteUrl(canonicalDatabase);
}
