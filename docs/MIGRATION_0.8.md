# Paseo 0.8 플러그인 이관

이관 대상은 **Paseo 0.8.0-beta.1**이다. 0.8 정식판 지원 선언이 아니다. 현재 Branch Garden과 Provider Usage의 소스·manifest·SDK·catalog는 **0.7.2**를 유지한다. 전체 대응은 [#77](https://github.com/NaruForge/Paseo-Plugin/issues/77), 선행 참조 문서 갱신은 [#78](https://github.com/NaruForge/Paseo-Plugin/issues/78)에서 추적한다.

기준 문서는 [공식 migration](https://paseo.sh/docs/plugins/v0.8/migration), [quickstart](https://paseo.sh/docs/plugins/v0.8), [reference](https://paseo.sh/docs/plugins/v0.8/reference), [beta.1 릴리스](https://github.com/getpaseo/paseo/releases/tag/v0.8.0-beta.1)다. 2026-09-08에 배포된 exact plugin/client SDK 선언과 CLI scaffold 생성 코드를 정적으로 대조했다. 실제 beta init·compile·설치·UI 검증은 후속 이관의 완료 조건이다.

## 버전과 배포 경로

| 구분 | 지원 상태·사용 방법 |
| --- | --- |
| 현재 소스와 collection `v0.1.0-rc.2` | Paseo 0.7.2 대상. 기존 태그와 실행 검증 기록을 보존 |
| 이 문서와 capability 참조 | Paseo 0.8.0-beta.1 계약을 설명. 현재 소스의 실행 가능성을 뜻하지 않음 |
| 후속 0.8 이관 소스 | 별도 작업 branch/ref에서 검증하고 새 collection prerelease로 공개 |

0.7 사용자는 검토한 `--ref v0.1.0-rc.2` 또는 commit으로 고정한다. Default branch를 추적하는 설치는 향후 0.8 이관 commit도 받을 수 있으므로 지원 버전을 먼저 확인한다. 소스 안에 0.7용 `index.ts` compatibility entry를 남겨 양쪽을 지원하려 하지 않는다. 별도 Git ref로 구분한다.

## Manifest와 exact SDK

두 플러그인은 현재 각각 `{ "id": "branch-garden" }`, `{ "id": "provider-usage" }`다. 0.8은 `requirements.paseo` 누락을 `<0.8.0`으로 해석해 로드 전에 거부한다. 이관된 소스의 권장 범위는 다음과 같다.

```json
{
  "id": "branch-garden",
  "requirements": { "paseo": "^0.8.0" }
}
```

Provider Usage도 기존 ID를 유지한다. `^0.8.0`은 0.8 계열로 제한하며, Paseo의 prerelease 판정에서 beta.1도 만족한다. 공식 migration의 `>=0.8.0` 예시는 상한이 없으므로 미래 breaking release까지 포함한다. Beta.1 CLI scaffold 생성 코드는 `>=0.8.0-beta.1`을 쓰며, 이 저장소에서는 지원 범위를 의도적으로 검토해 정한다.

로컬 SDK는 두 workspace의 `@getpaseo/plugin`을 exact `0.8.0-beta.1`로 맞춘다. Branch Garden은 `@getpaseo/client` 타입을 직접 가져오므로 해당 dependency도 대조한다. `plugins.json.paseoVersion`, lockfile과 release 검사도 같은 변경에서 맞춘다. Manifest·버전 문자열만 먼저 바꿔 호환된다고 표시하지 않는다.

Daemon과 app은 자신의 버전을 각각 검사한다. Compatible daemon에 이전 app이 연결됐다고 client bundle이 호환되는 것은 아니다. 0.8 이전 Paseo는 새 requirements 진단을 이해하지 못하므로 0.7 사용자 보호를 manifest에만 의존하지 않는다.

## 파일과 import 이동

| 현재 0.7 | 이관 후 0.8 |
| --- | --- |
| `index.ts`의 UI 등록 | `index.client.tsx` |
| `index.ts`의 RPC handler | `index.server.ts` |
| `*.client.ts`, `*.client.tsx` | `client/`의 `.ts`·`.tsx` |
| `*.server.ts` | `server/`의 `.ts` |
| `*.shared.ts` | `shared/`의 `.ts` |
| `*.logic.ts`, `*.view.ts`, helper | 실제 runtime 의존성에 따라 분류. 루트에 소스 모듈을 남기지 않음 |

`index.client.ts[x]`와 `index.server.ts[x]` 중 필요한 것만 두되 최소 하나가 필요하다. 현재 두 플러그인은 UI와 RPC가 있어 둘 다 필요하다. Manifest/package/tsconfig는 루트에 남긴다. Nested feature 디렉터리는 각 runtime 아래에 보존하고 상대 import·테스트 경로를 함께 수정한다.

| 기존 import·등록 | 0.8 대체 |
| --- | --- |
| root SDK의 `PluginContext` | `/client`의 `PluginClientContext`, `/server`의 `PluginServerContext` |
| root SDK의 훅·UI props·client contribution 타입 | `@getpaseo/plugin/client` |
| `@getpaseo/plugin/react-native`와 root의 `Icon` | `@getpaseo/plugin/client/react-native` |
| `/server`의 `defineRpc`, `defineAttachmentSource` | `@getpaseo/plugin` |
| `/ui`, `/provider`, `/acp` | `/client/ui`, `/server/provider`, `/server/acp` |
| `plugin.handle` | `server.handle` |
| `plugin.addClientSide(contributeClient)` | client entry에서 helper를 직접 호출하고 cleanup 반환 |
| `addClientSlashCommand` | client `addSlashCommand` |
| 혼합 entry의 surface/sidebar/panel/command/attachment/theme/timeline 등록 | client entry의 해당 `add*` |

`PluginTheme`·`PluginCleanup`처럼 실제 root에 남은 공유 타입까지 `/client`로 일괄 옮기지 않는다. Shared는 Node·React·runtime-specific SDK 타입을 참조할 수 없으며 type import와 전이 의존성도 검사 대상이다. `/client/host`는 사용하지 않는다.

## 플러그인별 적용 순서

1. **Branch Garden**: server entry에 Project/Workspace SDK adapter와 scan handler를 연결하고 client entry에 `main` surface와 sidebar를 등록한다. Git·도메인 로직을 보존하며 import와 runtime 위치를 먼저 바꾼다. 자체 Git 실행의 `core.fsmonitor` 처리도 별도 안전성 검토 대상으로 삼는다. Paseo daemon의 수정이 플러그인의 직접 `execFile`에 자동 적용되지는 않는다.
2. **Provider Usage**: 먼저 beta.1의 `paseo.providers.listUsage()`와 현재 Codex/Grok 직접 GET의 반환 범위·필드·인증·cache/갱신·오류 정책을 대조한다. 이관에서 데이터 경로를 유지할지 SDK 전환을 별도 변경으로 진행할지 결정한다. 기본 entry 이관은 snapshot handler를 server로, surface/sidebar/Command Center/usage helper를 client로 옮기고 `contributeClient`의 cleanup을 반환한다. Agent 목록·구독 경합, pill 제거, query 공유를 유지한다.
3. **공통 검증 도구**: `scripts/check-git-source-imports.mjs`의 새 SDK 경로와 runtime 경계를 대조한다. 현재 allowlist는 0.7 기준이다. 두 `vitest.config.mts`의 `/server` stub은 공유 `defineRpc` 이동과 함께 갱신한다. Release catalog의 exact 버전 일치 조건도 유지한다.

Provider Usage의 `provider-usage.view.ts`는 `PluginTheme`를 이용한 표시용 로직을 포함한다. Root의 공유 타입이라는 이유만으로 모든 view/helper를 shared로 옮기지 말고 실제 소비자와 의존성으로 판단한다. 테스트 mock이 잘못된 런타임 import를 숨기지 않도록 host compiler 검증을 별도로 수행한다.

## 검증과 기록

실제 이관을 시작할 때 해당 하위 이슈를 `In progress`로 옮긴다. 대상 beta CLI의 빈 임시 디렉터리에서 `paseo plugin init <absolute-directory> --id migration-probe`를 실행하고 생성 구조와 exact dependency를 대조한다. 기존 플러그인 복사는 scaffold 생성의 대안이 아니다.

소스 이관 후 다음을 확인한다.

- 각 플러그인 workspace typecheck와 test; 둘 모두 이관한 뒤 루트 `npm run check`
- Branch Garden의 read-only Git allowlist와 Git 상태 무변경, Provider Usage의 GET allowlist·credential 무기록·token 비로그
- 호환 beta daemon/app에서 source compile, 정확한 runtime ID의 `running`, RPC 결과와 surface/sidebar/Command Center
- Provider Usage pill의 최초 목록·구독·archive/remove/provider 변경·cleanup, 재연결/reload 시 중복 없음
- 저장한 contribution remover를 두 번 호출해 두 번째가 no-op인지 확인
- 승인된 Git 검증 runtime의 설치·성공 update·실패 후보 복구와 `node_modules` 없는 managed source 실행
- [Design](DESIGN.md)의 영향 기반 UI 등급, 실제 확인한 layout/theme/platform·상태, 생략 근거

설치/reload가 요청된 단계에서만 대상 daemon을 확인해 실행한다. 0.8 원격 명령은 `paseo --host <target> plugin ls`, `paseo --host <target> plugin reload <runtime-id>`처럼 global `--host`를 사용한다. Directory reload 실패는 이전 bundle로 복구되지 않으며 Git update의 후보 복구와 다르다. 소스 반영을 위해 daemon을 재시작하지 않는다.

문서만 갱신하는 현재 단계는 상대 링크·명령·타입·공식 anchor 대조와 `npm run check:docs-sync`, `git diff --check`로 검증한다. Typecheck·test·실행 인증은 소스 이관 때 수행한다. 과거 `docs/verification/` 기록과 릴리스 changelog는 당시 사실을 보존하고, 0.8 증거는 새 기록으로 추가한다.

## 신규 기능은 별도 범위

Settings, Provider/ACP, slash command, live/durable timeline, lifecycle hook, Terminal SDK, Project 구독, Provider 사용량 `listUsage`는 [기능표](plugin-capabilities/README.md)에 정리했다. 이관 완료 조건은 기존 두 플러그인의 동작 보존이다. SDK 사용량 경로의 대체 가능성은 이관 설계에서 먼저 검토하되, 실제 데이터 경로 변경과 새 기능 채택은 검증 가능한 별도 변경으로 진행한다.
