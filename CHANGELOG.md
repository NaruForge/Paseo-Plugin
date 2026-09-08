# Changelog

The collection uses one version/tag for all supported plugins. Published releases are listed on [GitHub](https://github.com/SWBaek/Paseo-Plugin/releases).

## 0.1.0-rc.2 — two-plugin candidate

- Convert Branch Garden's interface, accessibility labels, generated warnings/errors and scan-time display to English. Preserve user-provided names and read-only Git behavior. Explicit web accessibility states expose filter selection and repository expansion.
- Add actual Branch Garden screenshots and a user-supplied Provider Usage composer-pill image to the plugin guides.
- Focus maintenance on Branch Garden and Provider Usage. This is repository-maintainer support, not Paseo-team endorsement. Provider Usage's external integration remains experimental.
- Remove GitHub Project Board, Tailscale Dashboard, Composer Compact, Composer Skills and File Browser, including their sources, tests, guides, screenshots, catalog entries and workspace dependencies.
- Update English/Korean documentation, Issue Forms and validation to cover the two remaining plugins. Removing the retired plugins did not change the retained plugins' runtime code; the subsequent Branch Garden language update is listed above.
- Withdraw the unpublished seven-plugin release draft. Existing installs need explicit removal; see [removal and migration](docs/REMOVED_PLUGINS.md).

See [compatibility](docs/COMPATIBILITY.md) and [verification](docs/verification/0.1.0-rc.2.md). No public release is created by this cleanup.

## 0.1.0-rc.1 — withdrawn before publication

The first seven-plugin candidate introduced MIT licensing, public user/contributor documentation, release checks and security improvements. Its draft was withdrawn when the project scope narrowed. Historical source and verification remain in [Git history](https://github.com/SWBaek/Paseo-Plugin/tree/5919ab16fad941d46f2a294e981154f76297cc49).
