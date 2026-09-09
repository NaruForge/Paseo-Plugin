---
name: repository-readiness
description: "Audit or improve documentation readiness only in the Paseo-Plugin repository. Use only when the user explicitly invokes $repository-readiness; never select it for ordinary README edits, documentation work, or code reviews."
---

# Repository Readiness

Evaluate whether a first-time GitHub visitor can understand Paseo-Plugin, choose a plugin and compatible version, install and use it, recognize expected results, troubleshoot, update/remove it, and contribute without separate explanations.

## Invocation and repository boundary

- Run only on an explicit user invocation of `$repository-readiness`. A quoted example or discussion of this skill does not itself request an audit. Keep `policy.allow_implicit_invocation: false` in `agents/openai.yaml`.
- This is a project-local skill for NaruForge/Paseo-Plugin, including its forks and worktrees. Resolve the repository containing this skill and read its applicable `AGENTS.md`. Confirm identity from the root README and repository metadata; do not rely on a machine-specific absolute path or audit a different current working directory.
- **Audit is the default:** a bare invocation, `audit`, or `review` reads and reports only. Do not create report files unless the user requests an artifact.
- **Improve requires an explicit request:** `improve` or an equivalent instruction to edit documentation authorizes an audit followed by documentation corrections. A request for recommendations alone does not authorize edits. An explicit “do not modify files” constraint keeps the work read-only.

## Evidence scope

Read these user-facing documents when present; discover the current plugin list rather than fixing names or counts in this skill:

- `README.md`, `README.ko.md`, `plugins/*/README.md`.
- `docs/COMPATIBILITY.md`, `docs/CONFIGURATION.md`, `docs/GIT_INSTALLATION.md`, `docs/MIGRATION_*.md`, `docs/REMOVED_PLUGINS.md`.
- `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`, and `docs/screenshots/*`.
- Follow relevant links, including existing verification records, to understand the user's actual navigation and the provenance of documented claims. Read contributor procedures only as documentation; do not execute their commands.
- Use `plugins.json` and `plugins/*/paseo-plugin.json` only as references for obvious name, plugin list, default ID, maturity, release, or version inconsistencies. They do not establish implementation correctness, tested compatibility, or publication. A manifest range and an exact development target are not inherently inconsistent.

Base findings on information a GitHub visitor can access. Ignored local artifacts, private issue/project information, and unstated conversation knowledge do not fill gaps in public documentation. Identify the checkout/ref reviewed and distinguish local inspection from any remote page verification; do not imply that a link is live or a ref is published without checking it. If an essential source cannot be inspected, report that limit rather than inventing evidence or silently passing it.

## Excluded work

Do not inspect or grade source quality, implementation correctness, architecture, unit tests, coverage, CI design, GitHub Actions internals, or source-code security. Do not run `npm test`, typecheck, build, CI, repository validation scripts, or real plugin feature/runtime checks. Do not install/update/remove/reload plugins, start/restart a daemon, change its switch, or send Agent messages.

Do not create or recommend new validation/metadata scripts, lint rules, tests, CI improvements, or refactoring. Reading a command in documentation is not authorization to run it. Static checks of documentation links and paths are allowed; they do not certify engineering quality. Do not read implementation code to settle a documentation disagreement: compare documented evidence, consult a relevant versioned official source if needed, or leave the fact unresolved.

## Audit workflow

1. Read [Documentation rubric](references/documentation-rubric.md) before evaluating or scoring. Use it for both modes.
2. Read both root READMEs as entry points. Follow the journey: discover → understand → choose plugin → check compatibility → install → use → recognize expected results → troubleshoot → update/remove → contribute. Notice language changes, dead ends, repeated round trips, and developer-only prerequisites inserted into user installation.
3. Read every current plugin README independently. Check the user questions in criterion C, allowing concise answers or clear direct links to shared detail. Check actual copyable commands, required placeholders, version selection, post-install location and success cues, and removal/data consequences. Distinguish release and source instructions; do not execute them.
4. Inspect referenced images with an image viewer, plus placement, captions and alt text in their documents. Determine what functionality they show, whether they are publicly included/reachable, and how their version is labeled. A file inventory alone is insufficient. Do not generate, capture or manipulate missing screenshots; record the required visual as a remaining improvement.
5. Compare user-action facts across documents and descriptive metadata: names/list, maturity, released/unreleased state, versions, install commands, UI location, settings, limitations and data removal. Record both locations of a conflict. Use the evidence states and historical-record rules in the rubric.
6. Give the category scores with reasons, sum to 100, assess each Hard Gate independently, and sort actionable findings P0–P3. Consolidate repeated manifestations of one defect; cross-reference its affected criteria rather than inflating the finding count. Do not stop after finding the first serious issue.

## Improve workflow

- Complete and retain the before assessment first. Inspect `git status` and relevant diffs before edits. Preserve user changes, including changes to the same document; do not reset or overwrite them. If an overlapping edit cannot be reconciled confidently, leave that part and explain the dependency while completing independent corrections.
- Prioritize P0/P1. Improve existing README structure, plugin explanations, quick starts, compatibility wording, historical/current labels, captions, navigation, troubleshooting, update/removal, and support/trust/contribution guidance. Align action-changing facts between English and Korean; literal translation is unnecessary.
- Keep the root README a navigation hub. Avoid duplicating details, adding unnecessary FAQs/badges, a documentation site, excessive architecture prose, or new documents merely to increase the score. Add a document only when existing locations cannot reasonably serve a distinct user need.
- Change documentation only. Do not edit implementation files (`*.ts`, `*.tsx`, `*.js`, `*.mjs`), packages, tests, workflows, manifests or catalog metadata to make a disagreement disappear. Report a required non-document correction separately. Do not invent release refs, compatibility guarantees, settings behavior, screenshots or verification claims.
- Preserve historical release/verification facts. Clarify their date/version and link the current conclusion instead of rewriting history. Update stale claims presented as current, using documented evidence.
- Re-read the affected journey, check changed local links/anchors and commands statically against documented contracts, and inspect the final diff. No repository test or validation run is required by this skill. Re-score with the same rubric and comparable coverage, not merely because edits were made. Leave unavailable facts or visuals explicitly unresolved.

## Report

Respond in the user's language. Include enough linked file/line evidence to assess findings without reproducing entire documents.

For **Audit**, report:

- **Verdict** and `Documentation Readiness: N/100 — <grade>`; category scores and brief reasons. State scope and material inspection limits.
- **Hard Gates:** PASS/FAIL for all ten, with evidence for failures. If a necessary gate could not be assessed, mark it unassessed and withhold a completeness conclusion. Any failure prevents “documentation complete” regardless of score.
- **Plugin documentation:** each plugin's description, installation, usage/expected result, screenshot, compatibility, troubleshooting and update/removal states. Include missing answers to other criterion C questions in the findings.
- **Highest-priority findings**, ordered P0–P3. Each has `Where`, `Problem`, `Impact`, and `Recommended change`. Group these compactly when it improves readability.

For **Improve**, additionally report before/after scores and Hard Gate changes, documents changed, resolved items, remaining items and why they remain, plus the documentation checks actually performed. Do not claim runtime verification or create a commit, issue, PR, publication, or external message under this skill alone.
