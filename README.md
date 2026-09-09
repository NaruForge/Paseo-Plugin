# Paseo Plugins

[한국어](README.ko.md) · [Plugin guides](#plugins) · [Compatibility](docs/COMPATIBILITY.md) · [Support](SUPPORT.md) · [Contributing](CONTRIBUTING.md)

[![Validate](https://github.com/NaruForge/Paseo-Plugin/actions/workflows/validate.yml/badge.svg)](https://github.com/NaruForge/Paseo-Plugin/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Four independently installable plugins for Git workspace visibility, provider usage, reusable prompts and Windows command execution while working with Paseo agents.

Maintained by **NaruForge and contributors**. This is a community project, independently maintained and not endorsed or operated by the Paseo team.

**Published release target: Paseo 0.7.2.** The Plugin API is experimental. See the [compatibility and verification record](docs/COMPATIBILITY.md) before using another version. The first public prerelease is [v0.1.0-rc.2](https://github.com/NaruForge/Paseo-Plugin/releases/tag/v0.1.0-rc.2); copy the pinned `NaruForge/` commands in this README to install that tag. The release notes and tagged guides keep historical GitHub-owner examples from before the repository moved to NaruForge, and some tagged install samples omit `--ref`.

**Current source:** All four plugins target exact **0.8.0-beta.1**. Provider Usage uses the official host usage API and adds display Settings. The user has completed runtime verification of Branch Garden, Provider Usage and Prompt Palette on Paseo 0.8; see the [runtime record and reported scope](docs/verification/paseo-0.8-runtime.md). Command Deck has separate [source and Windows terminal evidence](docs/verification/command-deck-0.8-source.md); installed app/mobile verification remains pending. Git installation/update verification is tracked separately in [#96](https://github.com/NaruForge/Paseo-Plugin/issues/96). The existing `v0.1.0-rc.2` tag preserves both 0.7 plugins. For current source, follow [0.8 evaluation](#evaluate-current-08-source); developers can consult the [migration plan](docs/MIGRATION_0.8.md).

## Plugins

| Plugin | What it does | Requirements | Maturity |
| --- | --- | --- | --- |
| [`branch-garden`](plugins/branch-garden/) | Inspect registered Git projects, workspaces, branches and worktrees without changing Git state. | Current source: Paseo 0.8.0-beta.1; Git; registered projects or workspaces | Preview; 0.7 release, unreleased 0.8 changes |
| [`command-deck`](plugins/command-deck/) | Save Project commands and run, inspect and stop PowerShell terminals from the Composer. | Windows Host, PowerShell 7, Paseo 0.8.0-beta.1 | Experimental, unreleased; app runtime verification pending |
| [`prompt-palette`](plugins/prompt-palette/) | Save reusable prompts in Host Settings, preview and send them from the Agent Composer. | Paseo 0.8.0-beta.1 source; existing Agent with a Workspace | Experimental, unreleased |
| [`provider-usage`](plugins/provider-usage/) | Inspect enabled Provider usage through Paseo, with configurable pills and a sidebar managed by Paseo Layout. | Paseo 0.8.0-beta.1 source; enabled provider connections | Experimental; 0.7 release, unreleased 0.8 changes |

Branch Garden and Provider Usage are maintained as this repository's core offering; this does not imply Paseo-team support. Prompt Palette and Command Deck are unreleased experimental additions. Branch Garden's interface is in English. Provider Usage remains experimental at the provider integration boundary and still includes Korean status messages. Each English guide includes a representative image and labels historical 0.7 captures separately from simulated 0.8 source previews.

## Install one plugin

1. Install the tools listed in that plugin's guide on the **daemon host**.
2. In Paseo **Settings → Plugins**, enable plugins if you choose to trust them.
3. On **Paseo 0.7.2**, run one command below. For **0.8 source**, skip these release commands and use [the evaluation route](#evaluate-current-08-source).

```sh
paseo plugin add NaruForge/Paseo-Plugin:plugins/branch-garden --ref v0.1.0-rc.2
paseo plugin add NaruForge/Paseo-Plugin:plugins/provider-usage --ref v0.1.0-rc.2
```

Choose one command; there is no need to install the entire collection or run npm. These commands pin the 0.7-compatible release. Omitting `--ref` tracks the default branch, which already contains 0.8 source and is incompatible with 0.7. Select a reviewed compatible tag or commit from [Releases](https://github.com/NaruForge/Paseo-Plugin/releases). A pinned tag does not advance on `plugin update`. See [Git installation and rollback](docs/GIT_INSTALLATION.md).

```sh
paseo plugin ls
paseo plugin logs branch-garden
```

The manifest ID is the default runtime ID. If you install with `--id`, use that ID in later commands. Installations are per daemon. For 0.8 CLI operations, `--host` is global: `paseo --host <host> plugin ls`. Choose daemon and app versions for the plugin and ref being installed; the pinned commands above target 0.7.2.

Expect the chosen runtime to be `running` without load errors. Use the release’s versioned [Branch Garden guide](https://github.com/NaruForge/Paseo-Plugin/blob/v0.1.0-rc.2/plugins/branch-garden/README.md#use) or [Provider Usage guide](https://github.com/NaruForge/Paseo-Plugin/blob/v0.1.0-rc.2/plugins/provider-usage/README.md#use) for 0.7 behavior. Those historical guides preserve old command examples; use this README’s pinned installation and current maintenance instructions. Current-source guides are linked in the table above. For later maintenance, see [updates and removal](docs/CONFIGURATION.md#update-and-remove).

## Evaluate current 0.8 source

Current source includes Command Deck alongside the three existing plugins; it is not a new collection release. Match the daemon, app and CLI to **0.8.0-beta.1** and read the [reported runtime scope](docs/verification/paseo-0.8-runtime.md). Git deployment verification remains in #96.

For local source evaluation, clone this repository on the daemon host, enter its root, and review the selected commit before installing. Git is needed to clone; npm is only needed for development checks. Run in PowerShell or a POSIX shell:

```sh
git clone https://github.com/NaruForge/Paseo-Plugin.git
cd Paseo-Plugin
git rev-parse HEAD
```

If you already have a checkout, use that repository root and review its ref and local changes. Follow the directory installation steps in the [Branch Garden](plugins/branch-garden/README.md#install), [Provider Usage](plugins/provider-usage/README.md#installation), [Prompt Palette](plugins/prompt-palette/README.md#install-current-source), or [Command Deck](plugins/command-deck/README.md#install-current-source) guide. These examples use PowerShell on the daemon host; choose a separate `--id` when another source is already installed under the default ID.

For Git source evaluation, choose an existing published commit or tag that contains the plugin and that you have reviewed. Do not use `v0.1.0-rc.2` for 0.8 source; that tag is the 0.7.2 release and does not include Prompt Palette or Command Deck. Choose **one** command:

```sh
paseo plugin add NaruForge/Paseo-Plugin:plugins/branch-garden --ref <reviewed-0.8-ref>
paseo plugin add NaruForge/Paseo-Plugin:plugins/provider-usage --ref <reviewed-0.8-ref>
paseo plugin add NaruForge/Paseo-Plugin:plugins/prompt-palette --ref <reviewed-0.8-ref>
paseo plugin add NaruForge/Paseo-Plugin:plugins/command-deck --ref <reviewed-0.8-ref>
```

Replace the placeholder with that actual reviewed commit or tag; it is not a literal ref. See [Git source details](docs/GIT_INSTALLATION.md) for branch tracking, remote hosts and rollback.

**Configuration:** No plugin needs a custom host settings file. Provider Usage stores display preferences, Prompt Palette stores its library, and Command Deck stores Project commands in built-in Host Settings. Removal deletes those values; record preferences and copy prompts and commands first. Command Deck also deletes its installation identifier; existing terminals are not killed and are not adopted after reinstall. See [prerequisites and removal guidance](docs/CONFIGURATION.md).

## Trust and privacy

Paseo plugins are trusted, unsandboxed code. The backend has the daemon user's filesystem, process and network access. Review source before installing. Git and usage inspection are read-only. Prompt Palette saves settings and sends Agent messages on explicit user action. Command Deck saves commands and runs user-selected PowerShell with the daemon user's privileges, and can send Ctrl+C or terminate an owned terminal on explicit action. These are implementation boundaries, not an OS sandbox.

[Security and data access](SECURITY.md) lists the files, commands and endpoints used by each plugin. The plugins do not directly modify Git state or provider authentication. Prompt Palette can start Agent work under the Agent's existing permissions. Saved Command Deck commands can read or write files, start processes and use the network under the daemon account.

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
│   ├── prompt-palette/
│   └── command-deck/
├── docs/
│   ├── CONFIGURATION.md
│   ├── COMPATIBILITY.md
│   ├── GIT_INSTALLATION.md
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
