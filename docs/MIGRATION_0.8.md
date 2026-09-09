# Paseo 0.8 플러그인 이관

이관 대상은 **Paseo 0.8.0-beta.1**이다. 0.8 정식판 지원 선언이 아니다. Branch Garden은 [#82](https://github.com/NaruForge/Paseo-Plugin/issues/82)에서 소스·manifest·SDK를 이관했으며 사용자가 당시 저장소의 세 플러그인(Branch Garden·Provider Usage·Prompt Palette)에 대해 Paseo 0.8 Runtime 검증을 완료했다([검증 기록](verification/paseo-0.8-runtime.md)). Provider Usage도 [#84](https://github.com/NaruForge/Paseo-Plugin/issues/84)에서 소스를 이관하고 공식 사용량 SDK와 표시 Settings를 적용했다. Command Deck은 이후 추가된 Windows 전용 소스이며 그 사용자 Runtime 보고에 포함되지 않는다. 기존 `v0.1.0-rc.2` 태그의 두 플러그인은 **0.7.2**를 유지한다. 전체 대응은 [#77](https://github.com/NaruForge/Paseo-Plugin/issues/77), 선행 참조 문서 갱신은 [#78](https://github.com/NaruForge/Paseo-Plugin/issues/78)에서 추적한다.

기준 문서는 [공식 migration](https://paseo.sh/docs/plugins/v0.8/migration), [quickstart](https://paseo.sh/docs/plugins/v0.8), [reference](https://paseo.sh/docs/plugins/v0.8/reference), [beta.1 릴리스](https://github.com/getpaseo/paseo/releases/tag/v0.8.0-beta.1)다. 2026-09-08에 배포된 exact plugin/client SDK 선언과 CLI scaffold 생성 코드를 정적으로 대조했다. Branch Garden은 2026-09-09에 beta.1 CLI의 실제 init과 compiler 검증을 수행했다. 당시 [소스 검증 기록](verification/branch-garden-0.8-source.md)은 보존하고, 이후 사용자 Runtime 검증 보고는 [별도 기록](verification/paseo-0.8-runtime.md)으로 구분한다. Git 배포 경로는 [#96](https://github.com/NaruForge/Paseo-Plugin/issues/96)에서 추적한다.

## 버전과 배포 경로

| 구분 | 지원 상태·사용 방법 |
| --- | --- |
| Collection `v0.1.0-rc.2` | Paseo 0.7.2 대상. 기존 태그와 실행 검증 기록을 보존 |
| Branch Garden 현재 소스 | Exact 0.8.0-beta.1 계약. Typecheck/test와 node_modules 없는 compiler 검증 완료; [사용자 0.8 Runtime 검증 완료](verification/paseo-0.8-runtime.md) |
| Provider Usage 현재 소스 | Exact 0.8.0-beta.1 계약, 공식 사용량 SDK와 Settings. [검증 기록](verification/provider-usage-0.8-source.md); [사용자 0.8 Runtime 검증 완료](verification/paseo-0.8-runtime.md) |
| Prompt Palette 현재 소스 | Exact 0.8.0-beta.1 계약. [사용자 0.8 Runtime 검증 완료](verification/paseo-0.8-runtime.md); 새 collection 릴리스에는 아직 미포함 |
| Command Deck 현재 소스 | Exact 0.8.0-beta.1 계약, Windows Host + PowerShell 7. [소스·Windows 터미널 검증](verification/command-deck-0.8-source.md); 설치된 앱/모바일과 Git 활성화는 미완. 새 collection 릴리스에는 아직 미포함 |
| 이 문서와 capability 참조 | Paseo 0.8.0-beta.1 계약을 설명. 현재 소스의 실행 가능성을 뜻하지 않음 |
| 후속 배포 작업 | [#96](https://github.com/NaruForge/Paseo-Plugin/issues/96)의 Git 경로 검증 후 새 collection prerelease 준비 |

0.7 사용자는 검토한 `--ref v0.1.0-rc.2` 또는 commit으로 고정한다. Default branch는 이미 0.8 소스이므로 이를 추적하는 설치는 지원 버전을 먼저 확인한다. 소스 안에 0.7용 `index.ts` compatibility entry를 남겨 양쪽을 지원하려 하지 않는다. 별도 Git ref로 구분한다.

## Manifest와 exact SDK

기존 0.7 manifest는 각각 `{ "id": "branch-garden" }`, `{ "id": "provider-usage" }`였다. 두 플러그인 모두 기존 ID를 유지하고 아래 requirements를 적용했다. 0.8은 `requirements.paseo` 누락을 `<0.8.0`으로 해석해 로드 전에 거부한다. 이관된 소스의 권장 범위는 다음과 같다.

```json
{
  "id": "branch-garden",
  "requirements": { "paseo": "^0.8.0" }
}
```

Provider Usage도 기존 ID를 유지한다. `^0.8.0`은 0.8 계열로 제한하며, Paseo의 prerelease 판정에서 beta.1도 만족한다. 공식 migration의 `>=0.8.0` 예시는 상한이 없으므로 미래 breaking release까지 포함한다. Beta.1 CLI scaffold 생성 코드는 `>=0.8.0-beta.1`을 쓰며, 이 저장소에서는 지원 범위를 의도적으로 검토해 정한다.

로컬 SDK는 이관하는 workspace의 `@getpaseo/plugin`을 exact `0.8.0-beta.1`로 맞춘다. Branch Garden의 `@getpaseo/client`도 SDK peer 타입 검사용 exact beta.1로 유지한다. 다만 node_modules 없는 Git source에서 직접 type import가 해석되지 않아 server entry는 `PluginServerContext`에서 타입을 추론한다. `plugins.json`의 플러그인별 `paseoVersion`이 있으면 collection 기본 `paseoVersion`보다 우선하며, release 검사는 이 유효 버전과 SDK/client·lockfile을 대조한다. 현재 collection 기본값은 0.8.0-beta.1이다. Manifest·버전 문자열만 먼저 바꿔 호환된다고 표시하지 않는다.

Daemon과 app은 자신의 버전을 각각 검사한다. Compatible daemon에 이전 app이 연결됐다고 client bundle이 호환되는 것은 아니다. 0.8 이전 Paseo는 새 requirements 진단을 이해하지 못하므로 0.7 사용자 보호를 manifest에만 의존하지 않는다.

## 파일과 import 이동

| 기존 0.7 | 이관 후 0.8 |
| --- | --- |
| `index.ts`의 UI 등록 | `index.client.tsx` |
| `index.ts`의 RPC handler | `index.server.ts` |
| `*.client.ts`, `*.client.tsx` | `client/`의 `.ts`·`.tsx` |
| `*.server.ts` | `server/`의 `.ts` |
| `*.shared.ts` | `shared/`의 `.ts` |
| `*.logic.ts`, `*.view.ts`, helper | 실제 runtime 의존성에 따라 분류. 루트에 소스 모듈을 남기지 않음 |

`index.client.ts[x]`와 `index.server.ts[x]` 중 필요한 것만 두되 최소 하나가 필요하다. Branch Garden과 Provider Usage는 UI와 RPC가 있어 둘 다 사용하며, Prompt Palette는 client UI와 server Settings 등록을 위해 둘 다 사용한다. Manifest/package/tsconfig는 루트에 남긴다. Nested feature 디렉터리는 각 runtime 아래에 보존하고 상대 import·테스트 경로를 함께 수정한다.

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
2. **Provider Usage**: Beta.1의 공식 `providers.listUsage()`로 전환하고 `providers.snapshot()`의 enabled 연결만 표시한다. Provider ID allowlist를 제거하고 미지원 사용량은 unavailable로 남긴다. 직접 GET 대비 인증·cache·오류 정책 차이는 검증 기록에 남긴다. 기본 entry 이관은 snapshot handler를 server로, surface/sidebar/Command Center/usage helper를 client로 옮기고 `contributeClient`의 cleanup을 반환한다. Agent 목록·구독 경합, pill 제거, query 공유를 유지한다.
3. **공통 검증 도구**: `scripts/check-git-source-imports.mjs`는 SDK 버전별 allowlist와 0.8 client/server/shared 경계를 검사한다. 0.8에서는 type import와 re-export도 포함하고 `/client/host`와 직접 `@getpaseo/client` type import를 거부한다. Branch Garden은 공유 root SDK의 실제 `defineRpc`로 테스트하여 기존 Vitest stub과 alias 설정을 제거했다. Provider Usage도 실제 공유 SDK로 테스트하며 구형 stub과 alias를 제거했다. Release catalog의 유효 exact 버전 일치 조건을 유지한다.

Provider Usage의 `provider-usage.view.ts`는 `PluginTheme`를 이용한 표시용 로직을 포함한다. Root의 공유 타입이라는 이유만으로 모든 view/helper를 shared로 옮기지 말고 실제 소비자와 의존성으로 판단한다. 테스트 mock이 잘못된 런타임 import를 숨기지 않도록 host compiler 검증을 별도로 수행한다.

## 검증과 기록

실제 이관을 시작할 때 해당 하위 이슈를 `In progress`로 옮긴다. 대상 beta CLI의 빈 임시 디렉터리에서 `paseo plugin init <absolute-directory> --id migration-probe`를 실행하고 생성 구조와 exact dependency를 대조한다. 기존 플러그인 복사는 scaffold 생성의 대안이 아니다.

소스 이관 후 다음을 확인한다.

- 각 플러그인 workspace typecheck와 test; 공통 검증에는 루트 `npm run check`
- Branch Garden의 read-only Git allowlist와 Git 상태 무변경, Provider Usage의 공식 read-only SDK 경계·활성 연결 필터·credential 접근 및 token 로그 부재
- 호환 beta daemon/app에서 source compile, 정확한 runtime ID의 `running`, RPC 결과와 surface/sidebar/Command Center
- Provider Usage pill의 최초 목록·구독·archive/remove/provider 변경·cleanup, 재연결/reload 시 중복 없음
- 저장한 contribution remover를 두 번 호출해 두 번째가 no-op인지 확인
- 승인된 Git 검증 runtime의 설치·성공 update·실패 후보 복구와 `node_modules` 없는 managed source 실행
- [Design](DESIGN.md)의 영향 기반 UI 등급, 실제 확인한 layout/theme/platform·상태, 생략 근거

설치/reload가 요청된 단계에서만 대상 daemon을 확인해 실행한다. 0.8 원격 명령은 `paseo --host <target> plugin ls`, `paseo --host <target> plugin reload <runtime-id>`처럼 global `--host`를 사용한다. Directory reload 실패는 이전 bundle로 복구되지 않으며 Git update의 후보 복구와 다르다. 소스 반영을 위해 daemon을 재시작하지 않는다.

문서 단계 #78은 완료됐다. Branch Garden 소스 이관은 타입·테스트·루트 검사와 아래 compiler 검사로 검증한다. 이 명령은 설치된 exact beta.1 server package를 명시적으로 받아 임시 사본에서 node_modules를 제외한 뒤 client/server를 compile하며 daemon을 시작하거나 설치하지 않는다. Compiler package의 내부 API를 사용하는 개발 검증 도구이므로 대상 버전을 바꿀 때 경로와 함수를 재대조한다.

```powershell
node scripts/check-plugin-compiler.mjs plugins/branch-garden <beta.1-server-package-directory>
node scripts/check-plugin-compiler.mjs plugins/provider-usage <beta.1-server-package-directory>
```

Fresh CLI scaffold는 임시 빈 디렉터리에 `npm exec --yes --package=@getpaseo/cli@0.8.0-beta.1 -- paseo plugin init <absolute-directory> --id migration-probe`로 생성할 수 있다. 앱/daemon 업데이트는 별도 작업이다. 과거 `docs/verification/` 기록과 릴리스 changelog는 당시 사실을 보존하고, 0.8 증거는 새 기록으로 추가한다.

## 신규 기능 범위

Provider Usage #84에는 사용자 요청에 따라 공식 사용량 SDK 전환과 표시 Settings 다섯 항목을 포함했다. 후속 #86에서 Sidebar 표시를 Paseo Layout으로 일원화하고 schema v2로 나머지 네 옵션을 보존한다. 설정 기본값·저장·cleanup·오류와 미지원 Provider 상태를 함께 검증한다. Provider/ACP, slash command, timeline, lifecycle hook, Terminal SDK 등 나머지 [기능표](plugin-capabilities/README.md)의 API는 이번 구현 범위에 포함하지 않는다.
