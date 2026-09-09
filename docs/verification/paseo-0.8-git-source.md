# Paseo 0.8 Git source verification

Recorded: 2026-09-09. Issue: [#96](https://github.com/NaruForge/Paseo-Plugin/issues/96). Follow-up to the [user runtime report](paseo-0.8-runtime.md) after [#77](https://github.com/NaruForge/Paseo-Plugin/issues/77). This record covers Git `plugin add`, successful `plugin update`, and failed-candidate recovery. It is not a new collection release and does not repeat the user runtime report.

## Environment and boundaries

Windows 10.0.26200.9168 host `BSW-HOME`. Local Paseo CLI and daemon both reported **0.8.0-beta.1**. Daemon home `C:\Users\swBaek\.paseo`; `pluginsEnabled` was already `true` and was not changed. The daemon was not restarted. Node.js `24.18.0` was used only for a checkout `node_modules` scan.

Existing directory runtimes `branch-garden`, `provider-usage`, `prompt-palette`, and `command-deck` stayed installed and `running` throughout. Git verification used distinct IDs. `plugin update --all` was not used. The published tag `v0.1.0-rc.2` was not installed or moved.

In-scope plugins: Branch Garden, Provider Usage, Prompt Palette. Command Deck Git activation was outside #96 and remains unverified here. App UI, native mobile, and a repeat of the user runtime RPC/UI report were not part of this Git-path check.

## Source selection

Temporary tracking branch `verify/issue-96-git-source` was pushed from `main` at `b04930051646ba2edc15ccd956a76abde3357dbd` (`docs: Command Deck 문서 동선과 제거·설치 안내 정비 (#108)`). Probe commits lived only on that branch. After the checks, the remote and local branch and the isolated worktree were deleted so the failure probe cannot land on `main`.

| Commit | Role |
| --- | --- |
| `b04930051646ba2edc15ccd956a76abde3357dbd` | Install ref; same tree as `origin/main` at the start of the session |
| `3a2239410f23b718441ee98c91ef8215f70e0462` | Successful-update probe (docs-only marker on the verify branch) |
| `88bc4287d96cb1051ea0ba7da9632e1c4214561d` | Failed candidate: Branch Garden `index.server.ts` threw during `contribute()` |
| `44e76dad5db664b22e126be1d3d836006eb97d36` | Recovery: throw removed; plugin source matches the install tree |

Workspace typechecks for the three plugins passed on the local `main` tree before Git install.

## Git install

Each plugin was added from GitHub with `--ref verify/issue-96-git-source` and a verify ID:

```powershell
paseo plugin add NaruForge/Paseo-Plugin:plugins/branch-garden --ref verify/issue-96-git-source --id branch-garden-git-verify
paseo plugin add NaruForge/Paseo-Plugin:plugins/provider-usage --ref verify/issue-96-git-source --id provider-usage-git-verify
paseo plugin add NaruForge/Paseo-Plugin:plugins/prompt-palette --ref verify/issue-96-git-source --id prompt-palette-git-verify
```

`plugin ls` reported `source=git`, `status=running`, `commit=b04930051646`, no load error. Logs for each verify ID showed Loading → Plugin ready, with no credentials or tokens. Managed checkouts under `C:\Users\swBaek\.paseo\plugins\<id>\` contained no `node_modules`.

On this CLI, `paseo plugin status <id>` listed the installed commit and ref in the same shape as `plugin ls`. It did not print `commitsBehind` / `updateAvailable`. Ahead counts appeared in `plugin update --json` instead.

## Successful update

After the marker commit was pushed, each verify ID was updated individually:

| Runtime ID | previousCommit | currentCommit | commits | updated |
| --- | --- | --- | --- | --- |
| `branch-garden-git-verify` | `b04930051646ba2edc15ccd956a76abde3357dbd` | `3a2239410f23b718441ee98c91ef8215f70e0462` | 1 | true |
| `provider-usage-git-verify` | `b04930051646ba2edc15ccd956a76abde3357dbd` | `3a2239410f23b718441ee98c91ef8215f70e0462` | 1 | true |
| `prompt-palette-git-verify` | `b04930051646ba2edc15ccd956a76abde3357dbd` | `3a2239410f23b718441ee98c91ef8215f70e0462` | 1 | true |

All three remained `running` on `3a2239410f23` with no load error. Directory runtimes were unchanged.

## Failed candidate and recovery

Failed-candidate recovery was exercised on Branch Garden only. The other two Git runtimes stayed on the successful-update commit.

`plugin update branch-garden-git-verify` against `88bc4287d96c` failed (`DaemonRpcError` / `plugin.source.update.request`, message included `issue-96 git-source failed-candidate probe`). Logs showed the candidate failed to load, then the previous checkout loaded and reported Plugin ready. `plugin ls` still reported `running` at `3a2239410f23`. Directory runtimes and the other Git verify IDs were unchanged.

The recovery commit `44e76dad5db6` was then pushed. `plugin update branch-garden-git-verify` succeeded: `previousCommit=3a2239410f23…`, `currentCommit=44e76dad5db6…`, `commits=2`, `updated=true`. The runtime returned to `running` with Plugin ready. The recovered checkout also had no `node_modules`.

## Cleanup

The three verify IDs were removed. `plugin ls` then showed only the original directory runtimes, all `running`: `branch-garden`, `command-deck`, `prompt-palette`, `provider-usage`. The verify branch, worktree, and local branch were deleted. The daemon was not restarted.

## Omissions

- Command Deck Git `add` / `update` / failed-candidate recovery
- Installed-app UI, two app clients, native mobile, and RPC/UI re-verification of the three plugins
- Exact Paseo app/client build beyond the daemon/CLI **0.8.0-beta.1** report
- Reuse of the historical 0.7.0-beta.1 Git-update evidence in `GIT_INSTALLATION.md`
- A published 0.8 collection tag or maturity change
