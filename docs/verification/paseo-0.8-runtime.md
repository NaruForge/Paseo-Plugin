# Paseo 0.8 runtime verification

Report recorded: 2026-09-09. Migration tracking: [#77](https://github.com/NaruForge/Paseo-Plugin/issues/77). Git deployment follow-up: [#96](https://github.com/NaruForge/Paseo-Plugin/issues/96).

## User verification report

The user reported that they personally completed runtime verification of the three plugins then in this repository (Branch Garden, Provider Usage and Prompt Palette) on Paseo 0.8. Command Deck was added later and is outside this report; see [Command Deck source verification](command-deck-0.8-source.md). This is a user-performed runtime verification record, separate from the earlier automated checks and simulated UI previews. No repeat runtime session was performed by the documentation author.

| Plugin | Reported result |
| --- | --- |
| Branch Garden (`branch-garden`) | Runtime verification completed by the user on Paseo 0.8 |
| Provider Usage (`provider-usage`) | Runtime verification completed by the user on Paseo 0.8 |
| Prompt Palette (`prompt-palette`) | Runtime verification completed by the user on Paseo 0.8 |

The source reference when this report was recorded is `2e178a205ee3c06d4b57fb0d7a742ca93e2b259a` (main, including the Prompt Palette mobile layout change). This is the repository reference, not an independently confirmed commit of the user's installed build.

## Environment and scope

The report specifies Paseo **0.8**. Exact daemon and app versions, OS/device, installation source, installed commit and individual test scenarios were not supplied. The repository's exact SDK target remains **0.8.0-beta.1**, which must not be substituted for the reported runtime version.

The report establishes completion for all three plugins. It does not enumerate individual UI themes, accessibility checks, cleanup/error scenarios or native platforms, so this record does not mark those separately as passed. Git source installation, successful update and failed-candidate recovery are tracked independently in #96 until their results are supplied or tested.

## Documentation and release status

Current README, compatibility and migration guidance link to this report instead of describing all runtime verification as pending. Earlier files under `docs/verification/` retain their original statements about what had and had not been tested at that time; they are historical records, not the latest runtime status.

The existing `v0.1.0-rc.2` tag remains the Paseo 0.7.2 release and does not include Prompt Palette. No new collection release, SDK/manifest change, maturity promotion or platform-support expansion is implied by this record. Provider Usage's catalog description now reflects its official Paseo usage API rather than the retired direct credential-based integration.

This update changes documentation and descriptive catalog metadata only. No plugin source, stored setting, installation or runtime was changed.
