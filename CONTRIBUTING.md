# Contributing

English and Korean contributions are welcome. Start with an [issue](https://github.com/SWBaek/Paseo-Plugin/issues/new/choose) describing the user problem and an observable result. For large changes, agree on scope before implementation. The maintainer manages Project fields; contributors do not need access to the private GitHub Project.

## Local development

Use Node.js 22, npm, and Git. Clone your fork, create a branch, and run:

```sh
npm ci
npm run check
```

Each `plugins/*` directory is independently installed. Read its manifest to identify the default runtime ID. Start with `index.ts` for contributions, `*.client.tsx` for UI, and `*.server.ts` for host operations. Do not share runtime code between plugins. Paseo supplies runtime modules; local npm dependencies are for development. Never add an ambient declaration to invent a Paseo API.

For one plugin:

```sh
npm run typecheck --workspace branch-garden
npm test --workspace branch-garden
```

Both plugin test suites run on Windows, macOS and Linux. Automated tests do not establish native client or daemon runtime support.

## Runtime and UI review

Use a daemon you control. Check `paseo plugin ls` before every lifecycle operation. Install a development directory under a distinct runtime ID, then reload that ID after edits. Do not restart the daemon. Do not enable its global plugin switch without the owner's permission.

```sh
paseo plugin install /absolute/path/to/Paseo-Plugin/plugins/branch-garden --id branch-garden-dev
paseo plugin reload branch-garden-dev
paseo plugin ls
paseo plugin logs branch-garden-dev
```

Use [configuration guidance](docs/CONFIGURATION.md) for prerequisites. Remove temporary installations after verification.

Follow [Design rules](docs/DESIGN.md). Report the impact grade, tested layouts/themes/states, and why other environments were omitted. Use actual UI screenshots; redact private project names, local paths, account details and tokens before attaching them. Label fixture renders as fixtures.

## Pull requests

Use the PR template and `Closes #<issue>`. Explain the user-visible result and validation. Update relevant plugin guides, both root READMEs and the catalog when behavior or requirements change. Documentation-only work needs link/contract checks, not unrelated tests.

Keep read-only command and HTTP allowlists, credential boundaries and cleanup behavior intact. Test changed behavior and failure paths. Never include credentials or private logs. See [SECURITY.md](SECURITY.md) for sensitive reports.

Contributions are provided under this repository's [MIT license](LICENSE). Credit upstream code and preserve applicable notices. Be respectful, discuss the work, and avoid personal attacks or harassment; maintainers may moderate disruptive participation.

Repository-specific agent instructions are in [AGENTS.md](AGENTS.md); release responsibilities are in [RELEASING.md](docs/RELEASING.md).
