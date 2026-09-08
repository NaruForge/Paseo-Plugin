# Compatibility

Target contracts: Paseo daemon/client/CLI and exact `@getpaseo/plugin` **0.7.2**. Development checks use Node.js 22 in CI. The root package and catalog describe the collection release; they do not change Paseo's plugin API version.

## Daemon and client support

| Plugin | Daemon scope | Client limitations |
| --- | --- | --- |
| Branch Garden | Windows primary; macOS/Linux automated checks | Native navigation depends on the target Paseo client |
| GitHub Board | Windows primary; macOS/Linux automated checks; authenticated `gh` required | A system/browser URL handler is needed for external links |
| Tailscale Dashboard | Windows primary; macOS/Linux automated checks; Tailscale CLI required | Extended Dashboard opening needs Tailnet access from the client |
| Composer Compact | Host-independent logic; provider must support `/compact` | Do not assume all providers implement the command |
| Composer Skills | Host-independent session catalog logic | Clipboard copy uses the web Clipboard API; native iOS/Android copying is unavailable and shows a manual-copy path |
| File Browser | Windows daemon only | Browse over Paseo; downloads also require client Tailnet connectivity |
| Provider Usage | Windows primary; macOS/Linux automated checks | Experimental endpoints; availability depends on host authentication |

"Automated checks" means type checking and test execution, not a live Paseo daemon certification. CI runs Windows filesystem/ZIP suites only on Windows; other OS jobs exercise File Browser's portable configuration, archive-filter and view tests. Native iOS/Android apps and macOS/Linux daemon execution must not be described as runtime-verified based on these checks.

## Evidence

See [the release verification record](verification/0.1.0-rc.1.md) and [GitHub Actions](https://github.com/SWBaek/Paseo-Plugin/actions/workflows/validate.yml). Records distinguish source checks, runtime activation, RPC actions, UI layouts/themes and untested environments. Historic `0.7.0-beta.1` Git-update evidence in [Git installation](GIT_INSTALLATION.md) is not evidence for a new release.

## Paseo v0.8 preparation

The [official version selector](https://paseo.sh/docs/plugins) currently distinguishes v0.7 stable documentation and v0.8 preview. Keep the current release on 0.7.2. Before announcing v0.8 support:

1. Generate a fresh plugin with the target CLI and compare its runtime entries and exact package declarations.
2. Migrate affected contributions in a separate change and update the design/API documentation.
3. Typecheck every workspace and repeat Git activation/update, RPC and affected UI checks.
4. Publish a new compatibility entry and migration instructions; retain the prior release tag.
