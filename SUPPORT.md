# Support and maintenance

This repository is maintained by **NaruForge and contributors** as a community project. It is not operated or endorsed by the Paseo team. Support is best effort, with no service-level or response-time guarantee.

- Report reproducible problems with the [bug form](https://github.com/NaruForge/Paseo-Plugin/issues/new?template=03-bug.yml).
- Propose changes with the [idea form](https://github.com/NaruForge/Paseo-Plugin/issues/new?template=01-idea.yml).
- Report vulnerabilities through the private route in [SECURITY.md](SECURITY.md).

English and Korean reports are welcome. Include plugin runtime ID, installed commit/tag, Paseo daemon and client versions, daemon OS, client platform, reproduction steps and redacted logs. Do not attach authentication files or raw environment dumps.

## Support policy

Core support covers Branch Garden and Provider Usage. Prompt Palette and Command Deck are experimental additions; source-evaluation reports are welcome through the same bug form. Command Deck is Windows-only and its installed app/mobile interaction is not yet verified. Current Provider Usage delegates integrations to Paseo; the published 0.7 implementation uses experimental supplier endpoints. Five earlier plugins were removed before the first public release; see [removal guidance](docs/REMOVED_PLUGINS.md).

The v0.1.0-rc.4 source supports **Paseo 0.9.x stable and the verified 0.10.0-beta.1 beta** (`requirements.paseo: >=0.9.0 <0.10.0-beta.2`); v0.1.0-rc.3 remains pinned to 0.8.0 and v0.1.0-rc.2 to 0.7.2. Keep daemon, app and CLI inside the supported range. The current [verification record](docs/verification/paseo-0.9.2-0.10.0-beta.1.md) distinguishes source/compiler/CI checks, the live 0.10.0-beta.1 reload and untested native runtime behavior. Previous 0.8 and 0.9.0-beta.2 reports do not certify these versions.

Before 1.0, breaking changes can occur in minor releases and are documented in the changelog. Release candidates are for evaluation. Only the latest release in the active minor line receives routine fixes; use a reviewed tag/commit and retain the previous source reference for rollback.

For published releases, if a plugin cannot follow upstream safely, set its catalog maturity to `experimental` and explain the limitations in its guide. If retiring it, announce deprecation in the guide and changelog with migration/removal instructions before removal in a later minor release. The catalog's allowed maturity values are `preview`, `experimental` and `stable`; it has no `deprecated` value. No fixed calendar commitment is made. Preserve prior tags and release notes.

## Troubleshooting first steps

Run `paseo plugin ls` against the intended host, then `paseo plugin logs <runtime-id>`. Check the plugin's prerequisites and host configuration. After editing directory source, use `paseo plugin reload <runtime-id>`; after updating Git source, use `paseo plugin update <runtime-id>`. Restarting the daemon is not a plugin troubleshooting step.

Use `paseo --host <target> plugin ls` for remote state and include both daemon and app versions in reports. A missing `requirements.paseo` is treated as `<0.8.0`; an old `index.ts` needs the full runtime-entry migration. A `^0.8.0` manifest is rejected on 0.9, and a `^0.9.0` manifest on 0.10.0-beta.1. A newer Paseo beta or release outside the current range is rejected until it is verified; report it with the exact daemon/app versions and see [version channels](docs/COMPATIBILITY.md#paseo-version-channels). Use compatible source or complete the migration. `plugin ls` reports runtime/source/commit/load errors; `plugin status` checks the remote update ref.
