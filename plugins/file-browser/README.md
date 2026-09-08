# File Browser

Browse explicitly allowed Windows folders and download selected files or ZIPs to a Tailnet client.

[Collection](../../README.md) · [한국어 운영 안내](README.ko.md) · [Compatibility](../../docs/COMPATIBILITY.md) · [Support](../../SUPPORT.md)

## Install

```sh
paseo plugin add SWBaek/Paseo-Plugin:plugins/file-browser
paseo plugin ls
```

This tracks the default branch. Add `--ref <existing-tag-or-commit>` to pin reviewed source. See [Git installation](../../docs/GIT_INSTALLATION.md).

## Requirements

Paseo 0.7.2 and a Windows daemon. Browsing and preview need no Tailscale service. Downloads additionally require Tailscale on the daemon and client, with Tailnet-only HTTPS Serve configured below.

## Configuration

No folders are exposed by default. Create `~/.config/paseo-plugins/file-browser.json` under the daemon OS user's home:

```json
{
  "roots": [
    { "id": "projects", "label": "Projects", "path": "C:\\Projects" }
  ]
}
```

Use an existing local folder you intend to expose. Unversioned users must explicitly opt into the former `C:\Projects` default. See [configuration and migration](../../docs/CONFIGURATION.md). After the first successful load, reload the actual runtime ID to apply changes; reload revokes outstanding URLs.

## Use

Open **File Browser** in the sidebar. Choose a root, navigate directories and select a small text file for preview. Directory pages contain up to 200 entries. Previews read at most 64 KiB and support UTF-8 and BOM-marked UTF-16 text. Binary/unsupported encodings are rejected.

Select files/folders for download. One selected file downloads as-is; a folder or multiple items download as a Deflate ZIP. Moving folders clears selection. Root-wide directory downloads are blocked; explicitly selected folders within a root can be downloaded.

## Downloads

The download server starts only when needed on `127.0.0.1:9292`. Configure the exact Tailnet HTTPS mapping on the daemon host:

```powershell
tailscale serve --bg --https=9292 9292
tailscale serve status --json
```

This uses Serve, not Funnel. The plugin verifies the mapping targets `http://127.0.0.1:9292`, requires Tailnet identity and issues a URL valid for 60 seconds and one GET redemption. Paths are revalidated at redemption. Two installed copies share port 9292; do not initiate downloads from both simultaneously.

To stop providing this transport, remove only this mapping:

```powershell
tailscale serve --https=9292 off
```

## ZIP filtering and limits

Git folders include tracked files and untracked files allowed by the standard ignore hierarchy (`.gitignore`, `.git/info/exclude`, global excludes). Git state is unchanged. Non-Git folders exclude common generated data such as `node_modules`, `.git`, caches, logs and virtual environments.

Explicit files may bypass ignore rules, but never sensitive-name or link restrictions. Sensitive files that remain in a folder archive candidate cause the whole request to fail. Known-name filtering cannot detect every secret in ordinary source files.

Limits: 100 selected items; 10,000 archive entries; 2 GiB uncompressed data; depth 64; one concurrent archive. UTF-8 names and empty folders are preserved. ZIP streaming creates no temporary archive file. Links/junctions and special items are rejected. See [Security](../../SECURITY.md).

## Troubleshooting

Check configuration on the daemon host, not the browsing client. Use existing local paths and valid JSON with doubled backslashes. Non-Windows daemons are unsupported. For downloads, check the exact Serve mapping, client Tailnet connectivity and port conflicts. Expired/used URLs need a new download action.

```sh
paseo plugin logs file-browser
paseo plugin update file-browser
paseo plugin remove file-browser
```

Use the actual runtime ID and `--host <host>` where appropriate. Directory sources use `reload` instead of `update`.

## Screenshots

Actual Paseo web client: [wide/light](../../docs/screenshots/file-browser-wide-light.png), [wide/dark](../../docs/screenshots/file-browser-wide-dark.png), [compact/light](../../docs/screenshots/file-browser-compact-light.png), [compact/dark](../../docs/screenshots/file-browser-compact-dark.png).
