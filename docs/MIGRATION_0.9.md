# Paseo 0.9 플러그인 이관

현재 대상은 **Paseo 0.10.x 안정 버전**(SDK exact 0.10.0)과 이전 **0.9.x**(0.9.2로 계속 검사), 컬렉션은 **v0.1.0-rc.4**이다. 0.10은 플러그인 API를 바꾸지 않았으므로 이 문서의 0.9 계약이 그대로 적용된다. 추적은 [#121](https://github.com/NaruForge/Paseo-Plugin/issues/121)과 [#125](https://github.com/NaruForge/Paseo-Plugin/issues/125)이다. [호환성](COMPATIBILITY.md), 최초 이관의 [0.9.0-beta.2 검증 기록](verification/paseo-0.9.0-beta.2.md), [0.9.2 / 0.10.0-beta.1 기록](verification/paseo-0.9.2-0.10.0-beta.1.md), 현재 범위의 [0.10.0 검증 기록](verification/paseo-0.10.0.md)을 함께 읽는다.

0.8 이관은 [MIGRATION_0.8.md](MIGRATION_0.8.md)에 보존한다. 0.9는 런타임 entry를 다시 쪼개지 않는다. 네 플러그인은 이미 `index.client.tsx` / `index.server.ts`와 정식 Composer `button` / `update` / `remove` 계약을 사용한다.

## 0.8에서 깨진 이유

`requirements.paseo: ^0.8.0`은 0.8.x만 허용한다. Paseo 0.9.0-beta는 설치·로드·reload 전에 거부한다. 코드 계약보다 버전 선언이 먼저 실패한다.

[0.9.0-beta.1 릴리스](https://github.com/getpaseo/paseo/releases/tag/v0.9.0-beta.1)의 플러그인 변경은 대체로 추가 API다. 이 컬렉션이 채택한 항목만 아래 표에 있다.

| 플러그인 | 0.9 대응 |
| --- | --- |
| Branch Garden | exact SDK/client 0.10.0(이관 당시 0.9.0-beta.2); 읽기 전용 Git 스캔 유지 |
| Provider Usage | Agent directory를 `list({ subscribe: {} })`로 한 번 소유하고 cleanup에서 `release`; 기존 usage SDK·pill `button` 유지 |
| Prompt Palette | 첫 Agent 목록에 `subscribe: {}`, 이후 페이지와 30초 갱신은 일반 `list`; cleanup에서 observation `release` |
| Command Deck | Prompt Palette와 같은 directory 소유; Workspace panel에 `locations: ["workspace", "explorer"]` |

Settings schema·revision, RPC, Agent `send()`, Terminal SDK, 읽기 전용 Git allowlist는 유지한다. 메시지·명령을 자동 재전송하지 않으며 cleanup은 터미널을 종료하지 않는다. `useHosts`, `openExternalUrl`, timeline transformer, npm 패키지 배포는 이번 컬렉션에 추가하지 않는다.

## 버전과 설치

네 workspace의 `@getpaseo/plugin`과 Branch Garden의 `@getpaseo/client`는 exact 안정 버전 `0.10.0`이다. Plugin SDK 선언은 이관 당시의 `0.9.0-beta.2`, `0.9.2`와 바이트 단위로 같다. `plugins.json`의 `paseoVersion`과 lockfile도 맞춘다. Catalog의 플러그인별 필드가 collection 기본값보다 우선한다.

Manifest는 기존 ID와 `plugins.json`의 `paseoRange`인 `requirements.paseo: >=0.9.0 <0.11.0-0`을 사용한다. Paseo는 전체 버전이나 stable core 중 하나라도 범위를 만족하면 허용하므로 이 범위는 0.9.x와 0.10.x를 허용하고 0.11 베타와 정식을 거부한다. 이관 당시의 `^0.9.0`은 0.10.0-beta.1을, 중간 범위 `>=0.9.0 <0.10.0-beta.2`는 0.10.0을 거부했다. **daemon, app, CLI를 이 범위 안의 버전으로 맞춘다.** 이전 안정 SDK는 `paseoPreviousVersion`(0.9.2)이며 `npm run check:paseo-channel -- previous`로 다시 검사한다. 새 베타를 추가하는 절차는 [릴리스 절차](RELEASING.md#paseo-version-channels)를 따른다.

0.7.2 사용자는 Branch Garden·Provider Usage를 `--ref v0.1.0-rc.2`에 고정한다. 0.8.0 사용자는 `--ref v0.1.0-rc.3`을 유지한다. 0.9.x·0.10.x 소스는 `--ref v0.1.0-rc.4`를 사용한다. 이전 태그를 이동하거나 과거 검증 결과를 0.9 결과로 바꾸지 않는다. 고정 ref 변경과 Settings 백업은 [Git 설치](GIT_INSTALLATION.md)를 따른다.

## 검증 순서

1. 대상 CLI로 빈 임시 디렉터리에 fresh scaffold를 만든다.
2. Exact plugin/client declaration, host import allowlist, server compiler의 경로·인자를 대조한다.
3. 변경 workspace의 typecheck와 동작 테스트를 먼저 실행한다. 여러 플러그인·설치 상태 변경은 루트 `npm ci`와 `npm run check`를 실행한다.
4. 아래 compiler 검사를 네 플러그인에 실행한다. 임시 사본은 node_modules를 제외한다. 이 검사는 daemon을 시작하거나 플러그인을 설치하지 않는다.
5. [Design](DESIGN.md)의 UI 영향 등급에 따라 확인하고 실제 앱과 시뮬레이션을 구분한다.

```powershell
npm exec --yes --package=@getpaseo/cli@0.10.0 -- paseo plugin init <absolute-empty-directory> --id migration-probe
node scripts/check-plugin-compiler.mjs plugins/branch-garden <0.10.0-or-0.9.2-server-package-directory>
node scripts/check-plugin-compiler.mjs plugins/provider-usage <0.10.0-or-0.9.2-server-package-directory>
node scripts/check-plugin-compiler.mjs plugins/prompt-palette <0.10.0-or-0.9.2-server-package-directory>
node scripts/check-plugin-compiler.mjs plugins/command-deck <0.10.0-or-0.9.2-server-package-directory>
npm run check:paseo-channel -- previous
```

`<server-package-directory>`는 빈 임시 디렉터리에서 `npm install --ignore-scripts @getpaseo/server@<version>`으로 받은 `node_modules/@getpaseo/server`다. Compiler 검사는 plugin SDK가 catalog `paseoVersion`과 같고, 명시한 `@getpaseo/server`의 exact 버전이 catalog `paseoVersion`, `paseoPreviousVersion` 또는 `paseoBetaVersion`인지 확인한다. Catalog에 있는 모든 버전의 compiler를 실행한다. 현재 검증된 private entry는 `dist/server/server/plugins/compiler.js`의 `compilePlugin({ client, server })`다.

설치/reload가 요청되면 대상 daemon의 `plugin ls`로 실제 runtime ID와 source를 확인한다. Directory는 install/reload, Git source는 add/update를 사용한다. 원격 명령은 `paseo --host <target> plugin ls` 형식이다. 소스 반영을 위해 daemon을 재시작하지 않는다.

## 과거 증거

[0.8.0 정식판 기록](verification/paseo-0.8.0-release.md), [사용자 Runtime 보고](verification/paseo-0.8-runtime.md), [Git 검증](verification/paseo-0.8-git-source.md)은 당시 사실을 보존한다. 0.9 앱/모바일 동작의 증거로 재사용하지 않는다.
