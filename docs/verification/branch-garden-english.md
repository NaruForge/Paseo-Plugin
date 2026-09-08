# Branch Garden English UI and plugin screenshots

Date: 2026-09-08. Tracking: [Issue #74](https://github.com/NaruForge/Paseo-Plugin/issues/74) and [PR #75](https://github.com/NaruForge/Paseo-Plugin/pull/75). Target: Paseo 0.7.2 on the local Windows daemon and Chrome web client.

## Scope and checks

Branch Garden's headings, filters, counts, branch reasons, workspace states, loading/empty/error messages, generated server warnings and accessible names are English. Scan times use English 24-hour formatting in the client's local time zone. Repository/workspace/branch names and diagnostic details from external tools retain their original text.

The change does not modify Git commands, scanning or branch-classification logic. Existing server tests now expect the translated messages; Unicode path fixtures remain unchanged. Workspace typechecking and all 27 Branch Garden tests passed, including the read-only command allowlist and real Git state-preservation tests. A runtime-source scan found no remaining Korean literals; Korean test descriptions and Unicode path fixtures are not UI copy.

At implementation commit `8a87a24cf7e725d68cd43a6894b205ee63e966b8`, root `npm run check` also passed locally: documentation synchronization, Git-source imports, release metadata, both workspace typechecks and all 50 tests (27 Branch Garden, 23 Provider Usage). [Windows, macOS and Ubuntu CI](https://github.com/NaruForge/Paseo-Plugin/actions/runs/34180897224) passed for that commit. Later documentation corrections are tracked in PR #75; they do not change the runtime reviewed here.

## Live UI validation

UI impact **C**: text lengths and line wrapping, plus accessible selection/expansion state. Checked the actual running plugin at 1440×1100 and 390×844 in light theme. Both layouts showed English scan totals, warnings, status captions, branch reasons, workspaces and filters without horizontal overflow (surface widths 1120 and 390 respectively).

Exercised the Needs review and empty Cleanup candidates filters, repository collapse/expand and kept-branch expansion. The existing unknown-base-ref warning displayed in English. Web inspection also revealed that `accessibilityState` alone did not expose selected/expanded state in this host, so explicit React Native `aria-selected` and `aria-expanded` props were added and verified in the rendered DOM. Loading and failure copy was reviewed in source; backend failure paths are covered by the existing server tests rather than a forced failure of the live daemon.

Dark-theme repetition was omitted because theme tokens, colors and layout structure did not change. No native mobile or screen-reader session was performed. The daemon was not restarted. The actual `branch-garden` directory runtime was reloaded after typechecking and remained running; Provider Usage also remained running.

## Published images

- Branch Garden: [overview](../screenshots/branch-garden/overview.png) and [compact repository detail](../screenshots/branch-garden/repository-compact.png), captured from the live plugin. The review filter limits visible repository identities to this public repository. No example data or fabricated UI was substituted.
- Provider Usage: [user-supplied composer image](../screenshots/provider-usage/composer-pill.jpg), copied unchanged with the user's instruction to show the remaining quota. Only the composer/pill is presented in its README; no dashboard image is included. Provider Usage's implementation is unchanged.

All three images were visually inspected before inclusion. Screenshot values describe the capture moment and are not current usage guarantees.
