# Branch Garden

Release **v0.1.0-rc.3** targets final **Paseo 0.8.0**. See [final-version checks and remaining runtime limits](../../docs/verification/paseo-0.8.0-release.md). Existing screenshots below retain their historical version and simulated-host scope.

```sh
paseo plugin add NaruForge/Paseo-Plugin:plugins/branch-garden --ref v0.1.0-rc.3
```

Inspect registered Git projects, active workspaces, local branches and worktrees on the selected host. No branch is checked out, reset or deleted.

[Collection](../../README.md) · [Compatibility](../../docs/COMPATIBILITY.md) · [Install](#install) · [Support](../../SUPPORT.md)

**Current source targets Paseo 0.8.0.** Runtime entries, imports and exact SDK dependencies have been migrated and checked with the target compiler, including a copy without `node_modules`. The user has completed Paseo 0.8 runtime verification; see the [runtime record and reported scope](../../docs/verification/paseo-0.8-runtime.md). See the [source verification](../../docs/verification/branch-garden-0.8-source.md) and [#82](https://github.com/NaruForge/Paseo-Plugin/issues/82). The screenshots and pinned release below remain 0.7 evidence.

## Screenshots

These remain **Paseo 0.7.2** live captures of this public repository. They are the representative UI for scan totals, filters and expanded repository details; they are not a 0.8 app screenshot. Current 0.8 source keeps this English interface and did not replace these images.

![Branch Garden overview with scan totals, review filter and expanded repository](../../docs/screenshots/branch-garden/overview.png)

On a compact screen, workspace details and branch evidence stack vertically:

![Branch Garden repository details on a compact screen](../../docs/screenshots/branch-garden/repository-compact.png)

## Install

Choose **Paseo 0.7.2** for this published release command. Enable trusted plugins in the intended daemon’s **Settings → Plugins**, then run:

```sh
paseo plugin add NaruForge/Paseo-Plugin:plugins/branch-garden --ref v0.1.0-rc.2
paseo plugin ls
```

This pins the 0.7-compatible release; `update` does not advance a pinned tag. Omitting `--ref` tracks the default branch, which already contains 0.8 source incompatible with 0.7. Review and trust source before enabling plugins; see [Git installation](../../docs/GIT_INSTALLATION.md).

For current 0.8 source evaluation, follow the [source checkout steps](../../README.md#evaluate-current-08-source), then run this in PowerShell from the repository root on the daemon host:

```powershell
$repoRoot = (Resolve-Path .).Path
paseo plugin ls
paseo plugin install (Join-Path $repoRoot "plugins/branch-garden")
paseo plugin ls
```

Expect runtime ID `branch-garden` with status `running` and no load error. If that ID already exists, choose a distinct `--id branch-garden-dev` and use it in subsequent commands. Open **Branch Garden** in the sidebar.

For Git source evaluation of **0.8** source, choose a reviewed published commit that contains this plugin. Do not use `v0.1.0-rc.2` for 0.8:

```sh
paseo plugin add NaruForge/Paseo-Plugin:plugins/branch-garden --ref v0.1.0-rc.3
```

Replace the placeholder with that actual ref. Git add/update/recovery for this plugin is recorded in the [Git source verification](../../docs/verification/paseo-0.8-git-source.md); see [Git installation](../../docs/GIT_INSTALLATION.md).

## Requirements and configuration

For the pinned `v0.1.0-rc.2` release: Paseo 0.7.2. For current source: daemon and app compatible with `^0.8.0`, with development checks pinned to 0.8.0; this is not a final 0.8 runtime certification. Git is required on the daemon host. No repository-specific configuration is required. The plugin reads the selected host's existing Paseo project/workspace registry. Windows is the primary runtime environment; macOS/Linux automated checks and live runtime evidence are tracked separately in [Compatibility](../../docs/COMPATIBILITY.md).

## Use

Open **Branch Garden** in the sidebar, select the intended host and refresh. Expand a project to inspect workspace state, dirty worktrees and branch information. Registered projects can appear without active workspaces. Empty results mean no repositories matched the current scan or filter; they do not mean the filesystem is empty.

The plugin's labels, accessibility text, warnings and error messages are in English. Scan times use a 24-hour clock in the client's local time zone. Project, workspace and branch names remain unchanged; diagnostic details returned by Git or the host may use that tool's language. Paseo's surrounding interface follows its own language setting.

Use **All**, **Cleanup candidates** or **Needs review** to filter repositories. Expand **Kept branches** to see branches retained because they are the default branch, checked out, or unmerged with an existing upstream. Classification is advisory; this plugin never deletes branches.

## Data access and limitations

Reads project/workspace metadata and bounded read-only Git commands. It never prunes worktrees, deletes branches or writes Git configuration. Detached HEAD, missing repositories and scan failures are displayed explicitly. A snapshot can become stale while another process changes the repository.

## Troubleshooting

Check that Git is installed on the daemon host, that the selected host owns the workspace and that its repository still exists. Refresh after external Git changes.

```sh
paseo plugin ls
paseo plugin logs branch-garden
```

Use the actual runtime ID if installed with `--id`. For 0.8 CLI remote diagnostics, the syntax is `paseo --host <host> plugin ls`; check the daemon and app versions independently. Directory development installations use `reload` instead of `update`. If it still fails, follow [Support](../../SUPPORT.md#troubleshooting-first-steps) with redacted logs and the installed ref.


## Update and remove

Run `paseo plugin ls` against the intended Host before changing an installation. These examples use the default ID `branch-garden`; replace it with your actual ID if you used `--id`. On the 0.8 CLI, put remote selection before the command: `paseo --host <host> plugin ls`.

For a **Git source** installation, check the tracked ref and update it:

```sh
paseo plugin status branch-garden
paseo plugin update branch-garden
paseo plugin ls
```

Branches advance; fixed tags and commits do not. For a **directory source**, after reviewing changes to the local checkout use `paseo plugin reload branch-garden`, then `paseo plugin ls`. See [ref changes and rollback](../../docs/RELEASING.md#rollback) before switching a pinned installation.

Removal is optional and separate from troubleshooting. Branch Garden has no saved plugin settings. Removal leaves your original repositories, branches and worktrees intact. A Git-source removal deletes the managed checkout; a directory-source removal leaves the original source directory intact.

```sh
paseo plugin remove branch-garden
paseo plugin ls
```

Confirm only the intended runtime has disappeared. No daemon restart is needed.
