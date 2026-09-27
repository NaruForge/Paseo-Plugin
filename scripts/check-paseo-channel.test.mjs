import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyVersion, parseTarget } from "./check-paseo-channel.mjs";

const catalog = {
  paseoVersion: "0.9.2", paseoRange: ">=0.9.0 <0.10.0-beta.2", paseoBetaVersion: "0.10.0-beta.1",
  plugins: [{ id: "branch-garden", paseoVersion: "0.9.2" }, { id: "command-deck", paseoVersion: "0.9.2" }],
};

test("parses the verified beta, a dist-tag or an exact version only", () => {
  assert.deepEqual(parseTarget(["beta"]), { version: "beta" });
  assert.deepEqual(parseTarget(["--dist-tag", "latest"]), { distTag: "latest" });
  assert.deepEqual(parseTarget(["0.10.0-beta.2"]), { version: "0.10.0-beta.2" });
  for (const args of [[], ["^0.10.0"], ["v0.10.0"], ["--dist-tag"], ["--dist-tag", "Latest"], ["beta", "extra"]]) {
    assert.throws(() => parseTarget(args), /Usage/, JSON.stringify(args));
  }
});

test("classifies verified, patch and out-of-range Paseo versions", () => {
  assert.deepEqual(classifyVersion(catalog, "0.10.0-beta.1"), { verified: true, rejectedBy: [] });
  assert.deepEqual(classifyVersion(catalog, "0.9.2"), { verified: true, rejectedBy: [] });
  assert.deepEqual(classifyVersion(catalog, "0.9.3"), { verified: false, rejectedBy: [] });
  const outside = ["branch-garden (>=0.9.0 <0.10.0-beta.2)", "command-deck (>=0.9.0 <0.10.0-beta.2)"];
  assert.deepEqual(classifyVersion(catalog, "0.10.0-beta.2"), { verified: false, rejectedBy: outside });
  assert.deepEqual(classifyVersion(catalog, "0.10.0"), { verified: false, rejectedBy: outside });
});

test("a plugin entry override is classified separately", () => {
  const mixed = structuredClone(catalog);
  mixed.plugins[1].paseoRange = "^0.9.0";
  mixed.plugins[1].paseoBetaVersion = null;
  assert.deepEqual(classifyVersion(mixed, "0.10.0-beta.1"), { verified: false, rejectedBy: ["command-deck (^0.9.0)"] });
});
