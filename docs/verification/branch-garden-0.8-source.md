# Branch Garden 0.8 source migration

Date: 2026-09-09 (Asia/Seoul). Issue: [#82](https://github.com/NaruForge/Paseo-Plugin/issues/82), child of [#77](https://github.com/NaruForge/Paseo-Plugin/issues/77).

Source: local branch `feat/82-branch-garden-paseo-08`, based on `fa592207e9bbbac28bf66af23b5fbf39dedc9347`. This record covers the working-tree migration; it does not certify a published release or a live beta installation.

## Contract and source changes

- Generated a fresh plugin in an empty temporary directory using `@getpaseo/cli@0.8.0-beta.1` and its real `paseo plugin init` command. Compared the two runtime entries, directory structure, DOM-free TypeScript configuration and exact SDK dependency with the generated scaffold.
- Read the official [beta quickstart](https://paseo.sh/docs/plugins/v0.8), [migration](https://paseo.sh/docs/plugins/v0.8/migration) and [reference](https://paseo.sh/docs/plugins/v0.8/reference), then checked the published exact plugin/client declarations.
- Split `index.ts` into `index.client.tsx` (the same `main` surface and sidebar) and `index.server.ts` (the same scan handler and Project/Workspace adapters). Both entries return cleanup; neither owns timers, subscriptions or stored contribution removers. Paseo owns registration teardown.
- Moved UI and view helpers into `client/`, Git scan and classification into `server/`, and the RPC schema into `shared/`. Moved their tests alongside them. Compared all eight moved files with the base revision after only the expected import substitutions; UI bodies, Git commands, classification, schemas and existing tests are unchanged.
- Replaced the 0.7 Vitest server stub with the actual 0.8 shared SDK root. Removed the obsolete alias configuration and DOM library. Pinned plugin/client development dependencies to `0.8.0-beta.1`, and declared `requirements.paseo: ^0.8.0`.
- Added a Branch Garden catalog version override. Provider Usage retains the collection default `0.7.2`; both effective versions are checked against SDK/client declarations and the lockfile. The existing collection tag is unchanged.

## Compiler finding and regression prevention

The initial beta compiler check passed in the development checkout. A second check in a temporary copy without `node_modules` failed to resolve the old direct `@getpaseo/client` type import in the server entry. Removed that import and the explicit callback annotations; the public `PluginServerContext` now supplies the inferred types. The exact client development dependency remains for the SDK's peer types.

The node_modules-free client and server bundles then compiled successfully with the published `@getpaseo/server@0.8.0-beta.1` compiler. The repository import checker now rejects that direct dependency even as a type import. It uses TypeScript syntax parsing for static imports, inline types, re-exports, import types and literal dynamic imports; it checks 0.8 runtime directory edges and retains the 0.7 runtime allowlist. This check does not replace the host compiler's full dependency resolution.

To repeat the compiler check with an already downloaded exact server package:

```powershell
node scripts/check-plugin-compiler.mjs plugins/branch-garden <beta.1-server-package-directory>
```

The helper checks the package name/version, copies source without `node_modules` or tests, invokes the private compiler API, requires bundles for the present entries, and removes only its guarded temporary directory. It does not start a daemon or install a plugin. Its private compiler path must be rechecked when changing the target Paseo version.

## Validation

Local environment: Windows, Node.js `24.18.0`, npm `11.14.1`. CI is configured for Node.js 22 on Windows/macOS/Linux; this local record is not a new hosted CI result.

- Branch Garden workspace typecheck and all 27 existing tests passed, including read-only Git argument rejection and the real-repository scan test that compares refs and working-tree status before/after scanning.
- Exact beta compiler passed for both entries from a source copy without `node_modules`.
- Root `npm run check` passed: documentation sync, Git-source imports, release metadata, both workspace typechecks and both plugin test suites. Final test totals: Branch Garden 27, Provider Usage 23, common validation scripts 7 (57 total). The script tests and release check were rerun after the final runtime-entry validation adjustment.
- `git diff --check` passed. Provider Usage source/package/manifest and all historical verification records are unchanged.

UI impact: **A** (internal refactor/import changes). Reviewed the source and exact UI declarations on Windows; component bodies, theme tokens, layout branches, states and accessibility text are unchanged. No manual light/dark or wide/compact UI review is required by the impact rules. No beta app UI was exercised.

## Remaining runtime and release work

No installed daemon/app was updated or restarted, and no plugin was installed or reloaded. Beta `running` status, live RPC responses, sidebar/surface behavior, host-owned cleanup, native clients and Git installation/update/failed-candidate recovery remain unverified under parent #77. Provider Usage source migration is separate.

The direct Git runner is preserved. It does not yet explicitly disable repository `core.fsmonitor`; the separate safety review already tracked in #77 remains outstanding. Existing tests establish the current allowlist and fixture Git-state behavior, not an OS sandbox or a guarantee about every repository's configured helpers.

The historical `v0.1.0-rc.2` tag and earlier screenshots/runtime records remain 0.7 evidence. Use that explicit tag when retaining both plugins on Paseo 0.7.2; this source migration does not publish a new collection release.
