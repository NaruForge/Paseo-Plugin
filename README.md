# Paseo Plugins

[한국어](README.ko.md) · [Plugin guides](#plugins) · [Compatibility](docs/COMPATIBILITY.md) · [Contributing](CONTRIBUTING.md)

[![Validate](https://github.com/SWBaek/Paseo-Plugin/actions/workflows/validate.yml/badge.svg)](https://github.com/SWBaek/Paseo-Plugin/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Seven independently installable plugins for inspecting workspaces, browsing GitHub Projects, and making everyday Paseo tasks easier.

Maintained by **SWBaek and contributors**. This is a community project, independently maintained and not endorsed or operated by the Paseo team.

**Target: Paseo 0.7.2.** The Plugin API is experimental. See the [compatibility and verification record](docs/COMPATIBILITY.md) before using another version. This repository is preparing its first `0.1.0-rc.1` release; a version in package metadata is not evidence of a published release.

## Plugins

| Plugin | What it does | Requirements | Maturity |
| --- | --- | --- | --- |
| [`branch-garden`](plugins/branch-garden/) | Inspect active Git workspaces, branches and worktrees without changing Git state. | Git; active Paseo workspaces | Preview |
| [`github-project-board`](plugins/github-project-board/) | Browse your GitHub Projects as a read-only Kanban board. | GitHub CLI authentication; read:project | Preview |
| [`tailscale-dashboard`](plugins/tailscale-dashboard/) | See Tailscale connection and peer counts, with an optional verified operations dashboard. | Tailscale CLI | Preview |
| [`composer-compact`](plugins/composer-compact/) | Confirm and send /compact to the selected agent. | Provider supporting /compact | Preview |
| [`composer-skills`](plugins/composer-skills/) | Choose session skills and copy a prompt draft. | Session skills; secure browser clipboard | Preview |
| [`file-browser`](plugins/file-browser/) | Browse allowed Windows folders and download files or ZIPs over your Tailnet. | Windows; explicit roots; Tailscale for downloads | Preview |
| [`provider-usage`](plugins/provider-usage/) | Inspect Codex and Grok plan usage from existing host credentials. | Existing provider authentication | Experimental |

Client surfaces use Paseo's native plugin API. Host OS support and client support are separate: File Browser requires a Windows daemon, and Skills clipboard copying currently requires a secure web/desktop client. Native iOS/Android copying is unavailable. UI text currently includes Korean; the installation guides are available in English.

## Install one plugin

1. Install the tools listed in that plugin's guide on the **daemon host**.
2. In Paseo **Settings → Plugins**, enable plugins if you choose to trust them.
3. Run the command for the plugin you want:

```sh
paseo plugin add SWBaek/Paseo-Plugin:plugins/branch-garden
paseo plugin add SWBaek/Paseo-Plugin:plugins/github-project-board
paseo plugin add SWBaek/Paseo-Plugin:plugins/tailscale-dashboard
paseo plugin add SWBaek/Paseo-Plugin:plugins/composer-compact
paseo plugin add SWBaek/Paseo-Plugin:plugins/composer-skills
paseo plugin add SWBaek/Paseo-Plugin:plugins/file-browser
paseo plugin add SWBaek/Paseo-Plugin:plugins/provider-usage
```

Choose one command; there is no need to install the entire collection or run npm. These commands track the default branch. For a controlled installation, choose an existing tag or commit from [Releases](https://github.com/SWBaek/Paseo-Plugin/releases) and pass `--ref <tag-or-commit>`. See [Git installation and rollback](docs/GIT_INSTALLATION.md).

```sh
paseo plugin ls
paseo plugin logs branch-garden
paseo plugin update branch-garden
```

The manifest ID is the default runtime ID. If you install with `--id`, use that ID in later commands. Installations are per daemon; use `--host <host>` to target another machine.

**Configuration:** GitHub Board defaults to the authenticated GitHub user. File Browser requires an explicit folder allowlist before it can expose any files. See [configuration and migration](docs/CONFIGURATION.md).

## Trust and privacy

Paseo plugins are trusted, unsandboxed code. The backend has the daemon user's filesystem, process and network access. Review source before installing. Read-only describes these plugins' intended operations; it is not an OS sandbox.

[Security and data access](SECURITY.md) lists the files, commands and endpoints used by each plugin. Compact sends a command only after confirmation; Skills writes to the clipboard only after a user action. File Browser downloads transmit selected data to a Tailnet client.

## Develop

```sh
npm ci
npm run check
```

Node.js 22 and npm are used in CI. The check command validates documentation, Git-source imports, release metadata, all workspace types, and tests appropriate to the current OS. Full Windows filesystem/ZIP checks run on Windows. See [Contributing](CONTRIBUTING.md), [Design rules](docs/DESIGN.md) and [the Korean development guide](README.ko.md).

## Repository structure

```text
.
├── plugins/
│   ├── branch-garden/
│   ├── github-project-board/
│   ├── tailscale-dashboard/
│   ├── composer-compact/
│   ├── composer-skills/
│   ├── file-browser/
│   └── provider-usage/
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

[`plugins.json`](plugins.json) is this repository's descriptive catalog, checked against the actual manifests. It is not a Paseo registry format.

## Maintenance

[Changelog](CHANGELOG.md) · [Release process](docs/RELEASING.md) · [Support](SUPPORT.md) · [Security reports](SECURITY.md) · [Issue tracker](https://github.com/SWBaek/Paseo-Plugin/issues)

Use the issue forms for bugs and proposals. English and Korean reports are welcome. The maintainer tracks work in GitHub Issues; you do not need access to the maintainer's private Project to contribute.

Upstream: [Paseo plugin docs](https://paseo.sh/docs/plugins) · [v0.7 reference](https://paseo.sh/docs/plugins/v0.7/reference) · [Community projects](https://paseo.sh/docs/community)
