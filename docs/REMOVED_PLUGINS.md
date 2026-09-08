# Removed plugins

Before the first public release, this repository narrowed its maintained scope to Branch Garden and Provider Usage. The following plugins were removed, rather than retained as experimental offerings:

- GitHub Project Board (`github-project-board`)
- Tailscale Dashboard (`tailscale-dashboard`)
- Composer Compact (`composer-compact`)
- Composer Skills (`composer-skills`)
- File Browser (`file-browser`)

## Existing installations

Updating a checkout or Git source does not uninstall a running plugin. Check the intended daemon and remove each retired runtime explicitly:

```sh
paseo plugin ls
paseo plugin remove github-project-board
paseo plugin remove tailscale-dashboard
paseo plugin remove composer-compact
paseo plugin remove composer-skills
paseo plugin remove file-browser
paseo plugin ls
```

These commands use the original default IDs. If you installed with `--id`, use the actual ID from the listing; use `--host <host>` for another daemon. Do not remove Branch Garden or Provider Usage. No daemon restart is required.

Old Git installs can keep running their pinned source; an update into the removed subdirectory cannot migrate them. Remove them explicitly instead. Their source and documentation remain available in [the last seven-plugin commit](https://github.com/SWBaek/Paseo-Plugin/tree/5919ab16fad941d46f2a294e981154f76297cc49), but receive no further maintenance here.

## Optional host leftovers

Uninstalling a plugin does not delete the user's source files, provider/GitHub credentials, or unrelated Tailscale services. The retired plugins' own JSON settings, if present, are no longer used:

- `~/.config/paseo-plugins/github-project-board.json`
- `~/.config/paseo-plugins/file-browser.json`

Delete those individual settings files only if you no longer need them. If a Tailscale Serve mapping was created solely for File Browser downloads, inspect `tailscale serve status --json` and remove only that dedicated mapping when no other service uses it. Do not disable Tailscale or remove other dashboard services as part of plugin cleanup.

## Release history

The unpublished seven-plugin `v0.1.0-rc.1` GitHub draft was withdrawn. The two-plugin collection starts at `0.1.0-rc.2`; no new release has been published by this cleanup.
