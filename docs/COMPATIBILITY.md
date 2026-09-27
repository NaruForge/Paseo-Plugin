# Compatibility

Published `v0.1.0-rc.2` contracts: Paseo daemon/client/CLI and exact `@getpaseo/plugin` **0.7.2**. Published `v0.1.0-rc.3` contracts: exact final **0.8.0**. The v0.1.0-rc.4 collection and all four current sources support **Paseo 0.9.x stable** and the verified **0.10.0-beta.1** beta: exact 0.9.2 SDKs, `requirements.paseo: >=0.9.0 <0.10.0-beta.2`, and repeated 0.10.0-beta.1 SDK checks. Development checks use Node.js 22 in CI. The root package and catalog describe the collection release; they do not change Paseo's plugin API version.

## Paseo version channels

One source supports a stable Paseo line and, when verified, the current Paseo beta. The repository does not keep a separate beta branch while both versions share the same plugin API.

| Catalog field (`plugins.json`) | Meaning | Current value |
| --- | --- | --- |
| `paseoVersion` | Exact stable SDK in every workspace `package.json` and the lockfile | `0.9.2` |
| `paseoRange` | Exact `requirements.paseo` in every manifest | `>=0.9.0 <0.10.0-beta.2` |
| `paseoBetaVersion` | Exact prerelease also type-checked and tested in CI; omit or set `null` for none | `0.10.0-beta.1` |

Paseo accepts a plugin when either the full daemon/app version or its stable core (`0.10.0` for `0.10.0-beta.1`) satisfies `requirements.paseo`. The daemon and the app check it separately. Therefore:

| Paseo daemon/app | `^0.9.0` (before) | `>=0.9.0 <0.10.0-beta.2` (current) |
| --- | --- | --- |
| 0.9.0-beta.2, 0.9.x | Accepted | Accepted |
| 0.10.0-beta.1 | Rejected | Accepted |
| 0.10.0-beta.2 and later betas | Rejected | Rejected until verified |
| 0.10.0 | Rejected | Rejected until verified |

The range ends just after the newest verified version. Patch releases of a verified stable line stay accepted; a newer beta or minor release is rejected at load time with a clear error rather than failing inside the plugin. `npm run check:release` enforces this: the range must accept the stable SDK and verified beta, and must reject the next unverified prerelease or minor.

