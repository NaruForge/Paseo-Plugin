# Paseo 0.10.0 stable — collection v0.1.0-rc.4

Date: 2026-09-28. Tracking: [#125](https://github.com/NaruForge/Paseo-Plugin/issues/125); interim beta support was [#123](https://github.com/NaruForge/Paseo-Plugin/issues/123). Targets: exact stable SDK **0.10.0** and previous stable SDK **0.9.2**, one source, collection **v0.1.0-rc.4 prerelease**. This record follows the [stable promotion procedure](../RELEASING.md#promote-a-paseo-stable-release). The [0.9.2 / 0.10.0-beta.1](paseo-0.9.2-0.10.0-beta.1.md) and [0.9.0-beta.2](paseo-0.9.0-beta.2.md) records keep their original scope.

## Problem

Paseo 0.10.0 was released on 2026-09-28, and npm `latest` and `beta` both pointed to 0.10.0. As designed, the interim range `>=0.9.0 <0.10.0-beta.2` rejected it: after the local desktop daemon updated to 0.10.0, Provider Usage reported `Plugin "provider-usage" requires Paseo >=0.9.0 <0.10.0-beta.2. Your daemon is 0.10.0.` The other three plugins were disabled by the owner and share the same manifest range.

## Upstream comparison

Compared npm tarballs, the [v0.10.0 release notes](https://github.com/getpaseo/paseo/releases/tag/v0.10.0), the installed desktop app and fresh CLI scaffolds. No plugin behavior changes were required.

- **`@getpaseo/plugin`, `@getpaseo/client`, `@getpaseo/protocol`:** the complete `dist/` is identical in 0.10.0-beta.1 and 0.10.0. Only package versions and exact peer versions differ. The plugin SDK `dist/` is also byte-identical to 0.9.2 and 0.9.0-beta.2.
- **Host plugin runtime:** `@getpaseo/server` `dist/server/server/plugins/` is identical in 0.10.0-beta.1 and 0.10.0 (and, per the earlier record, in 0.9.2). `@getpaseo/protocol` `dist/plugin-requirements.js` is unchanged.
- **Release notes:** plugin-relevant changes are limited to the reorganized app Settings. No plugin API change is listed.
- **App Settings:** in the 0.9.2 web UI the App group has a **Layout** page containing the sidebar card; in the 0.10.0 web UI and the installed 0.10.0 desktop app the same card ("Choose which items appear at the top of the sidebar and in what order") is on the new **Sidebar** page. The Host group still has **Plugins** and **Usage**, so Provider Usage's "Settings → Usage" text remains accurate.
- **CLI scaffold:** `paseo plugin init` from CLI 0.10.0-beta.1 and 0.10.0 differ only in the exact SDK and the open-ended default range (`>=0.10.0`). The collection keeps its bounded range.

## Change

- `plugins.json`: `paseoVersion` 0.10.0, `paseoRange` `>=0.9.0 <0.11.0-0`, new `paseoPreviousVersion` 0.9.2, `paseoBetaVersion` removed. All four manifests declare the range; all SDKs, Branch Garden's client and the lockfile use exact 0.10.0.
- `scripts/release-paseo.mjs`: validates `paseoPreviousVersion` as an exact stable SDK older than `paseoVersion` and accepted by the range. `check-paseo-channel.mjs` adds the `previous` channel and passes without installing anything when a channel is absent from the catalog. `check-plugin-compiler.mjs` accepts the previous stable server.
- CI: the verified-channel job runs `previous` and `beta` on Windows, macOS and Linux; `release.yml` runs both.
- Provider Usage: the sidebar ownership comment and test name refer to Paseo's Settings rather than the removed Layout page. Runtime behavior is unchanged.
- Documentation: supported versions, Settings → Sidebar (Layout on 0.9), channel fields and promotion steps.

| Paseo daemon/app | Interim `>=0.9.0 <0.10.0-beta.2` | Current `>=0.9.0 <0.11.0-0` |
| --- | --- | --- |
| 0.9.x, 0.10.0-beta.1 | Accepted | Accepted |
| 0.10.0, 0.10.x | Rejected | Accepted |
| 0.11.0 betas, 0.11.0 | Rejected | Rejected until verified |

## Local verification

Environment: Windows 11, PowerShell, Node.js 24.18.0, npm 11.14.1 (CI uses Node.js 22). Branch `feat/paseo-0.10.0`.

- `npm run check` passed with the 0.10.0 SDK: documentation sync, Git-source imports (44 source files), release metadata, four workspace type checks and tests.
- `npm run check:paseo-channel -- previous` passed with 0.9.2 in every workspace and restored the locked 0.10.0 SDKs without changing package files or the lockfile. `-- beta` reported that the catalog has no beta.
- Tests on each SDK: Branch Garden 27, Command Deck 32, Prompt Palette 19, Provider Usage 39. Script tests: 16.
- `--dist-tag latest` and `--dist-tag beta` (both 0.10.0) were reported as verified catalog SDKs.
- Staged compiler without `node_modules`, run with `@getpaseo/server` 0.10.0 and 0.9.2; a 0.10.0-beta.1 server is now rejected as outside the catalog. Sizes equal the earlier records:

| Plugin | clientBytes | serverBytes |
| --- | --- | --- |
| branch-garden | 44806 | 29806 |
| provider-usage | 39430 | 6864 |
| prompt-palette | 32991 | 2234 |
| command-deck | 47298 | 15239 |

## Live directory reload

Local desktop-managed daemon **0.10.0** with directory installations from this checkout. After the manifest change, `paseo plugin reload provider-usage` changed Provider Usage from `failed` to `running` with no error; its log shows `[paseo] Loading plugin` then `[paseo] Plugin ready`. Branch Garden, Prompt Palette and Command Deck remained disabled by the owner and were not enabled for this check.

## Not verified

- Live activation of the three disabled plugins, and on a 0.9.x daemon/app for this source (the plugin SDK and host plugin runtime are identical to those verified in earlier records).
- UI interaction in the 0.10.0 desktop app, mobile apps, and the app-side requirement check; UI impact grade A (no UI output changed).
- Git add/update/recovery; the three-plugin Git evidence remains the [0.8 Git record](paseo-0.8-git-source.md).

## Publication boundaries

rc.4 had not been tagged or published, so its target changes in place; `v0.1.0-rc.2` and `v0.1.0-rc.3` are not moved. The collection remains a prerelease; follow [Releasing](../RELEASING.md).
