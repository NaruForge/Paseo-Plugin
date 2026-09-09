# Prompt Palette mobile layout verification

Date: 2026-09-09. Tracking: [#93](https://github.com/NaruForge/Paseo-Plugin/issues/93).
Target: exact `@getpaseo/plugin` **0.8.0-beta.1**.

## Change

The picker list and preview explicitly disable ScrollView growth while allowing shrinkage within the available body height. A single prompt no longer stretches the list toward its maximum height. Empty libraries use a plain message. Manage prompts follows the list with a divider and a secondary button.

Prompt name, description/body excerpt and trailing chevron now form one accessible press target. Rows have pressed feedback and shared group boundaries. Agent information precedes Host metadata; long Agent names use up to two lines. Back and Copy text use secondary surfaces; the existing preview-before-send, pending and uncertain-delivery behavior remains intact.

The public Modal declaration exposes body styles and scrolling but no sheet height or snap-point control. Local Paseo host source inspection confirmed that the static body fills available space and the host chooses sheet dimensions. This change fixes internal list growth, not the host's overall sheet height.

## Checks

- `npm run typecheck --workspace prompt-palette`: passed.
- `npm test --workspace prompt-palette`: all 19 existing tests passed.
- `git diff --check`: passed.
- UI grade **D**: Chrome source preview at 390×844 and 1280×900, both light and dark themes. All four layout/theme combinations reviewed; none omitted.
- Actual plugin source rendered through React Native Web. Simulated host Modal used a bounded body (65vh compact / 85vh wide), so the preview exercises ScrollView growth and shrinkage rather than an unconstrained content-only dialog. Host SDK data, Modal, icons and clipboard are substitutes, not native Paseo components.
- Single item: 66px row target; approximately 34px between row bottom and management button. Description click and keyboard Enter open the full preview without sending.
- 100 items: final item reachable by list scrolling. Long multiline body: Send and uncertain-delivery acknowledgement remain inside the simulated sheet. Long Agent titles and descriptions introduce no horizontal page overflow at reviewed sizes.
- Existing browser regression scenarios passed: settings edits/conflicts, empty-library navigation, loading/error/retry, pending disable, uncertain delivery, unavailable/removed Agent, preview snapshot and Composer draft preservation. Settings were included because Action's pressed feedback is shared with that screen.

Ignored local evidence is under `artifacts/prompt-palette/`: `verify-mobile-layout.js`, `verify-mobile-regression.js`, `verify-mobile-extra.js` and `mobile-fix-*.png`.

## Runtime limits

No live Agent message, plugin reload, daemon restart or native device verification was performed for this change. Native sheet gestures, safe-area clearance, font scaling and screen-reader behavior still need device verification. Browser checks do not establish actual mobile rendering. The full-height whitespace below the controls may remain because sheet dimensions belong to Paseo.
