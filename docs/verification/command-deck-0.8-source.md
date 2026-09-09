# Command Deck 0.8 source verification

Recorded: 2026-09-09. Idea: [#104](https://github.com/NaruForge/Paseo-Plugin/issues/104). Implementation: [#105](https://github.com/NaruForge/Paseo-Plugin/issues/105).

## Environment and boundaries

Windows host, PowerShell 7.6.5; the local Paseo CLI and reachable daemon both reported **0.8.0-beta.1**. A fresh `paseo plugin init` created the `command-deck` scaffold. Source dependencies use exact `@getpaseo/plugin` 0.8.0-beta.1 and manifest `^0.8.0`.

During the initial source verification, no Command Deck plugin installation, `plugin reload`, daemon restart or global plugin-switch change was performed. A separate disposable Workspace was used for SDK terminal probes; its created terminals were closed and the Workspace archived afterward. Existing user terminals were not touched. The subsequent authorized installation is recorded below.

## Source and compiler checks

- Workspace typecheck and **29 unit tests** passed, covering path validation, unavailable PowerShell, Workspace/settings isolation, stale revisions, concurrent start suppression, lost-response recovery, unknown runs, terminal ownership, interruption versus teardown, polling failures, late responses, output retention, effect restart, and Composer registration cleanup.
- The exact 0.8.0-beta.1 compiler produced client and server bundles from a staged source copy without node_modules. This checks public import boundaries, not installed runtime activation.
- Root `npm run check` passed: document/catalog/lockfile synchronization, source imports, release metadata, all workspace typechecks and tests. Command Deck's final focused checks include the additional output-retention/effect-restart regressions.

## Actual Windows terminal probes

The official SDK was used directly against the local daemon:

- `npm run dev` created a Node HTTP child server in a directory containing spaces and Korean characters. Captured output included its dynamically allocated port; an HTTP request succeeded. After Ctrl+C, the HTTP request failed. Terminal kill left no matching terminal.
- `.\dashboard.ps1` emitted its ready text and remained active until its terminal was killed.
- A fast `Write-Output` command finished before capture; the missing terminal returned no output. The UI explicitly documents this limitation.
- Two connected SDK clients called the same actual Command Deck runner concurrently and received one terminal ID.
- After disconnecting the first client and disposing/recreating the runner, the second client rediscovered the same named terminal. This is **runner recreation and SDK reconnect evidence**, not an installed `plugin reload` test.
- Terminating the npm terminal through the actual runner closed its child HTTP server. Missing and drive-relative working directories were rejected before execution.

## UI verification

Grade **D**. Actual client components were bundled with React Native Web and a simulated Paseo host. Chromium was checked at **1360×950** and **390×844**, with light and dark palettes. Panel and Settings screenshots were inspected; no horizontal overflow occurred.

Interactions checked: Composer and Command Center entry, command selection, one-click run, Ctrl+C, confirmation before terminal kill, output retained after exit, workspace selection, command editing/addition, successful settings save, revision conflict preserving the local draft, Copy draft, explicit discard/load-latest, empty list, loading, read error and disabled Run. Long Windows paths and Korean text were checked in the compact editor. Buttons expose roles/labels and minimum 44-pixel targets.

This preview does not certify Paseo's native modal, safe-area, virtual keyboard, screen reader, app navigation or mobile transport behavior. Host-provided Settings/Modal primitives were simulated. No native iOS/Android device was used.

## Remaining runtime gate

Before treating this plugin as deployment-complete, verify an authorized installation on the intended daemon/app: Settings persistence via real RPC, Composer/panel navigation, two actual app clients, mobile disconnect/reconnect, and `plugin reload` rediscovery. Capture exact app/device versions and logs with no secrets. Git source activation/update remains unverified. Do not apply the older three-plugin user runtime report to Command Deck.

## Authorized installation and reload — 2026-09-09

Following the user's explicit installation/reload request, the local BSW-HOME daemon and CLI reported 0.8.0-beta.1. `plugin ls` confirmed that `command-deck` was not installed, and the daemon's existing `pluginsEnabled` value was true. The workspace typecheck passed before installation.

Directory source `C:\Projects\Paseo-Plugin\plugins\command-deck` was installed under its manifest ID **command-deck**, then reloaded. Both post-command listings reported **running** without a load error. Logs showed Loading → Plugin ready, then Stopping → Plugin stopped → Loading → Plugin ready. The daemon was not restarted and the global plugin switch was not changed.

This verifies backend installation and a clean plugin reload. No command was launched during this follow-up, so preservation/rediscovery of a live command across actual reload, Settings RPC, app navigation, two app clients and native mobile behavior remain unverified.

## Project command sharing follow-up — 2026-09-09

The user selected Project-wide command sharing, including Git worktrees. Settings version 2 uses Project IDs for definitions and preserves version 1 installation/command IDs and unresolved Workspace links. Client catalog resolution can be persisted through the existing revision-checked Save changes action. Unknown links remain editable under Needs Project assignment. Execution and terminal ownership remain scoped to the current Workspace; the server checks its Project before reuse/creation and resolves cwd against that Workspace.

Validation: Command Deck typecheck and **32 tests** passed, including migration preservation, unresolved-command rejection, cross-Project rejection and separate worktree cwd/terminal ownership. Exact beta.1 staged compiler and root `npm run check` passed. Grade **D** simulated-host UI checks covered 1360×950 and 390×844 in light/dark themes; Project name/root rendering, settings revision conflicts, save/edit, shared command selection in another worktree, mapped legacy saves and manual reassignment passed. All four layouts were exercised; native mobile remains outside this simulated preview.

Local BSW-HOME directory runtime `command-deck` was reloaded at 14:54 KST. Post-reload listing reported running; logs recorded stopped/loading/ready without errors. No real user command was executed during this follow-up. Real app Settings persistence and native mobile interaction remain to be verified by the runtime gate above.
