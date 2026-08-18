require("ts-node/register");

const test = require("node:test");
const assert = require("node:assert/strict");

const { resolveLogLevel } = require("../src/utils/log-level.util");

test("uses FS_LOG_LEVEL when configured", () => {
  assert.equal(resolveLogLevel({ FS_LOG_LEVEL: "warn" }), "warn");
});

test("uses PV_LOG_LEVEL when FS_LOG_LEVEL is absent", () => {
  assert.equal(resolveLogLevel({ PV_LOG_LEVEL: "error" }), "error");
});

test("prefers FS_LOG_LEVEL over PV_LOG_LEVEL", () => {
  assert.equal(
    resolveLogLevel({ FS_LOG_LEVEL: "debug", PV_LOG_LEVEL: "error" }),
    "debug",
  );
});
