# Provider Usage reset display selection

Date: 2026-09-09. Scope: local source for issue #88, targeting exact SDK 0.8.0-beta.1.

## Behavior

- Host settings v3 adds `resetTimeFormat`: `date-time` (default) or `time-remaining`. Migration accepts v1/v2, preserves the four existing boolean choices, and strips the retired Sidebar field.
- Settings uses the public `SettingsSelect` declaration and the existing revision-aware save flow. The choice applies to Usage window/balance resets and Composer pills; the pill reset visibility switch remains independent.
- Pills omit Reset/Resets. Same-day dates show the time; other dates retain date and time. Durations use at most two nonzero units, such as `2h 15m` or `6d 3h`. Missing/invalid values show an em dash. Accessibility labels retain reset context.
- Remaining durations use client wall time, updated every 30 seconds while mounted. Timers clean up on disable/unmount and do not request usage. Delayed ticks use current wall time. Values below one minute show `<1m`; passed deadlines show `Due` (pill) / `Reset due` (surface), without asserting that the quota refreshed.

## Validation

- Provider Usage workspace typecheck and all 39 tests passed, including v1/v2 migration, exclusive format validation, duration boundaries, compact formatting, missing values, visibility, query/provider safety and clock cleanup.
- Documentation sync, Git-source runtime import check and `git diff --check` passed.
- Official v0.8 quickstart/reference and the installed exact beta.1 `SettingsSelect` declaration were checked. No private API or runtime dependencies added.
- UI grade C: actual Settings form, pill and surface source rendered with React Native Web in isolated Chrome at 1280px wide and 390px compact, dark theme. Screenshots inspected. Verified select default/change, pending disabled state, keyboard selection, retained preference with hidden pill time, conflict/reload, minute advancement and passed deadline.
- Light theme omitted because no colors, theme tokens or styles changed. Host Settings controls, provider data and persistence were simulated; this is not native Paseo app/runtime validation. The countdown clock was advanced with Playwright. Preview console had only a missing favicon resource error.

These checks were completed locally before publication. No plugin install, reload or daemon restart was performed; the linked pull request records subsequent CI and merge status.

