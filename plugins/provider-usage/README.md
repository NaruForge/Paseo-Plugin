# Provider Usage

Show usage for every enabled Provider connection on the selected Host, using Paseo's official usage API. The optional sidebar and matching Agent Composer pills complement **Settings → Usage**.

[Collection](../../README.md) · [Compatibility](../../docs/COMPATIBILITY.md) · [Install](#installation) · [Support](../../SUPPORT.md)

**Current source targets Paseo 0.8.0-beta.1.** Source and isolated UI checks are recorded in [verification](../../docs/verification/provider-usage-0.8-source.md). The user has completed Paseo 0.8 runtime verification; see the [runtime record and reported scope](../../docs/verification/paseo-0.8-runtime.md). The published `v0.1.0-rc.2` tag retains the previous 0.7.2 implementation.

## Screenshots

These **0.8.0-beta.1 source previews** were captured on 2026-09-09 with simulated host controls, settings and provider data. They show functionality, not a live Paseo installation or actual account quotas. Original images are included unchanged from the [reset display review](../../docs/verification/provider-usage-reset-time.md).

![Provider Usage source preview with pill fields and Time remaining selected](../../docs/screenshots/provider-usage/settings-preview.png)

This example enables Show reset time and selects Time remaining; the defaults remain reset time off and Date and time. “Save requests” is preview instrumentation, not a Paseo setting.

![Provider Usage source preview showing a usage window, unsupported connection, credit balance and unavailable provider](../../docs/screenshots/provider-usage/usage-preview.png)

The sample Usage screen distinguishes available values from unsupported or failed readings. The historical live Composer image is retained under Usage and refresh.

## Provider Usage Settings

Open **Settings → Plugins → Provider Usage → Provider Usage Settings**, or the **Provider Usage Settings** Command Center item.

| Group | Setting | Default |
| --- | --- | --- |
| Visibility | Composer pill | On |
| Pill | Show remaining % | On |
| Pill | Show provider name | On |
| Pill | Show reset time | Off |
| Reset time | Display format | Date and time |

Changes save immediately to this Host and plugin installation, with revision conflict detection. Failed saves leave the previous values in effect; reload the latest settings before retrying. Invalid settings can be explicitly restored to defaults. Loading or invalid settings do not silently overwrite stored values.

Sidebar visibility is controlled exclusively by **Paseo Settings → Layout**. The plugin always registers the Usage sidebar item, including while plugin settings are loading or invalid. It does not override your Layout preference. **Open provider usage** remains available in Command Center when the sidebar is hidden.

Pill fields follow the host's live settings hook. Composer pill visibility changes made in this screen apply after saving; changes from other clients converge within 30 seconds while connected. Turning all pill fields off leaves an accessible gauge icon.

Settings schema v3 migrates v1/v2 while preserving Composer pill visibility and all three pill field choices, removing the retired Sidebar value and defaulting the reset format to Date and time. It does not modify Paseo Layout. Downgrading to older schema code may report the newer document as invalid; it does not silently reset it.

Settings survive reload, disable, update and daemon restart. Removing the installation deletes its settings; reinstalling starts from defaults. Values are shared across authorized clients of the same Host and installation, without cross-host synchronization.

Choose **Reset time → Display format** to show either **Date and time** or **Time remaining** in Usage and the pill. The pill’s **Show reset time** switch remains independent. Pill values omit Reset/Resets: `09:30` (with a date on other days) or `2h 15m`, limited to two duration units such as `6d 3h`. Screen-reader labels retain the reset context.

Remaining time is calculated on the client and updates every 30 seconds while mounted, without additional Provider requests. Below one minute it shows `<1m`; after the supplied deadline it shows `Due` in the pill and `Reset due` in Usage. This indicates a passed deadline, not a confirmed refreshed quota. Background timer throttling can delay updates; the next tick uses current wall time.

## Usage and refresh

The surface includes all connections with `enabled: true` in the host's global Provider catalog. It does not restrict Provider IDs to Codex/Grok, require a running Agent, or hide an enabled connection because its status is unavailable. A Provider without a usage result remains visible as unavailable. Disabled connections are excluded even if the host still has cached usage for them. Pills appear on non-archived Agents with a Workspace and an enabled matching connection.

Open **Usage** from the optional sidebar or Command Center to inspect plans, usage windows, resets, balances and details. The pill shows the most consumed window's remaining percentage, falling back to a balance percentage when available. Reset time follows that window, with a balance fallback. Missing values display `—`; unavailable usage is never shown as zero. Provider-supplied missing-field defaults are owned by Paseo.

The surface and pills share a query to Paseo's official usage service, with no periodic usage polling. They read on initial mount and can reuse a recent reading. Use **Refresh** in Usage or press the Composer pill to request another reading; Provider catalog changes also trigger a shared usage refresh. Leaving the screen open does not repeatedly fetch usage, and the catalog subscription is not a live usage feed. **Paseo beta.1 caches usage for five minutes; its public API has no force-refresh option**, so a request may return the same host reading. The 30-second remaining-time display and Composer visibility settings synchronization are separate from usage retrieval.

The image below records the previous 0.7 composer UI; it is not beta Settings verification.

![Provider Usage pill showing Codex 96% remaining above the Paseo agent composer](../../docs/screenshots/provider-usage/composer-pill.jpg)

## Installation

This guide’s Settings and official-API behavior describe current **0.8.0-beta.1 source**. For the published **0.7.2** release, use the [versioned usage guide](https://github.com/NaruForge/Paseo-Plugin/blob/v0.1.0-rc.2/plugins/provider-usage/README.md#use). Its old command examples are historical; use the installation and maintenance commands here. Enable trusted plugins in the target daemon’s Settings → Plugins, then install the release with:

```sh
paseo plugin add NaruForge/Paseo-Plugin:plugins/provider-usage --ref v0.1.0-rc.2
paseo plugin ls
```

The tag is pinned and does not advance on update.

For current source evaluation, both daemon and app must match the beta target. Enable the Provider connections through normal Paseo tooling. Follow the [source checkout steps](../../README.md#evaluate-current-08-source), then run PowerShell from the repository root on the daemon host:

```powershell
$repoRoot = (Resolve-Path .).Path
paseo plugin ls
paseo plugin install (Join-Path $repoRoot "plugins/provider-usage")
paseo plugin ls
```

Expect `provider-usage` to be `running` without load errors. If the ID already exists, use a distinct `--id provider-usage-dev`. Open **Usage** from Command Center; sidebar visibility belongs to **Settings → Layout**. A matching enabled connection is required for an Agent pill. No enabled connections means there is no usage to show; unsupported connections stay visible as unavailable.

For Git source evaluation of **0.8** source, choose a reviewed published commit that contains this plugin. Do not use `v0.1.0-rc.2` for 0.8:

```sh
paseo plugin add NaruForge/Paseo-Plugin:plugins/provider-usage --ref <reviewed-0.8-ref>
```

Replace the placeholder with that actual ref. See [Git installation](../../docs/GIT_INSTALLATION.md) before selecting a beta candidate ref.

## Data access and troubleshooting

The plugin calls only `paseo.providers.snapshot()` and `paseo.providers.listUsage()` for usage. It no longer reads credential files or environment tokens, issues vendor HTTP requests, or refreshes authentication. The selected Paseo daemon owns provider integrations, authentication, caching and HTTP policy. Sign in and enable connections through normal Paseo/provider tooling; the plugin requests no credentials.

Unavailable can mean unsupported usage, missing authentication or a temporary provider limitation. Errors from the host are shown with generic descriptions rather than raw backend messages. Values can lag the provider's own UI. Do not include credentials or raw account responses in issue reports.

Before lifecycle commands, run `paseo plugin ls` and use the actual runtime ID. For a remote Host, use `paseo --host <host> plugin ls`. Directory sources use `paseo plugin reload <runtime-id>`; Git sources use `paseo plugin update <runtime-id>`. Removal deletes the installation's settings. For a missing pill, check the matching enabled connection, non-archived Agent with a Workspace, and Composer pill setting. For initialization failures, use `paseo plugin logs <runtime-id>`. If the symptom persists, use [Support](../../SUPPORT.md#troubleshooting-first-steps) with versions and redacted logs.

## Update and remove

Run `paseo plugin ls` against the intended Host before changing an installation. These examples use the default ID `provider-usage`; replace it with your actual ID if you used `--id`. On the 0.8 CLI, put remote selection before the command: `paseo --host <host> plugin ls`.

For a **Git source** installation, check the tracked ref and update it:

```sh
paseo plugin status provider-usage
paseo plugin update provider-usage
paseo plugin ls
```

Branches advance; fixed tags and commits do not. For a **directory source**, after reviewing changes to the local checkout use `paseo plugin reload provider-usage`, then `paseo plugin ls`. Settings survive update/reload. See [ref changes and rollback](../../docs/RELEASING.md#rollback) before switching a pinned installation.

Removal is optional and separate from troubleshooting. **Removal deletes this installation’s display settings.** Record your choices first; reinstalling starts from defaults. Provider authentication is not removed. A Git-source removal deletes the managed checkout; a directory-source removal leaves the original source directory intact.

```sh
paseo plugin remove provider-usage
paseo plugin ls
```

Confirm only the intended runtime has disappeared. No daemon restart is needed.
