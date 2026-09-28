# Changelog

The collection uses one version/tag for all supported plugins. Published releases are listed on [GitHub](https://github.com/NaruForge/Paseo-Plugin/releases).

## 0.1.0-rc.4 — 2026-09-28 (prerelease)

This collection supports **Paseo 0.10.x stable** and the previous **0.9.x** line from one source, and includes all four plugins. Manifests declare `requirements.paseo: >=0.9.0 <0.11.0-0`; Paseo 0.11 betas and releases are rejected at load time until a later release verifies them. Upgrade the daemon, app and CLI from 0.8 before installing: `^0.8.0` manifests are rejected on 0.9. Paseo 0.8.0 users keep `v0.1.0-rc.3`. Paseo 0.7.2 users keep `v0.1.0-rc.2`.

- Pin all Plugin SDKs, Branch Garden's client SDK and the release catalog to exact stable 0.10.0. The plugin SDK declarations are byte-identical to 0.9.0-beta.2, 0.9.2 and 0.10.0-beta.1, and the 0.9.2 and 0.10.0 host plugin runtimes are identical. Compile all four plugins without `node_modules` using both the 0.10.0 and 0.9.2 host compilers.
- Replace `^0.9.0`, which rejects Paseo 0.10, with a bounded range. Add `paseoRange`, `paseoPreviousVersion` and `paseoBetaVersion` to `plugins.json`. Release checks mirror Paseo's requirement check and require the range to accept the stable, previous stable and verified beta SDKs but reject the next unverified version.
- Add `npm run check:paseo-channel` to type-check and test every workspace with another exact SDK without changing package files. CI runs it for the previous stable (0.9.2) and verified beta channels on Windows, macOS and Linux, and a daily drift workflow reports new npm `latest`/`beta` releases that fall outside the range or break checks. Interim support for 0.10.0-beta.1 (#123) was replaced by the 0.10.0 promotion (#125).
- Own the Agent directory observation for Provider Usage, Prompt Palette and Command Deck with a single `list({ subscribe: {} })`, then `release` it on cleanup. Keep local `agents.subscribe` listeners and the 30-second Prompt Palette/Command Deck refresh.
- Update Vitest to 5 for all workspace tests. Keep Paseo-provided runtime modules (`react`, `react-native`, `@tanstack/react-query`, `zod`) and `@types/react`/`typescript` at the Paseo 0.10.0 scaffold versions, and `@types/node` at Paseo's embedded Node.js 24; Dependabot no longer proposes updates outside those versions.
- Advertise Command Deck's panel in both workspace and Explorer locations. Add optional `description` fields to each `paseo-plugin.json`.
- Point Provider Usage sidebar guidance to Paseo 0.10's **Settings → Sidebar** (**Settings → Layout** on 0.9). Document the stable/previous/beta channel policy, new-beta adoption, stable promotion and the `next` branch fallback. Update English/Korean installation, compatibility, capabilities and release documentation. Keep historical screenshots and verification reports at their original versions.

The collection remains a **prerelease**. SDK/compiler and source tests plus one live 0.10.0 reload do not certify app/mobile behavior or Git activation/update. See the [0.10.0 verification record](docs/verification/paseo-0.10.0.md).

Install one plugin with `paseo plugin add NaruForge/Paseo-Plugin:plugins/<plugin-id> --ref v0.1.0-rc.4`. Tags stay pinned; when a newer Paseo beta or release is supported by a later collection release, change the ref or track main with `paseo plugin update`. Before remove/re-add when changing a pinned ref, copy Provider Usage preferences, Prompt Palette prompts and Command Deck commands: removing an installation deletes its Settings and Command Deck's installation identity. See [upgrade/rollback guidance](docs/GIT_INSTALLATION.md).

## 0.1.0-rc.3 — 2026-09-10 (prerelease)

This collection targets **final Paseo 0.8.0** and includes all four plugins. Upgrade the daemon, app and CLI before installing: beta.1 does not have the final Composer pill API. Paseo 0.7.2 users must keep `v0.1.0-rc.2`.

- Pin all Plugin SDKs, Branch Garden's client SDK and release catalog to exact 0.8.0; verify the final CLI scaffold and compile all four plugins without node_modules using the exact host compiler.
- Migrate Provider Usage, Prompt Palette and Command Deck pills to `button` descriptors and `update/remove` handles. Preserve dynamic usage/reset labels, accessible titles, explicit actions and cleanup. If all usage fields are off, show `Usage` because final buttons reject empty labels; update Prompt Palette's label and disabled state while sending.
- Include the separate client/server runtime migration for Branch Garden and Provider Usage. Preserve Branch Garden's read-only Git scan and runtime IDs.
- Replace Provider Usage credential/vendor HTTP access with Paseo's official usage APIs for enabled connections. Add host-scoped display preferences, date-time/countdown resets and on-demand shared queries without periodic usage polling. Sidebar visibility belongs to Paseo Layout.
- Add experimental Prompt Palette: host-scoped prompt editing/ordering, full-body preview, revision conflict handling and explicit Agent sends without automatic retries.
- Add experimental Windows-only Command Deck: Project command Settings, Composer/panel entry, official Terminal SDK execution, bounded output, explicit interruption/termination and reconnect discovery. PowerShell 7 is required.
- Update English/Korean installation, compatibility, capabilities and release documentation. Keep historical screenshots and verification reports at their original versions.

The collection remains a **prerelease**. Final SDK/compiler and simulated-host UI checks do not certify live final-version app/mobile behavior or Git activation/update. See the [0.8.0 verification record](docs/verification/paseo-0.8.0-release.md). Prior [beta Git evidence](docs/verification/paseo-0.8-git-source.md) covers three plugins, not Command Deck.

Install one plugin with `paseo plugin add NaruForge/Paseo-Plugin:plugins/<plugin-id> --ref v0.1.0-rc.3`. Tags stay pinned. Before remove/re-add when changing a pinned ref, copy Provider Usage preferences, Prompt Palette prompts and Command Deck commands: removing an installation deletes its Settings and Command Deck's installation identity. See [upgrade/rollback guidance](docs/GIT_INSTALLATION.md).

## 0.1.0-rc.2 — 2026-09-08 (prerelease)

- Convert Branch Garden's interface, accessibility labels, generated warnings/errors and scan-time display to English. Preserve user-provided names and read-only Git behavior. Explicit web accessibility states expose filter selection and repository expansion.
- Add actual Branch Garden screenshots and a user-supplied Provider Usage composer-pill image to the plugin guides.
- Focus maintenance on Branch Garden and Provider Usage. This is repository-maintainer support, not Paseo-team endorsement. Provider Usage's external integration remains experimental.
- Remove GitHub Project Board, Tailscale Dashboard, Composer Compact, Composer Skills and File Browser, including their sources, tests, guides, screenshots, catalog entries and workspace dependencies.
- Update English/Korean documentation, Issue Forms and validation to cover the two remaining plugins. Removing the retired plugins did not change the retained plugins' runtime code; the subsequent Branch Garden language update is listed above.
- Withdraw the unpublished seven-plugin release draft. Existing installs need explicit removal; see [removal and migration](docs/REMOVED_PLUGINS.md).

Published as [v0.1.0-rc.2](https://github.com/NaruForge/Paseo-Plugin/releases/tag/v0.1.0-rc.2) from commit `e2f5bc744920284bf575ed44c9287fa2ad2b737d`. See [compatibility](docs/COMPATIBILITY.md), [removal verification](docs/verification/0.1.0-rc.2.md) and [English UI verification](docs/verification/branch-garden-english.md).

## 0.1.0-rc.1 — withdrawn before publication

The first seven-plugin candidate introduced MIT licensing, public user/contributor documentation, release checks and security improvements. Its draft was withdrawn when the project scope narrowed. Historical source and verification remain in [Git history](https://github.com/NaruForge/Paseo-Plugin/tree/5919ab16fad941d46f2a294e981154f76297cc49).
