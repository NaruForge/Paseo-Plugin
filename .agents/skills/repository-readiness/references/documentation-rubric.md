# Paseo-Plugin documentation rubric

Use in both Audit and Improve. Judge whether users can answer their questions and act, not whether named files or section headings exist. Do not award points for code quality or for the number of checks recorded in a document.

## Evidence and priority

| State | Meaning |
| --- | --- |
| CLEAR | The reader can understand the information and intended action. |
| AMBIGUOUS | Information exists but allows conflicting interpretations or clashes with another document. |
| STALE | Past version/feature information is presented so it can be mistaken for current guidance. |
| MISSING | Information or public evidence needed by the user is absent. |

Use these states on the information being reviewed, not on whether the plugin works. Do not assign `VERIFIED runtime` or independently certify a plugin. Check that documents distinguish published release target, current main/source target, reported runtime-verified version, source-only checks, untested environments, and historical compatibility/screenshots. Do not replace a reported broad runtime version with an exact SDK version or infer platforms/scenarios that were not reported.

A correctly labeled historical record or screenshot is not automatically STALE. It may be CLEAR as historical evidence while leaving current functionality visually undocumented. Existing public visuals count toward the representative-visual gate when they genuinely show the plugin's function and their context is clear; lack of a current-version image alone is not identical to having no representative visual at all. Missing meaningful current coverage can still reduce criterion F. Never require every old screenshot to be replaced simply to improve a score.

Keep current support guidance separate from immutable past records. Compare action-changing facts rather than harmless wording/translation differences. Neither metadata nor newer prose alone proves a contested behavior; qualify unresolved facts.

| Priority | User impact |
| --- | --- |
| P0 | Can lead the user to a wrong action, such as installing an incompatible ref or removing data under a misleading promise. |
| P1 | Blocks installation, compatibility decisions or the use/support/update/removal journey. |
| P2 | Reduces understanding, discoverability or navigation. |
| P3 | Style, placement and cosmetic polish. |

Assign priority from demonstrated impact, not automatically from a keyword or Hard Gate failure. Describe the same root problem once with all relevant locations.

## Scoring method

Total the ten category scores below; maximum 100. Award integer points proportionally to how completely and clearly the category's user questions are answered. Full credit means all applicable questions are resolved with accessible evidence; substantial ambiguity or missing steps reduces credit. A missing document title alone earns no deduction when the needed answers are provided elsewhere with clear navigation.

For C, assess each plugin against all user questions before assigning the collection score; give plugins equal consideration and explicitly expose a weak plugin rather than hiding it in an average. For F, consider every UI plugin. Briefly explain each category's deduction with evidence. One issue may affect distinct criteria (for example install choice and consistency), but explain those separate impacts rather than applying opaque repeated penalties. Scores are reasoned editorial judgments, not automated measurements. Use the same criteria and scope before and after edits; do not count unavailable evidence as inspected or increase scores on promises of future work.

| Score | Grade |
| --- | --- |
| 90–100 | Excellent |
| 80–89 | Strong |
| 70–79 | Usable |
| 60–69 | Needs work |
| Below 60 | Poor |

## A. First impression and project identity — 10

Inspect the first screen of both root READMEs. Within roughly 30 seconds, can a newcomer understand:

- What Paseo-Plugin is and which problem it solves?
- Whether it is an official Paseo project or a community project?
- Its present maturity/status, supported published release and current source state without mixing them?

Lead with user value. Excessive internal migration, SDK and development detail before orientation reduces clarity. Judge actual introductory content, not badges or decorative polish.

## B. Plugin discoverability — 15

- Every current plugin is discoverable from the collection README and linked to its guide.
- Names are consistent; each has a one-sentence purpose before implementation details.
- Users can compare choices, requirements and maturity; released/unreleased status is apparent per plugin.
- A table or equivalently scannable presentation helps selection. A table is not mandatory if another layout answers the same questions.

## C. Plugin README completeness — 20

For each plugin independently, evaluate these questions. Concise prose and clear links to common detail are valid; do not require ten headings or force irrelevant sections.

| Question | Required user answer |
| --- | --- |
| Purpose | What does this plugin do? |
| Why | When would I use it? |
| Requirements | Which Paseo version, host/app prerequisites or other tools do I need? |
| Install | What can I copy, and what directory/ref/placeholder must I choose? |
| Use | Where do I find it after installing, and what steps do I take? |
| Expected result | What should normal operation look like, including useful empty/unavailable states? |
| Configuration | What can I change, where and how is it saved? If no configuration exists, is that clear? |
| Limitations | What is unsupported or important to know before use? |
| Troubleshooting | What should I check for common symptoms, and where can I obtain help? |
| Removal | How do I remove it, and what happens to saved settings/data? |

Also check how the guide leads to updates. A development procedure should not be the unexplained substitute for user installation. Distinguish missing information from information present but scattered.

