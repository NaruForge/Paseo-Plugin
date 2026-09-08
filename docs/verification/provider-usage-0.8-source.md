# Provider Usage 0.8 source verification

Date: 2026-09-09. Tracking: [#84](https://github.com/NaruForge/Paseo-Plugin/issues/84), under [#77](https://github.com/NaruForge/Paseo-Plugin/issues/77). Target: exact Paseo **0.8.0-beta.1**, Windows source checks. This record is not live beta daemon/app certification.

## Changes

- Split the mixed entry into client/server entries and move modules into client/server/shared runtime directories. Keep installation ID `provider-usage`, RPC `provider-usage.snapshot`, surface `main` and pill `usage`. Remove obsolete Vitest SDK stubs, use actual shared `defineRpc`/`defineSettings`, pin SDK beta.1 and declare `requirements.paseo: ^0.8.0`.
- Replace credential-file/environment parsing and direct vendor HTTP with handler-context `paseo.providers.snapshot()` and `listUsage()`. Include all globally enabled connections, independently of catalog availability or Agent activity. Unknown/custom Provider IDs are allowed. Disabled cached readings are excluded; missing usage remains unavailable. Preserve windows, balances, resets and details without inventing zero in the adapter.
- Register **Provider Usage Settings** with host-scoped `display`, schema version 1. Defaults: Composer pill on, Sidebar off, remaining percentage on, provider name on, reset time off. Saves use loaded revisions, disable concurrent controls and report failures without overwriting values. Invalid documents require explicit default restoration.
- Keep Command Center access to surface/settings when the sidebar is hidden. Local visibility saves refresh registrations immediately; other clients converge through a 30-second settings read because beta.1 has no public entry-level settings subscription. Pill fields use the live `useSettings` hook. Cleanup removes subscriptions, pills/sidebar and the visibility timer; late responses do not revive disposed contributions.

## Native usage comparison

The published beta.1 SDK declarations and daemon quota-fetcher implementation were inspected without reading user credentials or calling vendor APIs.

| Concern | Previous direct implementation | Current SDK adapter |
| --- | --- | --- |
| Provider scope | Codex/Grok allowlist | Every `enabled` global catalog connection; host determines usage support |
| Credentials | Plugin parsed files/environment | Paseo owns authentication; plugin performs no credential access |
| Codex/Grok endpoints | Plugin authenticated GETs | Beta.1 host uses the same usage services; endpoint policy belongs to Paseo |
| Codex file lookup | First syntactically parseable file, even without a usable token | Native fetcher searches for a supported token |
| HTTP redirects | Plugin rejected redirects | Native HTTP policy is delegated to Paseo; the old plugin guarantee does not carry over |
| Refresh | Plugin's own direct reads | Host caches for five minutes; public `listUsage()` has no force-refresh argument |
| Errors | Plugin differentiated HTTP/auth failures | Native status is retained; missing result becomes unavailable, raw backend failures are replaced with generic messages |
| Missing fields | Plugin parsing | Adapter preserves unknown values; defaults already introduced by the native fetcher cannot be recovered (for example native Codex missing used percentage) |

## Source validation

- `npm run typecheck --workspace provider-usage` passed.
- `npm test --workspace provider-usage`: 28 tests passed after the final adapter/settings changes. Coverage includes arbitrary/disabled connections, missing and zero values, sanitized failures, absence of credential/HTTP/logging code, all eight pill field combinations, shared query refresh, registration cleanup and races, visibility defaults/retry/conflicts between reads/disposal.
- `node scripts/check-plugin-compiler.mjs plugins/provider-usage <exact-beta.1-server-package-directory>` passed: client and server bundles compile from a staged copy without node_modules. Final bundle sizes were 35,876 and 6,643 bytes. No daemon was started by this check.
- `npm run check` passed: docs synchronization, runtime imports, release metadata, both workspace typechecks, seven script tests and both plugin suites. After final Provider Usage copy/cleanup changes, its typecheck/28 tests, compiler, docs synchronization and runtime import checks passed again. Branch Garden retained 27 passing tests.

## UI verification

Grade **D**: new Settings screen and configurable pill fields. Chrome preview at **1280×900** and **390×844**, both light and dark, rendered the actual `UsageSettingsForm`, `UsagePill` and `MainSurface` with React Native Web. The harness substitutes public host Settings controls and persistence with simulation; screenshots are **not actual Paseo UI**. Host framing and contribution visibility shown in the harness are illustrative. Registration/visibility behavior is checked separately in unit tests.

Confirmed in the source preview: five defaults, readable labels/no horizontal overflow, save-pending disable, one write per action, every toggle, icon-only accessible label, reset label, revision-conflict feedback with unchanged values, reload, loading/error/invalid states, explicit default restoration, keyboard Tab/Space. Inspected Settings screenshots include all four layouts/themes, compact conflict and invalid recovery. The actual usage surface was also checked in all four layouts/themes, with unsupported connections, balances/details, partial failures and loading/empty/error states. All four layout/theme combinations were captured; unrelated Branch Garden layout was not re-reviewed because its visual source is unchanged.

Local ignored evidence is in `artifacts/usage-ui/`: source harness, Playwright verification script and screenshots. No preview dependencies were added to the workspace package/lockfile.

## Remaining runtime evidence

No beta daemon/app installation, plugin install/update/reload, live vendor usage query, live Settings persistence, native mobile rendering or Git-source activation/update was performed. These require a separately requested runtime step. Historical 0.7 screenshots and release evidence remain historical. This source work does not publish a new release or change the existing pinned tag.
