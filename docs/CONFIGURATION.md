# Configuration

Neither supported plugin requires a custom host settings file.

- Branch Garden reads the selected daemon's Paseo workspace registry and uses its installed Git executable. See the [plugin guide](../plugins/branch-garden/README.md).
- Provider Usage reads existing Codex/Grok authentication on the daemon host. Sign in using the provider's own tooling; the plugin never creates, refreshes or writes authentication. See the [plugin guide](../plugins/provider-usage/README.md).

Settings and credentials belong to the selected daemon host, not the viewing client. Keep authentication files out of Git and issue reports.

The earlier GitHub owner and File Browser root configuration files are no longer consumed by this collection. See [removed plugins](REMOVED_PLUGINS.md) for uninstall and optional leftover cleanup.
