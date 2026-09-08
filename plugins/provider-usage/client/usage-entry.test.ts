import type { PluginClientContext } from "@getpaseo/plugin/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_USAGE_SETTINGS } from "../shared/usage-settings";

vi.mock("./main", () => ({ MainSurface: () => null }));
vi.mock("./usage-pill", () => ({ UsagePill: () => null }));
vi.mock("./usage-settings", () => ({ UsageSettingsScreen: () => null }));
vi.mock("./usage-registration", () => ({ registerUsagePills: vi.fn(() => vi.fn()) }));
import contribute from "../index.client";

afterEach(() => vi.useRealTimers());

describe("Layout-owned sidebar registration", () => {
  it.each(["loading", "error", "invalid", "pill-off", "pill-on"])("keeps the same sidebar contribution registered with %s settings", async (state) => {
    vi.useFakeTimers();
    const removeSidebar = vi.fn();
    const addSidebarItem = vi.fn(() => removeSidebar);
    const unsubscribe = vi.fn();
    const client = {
      addSurface: vi.fn(), addSidebarItem, addSettingsScreen: vi.fn(), addCommandCenterItem: vi.fn(),
      rpc: vi.fn(() => {
        if (state === "loading") return new Promise(() => {});
        if (state === "error") return Promise.reject(new Error("offline"));
        if (state === "invalid") return Promise.resolve({ status: "invalid" });
        return Promise.resolve({ status: "ready", values: { ...DEFAULT_USAGE_SETTINGS, visibility: { composerPill: state === "pill-on" } } });
      }),
      paseo: { providers: { subscribe: vi.fn(() => unsubscribe) } },
    } as unknown as PluginClientContext;
    const dispose = contribute(client);
    expect(addSidebarItem).toHaveBeenCalledExactlyOnceWith({ id: "main", title: "Usage", icon: "Gauge", surface: "main" });
    await vi.advanceTimersByTimeAsync(60_000);
    expect(addSidebarItem).toHaveBeenCalledTimes(1);
    expect(removeSidebar).not.toHaveBeenCalled();
    dispose();
    // Paseo owns static contribution teardown; the plugin only tears down its subscriptions/timer.
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});
