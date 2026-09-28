import semver from "semver";

const exactVersion = /^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/;

// Mirrors assertPluginCompatibility in @getpaseo/protocol (dist/plugin-requirements.js, 0.8.0-beta.1 or later):
// a daemon or app passes when either its full version or its stable core satisfies requirements.paseo.
export function paseoAccepts(version, range) {
  const parsed = semver.parse(version);
  if (!parsed || semver.validRange(range) === null) return false;
  return semver.satisfies(parsed, range) || semver.satisfies(`${parsed.major}.${parsed.minor}.${parsed.patch}`, range);
}

export function separatesRuntimes(version) {
  const parsed = semver.parse(version ?? "");
  return Boolean(parsed && (parsed.major > 0 || parsed.minor >= 8));
}

// The first version newer than the highest verified one that the range must still reject.
// Patch releases of a verified stable line are accepted; a newer minor or prerelease is not.
export function nextUnverifiedVersion(version) {
  const parsed = semver.parse(version);
  if (parsed.prerelease.length) return semver.inc(parsed, "prerelease");
  return parsed.major === 0 ? `0.${parsed.minor + 1}.0-0` : `${parsed.major + 1}.0.0-0`;
}

// Catalog fields: paseoVersion is the exact stable SDK, paseoRange the manifest requirement,
// paseoBetaVersion an optional exact prerelease and paseoPreviousVersion an optional exact older stable SDK,
// both verified against the same source. A plugin entry that sets a field overrides the collection default;
// null opts out of an optional channel.
export function paseoChannels(catalog, entry) {
  const pick = (key) => (entry && Object.hasOwn(entry, key) ? entry[key] : catalog[key]) ?? undefined;
  return {
    version: pick("paseoVersion"), range: pick("paseoRange"),
    beta: pick("paseoBetaVersion"), previous: pick("paseoPreviousVersion"),
  };
}

export function validatePaseoMetadata({ catalog, entry, pkg, manifest, locked }) {
  const { version, range: declaredRange, beta, previous } = paseoChannels(catalog, entry);
  const errors = [];
  if (!exactVersion.test(version ?? "") || !semver.valid(version) || pkg.devDependencies?.["@getpaseo/plugin"] !== version) {
    errors.push("exact Paseo dependency must match catalog.");
  }
  for (const name of ["@getpaseo/plugin", "@getpaseo/client"]) {
    const dependency = pkg.devDependencies?.[name];
    if (dependency && (dependency !== version || locked?.devDependencies?.[name] !== dependency)) {
      errors.push(`${name} SDK/lockfile mismatch.`);
    }
  }
  const parsed = semver.parse(version ?? "");
  if (!parsed) return { version, errors };
  if (parsed.major === 0 && parsed.minor === 8 && manifest.requirements?.paseo !== "^0.8.0") {
    errors.push("migrated manifest must declare ^0.8.0.");
  }
  if (parsed.major > 0 || parsed.minor >= 9) {
    const range = declaredRange ?? `^${parsed.major}.${parsed.minor}.0`;
    if (manifest.requirements?.paseo !== range) errors.push(`manifest must declare the catalog range ${range}.`);
    if (semver.validRange(range) === null) errors.push("catalog Paseo range is invalid.");
    else {
      if (!paseoAccepts(version, range)) errors.push("catalog Paseo range must accept the stable SDK.");
      if (beta !== undefined) {
        if (!exactVersion.test(beta) || !semver.prerelease(beta) || !semver.gt(beta, version)) {
          errors.push("Paseo beta must be an exact prerelease newer than the stable SDK.");
        } else if (!paseoAccepts(beta, range)) errors.push("catalog Paseo range must accept the verified beta.");
      }
      if (previous !== undefined) {
        if (!exactVersion.test(previous) || semver.prerelease(previous) || !semver.lt(previous, version)) {
          errors.push("previous Paseo SDK must be an exact stable version older than the stable SDK.");
        } else if (!paseoAccepts(previous, range)) errors.push("catalog Paseo range must accept the previous stable SDK.");
      }
      const highest = beta && semver.valid(beta) && semver.gt(beta, version) ? beta : version;
      const next = nextUnverifiedVersion(highest);
      if (paseoAccepts(next, range)) errors.push(`catalog Paseo range must reject unverified ${next}.`);
    }
  }
  return { version, errors };
}

export function validateRuntimeEntries(files) {
  const errors = [];
  const counts = ["client", "server"].map((runtime) =>
    files.filter((file) => new RegExp(`^index\\.${runtime}\\.tsx?$`).test(file)).length);
  if (counts.every((count) => count === 0)) errors.push("at least one runtime entry is required.");
  if (counts.some((count) => count > 1)) errors.push("use only one entry per runtime.");
  if (files.some((file) => /^index\.tsx?$/.test(file))) errors.push("remove the legacy mixed entry.");
  return errors;
}
