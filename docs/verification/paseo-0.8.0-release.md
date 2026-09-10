# Paseo 0.8.0 final — collection v0.1.0-rc.3

Date: 2026-09-10. Tracking: [#112](https://github.com/NaruForge/Paseo-Plugin/issues/112). Target: exact **Paseo 0.8.0 final**, collection **v0.1.0-rc.3 prerelease**. This record concerns the final-version source migration; older verification documents retain their original scope.

## Upstream comparison and response

Compared the [final release](https://github.com/getpaseo/paseo/releases/tag/v0.8.0), [31 commits since beta.1](https://github.com/getpaseo/paseo/compare/v0.8.0-beta.1...v0.8.0), current versioned [migration](https://paseo.sh/docs/plugins/v0.8/migration) and [reference](https://paseo.sh/docs/plugins/v0.8/reference) with published exact npm declarations and a fresh final CLI scaffold.

- **Breaking pill contract:** `PluginComposerPillProps` and top-level `Component/title/onPress` are replaced by a `button` descriptor and `PluginButtonIconProps`. Registrations return `update/remove` handles. Updated all three consumers and lifecycle tests. Provider Usage publishes query/Settings/countdown label and accessible title changes through an effect; all fields disabled produces `Usage` because the final host rejects empty labels; its icon keeps the semantic usage tone, while the host owns label styling. Prompt Palette subscribes to its sender for pending label/disabled updates and retains its controlled Modal. Command Deck opens the same registered Workspace panel.
- **New header/menu/popover contributions:** documented the final API and corrected prior claims that header buttons have no public slot. No new header feature was added to the collection.
- **Other upstream changes:** provider reload/recovery and ACP fixes do not require changes to these plugins, which do not register custom providers. Existing separate entries, Settings, usage and Terminal SDK calls remain in place. Final SDK/client/protocol/relay dependency versions are consistent. The host compiler entry and argument contract used by the development checker remain unchanged.
- **Platform/CLI:** final Paseo desktop requires macOS 13 or later; global `--host` usage was already documented. Both daemon and app must use final 0.8.0. Paseo's prerelease manifest matcher can accept beta.1 against `^0.8.0`, but beta.1 does not implement the final pill API.
- **Release metadata:** root/workspace versions, lockfile, catalog and changelog use rc.3; SDKs use exact 0.8.0. Historical rc.2 remains pinned to Paseo 0.7.2. Built-in Settings versions and saved values do not change in this migration.

## Local verification

Environment: Windows, PowerShell 7.6, Node.js 24.18.0, npm 11.14.1. Base source: `246668590c9299139f9de2c3e9af4878eddec7c5`. Fresh dependencies installed with `npm ci`; CI uses Node.js 22.

- Workspace typechecks passed against exact 0.8.0 declarations.
- Branch Garden: 27 tests; Command Deck: 32; Prompt Palette: 20; Provider Usage: 39. Seven script tests additionally cover import and release contracts, including final and beta metadata. Sender coverage verifies in-place pending/ready updates and no updates after disposal during an unfinished send. Existing read-only Git, official usage API, Settings conflicts, lost-acknowledgement/no-retry and terminal ownership tests remain active.
- Fresh scaffold: isolated `@getpaseo/cli@0.8.0` installation, `paseo plugin init <empty-directory> --id migration-probe`. Confirmed separate entries/runtime directories, exact plugin SDK and manifest requirements. No daemon was started or installed by this probe.
- Staged compiler: `node scripts/check-plugin-compiler.mjs plugins/<id> <exact-0.8.0-server-package-directory>` for each of the four plugins. All client/server bundles compiled without node_modules in the staged source. The checker requires exact SDK/server equality and uses `dist/server/server/plugins/compiler.js` → `compilePlugin({ client, server })`.
- Root `npm run check` passed after the final source changes: documentation/import/release/type checks and **125 tests** in total. Three-OS CI is required before publication. Release workflow records the exact merged source SHA and repeats `npm ci` / `npm run check` on Windows, Ubuntu and macOS.

## UI verification

Grade **D** for the three changed Composer integrations: host-owned label structure and shared button contract changed. Chromium source preview at **1280×900** and **390×844**, both **light and dark**. Actual registration helpers, `UsagePill`, `PromptPill`, `PromptPicker` and sender/controller code run through React Native Web. Host button framing, icon glyphs, Modal, settings subscriptions and SDK responses are simulated.

All four theme/layout combinations passed: initial labels and accessible usage titles; usage field/reset preference updates and the all-fields-off fallback; keyboard Enter opening the prompt Modal; pending label and disabled state; completion restoring the pill after one simulated send; Command Deck panel action retaining Workspace context; unavailable usage; idempotent disposal removing all contributions. Screenshots were captured and representative normal/pending states visually inspected in both layouts/themes. No browser page errors occurred. Local ignored harness, verification script and screenshots are in `artifacts/release-080/`; no preview dependencies were added to the workspace.

Branch Garden is grade **A**, with no visual source changes. Unchanged Settings/surface/panel layouts were not reviewed again because this migration changes only the Composer contract. Native phone keyboards, screen-reader behavior and actual app button framing were not simulated faithfully and are not certified.

## Publication boundaries

The user authorized repository changes, commits, push, merge and release. This task does not update the user's Paseo daemon/app, alter existing installations, enable a global plugin switch, or submit the community-listing proposal upstream. No live message or terminal was created by the source preview.

**Remaining runtime evidence:** final 0.8.0 installed app/native mobile interaction and live final Git add/update/recovery were not performed. Prior [user runtime](paseo-0.8-runtime.md), [beta Git](paseo-0.8-git-source.md) and [Command Deck](command-deck-0.8-source.md) reports are historical evidence, not certification of the new final-version pills. Therefore rc.3 remains a prerelease; stable publication requires the independent review and additional runtime evidence in [Releasing](../RELEASING.md).
