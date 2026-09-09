# Command Deck

Save PowerShell commands for a Project and run them from the Agent Composer or a Workspace panel. **Experimental, unreleased; Windows hosts only.** Requires Paseo daemon/app/CLI **0.8.0-beta.1**, PowerShell 7 on the daemon PATH, and the tools used by your commands (for example Node.js/npm).

Source and Windows SDK checks are complete as described in the [verification record](../../docs/verification/command-deck-0.8-source.md). Backend installation/reload passed; installed app/mobile interaction verification remains pending. Existing verification reports for the other three plugins do not cover Command Deck.

[Collection](../../README.md) · [Compatibility](../../docs/COMPATIBILITY.md) · [Install](#install-current-source) · [Support](../../SUPPORT.md)

## Source previews

These **0.8.0-beta.1 source previews** render the actual source components with a **simulated Paseo host**, not an installed app or a native phone. Host-provided settings and modal primitives are approximations. The images themselves are labeled `Source preview - simulated Paseo host`.

![Command Deck compact panel listing saved commands, recent output, Run command, Send Ctrl+C and Terminate terminal](../../docs/screenshots/command-deck/panel-preview.png)

The panel shows a Project command, captured output, and explicit run, interrupt and terminate actions. Terminal presence is not treated as success.

![Command Deck settings with a Project selected, saved command library, Add command and Save changes](../../docs/screenshots/command-deck/settings-preview.png)

Settings edits the Host-scoped command library for one Project. Save changes persists the draft; Load latest and Copy draft recover from revision conflicts.

## Install current source

There is no published collection release containing Command Deck. Its source is available on main; use it for evaluation with compatible **0.8.0-beta.1 daemon, app and CLI** on a **Windows** host. Enable trusted plugins in the intended daemon’s **Settings → Plugins**.

Follow the [source checkout steps](../../README.md#evaluate-current-08-source), then run this in PowerShell from the repository root on the daemon host. npm is not needed just to install the existing source.

```powershell
$repoRoot = (Resolve-Path .).Path
paseo plugin ls
paseo plugin install (Join-Path $repoRoot "plugins/command-deck")
paseo plugin ls
```

Expect `command-deck` to be `running` without load errors. If that ID already exists, use a separate `--id command-deck-dev` and use that ID in later commands. On a remote 0.8 daemon, put `--host <target>` before `plugin`. Installation is per daemon. The `^0.8.0` manifest range includes beta.1; daemon and app requirements are checked separately.

Open **Settings → Plugins → Command Deck**. An empty command list is normal on first install. Then use **Commands** on an Agent Composer, or **Open workspace commands** in Command Center.

For Git source evaluation, choose a published commit containing this plugin that you have reviewed:

```powershell
paseo plugin add NaruForge/Paseo-Plugin:plugins/command-deck --ref <reviewed-0.8-ref>
```

Replace the placeholder with that published commit/tag; it is not a literal ref. Command Deck is absent from `v0.1.0-rc.2`. This command is not evidence that Command Deck Git installation has been verified. The three existing plugins' Git path is recorded in the [Git source verification](../../docs/verification/paseo-0.8-git-source.md); Command Deck Git activation remains unverified. See [Git installation](../../docs/GIT_INSTALLATION.md).

## Use

1. Open **Settings → Plugins → Command Deck** and select a Project.
2. **Add command**: enter its name, one PowerShell command line, and optionally its working directory. For example `npm run dev` or `.\dashboard.ps1`.
3. **Apply to draft → Save changes**. Leaving Settings discards unsaved edits. The library belongs to this host/installation and uses revision conflict protection.
4. Open the Agent Composer's **Commands** button, or **Open workspace commands** in Command Center. No Agent is required for the Command Center route.
5. Select a command and press **Run command**. Inspect its output, use **Send Ctrl+C** to request interruption, or confirm **Terminate terminal** to close it.

An empty command list is normal on first install. Commands and Open workspace commands still open the panel and can return you to Settings.

Commands belong to Projects and are shared across their Workspaces and Git worktrees. Run state and terminals remain separate for each Workspace. The default working directory is the Workspace root; relative paths resolve against that root, and full Windows absolute paths are accepted. `C:relative`, root-relative paths and missing directories are rejected. Environment expansion is not applied to the working-directory field.

PowerShell runs with `-NoLogo -NoProfile -Command`. Commands use the daemon's environment and privileges, not the viewing phone's shell. Profiles and execution policies are not automatically changed. Interactive prompts must be handled in the existing Workspace terminal; there is no general input field or direct terminal-tab navigation in this plugin.

## Storage and limits

Host Settings schema version 2 keys commands by Project ID. Up to 100 commands across the installation; names up to 80, command lines 8,000 and directories 2,000 JavaScript string code units. See [Command Deck Settings](../../docs/CONFIGURATION.md#command-deck-settings).

Settings are ordinary JSON, not a secret vault. They survive reload, disable, update and daemon restart. **Removing the plugin installation deletes its commands and installation identifier.** Copy anything you want to keep before removal; there is no import/export. Terminals are not automatically killed, and a reinstalled plugin will not adopt the old installation's terminals.

## Runs and output

- Terminal presence is **not** a successful exit or a ready development server. An ended terminal has an unknown command result.
- While the panel is mounted, it reads the latest 200 output lines every two seconds without overlapping polls. Long lines/responses are truncated. Previously captured output is retained in that panel after termination, but is not stored as a permanent log.
- Fast commands can exit before any output is captured. Reconnecting/reopening the panel does not recover output from terminals that have already disappeared.
- Concurrent starts for the same task share the pending operation. An existing owned terminal is reused. Creation requests are never automatically retried.
- If a response is lost, refresh and inspect the Workspace terminals. **Allow another run…** explicitly clears an unknown-run record; it does not stop an existing process and may allow a duplicate. Exactly-once execution across disconnects/reloads is not guaranteed.
- Changing a saved command affects its next run only. Removing a command leaves its terminal accessible under **removed command** in the panel.
- Client disconnect and plugin cleanup do not kill terminals. Matching installation/task markers allow rediscovery after reconnect or runner recreation. Do not rename these terminals if you want automatic discovery. Ambiguous ownership is never automatically terminated.
- The daemon owns terminal lifecycle. There is no automatic relaunch after daemon restart. Terminating a terminal may interrupt unsaved work; processes deliberately detached by a command need separate management.
- Opening a development website remotely requires its own network/preview route. The host's `localhost` URL is not automatically available on your phone.

## Troubleshooting

- **Commands is missing:** check a Windows daemon host, `running` plugin status, compatible daemon/app, and the intended Host. The Command Center route does not need an Agent. Installed app and native mobile interaction are not yet verified.
- **PowerShell is unavailable:** confirm PowerShell 7 (`pwsh`) is on the daemon PATH, not only on the viewing client.
- **A command is missing:** Apply to draft is local; choose Save changes before switching Host or leaving Settings. Confirm you are using the same Host and installation.
- **Working directory rejected:** use the Workspace root, a path relative to that root, or a full Windows absolute path. Missing directories, `C:relative` and root-relative paths are rejected.
- **Save conflict or invalid settings:** retain/copy your draft before loading latest. Do not remove/reinstall to fix a conflict; removal deletes the command library and installation identifier.
- **No output after Run:** fast commands can finish before the panel captures output. Inspect Workspace terminals; disappeared terminals cannot be recovered from this panel.
- **Run result is unknown:** terminal presence is not success. Check Workspace terminals before **Allow another run…**, which may start a duplicate.

For load errors, run `paseo plugin ls`, then `paseo plugin logs <runtime-id>`. On 0.8 use global `--host` for remote commands. Report persistent problems through [Support](../../SUPPORT.md), including the installed ref and versions, without command bodies, captured output, credentials or private paths.

## Update and remove

Run `paseo plugin ls` against the intended Host before changing an installation. These examples use the default ID `command-deck`; replace it with your actual ID if you used `--id`. On the 0.8 CLI, put remote selection before the command: `paseo --host <host> plugin ls`.

For a **Git source** installation, check the tracked ref and update it:

```sh
paseo plugin status command-deck
paseo plugin update command-deck
paseo plugin ls
```

Branches advance; fixed tags and commits do not. For a **directory source**, after reviewing changes to the local checkout use `paseo plugin reload command-deck`, then `paseo plugin ls`. Settings survive update/reload. See [ref changes and rollback](../../docs/RELEASING.md#rollback) before switching a pinned installation.

Removal is optional and separate from troubleshooting. **Removal deletes this installation’s commands and installation identifier.** Copy the draft first; there is no import feature. Terminals are not automatically killed, and a reinstalled plugin will not adopt the old installation's terminals. Inspect or stop them in the Workspace terminal before removal. A Git-source removal deletes the managed checkout; a directory-source removal leaves the original source directory intact.

```sh
paseo plugin remove command-deck
paseo plugin ls
```

Confirm only the intended runtime has disappeared. No daemon restart is needed.

## Contribute

For source changes, follow [Contributing](../../CONTRIBUTING.md). Development checks are separate from installation.

```powershell
npm run typecheck --workspace command-deck
npm test --workspace command-deck
npm run check
```

The source uses official Settings and Terminal SDK APIs. Server RPCs coordinate run ownership and requests; clients use the selected host's connection. Saved commands and output are ordinary user data, not a credential vault. The plugin adds no command/output backend logging, telemetry, custom process manager or direct vendor HTTP.

See [#104](https://github.com/NaruForge/Paseo-Plugin/issues/104), [implementation #105](https://github.com/NaruForge/Paseo-Plugin/issues/105), and [verification and remaining runtime checks](../../docs/verification/command-deck-0.8-source.md).

Existing version 1 settings preserve command and installation IDs during migration. Known Workspace-to-Project links are resolved in the client; Save changes persists those links with revision protection. Unresolved commands remain under **Needs Project assignment** for manual selection. No commands or terminals are deleted by migration.
