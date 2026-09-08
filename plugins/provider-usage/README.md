# Provider Usage

Show Codex and Grok plan usage in the sidebar and on the matching agent composer. **Experimental:** provider usage endpoints are not a stable public integration contract.

[Collection](../../README.md) · [Compatibility](../../docs/COMPATIBILITY.md) · [Support](../../SUPPORT.md)

**Paseo 0.8.0-beta.1:** this plugin still uses the 0.7.2 contract and cannot load on 0.8 until migrated. See the [migration plan](../../docs/MIGRATION_0.8.md) and [#77](https://github.com/NaruForge/Paseo-Plugin/issues/77). The beta's settings/provider APIs are not implemented features of this plugin.

The beta SDK exposes `paseo.providers.listUsage()` for normalized host usage. Migration planning will compare its Codex/Grok coverage, authentication, refresh and error behavior against the direct requests below before changing the data source. See the [SDK usage contract](../../docs/plugin-capabilities/backend-and-sdk.md#provider-사용량-sdk).

## Composer pill

The pill above the agent composer shows the provider and remaining usage percentage. Press it to refresh usage; the active query also refreshes every two minutes. The image below is a user-supplied capture of the actual Paseo composer. Its displayed quota is a snapshot, not a guaranteed allowance.

![Provider Usage pill showing Codex 96% remaining above the Paseo agent composer](../../docs/screenshots/provider-usage/composer-pill.jpg)

## Install

```sh
paseo plugin add NaruForge/Paseo-Plugin:plugins/provider-usage --ref v0.1.0-rc.2
paseo plugin ls
```

This pins the 0.7-compatible release; `update` does not advance a pinned tag. Omitting `--ref` tracks the default branch, including future compatibility changes. See [Git installation](../../docs/GIT_INSTALLATION.md).

## Requirements

Paseo 0.7.2 and existing provider authentication on the selected daemon host. This complements Paseo's native usage/settings screen. No API key is requested by the plugin UI.

## Authentication

Codex uses the first syntactically parseable JSON in `CODEX_HOME/auth.json`, `~/.config/codex/auth.json`, or `~/.codex/auth.json`. Grok uses the daemon's existing `GROK_API_KEY`/`GROK_TOKEN` environment value or `~/.grok/auth.json`. If that Codex file has no supported token, Codex is unavailable; later files are not tried. Supported credential shapes are defined in source; keychain-only or changed storage may be unavailable.

Sign in through the provider's normal tooling. Do not copy tokens into this repository, guides or bug reports. The plugin never refreshes or writes authentication.

## Use

Open **Usage** to inspect plans, usage windows, reset times and balances. A matching agent composer pill shows that provider's status; pressing the pill refreshes usage. The surface and pills share a cached snapshot and request a refresh every two minutes while their query is active; background clients may pause polling. The surface's refresh button also requests a new snapshot. Missing authentication appears as unavailable, not zero usage.

## Data access and limitations

Sends authenticated GETs only to Codex WHAM usage and Grok billing, with redirects rejected. See [Security](../../SECURITY.md) for exact endpoints. No inference, purchase, billing change or authentication refresh is performed.

Values depend on the provider response and may lag its own UI. Missing fields remain unknown. The provider's own usage screen is the reference when results disagree.

## Troubleshooting

Missing credentials and authentication failures show unavailable; network/server failures show an error. Reauthenticate through provider tooling if needed. Report response-shape changes with sanitized descriptions, never raw authentication or account data.

```sh
paseo plugin logs provider-usage
paseo plugin update provider-usage
paseo plugin remove provider-usage
```

Use the actual runtime ID. For 0.8 CLI remote diagnostics use `paseo --host <host> plugin ls`; current source still needs migration before loading on that daemon. Directory sources use `reload` instead of `update`.
