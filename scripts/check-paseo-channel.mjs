// Type-checks and tests every workspace against another exact Paseo SDK without editing package files or the lockfile.
// Usage: npm run check:paseo-channel -- beta | --dist-tag <latest|beta> | <exact-version>
import { access, readdir, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import semver from "semver";
import { paseoAccepts, paseoChannels } from "./release-paseo.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const sdkPackages = ["@getpaseo/plugin", "@getpaseo/client"];

export function parseTarget(args) {
  if (args[0] === "--dist-tag" && /^[a-z][a-z0-9-]*$/.test(args[1] ?? "") && args.length === 2) return { distTag: args[1] };
  if (args.length === 1 && (args[0] === "beta" || semver.valid(args[0]) === args[0])) return { version: args[0] };
  throw new Error("Usage: npm run check:paseo-channel -- beta | --dist-tag <tag> | <exact-version>");
}

// Compares a Paseo version with each plugin's verified SDKs and manifest range.
export function classifyVersion(catalog, target) {
  const plugins = catalog.plugins.map((entry) => {
    const { version, range, beta } = paseoChannels(catalog, entry);
    return { id: entry.id, range, verified: [version, beta].includes(target), accepted: Boolean(range) && paseoAccepts(target, range) };
  });
  return {
    verified: plugins.every((plugin) => plugin.verified),
    rejectedBy: plugins.filter((plugin) => !plugin.accepted).map((plugin) => `${plugin.id} (${plugin.range})`),
  };
}

const annotate = (level, message) => console.log(process.env.GITHUB_ACTIONS ? `::${level}::${message}` : `${level}: ${message}`);

function npm(args, options = {}) {
  const npmCli = process.env.npm_execpath;
  if (!npmCli) throw new Error("Run through npm run check:paseo-channel.");
  const result = spawnSync(process.execPath, [npmCli, ...args], { cwd: root, stdio: options.capture ? "pipe" : "inherit", encoding: "utf8", windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`npm ${args.join(" ")} failed${options.capture ? `: ${result.stderr.trim()}` : ""}`);
  return result.stdout;
}

async function installedVersion(workspace, name) {
  for (const base of [path.join(root, "plugins", workspace), root]) {
    const manifest = path.join(base, "node_modules", ...name.split("/"), "package.json");
    try {
      await access(manifest);
      return JSON.parse(await readFile(manifest, "utf8")).version;
    } catch {}
  }
  return null;
}

async function main() {
  const target = parseTarget(process.argv.slice(2));
  const catalog = JSON.parse(await readFile(path.join(root, "plugins.json"), "utf8"));
  const version = target.distTag
    ? npm(["view", `@getpaseo/plugin@${target.distTag}`, "version"], { capture: true }).trim()
    : target.version === "beta" ? catalog.paseoBetaVersion : target.version;
  if (!semver.valid(version)) throw new Error(`No exact Paseo version for ${JSON.stringify(target)}.`);
  const label = target.distTag ? `@getpaseo/plugin@${target.distTag} (${version})` : `Paseo ${version}`;
  const { verified, rejectedBy } = classifyVersion(catalog, version);
  if (target.distTag && verified) {
    console.log(`${label} is already a verified catalog SDK; nothing to check.`);
    return;
  }

  const workspaces = [];
  for (const entry of await readdir(path.join(root, "plugins"), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const pkg = JSON.parse(await readFile(path.join(root, "plugins", entry.name, "package.json"), "utf8"));
    if (pkg.devDependencies?.["@getpaseo/plugin"]) workspaces.push({ name: pkg.name, directory: entry.name });
  }
  const restore = !process.env.CI;
  let failure = null;
  try {
    // One install: a later --no-save install would reset workspaces changed by an earlier one.
    // The client is a peer of the plugin SDK, so every workspace resolves both at the target version.
    npm(["install", "--no-save", "--no-audit", "--no-fund", ...workspaces.flatMap((workspace) => ["--workspace", workspace.name]),
      ...sdkPackages.map((name) => `${name}@${version}`)]);
    for (const workspace of workspaces) {
      for (const name of sdkPackages) {
        const installed = await installedVersion(workspace.directory, name);
        if (installed !== version) throw new Error(`${workspace.name} resolves ${name}@${installed ?? "missing"}, expected ${version}.`);
      }
    }
    npm(["run", "typecheck"]);
    npm(["run", "test:workspaces"]);
  } catch (error) {
    failure = error;
  } finally {
    if (restore) {
      console.log("Restoring the locked SDKs with npm install.");
      npm(["install", "--no-audit", "--no-fund"]);
    }
  }
  if (failure) {
    annotate("error", `${label}: ${failure.message}`);
    process.exitCode = 1;
  } else if (rejectedBy.length) {
    annotate("error", `${label} passes type checks and tests but is outside the manifest range of ${rejectedBy.join(", ")}. Verify it at runtime, then update paseoRange/paseoBetaVersion (docs/RELEASING.md).`);
    process.exitCode = 1;
  } else if (!verified) {
    annotate("notice", `${label} passes type checks and tests and is inside the manifest range, but it is not a verified catalog SDK.`);
  } else {
    console.log(`${label} passes type checks and tests; manifests accept it.`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
