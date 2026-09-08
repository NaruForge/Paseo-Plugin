# GitHub Board

Browse the selected GitHub user or organization's Projects in a read-only Kanban board.

[Collection](../../README.md) · [Compatibility](../../docs/COMPATIBILITY.md) · [Support](../../SUPPORT.md)

## Install

```sh
paseo plugin add SWBaek/Paseo-Plugin:plugins/github-project-board
paseo plugin ls
```

This tracks the default branch. Add `--ref <existing-tag-or-commit>` for a reviewed pinned installation. See [Git installation](../../docs/GIT_INSTALLATION.md).

## Requirements

Paseo 0.7.2 and [GitHub CLI](https://cli.github.com/) on the daemon host. Authenticate there with `gh auth login`. Project reads need access to the owner's projects and the `read:project` scope; on a scope error, run `gh auth refresh -s read:project` yourself.

## Configuration

The default owner is `@me`, the GitHub CLI's authenticated user. To choose another user or organization, create `~/.config/paseo-plugins/github-project-board.json` under the daemon OS user's home:

```json
{ "owner": "example-org" }
```

See [configuration](../../docs/CONFIGURATION.md) for validation and refresh behavior. No tokens belong in this file. Unversioned installations no longer select `SWBaek` implicitly.

## Use

Open **GitHub Board** in the sidebar, refresh the project list and select a project. Filter visible cards and open their GitHub links. Columns reflect the project's status options; there is no drag-to-update or edit action.

## Data access and limitations

Runs only `gh project list`, `view`, `field-list`, and `item-list` with validated arguments and bounded output/time. Reads at most 100 projects and 1,000 items per scan. Larger projects can be truncated; consider counts and notices when reviewing them. The plugin uses existing `gh` credentials and does not persist authentication or edit GitHub data.

## Troubleshooting

Missing CLI, authentication and scope failures have actionable messages. An empty list can mean the owner has no visible projects. After changing owner or the CLI account, reload the plugin, reopen the surface and refresh the list before choosing a project. Owner selection is a daemon setting, not a per-client preference.

```sh
paseo plugin logs github-project-board
paseo plugin update github-project-board
paseo plugin remove github-project-board
```

Use your actual runtime ID and `--host <host>` where appropriate. Directory sources use `reload` instead of `update`.
