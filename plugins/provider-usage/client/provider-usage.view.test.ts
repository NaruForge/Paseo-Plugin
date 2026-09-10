import { describe, expect, it } from "vitest";
import type { PluginTheme } from "@getpaseo/plugin";
import {
  formatBalance,
  formatPercent,
  formatResetAt,
  formatPillResetAt,
  formatResetRemaining,
  pillAccessibilityLabel,
  pillLabel,
  snapshotStatus,
  toneColor,
  usageCopy,
} from "./provider-usage.view";
import type { ProviderUsage } from "../shared/provider-usage";

const theme = {
  colors: {
    statusDanger: "danger",
    statusWarning: "warning",
    statusSuccess: "success",
    foregroundMuted: "muted",
  },
} as PluginTheme;

function provider(overrides: Partial<ProviderUsage> = {}): ProviderUsage {
  return {
    id: "codex",
    label: "Codex",
    status: "available",
    planLabel: null,
    windows: [
      {
        id: "weekly",
        label: "Weekly",
        usedPercent: 25,
        remainingPercent: 75,
        resetsAt: null,
        tone: "ok",
      },
    ],
    balances: [],
    error: null,
    ...overrides,
  };
}

describe("provider usage view", () => {
  it("renders exclusive, compact reset formats and handles time boundaries", () => {
    const now = new Date("2026-09-09T00:00:00Z");
    const future = (seconds: number) => new Date(now.getTime() + seconds * 1000).toISOString();
    for (const invalid of [null, undefined, "", "bad-date"]) {
      expect(formatResetRemaining(invalid, now)).toBeNull();
      expect(formatPillResetAt(invalid, now, "time-remaining")).toBeNull();
    }
    expect(formatPillResetAt(future(-1), now, "time-remaining")).toBe("Due");
    expect(formatPillResetAt(future(0), now, "time-remaining")).toBe("Due");
    expect(formatPillResetAt(future(1), now, "time-remaining")).toBe("<1m");
    expect(formatPillResetAt(future(60), now, "time-remaining")).toBe("1m");
    expect(formatPillResetAt(future(61), now, "time-remaining")).toBe("2m");
    expect(formatPillResetAt(future(3600), now, "time-remaining")).toBe("1h");
    expect(formatPillResetAt(future(8100), now, "time-remaining")).toBe("2h 15m");
    expect(formatPillResetAt(future(6 * 86400 + 3 * 3600 + 900), now, "time-remaining")).toBe("6d 3h");
    expect(formatResetAt(future(8100), now, "time-remaining")).toBe("Resets in 2h 15m");
    expect(formatResetAt(future(0), now, "time-remaining")).toBe("Reset due");
    expect(formatPillResetAt(future(8100), now)).toMatch(/^\d{2}:\d{2}$/u);
    expect(formatPillResetAt(future(86400), now)).not.toMatch(/Reset|\bin\b/u);
    const reading = provider();
    reading.windows[0]!.resetsAt = future(8100);
    const fields = { showProviderName: true, showRemainingPercent: true, showResetTime: true };
    expect(pillLabel(reading, "codex", fields, now, "time-remaining")).toBe("Codex 75% · 2h 15m");
    expect(pillLabel(reading, "codex", { ...fields, showResetTime: false }, now, "time-remaining")).toBe("Codex 75%");
    expect(pillLabel(provider({ status: "unavailable" }), "codex", fields, now, "time-remaining")).toBe("Codex — · —");
  });
  it("formats glance copy without inventing numbers", () => {
    expect(formatPercent(32.4)).toBe("32%");
    expect(formatPercent(null)).toBe("—");
    expect(formatBalance(12, 40, "credits")).toBe("12 / 40 credits");
    expect(formatBalance(1.5, null, "usd")).toBe("1.5 USD");
    expect(pillLabel(provider(), "codex")).toBe("Codex 75%");
    expect(pillLabel(provider({ status: "unavailable" }), "codex")).toBe("Codex —");
    expect(pillAccessibilityLabel(provider(), "codex")).toBe("Codex 75 percent remaining");
  });

  it("keeps reset labels factual", () => {
    expect(formatResetAt("not-a-date")).toBeNull();
    expect(formatResetAt("2026-09-11T15:00:00.000Z", new Date("2026-09-04T00:00:00.000Z"))).toMatch(/^Resets /);
    expect(formatResetAt("2026-09-01T15:00:00.000Z", new Date("2026-09-04T00:00:00.000Z"))).toMatch(/^Reset /);
  });

  it("maps snapshot and tone to the smallest status range", () => {
    expect(snapshotStatus([], true, false)).toBe("loading");
    expect(snapshotStatus([], false, true)).toBe("error");
    expect(snapshotStatus([], false, false)).toBe("empty");
    expect(snapshotStatus([provider()], false, true)).toBe("available");
    expect(usageCopy("unavailable").title).toBe("Usage unavailable");
    expect(toneColor(theme, "danger")).toBe("danger");
    expect(toneColor(theme, "ok")).toBe("success");
    expect(toneColor(theme, "default")).toBe("muted");
  });
  it("honors all eight pill field combinations, with a nonempty final-API label", () => {
    for (let flags = 0; flags < 8; flags++) {
      const settings = { showProviderName: Boolean(flags & 1), showRemainingPercent: Boolean(flags & 2), showResetTime: Boolean(flags & 4) };
      const label = pillLabel(provider(), "codex", settings);
      expect(label.includes("Codex")).toBe(settings.showProviderName);
      expect(label.includes("75%")).toBe(settings.showRemainingPercent);
      expect(label.includes("—")).toBe(settings.showResetTime);
      expect(label.trim().length).toBeGreaterThan(0);
      if (flags === 0) expect(label).toBe("Usage");
    }
    expect(pillAccessibilityLabel(provider(), "codex")).toBe("Codex 75 percent remaining");
  });

  it("uses balance-only percentages and reset times, preserving a real zero", () => {
    const reading = provider({ windows: [], balances: [{ id: "credits", label: "Credits", used: null, remaining: 0, limit: 100, unit: "credits", resetsAt: "2026-10-01T00:00:00Z", tone: "danger" }] });
    expect(pillLabel(reading, "codex", { showProviderName: false, showRemainingPercent: true, showResetTime: true }, new Date("2026-09-09T00:00:00Z"))).toMatch(/^0% · (?!Resets)/u);
  });

});
