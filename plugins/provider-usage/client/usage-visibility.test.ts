import type { PluginClientContext } from "@getpaseo/plugin/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_USAGE_SETTINGS, UsageSettingsSchema } from "../shared/usage-settings";
import { registerUsageVisibility, VISIBILITY_REFRESH_INTERVAL_MS } from "./usage-visibility";

function setup() {
  const stopPills = vi.fn();
  const startPills = vi.fn(() => stopPills);
  const removeSidebar = vi.fn();
  const addSidebarItem = vi.fn(() => removeSidebar);
  const rpc = vi.fn(async (): Promise<unknown> => ({ status: "ready", values: DEFAULT_USAGE_SETTINGS }));
  const client = { rpc, addSidebarItem } as unknown as PluginClientContext;
  return { rpc, startPills, stopPills, addSidebarItem, removeSidebar, controller: registerUsageVisibility(client, startPills) };
}

afterEach(() => vi.useRealTimers());
describe("usage visibility settings", () => {
  it("uses the requested defaults and rejects invalid booleans", () => {
    expect(UsageSettingsSchema.parse({})).toEqual({ visibility: { composerPill: true, sidebar: false }, pill: { showRemainingPercent: true, showProviderName: true, showResetTime: false } });
    expect(UsageSettingsSchema.safeParse({ visibility: { sidebar: "true" } }).success).toBe(false);
  });

  it("changes actual contributions only after confirmed settings and disposes once", async () => {
    vi.useFakeTimers();
    const context = setup();
    expect(context.startPills).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(context.startPills).toHaveBeenCalledTimes(1);
    expect(context.addSidebarItem).not.toHaveBeenCalled();
    context.rpc.mockResolvedValue({ status: "ready", values: { ...DEFAULT_USAGE_SETTINGS, visibility: { composerPill: false, sidebar: true } } });
    await context.controller.refresh();
    expect(context.stopPills).toHaveBeenCalledTimes(1);
    expect(context.addSidebarItem).toHaveBeenCalledTimes(1);
    await context.controller.refresh();
    expect(context.addSidebarItem).toHaveBeenCalledTimes(1);
    context.controller.dispose();
    context.controller.dispose();
    expect(context.removeSidebar).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("retries disconnects, applies cross-client changes and hides invalid stored preferences", async () => {
    vi.useFakeTimers();
    const context = setup();
    await Promise.resolve();
    context.rpc.mockRejectedValueOnce(new Error("offline"));
    await context.controller.refresh();
    expect(context.stopPills).not.toHaveBeenCalled();
    context.rpc.mockResolvedValue({ status: "invalid" });
    await vi.advanceTimersByTimeAsync(VISIBILITY_REFRESH_INTERVAL_MS);
    expect(context.stopPills).toHaveBeenCalledTimes(1);
    context.rpc.mockResolvedValue({ status: "ready", values: DEFAULT_USAGE_SETTINGS });
    await vi.advanceTimersByTimeAsync(VISIBILITY_REFRESH_INTERVAL_MS);
    expect(context.startPills).toHaveBeenCalledTimes(2);
    context.controller.dispose();
  });

  it("ignores a stale reply and replies arriving after disposal", async () => {
    vi.useFakeTimers();
    const context = setup();
    await Promise.resolve();
    let resolve: (value: unknown) => void = () => {};
    context.rpc.mockImplementationOnce(() => new Promise((done) => { resolve = done; }));
    const stale = context.controller.refresh();
    context.rpc.mockResolvedValue({ status: "ready", values: DEFAULT_USAGE_SETTINGS });
    await context.controller.refresh();
    resolve({ status: "ready", values: { ...DEFAULT_USAGE_SETTINGS, visibility: { composerPill: false, sidebar: true } } });
    await stale;
    expect(context.addSidebarItem).not.toHaveBeenCalled();
    context.rpc.mockImplementationOnce(() => new Promise((done) => { resolve = done; }));
    const pending = context.controller.refresh();
    context.controller.dispose();
    resolve({ status: "ready", values: DEFAULT_USAGE_SETTINGS });
    await pending;
    expect(context.startPills).toHaveBeenCalledTimes(1);
  });
});
