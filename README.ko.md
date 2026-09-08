# Paseo Plugins

[English](README.md) · 커뮤니티에서 유지보수하는 플러그인 모음이며 Paseo 공식 운영·보증 저장소가 아닙니다.

사용자 안내: [호환성](docs/COMPATIBILITY.md) · [설정](docs/CONFIGURATION.md) · [릴리스](docs/RELEASING.md) · [보안](SECURITY.md) · [지원](SUPPORT.md)

첫 공개 사전 릴리스 [v0.1.0-rc.2](https://github.com/NaruForge/Paseo-Plugin/releases/tag/v0.1.0-rc.2)를 발행했습니다. 릴리스 노트에서 버전을 고정하는 설치 명령과 지원 범위·제한 사항을 확인할 수 있습니다.

Branch Garden과 Provider Usage 두 개의 [Paseo](https://paseo.sh) 플러그인에 집중하는 npm workspace입니다. 이 저장소의 핵심 지원 대상이며, Paseo 팀의 공식 지원을 의미하지 않습니다. Provider Usage의 공급자 연동은 여전히 실험적입니다. 각 `plugins/*` 디렉터리는 자체 manifest와 진입점을 가진 별도의 설치 단위이며, 플러그인끼리 런타임 코드를 공유하지 않습니다.

> **현재 소스·배포 대상: `0.7.2` / 새 참조 문서: `0.8.0-beta.1`** — 현재 두 플러그인은 0.8에서 그대로 로드되지 않습니다. [0.8 이관 안내](docs/MIGRATION_0.8.md)와 [대응 이슈 #77](https://github.com/NaruForge/Paseo-Plugin/issues/77)을 확인하세요. [Paseo Plugin Capabilities](docs/plugin-capabilities/README.md)는 새 베타 API를 설명하며 실행 호환성 인증이 아닙니다. 실제 이관 시 해당 CLI의 fresh scaffold와 exact SDK 선언을 다시 대조합니다.

> [!WARNING]
> Paseo 플러그인은 신뢰된 비격리 코드입니다. 서버 측 코드는 daemon이 실행되는 컴퓨터의 파일, 프로세스, 자격 증명과 네트워크에 접근할 수 있고, 클라이언트 코드는 Paseo 앱 안에서 실행됩니다. 검토하고 신뢰하는 소스만 설치하세요.

## 포함된 플러그인

| Runtime ID | 대상 | 역할 |
| --- | --- | --- |
| [`branch-garden`](plugins/branch-garden/) | Personal operations | 선택된 host의 등록된 Git Project·Workspace와 로컬 branch·worktree 상태를 읽기 전용으로 집계하는 전역 sidebar surface입니다. |
| [`provider-usage`](plugins/provider-usage/) | Personal operations | 선택된 Host의 Codex와 Grok 계획 사용량을 읽기 전용으로 집계해 전역 sidebar와 Agent Composer pill에 보여 줍니다. |

Runtime ID의 기준은 디렉터리명이나 package 이름이 아니라 각 플러그인의 `paseo-plugin.json`입니다.

Branch Garden의 UI·접근성 문구·자체 오류와 경고는 영어로 표시됩니다. 사용자가 정한 Project·Workspace·브랜치 이름과 외부 도구의 진단 원문은 바꾸지 않습니다. Provider Usage에는 한국어 상태 문구가 남아 있습니다. 각 플러그인의 README에서 실제 화면을 확인할 수 있습니다.

## 시작하기

필요한 도구:

- Paseo Desktop/daemon/CLI `0.7.2`
- Branch Garden을 사용할 daemon host의 Git과 등록된 Paseo Project 또는 Workspace
- 로컬 개발·검증에는 Node.js 22 이상과 npm (Git source 설치만 할 때는 npm 실행 불필요)
- `provider-usage`는 선택된 host에 이미 저장된 Codex·Grok 인증만 읽으며, 인증이 없는 provider는 사용 불가 상태로 표시합니다.

로컬 개발 시 루트에서 의존성을 설치하고 문서 동기화·Git-source runtime import·릴리스 메타데이터·모든 workspace 타입과 테스트를 검사합니다.

```powershell
npm ci
npm run check
```

동작 로직을 변경했다면 해당 플러그인의 테스트를 실행합니다. 전체 테스트는 Windows·macOS·Linux에서 다음 명령으로 실행합니다.

```powershell
npm test
```

플러그인 하나만 검사할 때는 package 이름을 workspace 선택자로 사용합니다.

```powershell
npm run typecheck --workspace branch-garden
```

## 플러그인 설정

두 플러그인은 별도의 사용자 설정 파일이 필요하지 않습니다. Branch Garden은 Git과 Paseo Workspace를, Provider Usage는 기존 공급자 인증을 사용합니다. [설정 안내](docs/CONFIGURATION.md)와 [제거된 플러그인 안내](docs/REMOVED_PLUGINS.md)를 확인하세요.

## 로컬 설치와 reload

먼저 대상 daemon의 **Settings → Plugins**에서 플러그인이 활성화되어 있는지 확인하세요. 전역 플러그인 switch를 켜는 것은 해당 daemon에서 모든 신뢰된 플러그인 코드를 허용하는 보안 결정입니다.

저장소 루트에서 절대 경로로 원하는 플러그인을 설치합니다.

```powershell
$repoRoot = (Resolve-Path .).Path
paseo plugin ls
paseo plugin install (Join-Path $repoRoot "plugins\branch-garden")
paseo plugin install (Join-Path $repoRoot "plugins\provider-usage")
paseo plugin ls
```

소스를 변경한 뒤에는 daemon을 재시작하지 말고 실제 runtime ID로 reload합니다.

```powershell
npm run typecheck --workspace branch-garden
npm test --workspace branch-garden
paseo plugin reload branch-garden
paseo plugin ls
paseo plugin logs branch-garden
```

설치·reload·제거를 수행하기 전에는 `paseo plugin ls`로 대상 host와 runtime ID를 확인하세요. 0.8 CLI의 원격 옵션은 `paseo --host <host> plugin ls`처럼 명령 앞에 둡니다. 위 로컬 소스 설치 예시는 현재 소스와 호환되는 0.7.2 daemon/client를 전제로 합니다.

## Git source 배포와 update

다른 daemon이나 PC에 배포할 때는 Git source의 canonical monorepo `repository:relative/path` 형식을 사용합니다. Paseo는 lockfile을 보고 package manager나 install script를 자동 실행하지 않습니다. 다만 manifest에 명시적인 `build`가 있으면 신뢰된 비격리 준비 명령으로 실행하므로, 먼저 source를 검토하고 문서 동기화·runtime import·타입 검사를 통과시켜야 합니다.

```powershell
npm run check:docs-sync
npm run check:git-source-imports
npm run typecheck
paseo plugin ls
paseo plugin add NaruForge/Paseo-Plugin:plugins/branch-garden --ref v0.1.0-rc.2
paseo plugin add NaruForge/Paseo-Plugin:plugins/provider-usage --ref v0.1.0-rc.2
paseo plugin ls
paseo plugin status
paseo plugin update --all
paseo plugin ls
```

위 예시는 0.7 호환 태그로 고정하므로 `update`로 새 commit으로 이동하지 않습니다. `--ref`를 생략하면 default branch를 추적해 향후 0.8 이관 commit을 받을 수 있습니다. 명시적 branch는 새 commit을 추적하며 tag와 commit은 고정됩니다. 기존 directory 설치와 Git 설치에 같은 runtime ID를 사용하지 마세요. 임시 ID 검증, 실패 후보 복구와 정리 절차는 [Git source 설치와 업데이트](docs/GIT_INSTALLATION.md)에 정리되어 있습니다.

## 저장소 구조

```text
.
├── plugins/
│   ├── branch-garden/
│   └── provider-usage/
├── docs/
│   ├── DESIGN.md
│   ├── GIT_INSTALLATION.md
│   └── plugin-capabilities/
├── scripts/
│   └── check-git-source-imports.mjs
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── ISSUE_MANAGEMENT.md
├── AGENTS.md
└── package.json
```

아래 표는 아직 이관하지 않은 **현재 0.7 소스**의 경로입니다. 0.8에서는 `index.client.ts[x]`·`index.server.ts[x]`와 `client/`·`server/`·`shared/`로 이동합니다. 새 등록·import·cleanup 규칙은 [이관 안내](docs/MIGRATION_0.8.md#파일과-import-이동)를 따릅니다.

| 파일 | 역할 |
| --- | --- |
| `index.ts` | 기여 등록, RPC handler 연결과 cleanup 수명주기 |
| `*.client.ts` | client contribution 조립, 구독과 controller cleanup |
| `*.client.tsx` | React Native UI, hook, theme와 responsive layout |
| `*.server.ts` | 파일 시스템, 프로세스, 자격 증명과 외부 API 같은 daemon 측 동작 |
| `*.shared.ts` | 클라이언트와 서버가 공유하는 Zod RPC 계약과 순수 값 |
| `*.logic.ts`, `*.view.ts` | runtime에 의존하지 않는 판단과 표시용 파생 값 |
| `*-registration.ts` 등 helper | client 등록, query, modal과 비동기 controller 수명주기 |
| `paseo-plugin.json` | 기본 설치 runtime ID |
| `package.json` | 로컬 타입 검사에 사용하는 exact `@getpaseo/plugin` 개발 의존성 |

클라이언트 모듈에서 `*.server.ts`를 가져오거나 서버 모듈에서 `*.client.tsx`를 가져오지 않습니다. 화면 안에서 별도의 Paseo client를 생성하지 않고 host가 제공한 Paseo API와 plugin RPC를 사용합니다.

## 개발 원칙

- UI 변경은 [Paseo Plugin Design Rules](docs/DESIGN.md)를 따릅니다.
- 0.8의 새 기여 지점을 선택할 때는 [Paseo Plugin Capabilities](docs/plugin-capabilities/README.md)에서 지원 범위와 제한을 확인합니다. 기존 0.7 소스에 신규 API를 바로 적용하지 않습니다.
- UI 검수는 디자인 규칙의 영향 기반 A–D 등급을 적용합니다. 변경이 영향을 주는 layout·theme·상태·접근성만 확인하고, D 등급에서 wide/compact와 밝은/어두운 theme를 모두 확인합니다.
- Git 명령은 read-only allowlist와 상태 무변경 테스트를 유지합니다.
- Git source로 배포하기 전에 `npm run check:git-source-imports`로 install 없이 사용할 수 없는 runtime dependency를 차단합니다.
- 한 플러그인만 변경하면 해당 workspace를, 공통 계약·설치 상태·여러 플러그인을 변경하면 루트 전체를 검증합니다.
- Plugin API 계약을 바꾸거나 새 기여 유형을 사용할 때는 공식 문서와 현재 CLI의 새 scaffold를 대조합니다.

상세한 저장소 작업 규칙은 [AGENTS.md](AGENTS.md)를 참고하세요.

## 이슈와 작업 관리

아이디어, 개발 계획과 버그는 [GitHub Issues](https://github.com/NaruForge/Paseo-Plugin/issues)에서 관리합니다. 새 이슈는 `.github/ISSUE_TEMPLATE/`의 양식을 사용하고, 상태·우선순위·하위 Issue·PR 연결 방식은 [Issue 관리 규칙](.github/ISSUE_MANAGEMENT.md)을 따릅니다.

## 공식 문서

- [Paseo Plugin 문서 버전 선택](https://paseo.sh/docs/plugins)
- [Paseo v0.7 Plugin quickstart](https://paseo.sh/docs/plugins/v0.7)
- [Paseo v0.7 Plugin reference](https://paseo.sh/docs/plugins/v0.7/reference)
- [Paseo v0.8 beta quickstart](https://paseo.sh/docs/plugins/v0.8)
- [Paseo v0.8 beta reference](https://paseo.sh/docs/plugins/v0.8/reference)
- [Paseo v0.8 migration](https://paseo.sh/docs/plugins/v0.8/migration)
- [Paseo v0.8 provider plugins](https://paseo.sh/docs/plugins/v0.8/providers)
- [Paseo CLI](https://paseo.sh/docs/cli)
- [Paseo TypeScript SDK](https://paseo.sh/docs/sdk/reference)
