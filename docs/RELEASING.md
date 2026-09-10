# Releasing the collection

All four current plugins use one collection version and one Git tag (`v<version>`). Runtime IDs remain unchanged. Keep versions in root/workspace packages, the lockfile, `plugins.json` and the changelog in sync. A catalog is descriptive metadata, not a Paseo registry submission.

## Prepare

1. Set the next version and write user-facing notes, including migration steps and supported Paseo versions. Use `-rc.N` for a candidate.
2. Run `npm ci` and `npm run check`. Review all supported OS CI jobs. Do not infer runtime compatibility from type/tests.
3. Record the source commit, runtime/OS/client versions, exercised actions, UI impact grades and limitations under `docs/verification/`.
4. Have an independent reviewer evaluate the diff and evidence. Resolve release-blocking findings before creating a stable release.

## Validate runtime safely

For **Paseo 0.8.0-beta.1**, apply the [migration checklist](MIGRATION_0.8.md) first. All four plugin sources target beta.1. The user runtime report and its limits for Branch Garden, Provider Usage and Prompt Palette are recorded in [verification](verification/paseo-0.8-runtime.md). Git add/update/recovery for those three plugins is recorded in the [Git source verification](verification/paseo-0.8-git-source.md); Command Deck Git activation remains unverified. The existing `v0.1.0-rc.2` release remains on 0.7.2. Source checks are not a new release or runtime certification. Keep the previous tag and use an explicit candidate ref. Do not overwrite 0.7 release notes or runtime evidence with beta claims.

Require separate client/server entries, runtime directories, `requirements.paseo`, exact target SDK/client dependencies and matching catalog/lockfile metadata. A plugin entry’s `paseoVersion` overrides the root `plugins.json.paseoVersion` default; release checks enforce the effective exact SDK and client dependency for every workspace. Update import checks and test stubs with the source migration. Recommended manifest range: `^0.8.0`; development SDK: exact `0.8.0-beta.1`.

Validate daemon and app versions independently, including host compiler boundaries, contribution removers and Provider Usage's pill registration/cleanup. For 0.8 remote operations use global `--host`, for example `paseo --host <target> plugin ls`. Recheck declarations if advancing beyond beta.1. Static docs/type checks do not establish beta runtime support.

Use an authorized test daemon with plugins already enabled. Check `paseo plugin ls`; use unique runtime IDs. A Git branch candidate can be tested before a tag exists:

```sh
paseo plugin add NaruForge/Paseo-Plugin:plugins/branch-garden --ref <candidate-branch> --id branch-garden-release-check
paseo plugin ls
paseo plugin status branch-garden-release-check
paseo plugin logs branch-garden-release-check
```

Repeat for each plugin, exercise its RPC/UI, and verify install without `node_modules` in the managed plugin directory. Test successful updates and failed-candidate rollback in a controlled test repository or branch; never inject a failure into the release branch. Directory reload has different failure semantics and does not prove Git rollback behavior.

Clean up only your temporary IDs with `paseo plugin remove <id>` and confirm existing installations remain running.

## Draft and publish

The **Draft release** workflow takes an existing source ref and a tag matching the package version. It checks the source on Windows, macOS and Linux, creates a draft GitHub prerelease, and leaves publication to a maintainer. Use a full commit SHA for the ref. It does not claim UI/runtime verification; review the evidence first. Never move an existing release tag to a different commit.

The workflow deliberately creates a **draft**. Publish only after reviewing the release notes, complete OS CI, runtime/UI evidence and remaining limitations. Stable releases should remove the prerelease suffix in a separately validated change. No npm publication is required because Paseo installs plugin source directly.

## Rollback

`paseo plugin update` follows branches; tags and commits stay pinned. Retain the prior tag or full commit SHA. **Before any remove/re-add rollback of current 0.8 source, record Provider Usage display preferences and copy Prompt Palette prompts and Command Deck commands outside the installation. Removal deletes those built-in settings and Command Deck's installation identifier; reinstalling starts from defaults. Prompt Palette and Command Deck have no import/export feature. Command Deck terminals are not killed and are not adopted after reinstall.** Branch Garden has no saved plugin settings.

To change a pinned installation, record its actual ID/source with `plugin ls`, remove only that installation, then add the reviewed source again under the same ID and explicit prior `--ref`. This briefly removes its contributions. Restore preferences and prompts manually. Original repositories, provider credentials and unrelated external configuration files remain intact.

Failed Git update candidates retain the previous running version, but directory reload failures do not. See [Git installation](GIT_INSTALLATION.md).

Only the historical two-plugin `v0.1.0-rc.2` release has no built-in 0.8 settings. This exception does not apply to current Provider Usage, Prompt Palette or Command Deck. A rejected Git update, without removal, keeps the installed revision and its settings.

## Upstream listing

After public release, use the prepared [community listing proposal](COMMUNITY_SUBMISSION.md) to ask the Paseo maintainers whether they want to list the project. Listing does not imply endorsement, repository transfer or official maintenance. Do not submit on behalf of maintainers or use official branding without their agreement.