CI checks the stable SDK on every change and the verified beta with `npm run check:paseo-channel -- beta`. The daily [Paseo release drift](../.github/workflows/paseo-drift.yml) workflow fails when npm `latest` or `beta` publishes a version outside the range or one that breaks type checks/tests. [Releasing](RELEASING.md#paseo-version-channels) describes how to adopt a new beta, promote a stable release, and when to split a branch.

## Published 0.7 release: daemon and client support

| Plugin | Daemon scope | Client limitations |
| --- | --- | --- |
| Branch Garden | Windows primary; macOS/Linux automated checks | Native navigation depends on the target Paseo client |
| Provider Usage | Windows primary; macOS/Linux automated checks | Experimental endpoints; availability depends on host authentication |

"Automated checks" means type checking and test execution, not a live Paseo daemon certification. Both plugin test suites run on all three CI operating systems. Native iOS/Android apps and macOS/Linux daemon execution must not be described as runtime-verified based on these checks.

## Evidence

See the [two-plugin removal verification](verification/0.1.0-rc.2.md), subsequent [Branch Garden English UI and screenshot verification](verification/branch-garden-english.md), and [GitHub Actions](https://github.com/NaruForge/Paseo-Plugin/actions/workflows/validate.yml). Records distinguish source checks, runtime activation, RPC actions, UI layouts/themes and untested environments. Historic `0.7.0-beta.1` Git-update evidence in [Git installation](GIT_INSTALLATION.md) is not evidence for a new release.

## Final Paseo 0.8.0 collection

All four sources have separate runtime entries and exact 0.8.0 SDK dependencies. The three Composer integrations use the final `button` / `update` / `remove` contract. Install v0.1.0-rc.3 with final 0.8.0 daemon, app and CLI; beta.1 is incompatible with this pill API even if Paseo’s prerelease matcher accepts the manifest range `^0.8.0`.

| Plugin | Daemon scope | Final-version evidence |
| --- | --- | --- |
| Branch Garden | Windows, macOS, Linux; Git required | Exact SDK types, read-only regression tests, staged compiler |
| Provider Usage | Windows, macOS, Linux; enabled Provider connection | Usage/settings/registration tests, staged compiler, simulated pill UI |
| Prompt Palette | Windows, macOS, Linux; Agent with Workspace | Settings/send/registration tests, staged compiler, simulated pill/Modal UI |
| Command Deck | Windows + PowerShell 7 | Settings/runner/registration tests, staged compiler, simulated pill action |

See the [0.8.0 release verification](verification/paseo-0.8.0-release.md) for actual commands, CI and UI scope. Collection v0.1.0-rc.3 remains a prerelease. Native app/mobile and live final-version Git activation/update are not certified by these source checks.

The earlier [user runtime report](verification/paseo-0.8-runtime.md), [Git verification](verification/paseo-0.8-git-source.md) and per-plugin beta source records retain their original scope. The 0.8.0 release does not retroactively change those results. Follow the [0.8 migration guide](MIGRATION_0.8.md) and [#112](https://github.com/NaruForge/Paseo-Plugin/issues/112) for those changes.

## Paseo 0.9 stable and 0.10 beta collection

All four sources keep separate runtime entries and the 0.8 Composer `button` / `update` / `remove` contract. They pin exact 0.9.2 SDKs and declare `requirements.paseo: >=0.9.0 <0.10.0-beta.2`. Install v0.1.0-rc.4 with a 0.9.x stable or 0.10.0-beta.1 daemon, app and CLI. A `^0.8.0` manifest is rejected on 0.9, and the earlier `^0.9.0` manifest is rejected on 0.10.0-beta.1.

The published `@getpaseo/plugin` declarations are byte-identical in 0.9.0-beta.2, 0.9.2 and 0.10.0-beta.1, and the 0.9.2 and 0.10.0-beta.1 host plugin runtimes (compiler, import allowlist and requirement check) are identical. The 0.10.0-beta.1 client/protocol changes are additive authentication fields.

| Plugin | Daemon scope | 0.9.2 / 0.10.0-beta.1 evidence |
| --- | --- | --- |
| Branch Garden | Windows, macOS, Linux; Git required | Both exact SDKs' types, read-only regression tests, both staged compilers |
| Provider Usage | Windows, macOS, Linux; enabled Provider connection | Usage/settings/registration tests on both SDKs, owned Agent directory observation, both staged compilers, live 0.10.0-beta.1 reload |
| Prompt Palette | Windows, macOS, Linux; Agent with Workspace | Settings/send/registration tests on both SDKs, owned Agent directory observation, both staged compilers |
| Command Deck | Windows + PowerShell 7 | Settings/runner/registration tests on both SDKs, Explorer panel locations, both staged compilers |

See the [0.9.2 / 0.10.0-beta.1 verification record](verification/paseo-0.9.2-0.10.0-beta.1.md) for comparisons, commands, compiler bytes, the live 0.10.0-beta.1 reload and remaining limits. The earlier [0.9.0-beta.2 record](verification/paseo-0.9.0-beta.2.md) keeps its original scope. Collection v0.1.0-rc.4 remains a prerelease. Native app/mobile and live Git activation/update are not certified by these source checks. Follow the [0.9 migration guide](MIGRATION_0.9.md), [#121](https://github.com/NaruForge/Paseo-Plugin/issues/121) and the stable/beta tracking issue [#123](https://github.com/NaruForge/Paseo-Plugin/issues/123). Daemon and app compatibility are checked separately.
