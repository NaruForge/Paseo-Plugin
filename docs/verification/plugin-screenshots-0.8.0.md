# Plugin screenshots from the installed Windows app

Date: 2026-09-10. Repository checkpoint before documentation changes: `2023cc2`.

Seven representative screenshots were captured through Computer Use from the installed Paseo Windows app. The executable reports product version `0.8.0.0`. All four runtime IDs used directory sources under this checkout; `paseo plugin ls` showed each running without a load error during the session. This is evidence of the screens described below, not full runtime certification or Git-source activation evidence.

| Plugin | Captured screens | Observed state |
| --- | --- | --- |
| Branch Garden | [Overview](../screenshots/branch-garden/overview-live.png), [repository detail](../screenshots/branch-garden/repository-live.png) | Real Host scan totals and expanded Paseo-Plugin Workspace/default-branch evidence |
| Provider Usage | [Usage](../screenshots/provider-usage/usage-live.png), [Settings](../screenshots/provider-usage/settings-live.png) | Actual Codex/Grok readings, unavailable Copilot reading and saved display preferences |
| Prompt Palette | [Settings](../screenshots/prompt-palette/settings-live.png) | Three existing saved prompts with editing, ordering and save controls |
| Command Deck | [Workspace panel](../screenshots/command-deck/panel-live.png), [Settings](../screenshots/command-deck/settings-live.png) | Paseo-Plugin Project selected; empty library, no connected terminal and unchanged draft |

## Image handling and review

Captures used the dark desktop layout at 1280 × 1440. Crops remove unrelated sidebar projects, window controls where practical, and excess blank space. Branch Garden's repository crop excludes other repositories; its overview totals still describe the whole Host. Pixels were not rescaled, generated or replaced with sample data. README images retain their original crop resolution for readable text.

UI impact: **A** for this documentation/image-only change; no plugin UI source or state contract changed. The seven published crops were visually checked. Light theme, compact layout, native mobile, screen-reader interaction and error/pending matrices were omitted because this session updates representative documentation images rather than UI behavior. Prompt picker/send behavior and Command Deck execution were not exercised.

Historical 0.7 captures and simulated beta source previews remain at their existing paths so earlier verification records preserve their evidence. Current plugin guides use the new `*-live.png` files.

## Runtime state

Branch Garden and Command Deck were initially disabled. They were temporarily enabled for capture, then restored to disabled. Prompt Palette and Provider Usage remained enabled. The global plugin switch was already on and was not changed. No installation, update, explicit reload, daemon restart, settings save, prompt send or command execution was performed. Final `paseo plugin ls` confirmed the original enabled/disabled state with no reported load errors.

Validation: documentation synchronization, Markdown image/link path checks for the changed guides and this record, and image decoding/dimensions. Typecheck and plugin tests are not required for this documentation-only change under `AGENTS.md`.

## Follow-up: Provider Usage entry points

Later on 2026-09-10, two additional Computer Use captures were added to address the missing navigation context in the initial seven images:

- [Composer pill and chat input](../screenshots/provider-usage/composer-live.png), cropped to 839 × 180. The pill shows 53% remaining and 6d 16h until reset, with provider name hidden by the existing preferences. The input is included to show where the pill appears; conversation content is excluded.
- [Selected sidebar Usage menu](../screenshots/provider-usage/sidebar-live.png), cropped to 287 × 184. The actual left navigation is shown through the Usage row, excluding unrelated Workspace/project names.

Both images retain their original pixel resolution. The guide now introduces the pill, the sidebar menu and its Layout visibility control, and Settings in that order. These later readings need not match the earlier usage-screen capture. Review remained grade A, dark Windows desktop at 1280 × 1440; both final crops were visually inspected. No plugin settings, enabled state, messages or terminals were changed in this follow-up. Documentation synchronization and local image/link checks passed.
