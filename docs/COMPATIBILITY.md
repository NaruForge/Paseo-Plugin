# Compatibility

Published `v0.1.0-rc.2` contracts: Paseo daemon/client/CLI and exact `@getpaseo/plugin` **0.7.2**. Both current plugin sources target exact **0.8.0-beta.1**. Live beta runtime verification is pending. Development checks use Node.js 22 in CI. The root package and catalog describe the collection release; they do not change Paseo's plugin API version.

## Published 0.7 release: daemon and client support

| Plugin | Daemon scope | Client limitations |
| --- | --- | --- |
| Branch Garden | Windows primary; macOS/Linux automated checks | Native navigation depends on the target Paseo client |
| Provider Usage | Windows primary; macOS/Linux automated checks | Experimental endpoints; availability depends on host authentication |

"Automated checks" means type checking and test execution, not a live Paseo daemon certification. Both plugin test suites run on all three CI operating systems. Native iOS/Android apps and macOS/Linux daemon execution must not be described as runtime-verified based on these checks.

## Evidence

See the [two-plugin removal verification](verification/0.1.0-rc.2.md), subsequent [Branch Garden English UI and screenshot verification](verification/branch-garden-english.md), and [GitHub Actions](https://github.com/NaruForge/Paseo-Plugin/actions/workflows/validate.yml). Records distinguish source checks, runtime activation, RPC actions, UI layouts/themes and untested environments. Historic `0.7.0-beta.1` Git-update evidence in [Git installation](GIT_INSTALLATION.md) is not evidence for a new release.

## Paseo v0.8 beta preparation

Paseo **0.8.0-beta.1** introduces a breaking plugin contract. Both sources now have separate client/server entries, runtime directories, exact beta.1 SDK dependencies and `requirements.paseo: ^0.8.0`. Provider Usage uses official host usage APIs and host-scoped display Settings.

| Repository artifact | Paseo target | Evidence |
| --- | --- | --- |
| Existing `v0.1.0-rc.2` tag | 0.7.2 | Existing verification records above |
| Branch Garden current source | 0.8.0-beta.1 | [Source verification](verification/branch-garden-0.8-source.md): fresh CLI scaffold, type/tests, beta compiler without node_modules; no live beta daemon/app checks |
| Provider Usage current source | 0.8.0-beta.1 | [Source verification](verification/provider-usage-0.8-source.md): adapter/settings tests, compiler without node_modules, isolated UI preview; no live beta daemon/app checks |
| Updated capability/design/migration reference | 0.8.0-beta.1 | Official versioned docs, published exact plugin/client declarations and CLI scaffold source inspected on 2026-09-08 |
| Future migrated collection release | 0.8 target to be recorded | Both live runtimes, Git activation/update and native RPC/UI checks pending |

Track the work in [#77](https://github.com/NaruForge/Paseo-Plugin/issues/77) and follow the [repository migration guide](MIGRATION_0.8.md). Preserve the 0.7 tag and use a separate candidate ref for 0.8. Before announcing collection support, complete live beta checks and repeat Git activation/update, RPC, cleanup and affected UI verification for both plugins. Keep source checks separate from runtime evidence; see [#82](https://github.com/NaruForge/Paseo-Plugin/issues/82) for the Branch Garden source step.

The recommended migrated manifest range is `^0.8.0`; the development SDK remains exact `0.8.0-beta.1`. Paseo's prerelease matching includes beta.1 in that range. Daemon and app versions are checked independently. An older app is not compatible merely because its daemon is compatible. See the [official requirements contract](https://paseo.sh/docs/plugins/v0.8/reference#requirements) and [migration guide](https://paseo.sh/docs/plugins/v0.8/migration).
