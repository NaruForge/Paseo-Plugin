# Branch Garden

Inspect active Git workspaces, local branches and worktrees on the selected host. No branch is checked out, reset or deleted.

[Collection](../../README.md) · [Compatibility](../../docs/COMPATIBILITY.md) · [Support](../../SUPPORT.md)

## Install

```sh
paseo plugin add SWBaek/Paseo-Plugin:plugins/branch-garden
paseo plugin ls
```

This tracks the default branch. Use an existing reviewed tag/commit with `--ref` for a pinned installation. Review and trust source before enabling plugins; see [Git installation](../../docs/GIT_INSTALLATION.md).

## Requirements and configuration

Paseo 0.7.2 and Git on the daemon host. No repository-specific configuration is required. The plugin reads the selected host's existing Paseo project/workspace registry. Windows is the primary runtime environment; macOS/Linux automated checks and live runtime evidence are tracked separately in [Compatibility](../../docs/COMPATIBILITY.md).

## Use

Open **Branch Garden** in the sidebar, select the intended host and refresh. Expand a project to inspect workspace state, dirty worktrees and branch information. Empty results mean there are no matching active Git workspaces, not that the filesystem is empty.

## Data access and limitations

Reads project/workspace metadata and bounded read-only Git commands. It never prunes worktrees, deletes branches or writes Git configuration. Detached HEAD, missing repositories and scan failures are displayed explicitly. A snapshot can become stale while another process changes the repository.

## Troubleshooting

Check that Git is installed on the daemon host, that the selected host owns the workspace and that its repository still exists. Refresh after external Git changes.

```sh
paseo plugin logs branch-garden
paseo plugin update branch-garden
paseo plugin remove branch-garden
```

Use the actual runtime ID if installed with `--id`; add `--host <host>` for another daemon. Directory development installations use `reload` instead of `update`.