## D. Installation documentation — 10

- The recommended route for the user's chosen version is clear; commands can be copied in the stated shell and context.
- Published tag and main/source installation are differentiated. Explain `--ref`, branch tracking, fixed tags/commits and any required placeholder substitution.
- Plugin commands and runtime IDs are distinguishable. Do not imply a placeholder is a ready-to-run published ref.
- Installation leads to a UI location, expected success/status, and update/remove instructions.
- Old commands are labeled by applicable version and do not masquerade as current instructions.
- Diagnostic, update and destructive removal commands are not bundled as an unexplained sequence to paste.

The user must know which version to install, what exact command to run, what happens next, and how to recognize success. Check documentation; never execute installation for this evaluation.

## E. Compatibility communication — 10

Clearly separate:

- Published release target.
- Current main/source target.
- Reported runtime-verified version and its stated scope.
- Source-only verification.
- Untested environment.
- Historical compatibility.

Look for old release install instructions adjacent to new source-only features without a usable distinction, or historical UI implied to be current. Technical compatibility detail should yield a clear user choice. A broad manifest requirement is not itself proof of tested support. Evaluate the communication, not real runtime compatibility.

## F. Screenshots and visual evidence — 10

Inspect actual public images for each UI plugin, not just image filenames:

- A representative image shows the plugin's value and expected result.
- README placement, description and meaningful alt text explain what to notice.
- When relevant, identify the Paseo generation/version and distinguish historical from current images and simulations from live captures.
- At least one representative screenshot per UI plugin is recommended. Additional images should explain distinct functions or user states, not increase image count for its own sake.
- Avoid excessive images and README length. Existing images are inspected without modification; missing visuals remain action items for the user.

Private/ignored local screenshots and a text statement that screenshots were taken are not public visual evidence. If an image cannot be opened, record the inspection limit.

## G. User journey continuity — 10

Follow actual links from both root READMEs:

Root README → plugin selection → plugin README → compatibility → installation → usage/expected result → troubleshooting → update/remove.

Check whether the next step is obvious, important information is too deeply buried, or users must repeatedly move between documents or languages. Check relevant local destinations and anchors; distinguish a working path from a useful navigation flow. The root README is a navigation hub, not a duplicate of every detailed guide. Ensure a path to support and contribution as well.

## H. Documentation consistency — 10

Compare both root READMEs, all plugin READMEs, compatibility/configuration/Git installation guides, changelog and descriptive catalog; include other relevant user guides when they contain the same claims.

Prioritize contradictions in descriptions, maturity, versions, released/unreleased status, current plugin list, install commands, UI instructions, settings/data behavior, removed plugins and historical features presented as current. English/Korean wording can differ; the facts that determine user action should agree. Do not mistake a clearly dated historical statement for a current contradiction.

## I. Trust, security and limitations documentation — 3

Check whether users can judge the installation's trust/data implications from documentation: trusted unsandboxed code, possible filesystem/process/network access, major data actually used according to the guides, credential handling, whether Git is modified, settings/data persistence and deletion on removal, and avoiding secrets in issue reports. Prefer understandable consequences over excessive API detail. Do not perform a source security audit or validate implementation promises.

## J. Contribution and support documentation — 2

Check support contact, bug-report and feature-proposal routes, access to CONTRIBUTING, minimum contributor steps and any language policy. Reading documented development commands is sufficient here; do not run them or grade the engineering process. Give user installation/use higher priority than contribution polish.

## Documentation Hard Gates

Assess each gate independently of the numeric score. FAIL if the stated problem exists; otherwise PASS when the evidence supports that conclusion. If evidence needed to decide is inaccessible, mark the gate unassessed, explain why, and withhold a completeness conclusion rather than force a PASS.

1. The project's purpose is difficult to understand immediately.
2. A publicly offered plugin has an insufficient explanation.
3. Installation instructions are absent or cannot be copied/adapted as documented for an available route.
4. The required Paseo version cannot be determined from the documentation.
5. Published release and current main/source are confused.
6. Users cannot determine where/how to use an installed plugin.
7. A UI plugin has no representative public visual showing its functionality.
8. Important limitations are not exposed to users.
9. Documents offer conflicting facts that affect user actions.
10. The README does not provide a natural route to necessary detailed guides.

These gates apply to publicly presented current plugins, including unreleased plugins offered for source evaluation; “unreleased” does not excuse missing purpose/use information or public visuals. Evaluate source-only installation in its declared scope without inventing a published release requirement. Preserve the distinction between gate 7's complete absence of representative visuals and criterion F's incomplete current-version coverage.

Any failed gate means **not documentation complete**, even at 90 or above. Report the numerical grade and this conclusion separately. Passing gates alone does not imply a perfect score. High readiness means the repository, every plugin, trust implications, navigation and version/release facts together answer the user's complete journey.
