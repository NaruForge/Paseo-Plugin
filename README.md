# Paseo Plugins

[한국어](README.ko.md) · [Plugin guides](#plugins) · [Compatibility](docs/COMPATIBILITY.md) · [Support](SUPPORT.md) · [Contributing](CONTRIBUTING.md)

[![Validate](https://github.com/NaruForge/Paseo-Plugin/actions/workflows/validate.yml/badge.svg)](https://github.com/NaruForge/Paseo-Plugin/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Four independently installable plugins for Git workspace visibility, provider usage, reusable prompts and Windows command execution while working with Paseo agents.

Maintained by **NaruForge and contributors**. This is a community project, independently maintained and not endorsed or operated by the Paseo team.

**Release candidate: collection v0.1.0-rc.4 supports Paseo 0.9.x stable and the verified 0.10.0-beta.1 beta.** Manifests declare `requirements.paseo: >=0.9.0 <0.10.0-beta.2`, SDKs are pinned to exact 0.9.2, and CI also checks the 0.10.0-beta.1 SDK. Later betas and final 0.10.0 are rejected at load time until they are verified; see [Paseo version channels](docs/COMPATIBILITY.md#paseo-version-channels). The collection remains a prerelease; see the [0.9.2 / 0.10.0-beta.1 evidence and limitations](docs/verification/paseo-0.9.2-0.10.0-beta.1.md). Keep [v0.1.0-rc.3](https://github.com/NaruForge/Paseo-Plugin/releases/tag/v0.1.0-rc.3) for Paseo 0.8.0 and [v0.1.0-rc.2](https://github.com/NaruForge/Paseo-Plugin/releases/tag/v0.1.0-rc.2) for Paseo 0.7.2.

Provider Usage uses Paseo’s official usage API. Branch Garden remains preview; the other plugins remain experimental. Prior [0.8 runtime](docs/verification/paseo-0.8-runtime.md) and [Git-source](docs/verification/paseo-0.8-git-source.md) reports retain their original scope.

## Plugins

| Plugin | What it does | Requirements | Maturity |
| --- | --- | --- | --- |
| [`branch-garden`](plugins/branch-garden/) | Inspect registered Git projects, workspaces, branches and worktrees without changing Git state. | Paseo 0.9.x or 0.10.0-beta.1; Git; registered projects or workspaces | Preview; v0.1.0-rc.4 |
| [`command-deck`](plugins/command-deck/) | Save Project commands and run, inspect and stop PowerShell terminals from the Composer. | Windows Host, PowerShell 7, Paseo 0.9.x or 0.10.0-beta.1 | Experimental, v0.1.0-rc.4; app runtime verification pending |
| [`prompt-palette`](plugins/prompt-palette/) | Save reusable prompts in Host Settings, preview and send them from the Agent Composer. | Paseo 0.9.x or 0.10.0-beta.1; existing Agent with a Workspace | Experimental, v0.1.0-rc.4 |
| [`provider-usage`](plugins/provider-usage/) | Inspect enabled Provider usage through Paseo, with configurable pills and a sidebar managed by Paseo Layout. | Paseo 0.9.x or 0.10.0-beta.1; enabled provider connections | Experimental; v0.1.0-rc.4 |

Branch Garden and Provider Usage are maintained as this repository's core offering; this does not imply Paseo-team support. Prompt Palette and Command Deck remain experimental. Branch Garden's interface is in English. Provider Usage remains experimental at the provider integration boundary and still includes Korean status messages. Each English guide includes representative screenshots from the installed Paseo 0.8.0 Windows app; see the [capture scope](docs/verification/plugin-screenshots-0.8.0.md).

## Install one plugin

1. Use a **Paseo 0.9.x stable or 0.10.0-beta.1** daemon, app and CLI. The daemon and app check the range separately. Install the tools listed in the plugin guide on the daemon host.
2. In Paseo **Settings → Plugins**, enable plugins if you choose to trust them.
3. Review the release source and choose one command:

```sh
paseo plugin add NaruForge/Paseo-Plugin:plugins/branch-garden --ref v0.1.0-rc.4
paseo plugin add NaruForge/Paseo-Plugin:plugins/provider-usage --ref v0.1.0-rc.4
paseo plugin add NaruForge/Paseo-Plugin:plugins/prompt-palette --ref v0.1.0-rc.4
paseo plugin add NaruForge/Paseo-Plugin:plugins/command-deck --ref v0.1.0-rc.4
```

No npm installation is required. `--ref` pins the tag; a pinned installation does not advance on `plugin update`. Omitting `--ref` tracks main. When Paseo publishes a newer beta, a later collection release widens the range after verification: change the pinned ref to that release, or track main and run `paseo plugin update`. Command Deck requires a Windows host and PowerShell 7. See [Git installation and Settings-preserving upgrade/rollback guidance](docs/GIT_INSTALLATION.md).

```sh
paseo plugin ls
paseo plugin logs branch-garden
```

Expect the chosen runtime to be `running` without load errors. The manifest ID is the default runtime ID; use the actual ID in later commands if installed with `--id`. Installations are per daemon. Remote commands use `paseo --host <host> plugin ls`. See the plugin guides above for actions and [configuration](docs/CONFIGURATION.md#update-and-remove) for maintenance.

**Legacy Paseo 0.7.2:** only Branch Garden and Provider Usage are available at `v0.1.0-rc.2`. Preserve that tag until upgrading both daemon and app. Use these pinned commands and the corresponding tagged guides:

```sh
paseo plugin add NaruForge/Paseo-Plugin:plugins/branch-garden --ref v0.1.0-rc.2
paseo plugin add NaruForge/Paseo-Plugin:plugins/provider-usage --ref v0.1.0-rc.2
```

## Evaluate current source

The v0.1.0-rc.4 collection includes all four plugins. Use a **0.9.x stable or 0.10.0-beta.1** daemon, app and CLI and read the [0.9.2 / 0.10.0-beta.1 evidence](docs/verification/paseo-0.9.2-0.10.0-beta.1.md). Git add/update/recovery for the three existing plugins on 0.8 is recorded in the [Git source verification](docs/verification/paseo-0.8-git-source.md); Command Deck Git activation remains unverified.

For local source evaluation, clone this repository on the daemon host, enter its root, and review the selected commit before installing. Git is needed to clone; npm is only needed for development checks. Run in PowerShell or a POSIX shell:

```sh
git clone https://github.com/NaruForge/Paseo-Plugin.git
cd Paseo-Plugin
git rev-parse HEAD
```

If you already have a checkout, use that repository root and review its ref and local changes. Follow the directory installation steps in the [Branch Garden](plugins/branch-garden/README.md#install), [Provider Usage](plugins/provider-usage/README.md#installation), [Prompt Palette](plugins/prompt-palette/README.md#install-current-source), or [Command Deck](plugins/command-deck/README.md#install-current-source) guide. These examples use PowerShell on the daemon host; choose a separate `--id` when another source is already installed under the default ID.

For Paseo 0.9.x or 0.10.0-beta.1, review and pin `v0.1.0-rc.4`. Keep `v0.1.0-rc.3` for 0.8.0 and `v0.1.0-rc.2` for 0.7.2. Choose **one** command:

```sh
paseo plugin add NaruForge/Paseo-Plugin:plugins/branch-garden --ref v0.1.0-rc.4
paseo plugin add NaruForge/Paseo-Plugin:plugins/provider-usage --ref v0.1.0-rc.4
paseo plugin add NaruForge/Paseo-Plugin:plugins/prompt-palette --ref v0.1.0-rc.4
paseo plugin add NaruForge/Paseo-Plugin:plugins/command-deck --ref v0.1.0-rc.4
```

The command pins the reviewed v0.1.0-rc.4 tag. See [Git source details](docs/GIT_INSTALLATION.md) for branch tracking, remote hosts and rollback.

**Configuration:** No plugin needs a custom host settings file. Provider Usage stores display preferences, Prompt Palette stores its library, and Command Deck stores Project commands in built-in Host Settings. Removal deletes those values; record preferences and copy prompts and commands first. Command Deck also deletes its installation identifier; existing terminals are not killed and are not adopted after reinstall. See [prerequisites and removal guidance](docs/CONFIGURATION.md).

## Trust and privacy

Paseo plugins are trusted, unsandboxed code. The backend has the daemon user's filesystem, process and network access. Review source before installing. Git and usage inspection are read-only. Prompt Palette saves settings and sends Agent messages on explicit user action. Command Deck saves commands and runs user-selected PowerShell with the daemon user's privileges, and can send Ctrl+C or terminate an owned terminal on explicit action. These are implementation boundaries, not an OS sandbox.

[Security and data access](SECURITY.md) lists the files, commands and endpoints used by each plugin. The plugins do not directly modify Git state or provider authentication. Prompt Palette can start Agent work under the Agent's existing permissions. Saved Command Deck commands can read or write files, start processes and use the network under the daemon account.

## Develop

```sh
npm ci
npm run check
```

Node.js 22 and npm are used in CI. The check command validates documentation, Git-source imports, release metadata, all workspace types, and all tests on Windows, macOS and Linux. `npm run check:paseo-channel -- beta` repeats type checks and tests with the verified beta SDK without changing package files; CI runs it too. See [Contributing](CONTRIBUTING.md), [Design rules](docs/DESIGN.md) and [the Korean development guide](README.ko.md).

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

[`plugins.json`](plugins.json) is this repository's descriptive catalog, checked against the actual manifests. It is not a Paseo registry format. `paseoVersion` is the exact stable SDK, `paseoRange` the manifest `requirements.paseo`, and `paseoBetaVersion` the exact verified beta. A plugin entry’s field overrides the catalog default, allowing independently migrated workspaces to retain exact SDK checks.

## Removed plugins

Five previously developed plugins have been removed before the first public release. Existing installations must be removed explicitly; updating this repository does not uninstall them. See [removal instructions](docs/REMOVED_PLUGINS.md).

## Maintenance

[Changelog](CHANGELOG.md) · [Release process](docs/RELEASING.md) · [Support](SUPPORT.md) · [Security reports](SECURITY.md) · [Issue tracker](https://github.com/NaruForge/Paseo-Plugin/issues)

Use the issue forms for bugs and proposals. English and Korean reports are welcome. The maintainer tracks work in GitHub Issues; you do not need access to the maintainer's private Project to contribute.

Upstream: [Plugin versions](https://paseo.sh/docs/plugins) · [current reference](https://paseo.sh/docs/plugins/reference) · [v0.8 reference](https://paseo.sh/docs/plugins/v0.8/reference) · [v0.7 reference](https://paseo.sh/docs/plugins/v0.7/reference) · [Community projects](https://paseo.sh/docs/community)
