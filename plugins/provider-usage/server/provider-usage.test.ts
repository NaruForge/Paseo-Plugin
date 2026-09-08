import { URL } from "node:url";
import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { listProviderUsageSnapshot, type UsageSource } from "./provider-usage";

function source(entries: unknown[], providers: unknown[] = []) {
  return {
    snapshot: vi.fn(async () => ({ entries })),
    listUsage: vi.fn(async () => ({ fetchedAt: "2026-09-09T00:00:00Z", providers })),
  } as unknown as UsageSource;
}

describe("host usage adapter", () => {
  it("includes every enabled connection regardless of availability or active agents, excluding disabled cached usage", async () => {
    const api = source([
      { provider: "claude", enabled: true, status: "unavailable", label: "Claude" },
      { provider: "custom", enabled: true, label: "My provider" },
      { provider: "codex", enabled: false },
    ], [
      { providerId: "claude", displayName: "Claude", status: "available", windows: [{ id: "week", label: "Weekly", remainingPct: 0 }] },
      { providerId: "codex", displayName: "Codex", status: "available", windows: [] },
    ]);
    const result = await listProviderUsageSnapshot(api);
    expect(result.providers.map((provider) => provider.id)).toEqual(["claude", "custom"]);
    expect(result.providers[0]?.windows[0]).toMatchObject({ usedPercent: 100, remainingPercent: 0 });
    expect(result.providers[1]).toMatchObject({ label: "My provider", status: "unavailable", windows: [] });
    expect(api.snapshot).toHaveBeenCalledWith();
    expect(api.listUsage).toHaveBeenCalledWith();
  });

  it("does not invent zero for missing usage and preserves balances, details and resets", async () => {
    const api = source([{ provider: "future", enabled: true }], [{
      providerId: "future", displayName: "Future", status: "available", planLabel: "Pro",
      windows: [{ id: "missing", label: "Unknown" }],
      balances: [{ id: "credits", label: "Credits", remaining: 25, limit: 100, unit: "credits", resetsAt: "2026-10-01T00:00:00Z" }],
      details: [{ id: "region", label: "Region", value: "Global" }],
    }]);
    const result = await listProviderUsageSnapshot(api);
    expect(result.providers[0]?.windows[0]).toMatchObject({ usedPercent: null, remainingPercent: null });
    expect(result.providers[0]?.balances[0]).toMatchObject({ remaining: 25, resetsAt: "2026-10-01T00:00:00Z" });
    expect(result.providers[0]?.details).toEqual([{ id: "region", label: "Region", value: "Global" }]);
  });

  it("does not fetch quotas when no connection matches and never expands a disabled provider filter", async () => {
    const api = source([{ provider: "codex", enabled: false }]);
    expect((await listProviderUsageSnapshot(api, { providerId: "codex" })).providers).toEqual([]);
    expect(api.listUsage).not.toHaveBeenCalled();
  });

  it("sanitizes host failures and fails closed if the connection catalog cannot be read", async () => {
    const api = source([{ provider: "codex", enabled: true }], [{ providerId: "codex", status: "error", error: "secret-token", windows: [] }]);
    expect(JSON.stringify(await listProviderUsageSnapshot(api))).not.toContain("secret-token");
    vi.mocked(api.snapshot).mockRejectedValueOnce(new Error("secret-token"));
    await expect(listProviderUsageSnapshot(api)).rejects.toThrow("Could not read enabled Provider connections.");
    vi.mocked(api.listUsage).mockRejectedValueOnce(new Error("secret-token"));
    await expect(listProviderUsageSnapshot(api)).rejects.toThrow("Could not read Provider usage from Paseo.");
  });

  it("keeps vendor HTTP, credentials, process execution and logging outside the plugin adapter", async () => {
    const code = await readFile(new URL("./provider-usage.ts", import.meta.url), "utf8");
    expect(code).not.toMatch(/node:|fetch\(|console\.|process\.|auth\.json|https:\/\//u);
  });
});
