# AGENTS.md

이 저장소는 Branch Garden과 Provider Usage 두 개의 독립적인 Paseo 플러그인을 개발하는 npm workspace다. 각 `plugins/*` 디렉터리는 자체 manifest와 진입점을 가진 별도의 설치 단위다.

현재 두 플러그인 소스·SDK·manifest는 **0.8.0-beta.1** 대상이며 실제 beta daemon/app 실행 검증은 후속 작업이다. 기존 배포 태그 `v0.1.0-rc.2`의 두 플러그인은 **0.7.2** 대상이다. 참조 문서는 **0.8.0-beta.1** 계약을 설명한다. 이관 계획은 [#77](https://github.com/NaruForge/Paseo-Plugin/issues/77), 파일·import·검증 순서는 [docs/MIGRATION_0.8.md](docs/MIGRATION_0.8.md)를 따른다.

아이디어, 개발 계획과 버그의 이슈 관리는 GitHub Issues를 사용한다. 새 이슈는 `.github/ISSUE_TEMPLATE/`의 양식을 사용하고, 분류·Project 상태·PR 연결 규칙은 `.github/ISSUE_MANAGEMENT.md`를 따른다.

작업을 시작할 때:

- 실제 구현을 시작할 때 해당 이슈의 GitHub Project Status를 `In progress`로 변경한다.
- 먼저 변경 대상 플러그인을 `plugins/`에서 고른다.
- 해당 디렉터리의 `paseo-plugin.json`에서 기본 설치 ID를 확인한다.
- 두 플러그인 소스는 `index.client.tsx`·`index.server.ts`와 `client/`·`server/`·`shared/`를 따른다.
- 한 플러그인만 바꿨으면 해당 workspace를, 구조나 공통 설치 상태를 바꿨으면 루트 workspace 전체를 검증한다.

플러그인 API는 실험 단계이므로 계약을 바꾸거나 새 기여 유형을 추가하기 전에 **대상 버전**의 문서를 확인한다. 0.8 작업은 [quickstart](https://paseo.sh/docs/plugins/v0.8), [reference](https://paseo.sh/docs/plugins/v0.8/reference), [migration](https://paseo.sh/docs/plugins/v0.8/migration)를, 기존 0.7 유지보수는 [v0.7 quickstart](https://paseo.sh/docs/plugins/v0.7)와 [reference](https://paseo.sh/docs/plugins/v0.7/reference)를 사용한다. Exact package declaration에 없는 API를 최신 문서만 보고 사용하지 않는다.

## Design Rules

- 플러그인의 클라이언트 UI를 만들거나 변경할 때는 [Paseo Plugin Design Rules](docs/DESIGN.md)를 따른다.
- 디자인 규칙이 공식 Plugin 문서나 대상 Paseo 버전의 `@getpaseo/plugin` package declaration과 충돌하면 공식 문서와 package declaration을 우선하고, 같은 변경에서 `docs/DESIGN.md`를 갱신한다.
- UI 검토는 `docs/DESIGN.md`의 영향 기반 등급을 적용한다. 변경이 영향을 줄 수 있는 layout, theme, 상태와 접근성만 확인하고, 새 화면·공통 UI 구조·공통 theme token 적용·반응형 동작을 바꾼 경우에만 wide/compact와 밝은/어두운 theme를 모두 확인한다. 검수 결과에는 등급, 실제로 확인한 환경과 나머지 환경을 생략한 근거를 짧게 남기고, 영향 여부가 불확실하면 한 단계 높은 등급을 적용한다.

## Common Commands

루트에서 의존성을 설치하고 모든 플러그인을 검사한다.

```powershell
npm install
npm run check:docs-sync
npm run check:git-source-imports
npm run typecheck
```

현재 플러그인 하나만 검사할 때는 package 이름을 workspace 선택자로 사용한다.

```powershell
npm run typecheck --workspace branch-garden
```

## Adding a Plugin

1. 지원할 Paseo 버전을 먼저 정하고 해당 CLI로 `plugins/<plugin-id>` 아래의 새 빈 디렉터리에 `paseo plugin init <absolute-directory> --id <plugin-id>`를 실행한다. 각 workspace의 대상 SDK와 manifest를 맞추고 catalog의 플러그인별 `paseoVersion`을 기록한다.
2. 생성된 `package.json`의 `name`과 `paseo-plugin.json`의 `id`가 이 저장소 안에서 고유한지 확인한다.
3. 루트에서 `npm install`을 실행해 workspace 설치 상태를 갱신한다.
4. 아래 Workspace Map, `README.md`, `README.ko.md`, `plugins.json`의 플러그인 목록·설치 예시·저장소 구조와 `.github/ISSUE_TEMPLATE/*.yml`의 대상 선택지를 갱신한다. Git source로 배포할 플러그인이면 `docs/GIT_INSTALLATION.md`의 설치 목록도 갱신한다.
5. `npm run check:docs-sync`, 새 플러그인의 workspace 타입 검사와 루트 전체 타입 검사를 실행한다.

기존 플러그인을 복사해 새 플러그인을 만들지 않는다. 현재 Paseo CLI가 생성하는 스캐폴드와 exact `@getpaseo/plugin` 의존성을 사용해야 플러그인 계약이 설치된 CLI 버전에 맞는다.

## Workspace Map

- `plugins/branch-garden/`
  Audience: **Personal operations**
  Role: 선택된 호스트의 Git Workspace와 로컬 브랜치 상태를 읽기 전용으로 집계하는 전역 사이드바 surface를 제공한다.
- `plugins/provider-usage/`
  Audience: **Personal operations**
  Role: 선택된 Host의 활성 Provider 연결과 사용량을 공식 SDK로 읽어 surface와 해당 Agent Composer pill에 표시하고 host Settings에서 표시 여부·필드를 저장한다. native 설정 → 사용량 화면을 대체하지 않는다.

## Per-Plugin Change Routing

현재 두 플러그인은 다음 0.8 runtime 규칙을 따른다.

- `index.client.ts[x]`: surface/sidebar/panel/command/slash/pill/attachment/theme/timeline/settings 등록과 client cleanup을 소유한다. `PluginClientContext`는 `@getpaseo/plugin/client`에서 가져온다. `addClientSide` wrapper 없이 helper cleanup을 직접 합성한다.
- `index.server.ts[x]`: RPC handler, settings persistence, provider와 lifecycle 등록·server cleanup을 소유한다. `PluginServerContext`는 `@getpaseo/plugin/server`에서 가져온다.
- `client/`: UI·훅·구독·query·controller. `server/`: Node·파일·프로세스·자격 증명·외부 API. `shared/`: 런타임 중립 값·타입·Zod 계약. Entry 외 소스 모듈은 이 디렉터리들에 두고 구형 루트 `index.ts`는 제거한다.
- 공유 `defineRpc`·`defineSettings`·`defineAttachmentSource`·`RpcInput`·`RpcOutput`·`PluginTheme`는 SDK root, client 훅·props는 `/client`, UI는 `/client/react-native`·`/client/ui`에서 가져온다. `/client/host`는 private이며 type import에도 runtime 경계를 적용한다.
- `*.logic.ts`, `*.view.ts`와 helper·테스트는 실제 소비자와 runtime 의존성에 따라 이동한다. 이름만으로 shared로 분류하지 않는다.
- 이관 완료 소스는 manifest에 `requirements.paseo`를 선언한다. 권장 범위는 `^0.8.0`, 이관 기준 SDK는 exact `0.8.0-beta.1`이다. Manifest만 바꿔 호환성을 표시하지 않는다.

- `client/*.tsx`: UI, 훅, React Native 스타일. 모든 `Text` 색상은 `theme.colors`, 루트 배경은 `theme.colors.surface0`, 좁은 화면은 `layout.compact`를 사용한다.
- `*.logic.ts`, `*.view.ts`: 런타임에 의존하지 않는 도메인 판단과 표시용 파생 값을 소유한다. 동작을 바꾸면 같은 이름의 테스트를 함께 확인한다.
- `*-registration.ts`, `*-query.ts`, `*-modal.ts`, `*-confirmation.ts`와 catalog·clipboard helper: client 등록, query와 비동기 controller 동작을 소유한다. 구독·pending state처럼 수명이 있는 자원은 만든 모듈에서 cleanup을 제공하고 동명 테스트를 함께 확인한다.
- `paseo-plugin.json`: 설치 기본 ID를 소유한다. 디렉터리명이나 package 이름으로 런타임 ID를 추측하지 않는다.
- `package.json`: 로컬 타입 검사용 exact `@getpaseo/plugin` 의존성을 소유한다. 공개 계약을 ambient declaration으로 임의 확장하지 않는다.

클라이언트 모듈에서 `server/`를 가져오거나 서버 모듈에서 `client/`를 가져오지 않는다. 화면 안에서 별도 Paseo 클라이언트를 만들지 않고 제공된 Paseo API를 사용한다.

## Synchronization Rules

- 기여 ID, surface ID, sidebar의 surface 연결 또는 등록 방식은 같은 플러그인의 client 등록 entry에서 함께 갱신한다. 0.7은 `index.ts`, 0.8은 `index.client.ts[x]`다. 연결된 컴포넌트의 export나 props가 영향을 받을 때만 해당 UI 모듈을 함께 바꾼다.
- RPC 입력·출력이 바뀌면 공유 계약, server 구현, handler 등록과 client 호출부를 영향 범위에 맞춰 갱신한다. 0.7은 suffix 모듈과 `plugin.handle`, 0.8은 runtime 디렉터리와 `index.server.ts[x]`의 `server.handle`을 사용한다.
- 0.8 Settings 변경은 공유 definition·schema version·migration, server `registerSettings`, client `useSettings`와 draft/revision 충돌 처리를 함께 대조한다. Settings 제거 시 값도 삭제되므로 운영 문서를 갱신한다.
- 플러그인 디렉터리를 추가·삭제·이름 변경하면 이 파일의 Workspace Map, `README.md`, `README.ko.md`, `plugins.json`의 플러그인 목록·설치 예시·저장소 구조, `.github/ISSUE_TEMPLATE/*.yml`의 대상 선택지와 루트 workspace 검증을 같은 변경에서 맞추고 `npm run check:docs-sync`를 실행한다. Git source 배포 목록에 영향을 주면 `docs/GIT_INSTALLATION.md`도 갱신한다.
- 플러그인의 사용자용 설치 요구 사항, 운영 절차 또는 안전 경계를 바꾸면 해당 내용을 이미 설명하는 루트나 플러그인 `README.md`와 `docs/` 문서를 같은 변경에서 갱신한다. 과거 release·verification 기록은 당시 사실을 보존하고 새 버전 증거를 별도로 추가한다.
- Paseo 플러그인 계약이 바뀌면 현재 CLI가 생성하는 새 스캐폴드, exact `@getpaseo/plugin` package declaration과 공식 참조 문서를 대조하고, 영향받는 각 플러그인의 타입 계약을 확인한다.
- 0.8 source 이관은 runtime import allowlist, Vitest stub, exact SDK·client dependency, lockfile·catalog 일치도 함께 검증한다. Catalog의 플러그인별 `paseoVersion`이 있으면 collection 기본 `paseoVersion`보다 우선한다. 현재 검사 스크립트 통과만으로 0.8 host compiler나 실행 호환성을 인증하지 않는다.

## Validation and Runtime Safety

- 문서만 바꾸고 플러그인 소스, package declaration, workspace 구조와 설치 상태에 영향을 주지 않은 경우에는 typecheck와 테스트를 요구하지 않는다. 문서의 명령·경로·계약을 바꿨다면 해당 내용의 정적 대조나 필요한 최소 검증은 수행한다.
- 한 플러그인의 소스 변경은 먼저 `npm run typecheck --workspace <package-name>`으로 검사한다.
- `branch-garden`의 logic, server, shared 또는 view 동작을 바꾸면 `npm run typecheck --workspace branch-garden`과 `npm test --workspace branch-garden`을 모두 실행한다. Git 명령 변경은 read-only allowlist와 실제 Git 상태 무변경 테스트를 반드시 통과해야 한다.
- `provider-usage`의 logic, server, shared, view, query, client 또는 registration 동작을 바꾸면 `npm run typecheck --workspace provider-usage`와 `npm test --workspace provider-usage`를 모두 실행한다. 현재 사용량은 공식 `providers.snapshot`·`listUsage`만 호출한다. 활성 연결 필터, 누락 값·오류 정규화, 직접 HTTP·자격 증명 접근·토큰 로그 부재 테스트를 통과해야 한다. 0.7 ref의 직접 HTTP를 변경할 때는 기존 Codex WHAM·Grok billing GET allowlist와 자격 증명 무기록·토큰 비로그 검사를 유지한다.
- workspace 구조, 설치 상태 또는 여러 플러그인에 걸친 변경은 루트에서 `npm run check:docs-sync`와 `npm run typecheck`로 검사한다.
- Git source 설치나 업데이트 경로를 변경하거나 배포를 준비할 때는 루트에서 `npm run check:git-source-imports`를 실행한다. Paseo는 package manager와 install script를 자동 실행하지 않는다. Manifest에 `build`가 있으면 명시한 argv 명령만 staged plugin directory에서 실행하므로, 현재 플러그인처럼 `build`를 생략한 source의 runtime import는 host 제공 모듈, Node 기본 모듈과 플러그인 내부 상대 경로만 사용한다.
- 같은 컴퓨터에서 소스를 편집하는 개발 흐름은 directory install과 `plugin reload`, 다른 daemon이나 PC에 배포하는 운영 흐름은 Git source의 `plugin add owner/repository:plugins/<id>`와 `plugin update`를 사용한다. `--path`는 legacy 호환 형식이다. 기존 directory runtime과 Git 검증 runtime에는 서로 다른 ID를 사용한다.
- 설치·업데이트 또는 재로딩까지 요청된 경우에만 대상 데몬과 source를 확인하고 directory source에는 `paseo plugin install`, Git source에는 `paseo plugin add`/`update`, 소스 변경 반영에는 `paseo plugin reload`를 실행한다. 설치 시 `paseo-plugin.json`의 ID가 기본값이며 `--id`를 지정하면 그 값이 실제 런타임 ID가 된다. 생명주기 명령과 로그 확인 전에는 대상 데몬에서 `paseo plugin ls`를 실행해 실제 런타임 ID를 확인하고, 원격 데몬에는 같은 명령에 `--host <host>`를 사용한다. 명령 실행 후에는 `paseo plugin ls`에서 상태와 오류를 확인한다.
- 플러그인은 신뢰된 비격리 코드다. 데몬의 전역 플러그인 스위치가 꺼져 있거나 없으면 사용자의 명시적 허가 없이 켜지 않는다.
- 소스 변경을 반영하려고 데몬을 재시작하지 않는다. `paseo plugin reload <runtime-id>`를 사용한다.
- 백엔드 오류는 `paseo plugin logs <runtime-id>`로 확인하고, 로그에 자격 증명이나 토큰을 남기지 않는다.

0.8 CLI의 원격 명령은 global 옵션 형식인 `paseo --host <target> plugin ls`·`paseo --host <target> plugin reload <runtime-id>`를 사용한다. Daemon과 app의 버전 요구 사항은 각각 검사한다. 신규 lifecycle/permission/terminal/provider API는 현재 두 플러그인의 읽기 전용 기능 범위를 자동으로 확장하지 않는다.
