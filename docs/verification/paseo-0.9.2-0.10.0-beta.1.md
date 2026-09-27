# Paseo 0.9.2 stable and 0.10.0-beta.1 — collection v0.1.0-rc.4

Date: 2026-09-28. Tracking: [#123](https://github.com/NaruForge/Paseo-Plugin/issues/123); the 0.9 migration was [#121](https://github.com/NaruForge/Paseo-Plugin/issues/121). Targets: exact stable SDK **0.9.2** and verified beta **0.10.0-beta.1**, one source, collection **v0.1.0-rc.4 prerelease**. This record replaces the unreleased rc.4 target (0.9.0-beta.2); the [0.9.0-beta.2 record](paseo-0.9.0-beta.2.md) keeps its original scope.

## Problem

After updating the local daemon to 0.10.0-beta.1, `paseo plugin ls` reported Provider Usage as `failed`: `Plugin "provider-usage" requires Paseo ^0.9.0. Your daemon is 0.10.0-beta.1.` The other three plugins were disabled by the owner, and their manifests declared the same range. npm `latest` was 0.9.2 and `beta` was 0.10.0-beta.1, while the source still pinned 0.9.0-beta.2.

## Upstream comparison

Compared npm tarballs; no plugin source changes were required.

- **`@getpaseo/plugin`:** `dist/` is byte-identical in 0.9.0-beta.2, 0.9.2 and 0.10.0-beta.1. Only `package.json` versions and the exact client/protocol peer versions differ.
- **`@getpaseo/client`:** 0.9.0-beta.2 and 0.9.2 declarations are identical. 0.10.0-beta.1 adds daemon password/local-credential authentication (`DaemonAuthenticationError`, `localCredential`, `hello_rejection`). **`@getpaseo/protocol`** adds the matching optional `auth`, `protocolVersion` and `hello.rejected` schemas. No plugin uses these.
- **Host plugin runtime:** `@getpaseo/server` `dist/server/server/plugins/` (compiler, compiler imports, SDK specifiers, manifest, runtime) is identical in 0.9.2 and 0.10.0-beta.1. The private compiler entry remains `compiler.js` → `compilePlugin({ client, server })`.
- **Requirement check:** `@getpaseo/protocol` `dist/plugin-requirements.js` is identical in both versions and matches the check in the desktop app bundle. A daemon or app passes when either its full version or its stable core satisfies `requirements.paseo`, so `^0.9.0` rejects 0.10.0-beta.1 (core 0.10.0).
- **CLI scaffold:** `paseo plugin init` from CLI 0.9.2 and 0.10.0-beta.1 differ only in the exact SDK and the default range (`>=0.9.2`, `>=0.10.0-beta.1`). This collection deliberately uses a bounded range (below) instead of the open-ended scaffold default. Existing `tsconfig.json` differences in `types` predate this change and were not modified.

## Change

- `plugins.json`: `paseoVersion` 0.9.2, new `paseoRange` `>=0.9.0 <0.10.0-beta.2`, new `paseoBetaVersion` 0.10.0-beta.1. All four manifests declare the range; all SDKs, Branch Garden's client and the lockfile use exact 0.9.2.
- `scripts/release-paseo.mjs`: mirrors Paseo's requirement check, requires manifests to equal the catalog range, and requires the range to accept the stable SDK and verified beta but reject the next unverified version (`0.10.0-beta.2` here). `check-git-source-imports.mjs` and `check-release.mjs` apply the separate runtime rules to 0.8 and later instead of only 0.8/0.9. `check-plugin-compiler.mjs` accepts the catalog stable or beta server.
- `scripts/check-paseo-channel.mjs` (`npm run check:paseo-channel`): installs another exact SDK with `npm install --no-save` in every workspace, verifies the resolved versions, runs all type checks and workspace tests, and restores the locked SDKs outside CI.
- CI: `validate.yml` adds a verified-beta job on Windows, macOS and Linux; `release.yml` runs the same check; new daily `paseo-drift.yml` compares npm `latest` and `beta` with the catalog.

| Paseo daemon/app | Before (`^0.9.0`) | After (`>=0.9.0 <0.10.0-beta.2`) |
| --- | --- | --- |
| 0.9.0-beta.2, 0.9.2 | Accepted | Accepted |
| 0.10.0-beta.1 | Rejected | Accepted |
| 0.10.0-beta.2, 0.10.0 | Rejected | Rejected until verified |

## Local verification

Environment: Windows 11, PowerShell, Node.js 24.18.0, npm 11.14.1 (CI uses Node.js 22). Branch `feat/paseo-stable-beta-channels`.

- `npm run check` passed with the 0.9.2 SDK: documentation sync, Git-source imports (44 source files), release metadata, four workspace type checks and tests.
- `npm run check:paseo-channel -- beta` passed: all four workspaces resolved `@getpaseo/plugin` and `@getpaseo/client` 0.10.0-beta.1, type checks passed, and the locked 0.9.2 SDKs were restored without changing `package.json` or the lockfile.
- Tests on each SDK: Branch Garden 27, Command Deck 32, Prompt Palette 19, Provider Usage 39. Script tests: 14.
- `--dist-tag latest` (0.9.2) and `--dist-tag beta` (0.10.0-beta.1) were reported as verified catalog SDKs. A 0.9.1 server package was rejected by the compiler check.
- Staged compiler without `node_modules`, run with `@getpaseo/server` 0.9.2 and 0.10.0-beta.1. Both produced the same sizes, which also equal the 0.9.0-beta.2 record:

| Plugin | clientBytes | serverBytes |
| --- | --- | --- |
| branch-garden | 44806 | 29806 |
| provider-usage | 39430 | 6864 |
| prompt-palette | 32991 | 2234 |
| command-deck | 47298 | 15239 |

## Live directory reload

Local desktop-managed daemon **0.10.0-beta.1** with directory installations from this checkout. After the manifest change, `paseo plugin reload provider-usage` changed Provider Usage from `failed` to `running` with no error; its log shows `[paseo] Loading plugin` then `[paseo] Plugin ready`. Branch Garden, Prompt Palette and Command Deck remained disabled by the owner and were not enabled for this check, so their live 0.10.0-beta.1 activation is not recorded here. Their manifests, SDK types, tests and compiled bundles are the same as Provider Usage's evidence scope above.

## Not verified

- Live activation on a 0.9.2 daemon/app (no 0.9.2 daemon was available; 0.9.0-beta.2 live activation is in the earlier record, and the plugin API is byte-identical).
- UI interaction in the 0.10.0-beta.1 desktop app, mobile apps, and the app-side requirement check; UI impact grade A (no UI source changed).
- Git add/update/recovery on either version; the three-plugin Git evidence remains the [0.8 Git record](paseo-0.8-git-source.md).
- GitHub Actions results for the new jobs before this branch is pushed.

## Publication boundaries

rc.4 had not been tagged or published, so its target changes in place; `v0.1.0-rc.2` and `v0.1.0-rc.3` are not moved. The collection remains a prerelease; follow [Releasing](../RELEASING.md) and the [version channel rules](../RELEASING.md#paseo-version-channels).
