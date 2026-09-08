# Provider Usage

Show Codex and Grok plan usage in the sidebar and on the matching agent composer. **Experimental:** provider usage endpoints are not a stable public integration contract.

[Collection](../../README.md) · [Compatibility](../../docs/COMPATIBILITY.md) · [Support](../../SUPPORT.md)

## Install

```sh
paseo plugin add SWBaek/Paseo-Plugin:plugins/provider-usage
paseo plugin ls
```

This tracks the default branch. Add `--ref <existing-tag-or-commit>` to pin reviewed source. See [Git installation](../../docs/GIT_INSTALLATION.md).

## Requirements

Paseo 0.7.2 and existing provider authentication on the selected daemon host. This complements Paseo's native usage/settings screen. No API key is requested by the plugin UI.

## Authentication

Codex uses the first syntactically parseable JSON in `CODEX_HOME/auth.json`, `~/.config/codex/auth.json`, or `~/.codex/auth.json`. Grok uses the daemon's existing `GROK_API_KEY`/`GROK_TOKEN` environment value or `~/.grok/auth.json`. If that Codex file has no supported token, Codex is unavailable; later files are not tried. Supported credential shapes are defined in source; keychain-only or changed storage may be unavailable.

Sign in through the provider's normal tooling. Do not copy tokens into this repository, guides or bug reports. The plugin never refreshes or writes authentication.

## Use

Open **Usage** to inspect plans, usage windows, reset times and balances. A matching agent composer pill shows that provider's status. Missing authentication appears as unavailable, not zero usage. Refresh to request a new snapshot.

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

Use the actual runtime ID and `--host <host>` where appropriate. Directory sources use `reload` instead of `update`.
