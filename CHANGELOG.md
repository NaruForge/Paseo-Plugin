# Changelog

The collection uses one version/tag for all supported plugins. Published releases are listed on [GitHub](https://github.com/NaruForge/Paseo-Plugin/releases).

## Unreleased

- Add experimental Windows-only Command Deck for Paseo 0.8.0-beta.1: Project command Settings, Composer/panel entry, official terminal execution, bounded output, explicit interruption/termination and reconnect discovery. Source/UI and Windows SDK evidence are [recorded separately](docs/verification/command-deck-0.8-source.md); installed app/mobile validation remains pending.

- Remove Provider Usage's two-minute usage polling. Keep shared reads from Paseo's official usage service on demand, including initial display, manual refresh and Provider catalog changes; countdown display and settings synchronization are unchanged.

- Add experimental Prompt Palette for Paseo 0.8.0-beta.1: host-scoped prompt editing and ordering, Composer picker with full preview, revision conflict protection and explicit Agent sends without automatic retries. Not included in the existing release tag.

- Add an exclusive Date and time / Time remaining preference for Provider Usage resets, with automatic countdown updates and compact pill values without Reset/Resets. Migrate display settings v1/v2 to v3 while preserving existing choices.
- Delegate Provider Usage sidebar visibility to Paseo Settings → Layout. Always register the sidebar item, remove the duplicate plugin switch, and migrate v1 display settings to v2 while preserving all four remaining preferences.

- Migrate Branch Garden source to Paseo 0.8.0-beta.1 runtime entries and SDK imports, preserving the existing UI and read-only Git scan.
- Check per-plugin SDK catalog versions and 0.8 runtime/type import boundaries; add an exact beta compiler check using a source copy without node_modules.
- Migrate Provider Usage to the official Paseo usage SDK and all enabled Provider connections; remove direct credential and vendor HTTP access.
- Add host-scoped Provider Usage Settings: Composer pill on, remaining percentage and provider name on, reset time off by default.
- The existing v0.1.0-rc.2 tag remains on 0.7.2. The user reported runtime verification of all three plugins on Paseo 0.8; see the [reported environment and scope](docs/verification/paseo-0.8-runtime.md). Git installation/update/recovery is tracked separately in [#96](https://github.com/NaruForge/Paseo-Plugin/issues/96).
- Clarify user installation, support and settings deletion on removal/rollback. Add explicitly labeled source-preview images for Prompt Palette and Provider Usage while preserving historical release evidence.
- Clarify Command Deck trust, troubleshooting, empty-library and removal data loss. Point current tag installation at this repository's `NaruForge/` commands rather than historical release-note owner examples, and document 0.8 Git evaluation refs for all four plugins.

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
