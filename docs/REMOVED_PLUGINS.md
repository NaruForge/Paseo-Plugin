# Removed plugins

Before the first public release, this repository narrowed its maintained scope to Branch Garden and Provider Usage. The following plugins were removed, rather than retained as experimental offerings:

- GitHub Project Board (`github-project-board`)
- Tailscale Dashboard (`tailscale-dashboard`)
- Composer Compact (`composer-compact`)
- Composer Skills (`composer-skills`)
- File Browser (`file-browser`)

## Existing installations

Updating a checkout or Git source does not uninstall a running plugin. Check the intended daemon and remove each retired runtime explicitly:

For directory-source development installs, uninstall before pulling the removal commit into the source directory. Otherwise a later reload or daemon restart can fail because the plugin's entrypoint is gone. If the source is already gone, use the catalog's runtime ID to uninstall it anyway.

```sh
paseo plugin ls
paseo plugin remove github-project-board
paseo plugin remove tailscale-dashboard
paseo plugin remove composer-compact
paseo plugin remove composer-skills
paseo plugin remove file-browser
paseo plugin ls
```

These commands use the original default IDs. If you installed with `--id`, use the actual ID from the listing. On the 0.8 CLI, remote commands use global `--host`, for example `paseo --host <host> plugin ls`. Do not remove Branch Garden or Provider Usage. No daemon restart is required.

Old Git installs can keep running their pinned source; an update into the removed subdirectory cannot migrate them. Remove them explicitly instead. Their source and documentation remain available in [the last seven-plugin commit](https://github.com/NaruForge/Paseo-Plugin/tree/5919ab16fad941d46f2a294e981154f76297cc49), but receive no further maintenance here.

That pinned-source statement assumes a compatible older Paseo runtime. Paseo 0.8 rejects old entry/manifest contracts, and these retired plugins are outside the [0.8 migration scope](MIGRATION_0.8.md). Their historical JSON files below are separate from the new built-in 0.8 Settings API, whose values are deleted when an installation is removed.

## Optional host leftovers

Uninstalling a directory-source plugin leaves its original source directory intact; a Git-source uninstall removes Paseo's managed checkout. Neither removes your original Git repository, provider/GitHub credentials, or unrelated Tailscale services. The retired plugins' own JSON settings, if present, are no longer used:

- `~/.config/paseo-plugins/github-project-board.json`
- `~/.config/paseo-plugins/file-browser.json`

Delete those individual settings files only if you no longer need them. If a Tailscale Serve mapping was created solely for File Browser downloads, inspect `tailscale serve status --json` and remove only that dedicated mapping when no other service uses it. Do not disable Tailscale or remove other dashboard services as part of plugin cleanup.

## Release history

The unpublished seven-plugin `v0.1.0-rc.1` GitHub draft was withdrawn. The two-plugin collection was subsequently published as [v0.1.0-rc.2](https://github.com/NaruForge/Paseo-Plugin/releases/tag/v0.1.0-rc.2) on 2026-09-08.
