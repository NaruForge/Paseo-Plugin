# Paseo Plugins

[한국어](README.ko.md) · [Plugin guides](#plugins) · [Compatibility](docs/COMPATIBILITY.md) · [Contributing](CONTRIBUTING.md)

[![Validate](https://github.com/SWBaek/Paseo-Plugin/actions/workflows/validate.yml/badge.svg)](https://github.com/SWBaek/Paseo-Plugin/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Two independently installable plugins focused on Git workspace visibility and provider usage while working with Paseo agents.

Maintained by **SWBaek and contributors**. This is a community project, independently maintained and not endorsed or operated by the Paseo team.

**Target: Paseo 0.7.2.** The Plugin API is experimental. See the [compatibility and verification record](docs/COMPATIBILITY.md) before using another version. The first public prerelease, [v0.1.0-rc.2](https://github.com/SWBaek/Paseo-Plugin/releases/tag/v0.1.0-rc.2), includes pinned installation instructions and known limitations.

## Plugins

| Plugin | What it does | Requirements | Maturity |
| --- | --- | --- | --- |
| [`branch-garden`](plugins/branch-garden/) | Inspect registered Git projects, workspaces, branches and worktrees without changing Git state. | Git; registered Paseo projects or workspaces | Preview |
| [`provider-usage`](plugins/provider-usage/) | Inspect Codex and Grok plan usage from existing host credentials. | Existing provider authentication | Experimental |

Both plugins are maintained as this repository's core offering; this does not imply Paseo-team support. Branch Garden's interface is in English. Provider Usage remains experimental at the provider integration boundary and still includes Korean status messages. Installation guides are available in English, with actual screenshots in each plugin guide.

## Install one plugin

1. Install the tools listed in that plugin's guide on the **daemon host**.
2. In Paseo **Settings → Plugins**, enable plugins if you choose to trust them.
3. Run the command for the plugin you want:

```sh
paseo plugin add SWBaek/Paseo-Plugin:plugins/branch-garden
paseo plugin add SWBaek/Paseo-Plugin:plugins/provider-usage
```

Choose one command; there is no need to install the entire collection or run npm. These commands track the default branch. For a controlled installation, choose an existing tag or commit from [Releases](https://github.com/SWBaek/Paseo-Plugin/releases) and pass `--ref <tag-or-commit>`. See [Git installation and rollback](docs/GIT_INSTALLATION.md).

```sh
paseo plugin ls
paseo plugin logs branch-garden
paseo plugin update branch-garden
```

The manifest ID is the default runtime ID. If you install with `--id`, use that ID in later commands. Installations are per daemon; use `--host <host>` to target another machine.

**Configuration:** Neither plugin needs a custom host settings file. See [prerequisites and removal guidance](docs/CONFIGURATION.md).

## Trust and privacy

Paseo plugins are trusted, unsandboxed code. The backend has the daemon user's filesystem, process and network access. Review source before installing. Read-only describes these plugins' intended operations; it is not an OS sandbox.

[Security and data access](SECURITY.md) lists the files, commands and endpoints used by each plugin. Neither plugin modifies Git state or provider authentication.

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

## Removed plugins

Five previously developed plugins have been removed before the first public release. Existing installations must be removed explicitly; updating this repository does not uninstall them. See [removal instructions](docs/REMOVED_PLUGINS.md).

## Maintenance

[Changelog](CHANGELOG.md) · [Release process](docs/RELEASING.md) · [Support](SUPPORT.md) · [Security reports](SECURITY.md) · [Issue tracker](https://github.com/SWBaek/Paseo-Plugin/issues)

Use the issue forms for bugs and proposals. English and Korean reports are welcome. The maintainer tracks work in GitHub Issues; you do not need access to the maintainer's private Project to contribute.

Upstream: [Paseo plugin docs](https://paseo.sh/docs/plugins) · [v0.7 reference](https://paseo.sh/docs/plugins/v0.7/reference) · [Community projects](https://paseo.sh/docs/community)
