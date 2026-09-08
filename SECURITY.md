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
| Provider Usage | Existing Codex/Grok credentials and two usage endpoints below | Does not refresh or write authentication; no inference calls |

Provider Usage permits GET only to:

- `https://chatgpt.com/backend-api/wham/usage`
- `https://cli-chat-proxy.grok.com/v1/billing?format=credits`

Redirects are rejected. These are provider-specific usage endpoints, not a stable public integration contract. The plugin is experimental; authentication or response changes can make it unavailable. Credentials remain server-side and are excluded from RPC output. The repository adds no analytics or telemetry service; provider requests and external links are described above.
