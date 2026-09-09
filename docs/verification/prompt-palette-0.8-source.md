# Prompt Palette 0.8 source verification

Date: 2026-09-09. Tracking: [#83](https://github.com/NaruForge/Paseo-Plugin/issues/83). Target: exact Paseo **0.8.0-beta.1**, Windows source checks.

## Scope

Fresh `paseo plugin init` scaffold, manifest ID `prompt-palette`, exact beta.1 SDK, client/server entries and shared schema. Host Settings library v1 stores ordered prompts; client draft editing uses an explicit revision. A per-Agent pill opens the public Modal for list, full-text preview and official Agent send. Server entry registers settings only.

The collection version remains aligned with current workspace metadata; Prompt Palette is an **unreleased addition**, absent from the published `v0.1.0-rc.2` tag.

## Automated checks

- Workspace typecheck and 19 unit tests passed: Unicode/whitespace preservation, limits and duplicate IDs, immutable ordering, revision guard, controller cleanup, multi-page enumeration, concurrent remove/move events, retry after failed enumeration, malformed page handling, late response disposal, synchronous duplicate send prevention, pending subscriptions, preflight failure and ambiguous acknowledgement handling.
- Exact beta.1 compiler accepts client/server bundles from a staged source copy with no node_modules: final client 32,535 bytes and server 2,234 bytes. The compiler check starts no daemon.
- Root `npm run check` passed: document sync, runtime imports, release metadata, all workspace typechecks and script/plugin tests. Branch Garden retains 27 tests and Provider Usage 39; script checks have 7 tests.

## UI review

Grade **D**. Chrome source preview at **1280×900** and **390×844**, in light and dark themes. The preview renders the actual plugin entry and React Native UI through React Native Web, with simulated SDK data/settings and substitutes for public host Settings/Modal components. The host pill uses React Native Pressable to reproduce its event behavior. These are **not screenshots of a live Paseo installation**.

Reviewed Settings, editor, list and full preview in all four combinations. Exercised draft add/edit/save, revision changes while the editor is open, settings failure/recovery without draft loss, explicit discard/reload, preview snapshot preservation during a remote edit, Composer draft preservation, pending disable, uncertain delivery without automatic retry, uncertainty retained on picker reopen, empty-library navigation and keyboard activation.

Additional browser checks passed for reorder/delete and cancellation, failed-save draft copying, Host-switch draft isolation, initial loading/error/invalid states, picker reload failure/retry, unavailable/removed Agents and long multiline previews. Source preview checks found no horizontal overflow at the reviewed widths and kept send/recovery controls reachable with a long body. Native keyboard, safe-area and screen-reader behavior are still part of the live runtime follow-up.

Ignored local evidence: `artifacts/prompt-palette/` contains the harness, browser verification scripts and screenshots. Preview dependencies are reused from a separate ignored harness and do not enter workspace dependencies.

## Runtime limits

No plugin installation/reload/update, live Agent message, daemon restart, native mobile rendering or Git activation/update was performed. The repository permits lifecycle commands only when that runtime step is requested. Actual beta daemon/app Modal integration, Settings persistence and Provider behavior for active turns remain unverified. A source preview cannot establish native keyboard/sheet behavior or end-to-end daemon acknowledgement.

No new release was published and the existing tag remains unchanged.
