# Branch Garden

Inspect registered Git projects, active workspaces, local branches and worktrees on the selected host. No branch is checked out, reset or deleted.

[Collection](../../README.md) · [Compatibility](../../docs/COMPATIBILITY.md) · [Support](../../SUPPORT.md)

**Current source targets Paseo 0.8.0-beta.1.** Runtime entries, imports and exact SDK dependencies have been migrated and checked with the beta compiler, including a copy without `node_modules`. The user has completed Paseo 0.8 runtime verification; see the [runtime record and reported scope](../../docs/verification/paseo-0.8-runtime.md). See the [source verification](../../docs/verification/branch-garden-0.8-source.md) and [#82](https://github.com/NaruForge/Paseo-Plugin/issues/82). The screenshots and pinned release below remain 0.7 evidence.

## Screenshots

Actual Paseo 0.7.2 web client, showing this public repository. The overview combines scan totals, warnings and repository filters; expanding a repository shows workspaces and the reasons branches need review.

![Branch Garden overview with scan totals, review filter and expanded repository](../../docs/screenshots/branch-garden/overview.png)

On a compact screen, workspace details and branch evidence stack vertically:

![Branch Garden repository details on a compact screen](../../docs/screenshots/branch-garden/repository-compact.png)

## Install

```sh
paseo plugin add NaruForge/Paseo-Plugin:plugins/branch-garden --ref v0.1.0-rc.2
paseo plugin ls
```

This pins the 0.7-compatible release; `update` does not advance a pinned tag. Omitting `--ref` tracks the default branch, including future compatibility changes. Review and trust source before enabling plugins; see [Git installation](../../docs/GIT_INSTALLATION.md).

## Requirements and configuration

For the pinned `v0.1.0-rc.2` release: Paseo 0.7.2. For current source: daemon and app compatible with `^0.8.0`, with development checks pinned to 0.8.0-beta.1; this is not a final 0.8 runtime certification. Git is required on the daemon host. No repository-specific configuration is required. The plugin reads the selected host's existing Paseo project/workspace registry. Windows is the primary runtime environment; macOS/Linux automated checks and live runtime evidence are tracked separately in [Compatibility](../../docs/COMPATIBILITY.md).

## Use

Open **Branch Garden** in the sidebar, select the intended host and refresh. Expand a project to inspect workspace state, dirty worktrees and branch information. Registered projects can appear without active workspaces. Empty results mean no repositories matched the current scan or filter; they do not mean the filesystem is empty.

The plugin's labels, accessibility text, warnings and error messages are in English. Scan times use a 24-hour clock in the client's local time zone. Project, workspace and branch names remain unchanged; diagnostic details returned by Git or the host may use that tool's language. Paseo's surrounding interface follows its own language setting.

Use **All**, **Cleanup candidates** or **Needs review** to filter repositories. Expand **Kept branches** to see branches retained because they are the default branch, checked out, or unmerged with an existing upstream. Classification is advisory; this plugin never deletes branches.

## Data access and limitations

Reads project/workspace metadata and bounded read-only Git commands. It never prunes worktrees, deletes branches or writes Git configuration. Detached HEAD, missing repositories and scan failures are displayed explicitly. A snapshot can become stale while another process changes the repository.

## Troubleshooting

Check that Git is installed on the daemon host, that the selected host owns the workspace and that its repository still exists. Refresh after external Git changes.

```sh
paseo plugin logs branch-garden
paseo plugin update branch-garden
paseo plugin remove branch-garden
```

Use the actual runtime ID if installed with `--id`. For 0.8 CLI remote diagnostics, the syntax is `paseo --host <host> plugin ls`; check the daemon and app versions independently. Directory development installations use `reload` instead of `update`.

