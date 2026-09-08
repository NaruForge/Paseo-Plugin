# Tailscale Dashboard

See the selected host's Tailscale connection and peer counts, with optional extended operations status.

[Collection](../../README.md) · [Compatibility](../../docs/COMPATIBILITY.md) · [Support](../../SUPPORT.md)

## Install

```sh
paseo plugin add SWBaek/Paseo-Plugin:plugins/tailscale-dashboard
paseo plugin ls
```

This tracks the default branch. Add `--ref <existing-tag-or-commit>` to pin reviewed source. See [Git installation](../../docs/GIT_INSTALLATION.md).

## Requirements and configuration

Paseo 0.7.2 and a logged-in Tailscale CLI on the daemon host. No extra service is required for basic connection and peer counts. The plugin does not run `tailscale up`, configure Serve or enable Funnel.

## Use

Open **Tailscale Dashboard** in the sidebar and refresh. The basic card reports CLI connection state, device name and online/total peer counts. If exactly one eligible backend implements the optional status contract, additional health/service/peer cards appear and **Open full Dashboard** becomes available.

## Optional extended Dashboard

The extension uses a [documented TailscaleOps-compatible response contract](STATUS_API.md), not a private repository requirement. The plugin discovers eligible HTTPS Serve mappings on this host, probes their loopback backend and accepts one schema-valid response. It does not install or start a Dashboard server.

## Data access and limitations

Runs only `tailscale status --json` and `tailscale serve status --json`. Optional backend probes are bounded GETs with redirects disabled. Backend data describes the service's own reported health; schema validation does not independently verify every health claim.

No, ambiguous or failed extended responses leave the basic CLI card available when CLI state was read successfully. External opening additionally needs Tailnet access on the browsing client.

## Troubleshooting

Install/login to Tailscale on the selected host if connection state is unavailable. A missing extended Dashboard is optional, not a failed base installation. For a configured extension, check its status endpoint and Serve mapping against the contract. Ambiguous candidates deliberately disable automatic opening.

```sh
paseo plugin logs tailscale-dashboard
paseo plugin update tailscale-dashboard
paseo plugin remove tailscale-dashboard
```

Use the actual runtime ID and `--host <host>` where appropriate. Directory sources use `reload` instead of `update`.
