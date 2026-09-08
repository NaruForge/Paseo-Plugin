import { describe, expect, it } from "vitest";
import { DEFAULT_USAGE_SETTINGS, UsageSettingsSchema, usageSettings } from "./usage-settings";

describe("usage settings v3 migration", () => {
  it("migrates v2 choices to date-time and validates the mutually exclusive format", () => {
    for (let flags = 0; flags < 16; flags++) {
      const previous = {
        visibility: { composerPill: Boolean(flags & 1) },
        pill: { showProviderName: Boolean(flags & 2), showRemainingPercent: Boolean(flags & 4), showResetTime: Boolean(flags & 8) },
      };
      expect(usageSettings.migrate?.(previous, 2)).toEqual({ ...previous, resetTimeFormat: "date-time" });
    }
    expect(UsageSettingsSchema.parse({ resetTimeFormat: "time-remaining" }).resetTimeFormat).toBe("time-remaining");
    expect(UsageSettingsSchema.safeParse({ resetTimeFormat: "both" }).success).toBe(false);
  });
  it("preserves every existing pill choice for either retired sidebar value without mutating the input", () => {
    for (let flags = 0; flags < 32; flags++) {
      const previous = {
        visibility: { composerPill: Boolean(flags & 1), sidebar: Boolean(flags & 2) },
        pill: { showRemainingPercent: Boolean(flags & 4), showProviderName: Boolean(flags & 8), showResetTime: Boolean(flags & 16) },
      };
      const before = structuredClone(previous);
      expect(usageSettings.migrate?.(previous, 1)).toEqual({
        resetTimeFormat: "date-time", visibility: { composerPill: previous.visibility.composerPill }, pill: previous.pill,
      });
      expect(previous).toEqual(before);
    }
    expect(usageSettings.version).toBe(3);
  });

  it("fills missing values from defaults but rejects malformed retained values and unsupported versions", () => {
    expect(usageSettings.migrate?.({}, 1)).toEqual(DEFAULT_USAGE_SETTINGS);
    expect(() => usageSettings.migrate?.({ visibility: { composerPill: "false" } }, 1)).toThrow();
    expect(() => usageSettings.migrate?.({ pill: { showResetTime: null } }, 1)).toThrow();
    expect(() => usageSettings.migrate?.({}, 3)).toThrow("Unsupported");
  });

  it("does not reintroduce the retired setting when older clients submit it", () => {
    const parsed = UsageSettingsSchema.parse({ ...DEFAULT_USAGE_SETTINGS, visibility: { composerPill: false, sidebar: true } });
    expect(parsed.visibility).toEqual({ composerPill: false });
  });
});
