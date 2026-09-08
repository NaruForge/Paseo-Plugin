# Host configuration and migration

Settings belong to the **OS user running the selected daemon**, not the browser user. `~` below means that user's home directory (`C:\Users\<user>` on Windows). These are repository-defined JSON files, not additions to Paseo's manifest or global `config.json`. They remain outside managed Git checkouts and survive plugin updates.

Create only the file needed for your plugin. Do not store tokens in these files. Invalid settings produce an actionable error and never silently select another account/folder.

## GitHub Board

File: `~/.config/paseo-plugins/github-project-board.json`

```json
{ "owner": "@me" }
```

With no file, `@me` selects the GitHub CLI's authenticated user. To inspect another user or organization, set its login, for example `{ "owner": "example-org" }`. Access still depends on the existing GitHub CLI credentials. Run `gh auth login` on the daemon host if needed; for a scope error use `gh auth refresh -s read:project`. The plugin never signs in or changes scopes itself.

The file accepts only `owner`; unknown keys, invalid JSON and invalid login values are rejected. The first successful load fixes the owner for that runtime, keeping list and board reads consistent. After changing it, run `paseo plugin reload github-project-board` using your actual runtime ID, then reopen the surface and refresh the project list. It is a daemon-wide owner selection, not a per-client preference. Changing the GitHub CLI's authenticated account while using `@me` also requires a reload and list refresh.

## File Browser

File: `~/.config/paseo-plugins/file-browser.json`

```json
{
  "roots": [
    { "id": "projects", "label": "Projects", "path": "C:\\Projects" },
    { "id": "notes", "label": "Notes", "path": "D:\\Notes" }
  ]
}
```

Replace the example paths with existing local Windows folders you intend to expose. JSON needs doubled backslashes. Up to 16 roots are allowed; IDs are unique lowercase identifiers. Relative paths, UNC shares, device paths, drive roots and reserved path names are rejected. Folder contents remain subject to the existing link, sensitive-name and download checks.

The first successful configuration load is shared by listing, preview and all downloads. To change or revoke access after that, edit the file and run:

```sh
paseo plugin ls
paseo plugin reload file-browser
paseo plugin ls
```

Use your actual ID if installed under another name. Reload revokes pending URLs. Missing or malformed configuration exposes no folders and can be corrected before retrying; a configuration error does not enable a fallback root.

### Migration from the unversioned collection

Earlier source implicitly exposed `C:\Projects`. Create the explicit configuration above with just that root if you want to retain that behavior, then reload. No migration script writes or expands the allowlist automatically. Downloads still require [Tailnet Serve setup](../plugins/file-browser/README.md#downloads).

## Other plugins

Branch Garden and Composer Compact need no repository-specific settings. Composer Skills uses the selected session's skill catalog. Tailscale Dashboard discovers connection/peer state from the CLI; the optional extended Dashboard uses the [documented response contract](../plugins/tailscale-dashboard/STATUS_API.md). Provider Usage uses [existing provider credentials](../plugins/provider-usage/README.md#authentication) on the daemon host.
