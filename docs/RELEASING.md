# Releasing the collection

All four current plugins use one collection version and one Git tag (`v<version>`). Runtime IDs remain unchanged. Keep versions in root/workspace packages, the lockfile, `plugins.json` and the changelog in sync. A catalog is descriptive metadata, not a Paseo registry submission.

## Prepare

1. Set the next version and write user-facing notes, including migration steps and supported Paseo versions. Use `-rc.N` for a candidate.
2. Run `npm ci`, `npm run check`, `npm run check:paseo-channel -- previous` and `npm run check:paseo-channel -- beta` (a channel missing from the catalog passes immediately). Review all supported OS CI jobs, including the verified-channel jobs. Do not infer runtime compatibility from type/tests.
3. Record the source commit, runtime/OS/client versions, exercised actions, UI impact grades and limitations under `docs/verification/`.
4. Have an independent reviewer evaluate the diff and evidence. Resolve release-blocking findings before creating a stable release.

## Validate runtime safely

For **Paseo 0.10.x and 0.9.x**, apply the [0.9 migration checklist](MIGRATION_0.9.md) and the [version channel rules](#paseo-version-channels). All four plugins use exact 0.10.0 SDKs, CI repeats type checks and tests with 0.9.2, and the three pills keep `button` descriptors with `update/remove` handles plus an owned Agent directory observation. Review the [0.10.0 evidence](verification/paseo-0.10.0.md); 0.8 runtime reports and the [0.9.0-beta.2](verification/paseo-0.9.0-beta.2.md) and [0.9.2 / 0.10.0-beta.1](verification/paseo-0.9.2-0.10.0-beta.1.md) records do not certify 0.10.0. Keep v0.1.0-rc.2 for 0.7.2 and v0.1.0-rc.3 for 0.8.0; never move an existing tag.

Require separate runtime entries, runtime import boundaries, manifests equal to the catalog `paseoRange` (`>=0.9.0 <0.11.0-0`), and matching exact 0.10.0 SDK/client/catalog/lockfile values. Validate daemon and app independently, on the stable line and on each verified catalog channel. For remote operations use `paseo --host <target> plugin ls`. A source/compiler check does not establish native app support. A prerelease may publish with documented runtime limitations; a stable release still requires the independent review and runtime evidence above.

Use an authorized test daemon with plugins already enabled. Check `paseo plugin ls`; use unique runtime IDs. A Git branch candidate can be tested before a tag exists:

```sh
paseo plugin add NaruForge/Paseo-Plugin:plugins/branch-garden --ref <candidate-branch> --id branch-garden-release-check
paseo plugin ls
paseo plugin status branch-garden-release-check
paseo plugin logs branch-garden-release-check
```

Repeat for each plugin, exercise its RPC/UI, and verify install without `node_modules` in the managed plugin directory. Test successful updates and failed-candidate rollback in a controlled test repository or branch; never inject a failure into the release branch. Directory reload has different failure semantics and does not prove Git rollback behavior.

Clean up only your temporary IDs with `paseo plugin remove <id>` and confirm existing installations remain running.

## Paseo version channels

One source serves the stable Paseo line, the previous stable line and the verified beta while they share a plugin API. The catalog fields, acceptance table and checks are in [Compatibility](COMPATIBILITY.md#paseo-version-channels). The range always ends just after the newest verified version, so an unverified Paseo release is rejected at load time instead of failing inside a plugin. The daily [Paseo release drift](../.github/workflows/paseo-drift.yml) workflow is the trigger for the steps below; a user report such as `requires Paseo … Your daemon is …` is another.

### Adopt a new Paseo beta

1. Read the Paseo release notes. Compare the new `@getpaseo/plugin`, `@getpaseo/client` and `@getpaseo/protocol` declarations, the host plugin runtime (`@getpaseo/server` `dist/server/server/plugins/`) and `@getpaseo/protocol` `dist/plugin-requirements.js` with the verified beta.
2. Set `paseoBetaVersion` to the new exact prerelease. Raise the `paseoRange` upper bound to its next prerelease (for example `>=0.9.0 <0.11.0-beta.2` for 0.11.0-beta.1) in `plugins.json` and all four manifests. Keep the stable SDK unchanged.
3. Compare a fresh `paseo plugin init` scaffold from that CLI and align the scaffold-owned devDependencies (`react`, `react-native`, `@types/react`, `@tanstack/react-query`, `zod`, `typescript`). Run `npm run check`, `npm run check:paseo-channel -- beta`, and `node scripts/check-plugin-compiler.mjs plugins/<id> <@getpaseo/server-directory>` for each plugin with that beta's server package.
4. On a daemon and app running the beta, reload the directory installations and confirm `running` with no load errors in `paseo plugin ls` and `paseo plugin logs`. Exercise the changed contracts. Add a new record under `docs/verification/`; keep earlier records unchanged.
5. Update the documents that name supported versions (root and plugin READMEs, Compatibility, Changelog) and release a new collection version. Users pinned to an older tag keep its range until they change `--ref`; users tracking main receive it with `paseo plugin update`.

### Promote a Paseo stable release

1. Repeat the beta comparison and runtime checks for the stable version.
2. Set `paseoVersion` and every workspace `@getpaseo/plugin` (and Branch Garden's `@getpaseo/client`) to that exact version, align the scaffold-owned devDependencies and the `@types/node` major with the new scaffold and Paseo's embedded Node.js, then run `npm install` so the lockfile matches.
3. Remove `paseoBetaVersion` until the next beta is verified. The range must then reject the next minor prerelease, for example `<0.11.0-0` for 0.10.0.
4. If the previous stable line still passes on the same source, keep its lower bound and set `paseoPreviousVersion` to its newest exact stable SDK (for example `>=0.9.0 <0.11.0-0` with 0.9.2); CI then runs `npm run check:paseo-channel -- previous`. Otherwise raise the lower bound to the new line, remove `paseoPreviousVersion`, and tell previous-line users which tag to keep in the Changelog.
5. Replace the old stable-line Settings paths and version names in user documents, add a verification record, and reload the directory installations on the new stable daemon.

### When stable and beta diverge

If a beta needs source that cannot also type-check, test and run on the stable SDK, do not widen the range and do not add runtime version switches. Create a `next` branch whose catalog uses the beta as `paseoVersion` and a range ending at its next prerelease (for example `>=0.11.0-beta.3 <0.11.0-beta.4`); `npm run check:release` enforces the same rules there. Main keeps the stable range. Beta users install with `--ref next` and `paseo plugin update`; stable users stay on tags. Cherry-pick fixes to both branches, publish beta-only releases as `-rc.N` prereleases from `next`, and merge `next` into main when that Paseo line becomes stable.

## Draft and publish

The **Draft release** workflow takes an existing source ref and a tag matching the package version. It checks the source on Windows, macOS and Linux, including the verified beta SDK, creates a draft GitHub prerelease, and leaves publication to a maintainer. Use a full commit SHA for the ref. It does not claim UI/runtime verification; review the evidence first. Never move an existing release tag to a different commit.

The workflow deliberately creates a **draft**. Publish only after reviewing the release notes, complete OS CI, runtime/UI evidence and remaining limitations. Stable releases should remove the prerelease suffix in a separately validated change. No npm publication is required because Paseo installs plugin source directly.

## Rollback

`paseo plugin update` follows branches; tags and commits stay pinned. Retain the prior tag or full commit SHA. **Before any remove/re-add rollback of current source, record Provider Usage display preferences and copy Prompt Palette prompts and Command Deck commands outside the installation. Removal deletes those built-in settings and Command Deck's installation identifier; reinstalling starts from defaults. Prompt Palette and Command Deck have no import/export feature. Command Deck terminals are not killed and are not adopted after reinstall.** Branch Garden has no saved plugin settings.

To change a pinned installation, record its actual ID/source with `plugin ls`, remove only that installation, then add the reviewed source again under the same ID and explicit prior `--ref`. This briefly removes its contributions. Restore preferences and prompts manually. Original repositories, provider credentials and unrelated external configuration files remain intact.

Failed Git update candidates retain the previous running version, but directory reload failures do not. See [Git installation](GIT_INSTALLATION.md).

Only the historical two-plugin `v0.1.0-rc.2` release has no built-in 0.8 settings. This exception does not apply to current Provider Usage, Prompt Palette or Command Deck. A rejected Git update, without removal, keeps the installed revision and its settings.

## Upstream listing

After public release, use the prepared [community listing proposal](COMMUNITY_SUBMISSION.md) to ask the Paseo maintainers whether they want to list the project. Listing does not imply endorsement, repository transfer or official maintenance. Do not submit on behalf of maintainers or use official branding without their agreement.
