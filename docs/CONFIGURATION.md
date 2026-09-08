# Configuration

Neither supported plugin requires a custom host settings file.

- Branch Garden reads the selected daemon's Paseo project/workspace registry and uses its installed Git executable. See the [plugin guide](../plugins/branch-garden/README.md).
- Provider Usage reads enabled connections and usage through Paseo. The daemon owns authentication and provider HTTP; the plugin neither reads nor writes credentials. See the [plugin guide](../plugins/provider-usage/README.md).

Settings and credentials belong to the selected daemon host, not the viewing client. Keep authentication files out of Git and issue reports.

The earlier GitHub owner and File Browser root configuration files are no longer consumed by this collection. See [removed plugins](REMOVED_PLUGINS.md) for uninstall and optional leftover cleanup.

## Provider Usage Settings

Changes save immediately. Defaults: Composer pill on, Show remaining % on, Show provider name on, Show reset time off. Command Center always provides the usage surface and settings screen. Local Composer pill visibility changes apply after saving; another client’s Composer pill visibility changes converge within 30 seconds while connected. Pill fields use live host settings. Failed saves preserve prior values and offer reload; invalid documents offer explicit default recovery.

Sidebar visibility belongs to **Paseo Settings → Layout**. Provider Usage always registers the Usage sidebar item, independently of its settings state. Schema v2 migrates v1 by removing only the old Sidebar preference and preserving the remaining four options; it does not modify Paseo Layout. Downgrading to the old schema can report the v2 document as invalid.

## Paseo 0.8 settings contract

Both plugin sources target 0.8.0-beta.1. Provider Usage registers **Provider Usage Settings** under Settings → Plugins, using `addSettingsScreen` and host-scoped `defineSettings` → `registerSettings` → `useSettings`; see the [settings reference](plugin-capabilities/backend-and-sdk.md#host-단위-설정-저장) and [migration plan](MIGRATION_0.8.md).

Built-in values are shared by authorized clients of the same host and installation, validated against a schema, and saved with revision conflict detection. They survive reload/disable/update and daemon restart, but **removing the installation deletes its values**. Reinstalling starts from defaults. They are ordinary JSON, not a credential vault, and provide neither per-user storage nor cross-host synchronization. A settings screen does not replace Paseo's native provider usage screen or expose a generic route into it.
