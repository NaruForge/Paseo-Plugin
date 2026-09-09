# Security

## Report a vulnerability privately

Use GitHub's [Report a vulnerability](https://github.com/NaruForge/Paseo-Plugin/security/advisories/new) for this repository. Private vulnerability reporting is enabled. Do not open a public issue containing an exploit, credential, private file or unredacted log. If GitHub reporting is unavailable, open an issue asking for a private contact without including sensitive details.

NaruForge maintains this community project on a best-effort basis; there is no guaranteed response time. Security fixes target the latest supported release line. See [Support](SUPPORT.md).

## Trust boundary

Paseo plugins are trusted, unsandboxed code. Backend code runs with the daemon user's access; client contributions run inside Paseo. These plugins' allowlists constrain their implementation, not the operating system or other installed plugins. Inspect source and pin a reviewed commit/tag when appropriate.

Paseo 0.8 adds compiler boundaries between client/server/shared modules and daemon/app version requirements; these are **not an OS sandbox**. Its lifecycle hooks, permission responses, provider contributions and terminal actions can change host/agent state. Usage and Git inspection remain read-only. Provider Usage additionally saves user-selected display preferences through built-in host settings. Built-in host settings are ordinary JSON and must not hold credentials. See the [0.8 migration scope](docs/MIGRATION_0.8.md).

## Data access by plugin

| Plugin | Reads and connections | Writes and user actions |
| --- | --- | --- |
| Branch Garden | Selected host's Paseo projects/workspaces and read-only Git status, branches and worktrees | No Git writes; navigation stays on the selected host |
| Prompt Palette | Host-scoped prompt library and the selected Agent state through Paseo SDK | Saves library revisions; sends previewed prompt text to the selected Agent on explicit Send; optional copy uses the viewing client clipboard |
| Provider Usage | Host Provider catalog and normalized usage via official Paseo SDK | Saves display settings; no credential access, vendor HTTP, authentication refresh or inference calls |

Current Provider Usage source delegates usage retrieval to `paseo.providers.snapshot()` and `paseo.providers.listUsage()`. Paseo owns credential storage, usage integrations, caching and HTTP policy. The plugin has no vendor endpoint allowlist because it makes no direct HTTP requests; it sanitizes host failure messages and performs no credential logging. Tests guard this adapter boundary. The repository adds no analytics or telemetry service.

The published `v0.1.0-rc.2` implementation used authenticated GETs to Codex WHAM and Grok billing with redirects rejected. That policy is historical and does not describe Paseo's own HTTP implementation. Display settings are ordinary host JSON and must contain no credentials.

Prompt Palette stores ordinary text in built-in Host Settings, not encrypted secret storage. Sending can start Agent work under its existing permissions and Provider configuration. It does not read credentials, change permissions, merge Composer drafts/attachments, call vendors directly, or automatically retry uncertain sends. Removal deletes its saved library.
