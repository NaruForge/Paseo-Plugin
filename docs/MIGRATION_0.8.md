# Paseo 0.8 플러그인 이관

현재 대상은 **Paseo 0.8.0 정식판**, 컬렉션은 **v0.1.0-rc.3**이다. 베타 이관은 [#77](https://github.com/NaruForge/Paseo-Plugin/issues/77), 정식판 대응은 [#112](https://github.com/NaruForge/Paseo-Plugin/issues/112)에서 추적한다. [정식판 검증 기록](verification/paseo-0.8.0-release.md)과 [호환성](COMPATIBILITY.md)을 함께 읽는다.

## Beta.1에서 정식판으로

[정식 릴리스](https://github.com/getpaseo/paseo/releases/tag/v0.8.0), [beta.1 이후 diff](https://github.com/getpaseo/paseo/compare/v0.8.0-beta.1...v0.8.0), [공식 migration](https://paseo.sh/docs/plugins/v0.8/migration), [quickstart](https://paseo.sh/docs/plugins/v0.8), [reference](https://paseo.sh/docs/plugins/v0.8/reference)를 exact npm 선언과 대조한다.

정식판은 Composer pill 계약을 바꿨다. `PluginComposerPillProps`, 최상위 `title`·`Component`·`onPress`를 제거하고 `button: { title, label, icon, behavior }`를 사용한다. 반환값은 호출 가능한 cleanup 함수가 아니라 `registration.update(patch)`와 `registration.remove()`를 가진 handle이다. 텍스트·disabled 상태는 `update`로 바꾸며 custom icon은 `PluginButtonIconProps`를 받는다. `addHeaderButton`도 같은 button 계약을 사용하지만 이번 컬렉션에는 새 header 기여를 추가하지 않는다.

| 플러그인 | 정식판 대응 |
| --- | --- |
| Branch Garden | SDK/client를 exact 0.8.0으로 갱신; 기존 읽기 전용 코드 유지 |
| Provider Usage | Gauge icon과 host label 분리; query·Settings·리셋 시계에서 label/title 갱신; handle 제거 |
| Prompt Palette | icon에서 기존 controlled Modal 유지; sender 구독으로 Sending…/disabled 갱신; 구독과 handle 정리 |
| Command Deck | Terminal icon·Commands label·공식 panel 열기 action으로 전환; handle 제거 |

Settings schema·revision, RPC 계약, Agent `send()`와 Terminal SDK 동작은 유지한다. 메시지·명령을 자동 재전송하지 않으며 cleanup은 터미널을 종료하지 않는다. 새 provider/lifecycle/header API는 기존 플러그인의 권한을 확장하지 않는다.

## 버전과 설치

네 workspace의 `@getpaseo/plugin`과 Branch Garden의 `@getpaseo/client`는 exact `0.8.0`이다. `plugins.json`과 lockfile도 맞춘다. Catalog의 플러그인별 `paseoVersion`이 collection 기본값보다 우선한다.

Manifest는 기존 ID와 `requirements.paseo: ^0.8.0`을 유지한다. Paseo의 prerelease matcher가 beta.1을 허용할 수 있어도 새 pill API는 beta.1에서 동작하지 않는다. **daemon, app, CLI를 모두 정식 0.8.0으로 맞춘다.** Manifest만으로 베타 실행을 보호한다고 가정하지 않는다.

0.7.2 사용자는 Branch Garden·Provider Usage를 `--ref v0.1.0-rc.2`에 고정한다. 정식 0.8.0용 네 플러그인은 `--ref v0.1.0-rc.3`을 사용한다. 이전 태그를 이동하거나 과거 검증 결과를 정식판 결과로 바꾸지 않는다. 고정 ref 변경과 Settings 백업은 [Git 설치](GIT_INSTALLATION.md)를 따른다. 앱/daemon 업데이트와 기존 설치 reload는 저장소 수정과 별도 작업이다.

## 0.7 소스를 이관할 때의 파일과 import

| 이전 | 0.8 |
| --- | --- |
| 혼합 `index.ts` | `index.client.ts[x]`와 `index.server.ts[x]`; 최소 한 entry |
| 루트 source helper | 소비 runtime에 따라 `client/`, `server/`, `shared/` |
| root `PluginContext` | `/client`의 `PluginClientContext`, `/server`의 `PluginServerContext` |
| root 훅·client props | `@getpaseo/plugin/client` |
| `/react-native`, `/ui` | `/client/react-native`, `/client/ui` |
| `/server`의 `defineRpc` | SDK root의 공유 계약 |
| `plugin.handle` | `server.handle` |
| `addClientSide` | client entry에서 helper 직접 호출·cleanup 합성 |
| `addClientSlashCommand` | `addSlashCommand` |

`defineSettings`, `PluginTheme`, `PluginCleanup` 같은 공유 값/타입은 root에서 가져온다. `/client/host`는 private이다. 클라이언트와 서버 사이의 import, shared의 runtime-specific import, client에 도달하는 Node import는 type-only와 전이 경로도 금지한다. 직접 `@getpaseo/client` type import 대신 제공된 `PluginServerContext`에서 필요한 타입을 추론한다. Git source 설치는 npm install을 자동 실행하지 않는다.

## 검증 순서

1. 대상 CLI로 빈 임시 디렉터리에 fresh scaffold를 만든다. 기존 플러그인 복사는 대안이 아니다.
2. Exact plugin/client declaration, host import allowlist, server compiler의 경로·인자를 대조한다.
3. 변경 workspace의 typecheck와 동작 테스트를 먼저 실행한다. 여러 플러그인·설치 상태 변경은 루트 `npm ci`와 `npm run check`를 실행한다.
4. 아래 compiler 검사를 네 플러그인에 실행한다. 임시 사본은 node_modules를 제외한다. 이 검사는 daemon을 시작하거나 플러그인을 설치하지 않는다.
5. [Design](DESIGN.md)의 UI 영향 등급에 따라 확인하고 실제 앱과 시뮬레이션을 구분한다. 배포는 세 OS CI와 [release 절차](RELEASING.md)를 따른다.

```powershell
npm exec --yes --package=@getpaseo/cli@0.8.0 -- paseo plugin init <absolute-empty-directory> --id migration-probe
node scripts/check-plugin-compiler.mjs plugins/branch-garden <0.8.0-server-package-directory>
node scripts/check-plugin-compiler.mjs plugins/provider-usage <0.8.0-server-package-directory>
node scripts/check-plugin-compiler.mjs plugins/prompt-palette <0.8.0-server-package-directory>
node scripts/check-plugin-compiler.mjs plugins/command-deck <0.8.0-server-package-directory>
```

Compiler 검사는 명시한 `@getpaseo/server`의 exact 버전이 SDK와 일치하는지 확인한다. 현재 검증된 private entry는 `dist/server/server/plugins/compiler.js`의 `compilePlugin({ client, server })`다. 다음 버전에서는 다시 대조한다.

설치/reload가 요청되면 대상 daemon의 `plugin ls`로 실제 runtime ID와 source를 확인한다. Directory는 install/reload, Git source는 add/update를 사용한다. 원격 명령은 `paseo --host <target> plugin ls` 형식이다. 소스 반영을 위해 daemon을 재시작하지 않는다.

## 과거 증거

[Branch Garden](verification/branch-garden-0.8-source.md), [Provider Usage](verification/provider-usage-0.8-source.md), [Prompt Palette](verification/prompt-palette-0.8-source.md), [Command Deck](verification/command-deck-0.8-source.md)의 베타 소스 검증과 [사용자 Runtime 보고](verification/paseo-0.8-runtime.md), [세 플러그인 Git 검증](verification/paseo-0.8-git-source.md)은 당시 사실을 보존한다. 정식판의 새 pill 구현이 실제 앱/모바일에서 검증됐다는 증거로 재사용하지 않는다.
