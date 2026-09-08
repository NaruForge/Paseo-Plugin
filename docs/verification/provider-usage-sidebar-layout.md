# Provider Usage sidebar ownership

Date: 2026-09-09. Tracking: [#86](https://github.com/NaruForge/Paseo-Plugin/issues/86). Exact SDK: 0.8.0-beta.1.

## Change

Provider Usage always registers the existing `main` sidebar item in its client entry. Paseo Settings → Layout controls its visibility. The plugin no longer removes that item based on its own settings or duplicates Layout with a Sidebar switch. Command Center access remains available.

The `display` document advances from v1 to v2. Its host migration strips the retired `visibility.sidebar` field while preserving `visibility.composerPill` and all three `pill` fields. Missing values use defaults; invalid retained values and unsupported migration versions fail rather than resetting saved preferences. The old Sidebar value is not copied to Paseo Layout, and the plugin neither reads nor writes Layout preferences. The unchanged contribution ID preserves any existing host Layout choice. Downgrading to v1 code can report the newer document as invalid.

## Verification

- Provider Usage typecheck and **36 tests** passed.
- Migration coverage checks all **32** combinations of the previous five booleans, input immutability, malformed retained values, missing defaults and unsupported versions.
- Client-entry tests verify one stable sidebar registration during loading, error, invalid settings, pill off and pill on. Visibility polling never unregisters/re-registers it. Existing pill retry, stale-response, provider registration and disposal tests pass.
- Exact beta.1 compiler passed on a temporary source copy without node_modules: client 35,476 bytes, server 6,750 bytes.
- Documentation sync and Git-source import checks passed. Runtime ID, manifest, SDK dependencies and workspace structure are unchanged.

## UI review

Grade **C**: remove one settings row and its registration condition; affected layout/state axes only. Chrome + React Native Web source preview in dark mode at **1280×900** and **390×844** showed four switches, no Sidebar switch, no horizontal overflow and correct labels. Pending disables controls; conflict keeps saved values; Reload, invalid recovery and keyboard Tab/Space passed. Light mode was omitted because no colors, theme tokens or component styling changed. Branch Garden and usage reading cards are unaffected.

The preview renders the actual Settings form with simulated host controls/persistence. Local ignored screenshots and the test harness are in `artifacts/sidebar-layout/`. This is not native Paseo Layout or live migration verification. No plugin install/reload, Layout mutation or daemon restart was performed for this change. The earlier [0.8 source record](provider-usage-0.8-source.md) describes the original five-option implementation at its own checkpoint.
