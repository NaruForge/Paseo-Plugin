# Compatibility

Target contracts: Paseo daemon/client/CLI and exact `@getpaseo/plugin` **0.7.2**. Development checks use Node.js 22 in CI. The root package and catalog describe the collection release; they do not change Paseo's plugin API version.

## Daemon and client support

| Plugin | Daemon scope | Client limitations |
| --- | --- | --- |
| Branch Garden | Windows primary; macOS/Linux automated checks | Native navigation depends on the target Paseo client |
| Provider Usage | Windows primary; macOS/Linux automated checks | Experimental endpoints; availability depends on host authentication |

"Automated checks" means type checking and test execution, not a live Paseo daemon certification. Both plugin test suites run on all three CI operating systems. Native iOS/Android apps and macOS/Linux daemon execution must not be described as runtime-verified based on these checks.

## Evidence

See [the release verification record](verification/0.1.0-rc.2.md) and [GitHub Actions](https://github.com/SWBaek/Paseo-Plugin/actions/workflows/validate.yml). Records distinguish source checks, runtime activation, RPC actions, UI layouts/themes and untested environments. Historic `0.7.0-beta.1` Git-update evidence in [Git installation](GIT_INSTALLATION.md) is not evidence for a new release.

## Paseo v0.8 preparation

The [official version selector](https://paseo.sh/docs/plugins) currently distinguishes v0.7 stable documentation and v0.8 preview. Keep the current release on 0.7.2. Before announcing v0.8 support:

1. Generate a fresh plugin with the target CLI and compare its runtime entries and exact package declarations.
2. Migrate affected contributions in a separate change and update the design/API documentation.
3. Typecheck every workspace and repeat Git activation/update, RPC and affected UI checks.
4. Publish a new compatibility entry and migration instructions; retain the prior release tag.
