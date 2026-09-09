# Prompt Palette

Save prompts you use often and send them from an Agent's Composer after reviewing the full text.

**Experimental, unreleased source for Paseo 0.8.0-beta.1.** This plugin is not included in the existing `v0.1.0-rc.2` tag. Both daemon and app must be compatible; source/compiler and simulated UI checks are not live Paseo certification. See [verification](../../docs/verification/prompt-palette-0.8-source.md).

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

## Local development

The manifest's default installation ID is `prompt-palette`. The project was created with `paseo plugin init` from exact CLI 0.8.0-beta.1.

```powershell
npm ci
npm run typecheck --workspace prompt-palette
npm test --workspace prompt-palette
npm run check
```

For an explicitly chosen compatible test daemon with plugins already enabled:

```powershell
$repoRoot = (Resolve-Path .).Path
paseo plugin ls
paseo plugin install (Join-Path $repoRoot "plugins\prompt-palette")
paseo plugin ls
# After subsequent source changes:
paseo plugin reload prompt-palette
paseo plugin ls
paseo plugin logs prompt-palette
```

Use the actual runtime ID from `plugin ls` if installed with `--id`. Remote CLI options are global: `paseo --host <host> plugin ls`. Do not restart the daemon to load source changes.

After a reviewed ref containing this plugin is published, Git source installation can use:

```sh
paseo plugin add NaruForge/Paseo-Plugin:plugins/prompt-palette --ref <reviewed-prompt-palette-ref>
```

Replace the placeholder; the existing 0.7 release tag does not contain this directory. See [Git installation](../../docs/GIT_INSTALLATION.md).

## Implementation

`index.client.tsx` registers Settings and per-Agent pills. `index.server.ts` only registers built-in settings persistence. Runtime-neutral schemas live in `shared/`; UI, draft logic, registration lifecycle and sending live in `client/`. No custom backend RPC or third-party runtime dependency is needed.

Initial Agent enumeration follows every page and merges concurrent events. A 30-second refresh recovers missed events or initial query failures. Disposal cancels timers and listeners, closes pickers, invalidates pending preflight checks and prevents late results from restoring removed pills.

