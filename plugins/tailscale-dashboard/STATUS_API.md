# Optional operations status API

This is this repository's optional TailscaleOps-compatible integration contract, not a Tailscale or Paseo official API. Basic connection and peer counts work without it. No private service is required.

The plugin discovers HTTPS Serve mappings matching the daemon's Tailscale DNS name whose proxy is loopback HTTP/HTTPS. It requests `api/v1/status` beneath each eligible proxy base path. At most 16 candidates are probed, with a five-second timeout and 512 KiB response limit per candidate; redirects are rejected. Only exactly one schema-valid response enables the external Dashboard link.

A service implementing this optional endpoint must return JSON such as:

```json
{
  "generatedAt": "2026-09-08T00:00:00.000Z",
  "refreshIntervalSeconds": 30,
  "overall": { "status": "healthy", "message": "Example snapshot" },
  "device": { "name": "example-host", "os": "windows", "online": true, "version": null },
  "summary": {
    "onlinePeers": 0,
    "totalPeers": 0,
    "funnelIngressPeers": { "online": 0, "total": 0 },
    "serveServices": 0,
    "funnelEnabled": false
  },
  "protectedServices": [],
  "peers": [],
  "warnings": [],
  "serve": []
}
```

The server source's `TailscaleOpsStatusSchema` is authoritative for accepted input and normalization; the shared `DashboardSnapshotSchema` describes bounded client output.

- `protectedServices` entries: `name`, `mode`, `listenerHealthy`, nullable `backendHealthy`, `status` (`healthy`, `warning`, `error`) and `detail`.
- Peers: `name`, `os`, `online`, nullable `lastSeen`, `connection`, nullable `relay`, nullable `latencyMs`.
- Warnings: `severity` (`warning` or `error`), `title`, `detail`.

Implementers must report observed status honestly. Keep credentials and sensitive account/network data out of responses. Matching this schema verifies response shape; it does not independently verify reported service health.
