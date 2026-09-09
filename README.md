# Paseo Plugins

[한국어](README.ko.md) · [Plugin guides](#plugins) · [Compatibility](docs/COMPATIBILITY.md) · [Contributing](CONTRIBUTING.md)

[![Validate](https://github.com/NaruForge/Paseo-Plugin/actions/workflows/validate.yml/badge.svg)](https://github.com/NaruForge/Paseo-Plugin/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Three independently installable plugins for Git workspace visibility, provider usage and reusable prompts while working with Paseo agents.

Maintained by **NaruForge and contributors**. This is a community project, independently maintained and not endorsed or operated by the Paseo team.

**Published release target: Paseo 0.7.2.** The Plugin API is experimental. See the [compatibility and verification record](docs/COMPATIBILITY.md) before using another version. The first public prerelease, [v0.1.0-rc.2](https://github.com/NaruForge/Paseo-Plugin/releases/tag/v0.1.0-rc.2), includes pinned installation instructions and known limitations.

**Current source:** All three plugins target exact **0.8.0-beta.1**. Provider Usage uses the official host usage API and adds display Settings. Live beta daemon/app verification is pending; see its [source verification](docs/verification/provider-usage-0.8-source.md). The existing `v0.1.0-rc.2` tag preserves both 0.7 plugins. See the [migration plan](docs/MIGRATION_0.8.md), [source verification](docs/verification/branch-garden-0.8-source.md) and [#77](https://github.com/NaruForge/Paseo-Plugin/issues/77).

## Plugins

| Plugin | What it does | Requirements | Maturity |
| --- | --- | --- | --- |
| [`branch-garden`](plugins/branch-garden/) | Inspect registered Git projects, workspaces, branches and worktrees without changing Git state. | Current source: Paseo 0.8.0-beta.1; Git; registered projects or workspaces | Preview |
| [`prompt-palette`](plugins/prompt-palette/) | Save reusable prompts in Host Settings, preview and send them from the Agent Composer. | Paseo 0.8.0-beta.1 source | Experimental, unreleased |
| [`provider-usage`](plugins/provider-usage/) | Inspect enabled Provider usage through Paseo, with configurable pills and a sidebar managed by Paseo Layout. | Paseo 0.8.0-beta.1 source; enabled provider connections | Experimental |

Branch Garden and Provider Usage are maintained as this repository's core offering; this does not imply Paseo-team support. Branch Garden's interface is in English. Provider Usage remains experimental at the provider integration boundary and still includes Korean status messages. Their English installation guides include historical runtime screenshots.

Prompt Palette is an unreleased experimental addition. Its guide documents the current source and verification limits.

## Install one plugin

1. Install the tools listed in that plugin's guide on the **daemon host**.
2. In Paseo **Settings → Plugins**, enable plugins if you choose to trust them.
3. Run the command for the plugin you want:

```sh
paseo plugin add NaruForge/Paseo-Plugin:plugins/branch-garden --ref v0.1.0-rc.2
paseo plugin add NaruForge/Paseo-Plugin:plugins/provider-usage --ref v0.1.0-rc.2
```

Choose one command; there is no need to install the entire collection or run npm. These commands pin the 0.7-compatible release. Omitting `--ref` tracks the default branch and can pick up a future 0.8 migration. Select a reviewed compatible tag or commit from [Releases](https://github.com/NaruForge/Paseo-Plugin/releases). A pinned tag does not advance on `plugin update`. See [Git installation and rollback](docs/GIT_INSTALLATION.md).

```sh
paseo plugin ls
paseo plugin logs branch-garden
paseo plugin update branch-garden
```

The manifest ID is the default runtime ID. If you install with `--id`, use that ID in later commands. Installations are per daemon. For 0.8 CLI operations, `--host` is global: `paseo --host <host> plugin ls`. Choose daemon and app versions for the plugin and ref being installed; the pinned commands above target 0.7.2.

Prompt Palette is not included in `v0.1.0-rc.2`. After a reviewed commit containing it is published, install that ref on a compatible beta Host and app:

```sh
paseo plugin add NaruForge/Paseo-Plugin:plugins/prompt-palette --ref <reviewed-prompt-palette-ref>
```

Replace the placeholder with the reviewed commit or tag. For current local development, use the [plugin guide](plugins/prompt-palette/README.md).

**Configuration:** No plugin needs a custom host settings file. Prompt Palette stores its library in built-in Host Settings. See [prerequisites and removal guidance](docs/CONFIGURATION.md).

## Trust and privacy

Paseo plugins are trusted, unsandboxed code. The backend has the daemon user's filesystem, process and network access. Review source before installing. Git and usage inspection are read-only; Prompt Palette saves settings and sends Agent messages on user action. These are implementation boundaries, not an OS sandbox.

[Security and data access](SECURITY.md) lists the files, commands and endpoints used by each plugin. The plugins do not directly modify Git state or provider authentication. Prompt Palette can start Agent work under the Agent's existing permissions.

## Develop

```sh
npm ci
npm run check
```

Node.js 22 and npm are used in CI. The check command validates documentation, Git-source imports, release metadata, all workspace types, and all tests on Windows, macOS and Linux. See [Contributing](CONTRIBUTING.md), [Design rules](docs/DESIGN.md) and [the Korean development guide](README.ko.md).

## Repository structure

```text
.
├── plugins/
│   ├── branch-garden/
│   ├── provider-usage/
│   └── prompt-palette/
├── docs/
│   ├── CONFIGURATION.md
│   ├── COMPATIBILITY.md
│   ├── RELEASING.md
│   ├── DESIGN.md
│   └── verification/
├── scripts/
├── .github/
├── plugins.json
├── README.ko.md
└── package.json
```

[`plugins.json`](plugins.json) is this repository's descriptive catalog, checked against the actual manifests. It is not a Paseo registry format. A plugin entry’s `paseoVersion` overrides the catalog default, allowing independently migrated workspaces to retain exact SDK checks.

## Removed plugins

Five previously developed plugins have been removed before the first public release. Existing installations must be removed explicitly; updating this repository does not uninstall them. See [removal instructions](docs/REMOVED_PLUGINS.md).

## Maintenance

[Changelog](CHANGELOG.md) · [Release process](docs/RELEASING.md) · [Support](SUPPORT.md) · [Security reports](SECURITY.md) · [Issue tracker](https://github.com/NaruForge/Paseo-Plugin/issues)

Use the issue forms for bugs and proposals. English and Korean reports are welcome. The maintainer tracks work in GitHub Issues; you do not need access to the maintainer's private Project to contribute.

Upstream: [Plugin versions](https://paseo.sh/docs/plugins) · [v0.7 reference for the published release](https://paseo.sh/docs/plugins/v0.7/reference) · [v0.8 beta reference](https://paseo.sh/docs/plugins/v0.8/reference) · [Migration](https://paseo.sh/docs/plugins/v0.8/migration) · [Community projects](https://paseo.sh/docs/community)
