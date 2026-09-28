import assert from "node:assert/strict";
import { test } from "node:test";
import {
  nextUnverifiedVersion, paseoAccepts, separatesRuntimes, validatePaseoMetadata, validateRuntimeEntries,
} from "./release-paseo.mjs";

function metadata(version = "0.8.0") {
  const devDependencies = { "@getpaseo/plugin": version, "@getpaseo/client": version };
  return {
    catalog: { paseoVersion: "0.7.2" }, entry: { paseoVersion: version },
    pkg: { devDependencies }, locked: { devDependencies: { ...devDependencies } },
    manifest: { requirements: { paseo: "^0.8.0" } },
  };
}

test("independent migrations preserve the default and enforce the entry override", () => {
  assert.deepEqual(validatePaseoMetadata(metadata()), { version: "0.8.0", errors: [] });
  assert.deepEqual(validatePaseoMetadata(metadata("0.8.0-beta.1")), { version: "0.8.0-beta.1", errors: [] });
  const legacy = metadata("0.7.2");
  legacy.entry = {};
  legacy.manifest = {};
  assert.deepEqual(validatePaseoMetadata(legacy), { version: "0.7.2", errors: [] });
});

test("rejects a stale catalog, non-exact SDK, wrong client and stale lockfile", () => {
  for (const mutate of [
    (data) => { data.entry = {}; },
    (data) => { data.entry.paseoVersion = "^0.8.0"; },
    (data) => { data.pkg.devDependencies["@getpaseo/client"] = "0.7.2"; },
    (data) => { data.locked.devDependencies["@getpaseo/plugin"] = "0.7.2"; },
  ]) {
    const data = metadata();
    mutate(data);
    assert.ok(validatePaseoMetadata(data).errors.length);
  }
});

test("a final 0.8 entry requires the migrated manifest even when the SDK matches", () => {
  const data = metadata();
  data.manifest = {};
  assert.deepEqual(validatePaseoMetadata(data).errors, ["migrated manifest must declare ^0.8.0."]);
});

test("matches Paseo's full-version or stable-core requirement check", () => {
  const cases = {
    "^0.9.0": [true, true, false, false, false],
    ">=0.9.0 <0.11.0": [true, true, true, true, true],
    ">=0.9.0 <0.10.0-beta.2": [true, true, true, false, false],
  };
  for (const [range, expected] of Object.entries(cases)) {
    assert.deepEqual(["0.9.0-beta.2", "0.9.2", "0.10.0-beta.1", "0.10.0-beta.2", "0.10.0"]
      .map((version) => paseoAccepts(version, range)), expected, range);
  }
  assert.equal(paseoAccepts("0.9.2", "not a range"), false);
  assert.equal(nextUnverifiedVersion("0.9.2"), "0.10.0-0");
  assert.equal(nextUnverifiedVersion("0.10.0-beta.1"), "0.10.0-beta.2");
  assert.equal(separatesRuntimes("0.7.2"), false);
  assert.equal(separatesRuntimes("0.10.0-beta.1"), true);
});

// Pass beta: null for a stable-only catalog.
function channels({ range = ">=0.9.0 <0.10.0-beta.2", beta = "0.10.0-beta.1" } = {}) {
  const data = metadata("0.9.2");
  data.catalog = { paseoVersion: "0.9.2", paseoRange: range, paseoBetaVersion: beta ?? undefined };
  data.entry = { paseoVersion: "0.9.2" };
  data.manifest = { requirements: { paseo: range } };
  return data;
}

test("a stable SDK with a verified beta uses the catalog range", () => {
  assert.deepEqual(validatePaseoMetadata(channels()), { version: "0.9.2", errors: [] });
  const stableOnly = channels({ range: ">=0.9.0 <0.10.0-0", beta: null });
  assert.deepEqual(validatePaseoMetadata(stableOnly).errors, []);
  const entryOverride = channels();
  entryOverride.entry.paseoRange = "^0.9.0";
  entryOverride.entry.paseoBetaVersion = null;
  entryOverride.manifest.requirements.paseo = "^0.9.0";
  assert.deepEqual(validatePaseoMetadata(entryOverride).errors, []);
});

