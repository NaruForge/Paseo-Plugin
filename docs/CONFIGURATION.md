# Configuration

Neither supported plugin requires a custom host settings file.

- Branch Garden reads the selected daemon's Paseo project/workspace registry and uses its installed Git executable. See the [plugin guide](../plugins/branch-garden/README.md).
- Provider Usage reads existing Codex/Grok authentication on the daemon host. Sign in using the provider's own tooling; the plugin never creates, refreshes or writes authentication. See the [plugin guide](../plugins/provider-usage/README.md).

Settings and credentials belong to the selected daemon host, not the viewing client. Keep authentication files out of Git and issue reports.

The earlier GitHub owner and File Browser root configuration files are no longer consumed by this collection. See [removed plugins](REMOVED_PLUGINS.md) for uninstall and optional leftover cleanup.

## Paseo 0.8 settings contract

The current plugins still target 0.7.2 and do not register 0.8 settings. The beta API adds `addSettingsScreen` and host-scoped `defineSettings` → `registerSettings` → `useSettings`; see the [settings reference](plugin-capabilities/backend-and-sdk.md#host-단위-설정-저장) and [migration plan](MIGRATION_0.8.md).

Built-in values are shared by authorized clients of the same host and installation, validated against a schema, and saved with revision conflict detection. They survive reload/disable/update and daemon restart, but **removing the installation deletes its values**. Reinstalling starts from defaults. They are ordinary JSON, not a credential vault, and provide neither per-user storage nor cross-host synchronization. A settings screen does not replace Paseo's native provider usage screen or expose a generic route into it.
