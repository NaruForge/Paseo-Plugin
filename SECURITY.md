# Security

## Report a vulnerability privately

Use GitHub's [Report a vulnerability](https://github.com/SWBaek/Paseo-Plugin/security/advisories/new) for this repository. Private vulnerability reporting is enabled. Do not open a public issue containing an exploit, credential, private file or unredacted log. If GitHub reporting is unavailable, open an issue asking for a private contact without including sensitive details.

SWBaek maintains this community project on a best-effort basis; there is no guaranteed response time. Security fixes target the latest supported release line. See [Support](SUPPORT.md).

## Trust boundary

Paseo plugins are trusted, unsandboxed code. Backend code runs with the daemon user's access; client contributions run inside Paseo. These plugins' allowlists constrain their implementation, not the operating system or other installed plugins. Inspect source and pin a reviewed commit/tag when appropriate.

## Data access by plugin

| Plugin | Reads and connections | Writes and user actions |
| --- | --- | --- |
| Branch Garden | Selected host's Paseo projects/workspaces and read-only Git status, branches and worktrees | No Git writes; navigation stays on the selected host |
| GitHub Board | Host configuration; existing `gh` authentication; `gh project list/view/field-list/item-list` | No Project edits; GitHub links open on user action |
| Tailscale Dashboard | `tailscale status --json`, `tailscale serve status --json`; bounded GET probes to eligible loopback backends | No Tailscale changes; only a verified dashboard URL can be opened on user action |
| Composer Compact | Active agent/workspace state | Sends `/compact` to the selected agent only after confirmation |
| Composer Skills | Commands/skills advertised by the selected session | Copies a draft on user action; never directly fills or submits the composer |
| File Browser | Explicit host folder allowlist, file metadata/content, read-only Git ignore queries, Tailscale status | Streams selected files/ZIPs to a Tailnet client through an expiring one-use URL; no source file writes |
| Provider Usage | Existing Codex/Grok credentials and two usage endpoints below | Does not refresh or write authentication; no inference calls |

Provider Usage permits GET only to:

- `https://chatgpt.com/backend-api/wham/usage`
- `https://cli-chat-proxy.grok.com/v1/billing?format=credits`

Redirects are rejected. These are provider-specific usage endpoints, not a stable public integration contract. The plugin is experimental; authentication or response changes can make it unavailable. Credentials remain server-side and are excluded from RPC output. The repository adds no analytics or telemetry service; provider requests and external links are described above.

## File Browser boundary

No folders are exposed until the daemon owner supplies a valid configuration. UNC/device paths and drive roots are rejected. Preview and downloads reject link/junction traversal and known sensitive file names, including `.env*`, credential names and private-key extensions. The sensitive-name filter is not a data-classification system: ordinary source files can still contain secrets, so review selections before sharing.

Downloads bind to loopback, require the configured Tailnet-only HTTPS Serve mapping and Tailscale identity headers, expire after 60 seconds and cannot be reused after GET redemption. A local process with the same host privileges can access loopback; Tailnet identity is a proxy boundary, not protection from hostile local processes.

Folder/selection ZIPs have bounded entries, bytes, depth and concurrency. Paths and selection manifests are revalidated at redemption. The configured allowlist stays fixed after its first successful load until plugin reload; reload closes the server and revokes pending tokens. See [File Browser](plugins/file-browser/README.md) for limits.