test("rejects stale manifests and ranges that miss or exceed the verified versions", () => {
  const stale = channels();
  stale.manifest = { requirements: { paseo: "^0.9.0" } };
  assert.deepEqual(validatePaseoMetadata(stale).errors, ["manifest must declare the catalog range >=0.9.0 <0.10.0-beta.2."]);
  for (const [options, error] of [
    [{ range: ">=0.9.0" }, "catalog Paseo range must reject unverified 0.10.0-beta.2."],
    [{ range: ">=0.9.0 <0.11.0" }, "catalog Paseo range must reject unverified 0.10.0-beta.2."],
    [{ range: "^0.9.0" }, "catalog Paseo range must accept the verified beta."],
    [{ range: ">=0.10.0-beta.1 <0.10.0-beta.2" }, "catalog Paseo range must accept the stable SDK."],
    [{ range: ">=0.9.0 <0.10.0-0", beta: "0.9.1" }, "Paseo beta must be an exact prerelease newer than the stable SDK."],
    [{ range: ">=0.9.0 <0.10.0-0", beta: "0.9.0-beta.2" }, "Paseo beta must be an exact prerelease newer than the stable SDK."],
    [{ range: ">=0.9.0 <0.11.0-0", beta: null }, "catalog Paseo range must reject unverified 0.10.0-0."],
    [{ range: "not a range" }, "catalog Paseo range is invalid."],
  ]) {
    assert.deepEqual(validatePaseoMetadata(channels(options)).errors, [error], JSON.stringify(options));
  }
});

function promoted({ range = ">=0.9.0 <0.11.0-0", previous = "0.9.2" } = {}) {
  const data = metadata("0.10.0");
  data.catalog = { paseoVersion: "0.10.0", paseoRange: range, paseoPreviousVersion: previous };
  data.entry = { paseoVersion: "0.10.0" };
  data.manifest = { requirements: { paseo: range } };
  return data;
}

test("a promoted stable SDK keeps a verified previous stable line in range", () => {
  assert.deepEqual(validatePaseoMetadata(promoted()), { version: "0.10.0", errors: [] });
  const optedOut = promoted();
  optedOut.entry.paseoPreviousVersion = null;
  assert.deepEqual(validatePaseoMetadata(optedOut).errors, []);
  for (const [options, error] of [
    [{ range: ">=0.10.0 <0.11.0-0" }, "catalog Paseo range must accept the previous stable SDK."],
    [{ previous: "0.10.0-beta.1" }, "previous Paseo SDK must be an exact stable version older than the stable SDK."],
    [{ previous: "0.10.1" }, "previous Paseo SDK must be an exact stable version older than the stable SDK."],
    [{ previous: "^0.9.2" }, "previous Paseo SDK must be an exact stable version older than the stable SDK."],
    [{ range: ">=0.9.0 <0.12.0-0" }, "catalog Paseo range must reject unverified 0.11.0-0."],
  ]) {
    assert.deepEqual(validatePaseoMetadata(promoted(options)).errors, [error], JSON.stringify(options));
  }
});

test("a 0.9 entry without a catalog range keeps the ^0.9.0 default", () => {
  const data = metadata("0.9.2");
  data.manifest = { requirements: { paseo: "^0.9.0" } };
  assert.deepEqual(validatePaseoMetadata(data), { version: "0.9.2", errors: [] });
  data.manifest = { requirements: { paseo: "^0.8.0" } };
  assert.deepEqual(validatePaseoMetadata(data).errors, ["manifest must declare the catalog range ^0.9.0."]);
});

test("runtime entries support single-runtime plugins and reject half-migrations", () => {
  for (const files of [["index.client.tsx", "index.server.ts"], ["index.client.ts"], ["index.server.tsx"]]) {
    assert.deepEqual(validateRuntimeEntries(files), []);
  }
  for (const files of [[], ["index.ts"], ["index.client.tsx", "index.ts"], ["index.client.ts", "index.client.tsx"]]) {
    assert.ok(validateRuntimeEntries(files).length);
  }
});
