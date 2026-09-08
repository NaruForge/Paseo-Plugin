# Changelog

The collection uses one version/tag for all plugins. Plugin-specific changes are listed under that release. Published releases are listed on [GitHub](https://github.com/SWBaek/Paseo-Plugin/releases).

## 0.1.0-rc.1 — release candidate

First versioned community-distribution candidate, targeting Paseo 0.7.2. The release is not stable or upstream-endorsed.

- Add MIT licensing, English and Korean entry guides, individual plugin guides, catalog, support/security/contribution policies and a release process.
- GitHub Board defaults to the authenticated user and accepts a host-configured user or organization; scope guidance uses `read:project`.
- **Migration required:** File Browser no longer implicitly exposes `C:\Projects`. Configure explicit allowed folders as described in [configuration](docs/CONFIGURATION.md). Reload applies changes and revokes outstanding download URLs.
- Tailscale Dashboard shows CLI connection and peer counts without an extended TailscaleOps service.
- Provider Usage rejects HTTP redirects to keep authenticated requests within its two-endpoint allowlist.
- Add configuration and redirect regression checks, OS-aware tests and release metadata validation.

Known limitations: UI text includes Korean; native mobile clipboard copying is unavailable; File Browser remains Windows-only; usage endpoints are experimental. See [Compatibility](docs/COMPATIBILITY.md) and the [verification record](docs/verification/0.1.0-rc.1.md).
