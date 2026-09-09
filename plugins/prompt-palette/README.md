# Prompt Palette

Save prompts you use often and send them from an Agent's Composer after reviewing the full text.

**Experimental, unreleased source for Paseo 0.8.0-beta.1.** This plugin is not included in the existing `v0.1.0-rc.2` tag. Both daemon and app must be compatible. The user has completed Paseo 0.8 runtime verification; see the [runtime record and reported scope](../../docs/verification/paseo-0.8-runtime.md). Earlier [source verification](../../docs/verification/prompt-palette-0.8-source.md) remains a separate historical record.

[Collection](../../README.md) · [Compatibility](../../docs/COMPATIBILITY.md) · [Install](#install-current-source) · [Support](../../SUPPORT.md)

## Screenshots

These **0.8.0-beta.1 source previews**, captured on 2026-09-09, use simulated Paseo host components and sample text. They do not show a live Agent send or certify native mobile layout. Original captures are included unchanged.

![Prompt Palette compact source preview listing a saved prompt and Manage prompts](../../docs/screenshots/prompt-palette/picker-preview.png)

The picker shows the Agent/Host target and opens a saved prompt for review. This image comes from the [mobile layout review](../../docs/verification/prompt-palette-mobile-layout.md).

![Prompt Palette source preview showing the full prompt body, target Agent, Copy text and Send](../../docs/screenshots/prompt-palette/send-preview.png)

The full-body preview comes from the earlier [initial source review](../../docs/verification/prompt-palette-0.8-source.md), before the later button/layout adjustments. It illustrates preview-before-send; surrounding controls and sheet dimensions are simulated.

## Use

1. Open **Settings → Plugins → Prompt Palette**.
2. Choose **Add prompt**, enter a name, optional description and prompt body, then **Apply to draft**.
3. Edit, delete or move items up/down as needed. Choose **Save changes** to save the whole library.
4. Open an existing Agent and press **Prompts** in its Composer.
5. Select a saved prompt, review its full text and Host/Agent target, then press **Send**.

The pill remains available for an empty library and links to Settings. Creating a new Agent from a draft Composer is outside this version's scope.

Apply to draft does not save to the Host. Save before leaving Settings or changing Host; unsaved changes are local to the open screen. Cancel / load latest confirms discarding the draft. Delete also requires confirmation and is persisted only by Save changes.

The library belongs to this Host and plugin installation, and is shared by its authorized clients. Other Hosts and installations have separate libraries. Conflicting saves preserve the draft; copy it before explicitly discarding it and loading the latest values. A settings load error does not replace an existing draft. Invalid documents are reported without automatically resetting stored content.

## Message behavior

- Only the previewed body is sent, with whitespace and line breaks preserved. Name and description are not prepended.
- Changing a saved prompt on another client does not change a preview already selected for sending.
- Existing Composer text and attachments remain untouched and are not included in the send.
- Uses the official `paseo.agents.ref(agentId).send(body)`. The picker closes on daemon acceptance, not Agent turn completion.
- Existing Paseo/Provider behavior determines how a running Agent receives the message. The plugin does not stop a turn, change Provider configuration, or answer permission requests.
- Duplicate taps are blocked during validation and sending. Agent availability and workspace ownership are refreshed before submission.
- A failed submission is conservatively treated as uncertain delivery because its acknowledgement may have been lost. The preview stays open, no automatic retry occurs, and **I checked the conversation — allow another send** explicitly unlocks another attempt. The uncertainty latch survives closing/reopening the picker while that registration remains alive; it does not persist through plugin reload or app restart.
- Copy text uses the viewing client's clipboard. The plugin does not log prompt bodies or access provider credentials or vendor HTTP.

## Storage and limits

Host Settings schema `library`, version 1, defaults to an empty array. Up to 100 prompts; names up to 80, descriptions 240 and bodies 20,000 JavaScript string code units. Names and bodies cannot be whitespace-only. Item IDs stay stable on edit/reorder; duplicate names are permitted.

Settings are ordinary JSON, not a secret vault. They survive reload, disable, update and daemon restart. **Removing the plugin installation deletes its library.** Copy anything you want to keep before removal. No cross-Host sync, template variables, search/tags, import/export, macros or scheduled sends are included.

## Install current source

There is no published collection release containing Prompt Palette. Its source is available on main; use it for evaluation with compatible **0.8.0-beta.1 daemon, app and CLI**. Enable trusted plugins in the intended daemon’s **Settings → Plugins**. An existing Agent with a Workspace is needed for sending.

Follow the [source checkout steps](../../README.md#evaluate-current-08-source), then run this in PowerShell from the repository root on the daemon host. npm is not needed just to install the existing source.

```powershell
$repoRoot = (Resolve-Path .).Path
paseo plugin ls
paseo plugin install (Join-Path $repoRoot "plugins/prompt-palette")
paseo plugin ls
```

Expect `prompt-palette` to be `running` without load errors. If that ID already exists, use a separate `--id prompt-palette-dev` and use that ID in later commands. Open **Settings → Plugins → Prompt Palette**, save your first prompt, then use **Prompts** on an existing Agent. An empty library is normal on first install and links back to Settings.

For Git source evaluation, choose a published commit containing this plugin that you have reviewed:

```sh
paseo plugin add NaruForge/Paseo-Plugin:plugins/prompt-palette --ref <reviewed-0.8-ref>
```

Replace the placeholder with that actual ref. `v0.1.0-rc.2` does not contain this plugin. Git installation/update/recovery verification remains separate in [#96](https://github.com/NaruForge/Paseo-Plugin/issues/96); see [Git installation](../../docs/GIT_INSTALLATION.md).

## Troubleshooting

- **Prompts is missing:** check the intended Host, `running` plugin status, compatible daemon/app, and an existing available Agent with a Workspace. The new-Agent draft Composer is not supported.
- **A prompt is missing:** Apply to draft is local; choose Save changes before switching Host or leaving Settings. Confirm you are using the same Host and installation.
- **Save conflict or invalid settings:** retain/copy your draft before loading latest. Do not remove/reinstall to fix a conflict; removal deletes the library.
- **Delivery is uncertain:** check the Agent conversation before unlocking another send. The plugin never automatically retries.

For load errors, run `paseo plugin ls`, then `paseo plugin logs <runtime-id>`. On 0.8 use global `--host` for remote commands. Report persistent problems through [Support](../../SUPPORT.md), including the installed ref and versions, without prompt bodies, credentials or private conversation content.

## Contribute

For source changes, follow [Contributing](../../CONTRIBUTING.md). Development checks are separate from installation. [Source verification](../../docs/verification/prompt-palette-0.8-source.md) describes the implementation checkpoint and [runtime verification](../../docs/verification/paseo-0.8-runtime.md) records the later user report.

## Update and remove

Run `paseo plugin ls` against the intended Host before changing an installation. These examples use the default ID `prompt-palette`; replace it with your actual ID if you used `--id`. On the 0.8 CLI, put remote selection before the command: `paseo --host <host> plugin ls`.

For a **Git source** installation, check the tracked ref and update it:

```sh
paseo plugin status prompt-palette
paseo plugin update prompt-palette
paseo plugin ls
```

Branches advance; fixed tags and commits do not. For a **directory source**, after reviewing changes to the local checkout use `paseo plugin reload prompt-palette`, then `paseo plugin ls`. Settings survive update/reload. See [ref changes and rollback](../../docs/RELEASING.md#rollback) before switching a pinned installation.

Removal is optional and separate from troubleshooting. **Removal deletes this installation’s prompt library.** Copy all prompts you want to retain first; there is no import/export feature. Reinstalling starts with an empty library. A Git-source removal deletes the managed checkout; a directory-source removal leaves the original source directory intact.

```sh
paseo plugin remove prompt-palette
paseo plugin ls
```

Confirm only the intended runtime has disappeared. No daemon restart is needed.
