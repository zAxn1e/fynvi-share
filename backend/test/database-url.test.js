require("ts-node/register");

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const { resolveDatabaseUrl } = require("../src/utils/database-url.util");

const urlFor = (paths, explicitUrl) =>
  resolveDatabaseUrl({
    dataDirectory: "/data",
    explicitUrl,
    exists: (candidate) =>
      paths.map((item) => path.normalize(item)).includes(path.normalize(candidate)),
  });

const expectedUrl = (p) =>
  `file:${path.resolve(p).replace(/\\/g, "/")}?connection_limit=1`;

test("uses an explicitly configured database URL", () => {
  assert.equal(
    urlFor(["/data/pingvin-share.db"], "file:/custom/database.db"),
    "file:/custom/database.db",
  );
});

test("uses the canonical database when it exists", () => {
  assert.equal(
    urlFor(["/data/pingvin-share.db", "/data/fynvi-share.db"]),
    expectedUrl("/data/fynvi-share.db"),
  );
});

test("keeps using the legacy database on upgrade", () => {
  assert.equal(
    urlFor(["/data/pingvin-share.db"]),
    expectedUrl("/data/pingvin-share.db"),
  );
});

test("selects the canonical database for a fresh installation", () => {
  assert.equal(
    urlFor([]),
    expectedUrl("/data/fynvi-share.db"),
  );
});
