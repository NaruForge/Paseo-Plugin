import { type PluginCleanup, settingsRpc } from "@getpaseo/plugin";
import type { PluginClientContext } from "@getpaseo/plugin/client";
import { UsageSettingsSchema, usageSettings } from "../shared/usage-settings";

// beta.1 exposes useSettings updates to components, but no settings subscription to entries.
// Local saves call refresh immediately; other clients' visibility changes converge on this read.
export const VISIBILITY_REFRESH_INTERVAL_MS = 30_000;

export function registerUsageVisibility(
  client: PluginClientContext,
  startPills: () => PluginCleanup,
) {
  let active = true;
  let request = 0;
  let pending = 0;
  let removePills: PluginCleanup | undefined;
  let removeSidebar: PluginCleanup | undefined;

  function apply(composerPill: boolean, sidebar: boolean) {
    if (!composerPill && removePills) {
      void removePills();
      removePills = undefined;
    }
    if (!sidebar && removeSidebar) {
      void removeSidebar();
      removeSidebar = undefined;
    }
    if (composerPill && !removePills) removePills = startPills();
    if (sidebar && !removeSidebar) {
      removeSidebar = client.addSidebarItem({
        id: "main", title: "Usage", icon: "Gauge", surface: "main",
      });
    }
  }

  async function refresh(): Promise<void> {
    if (!active) return;
    const current = ++request;
    pending += 1;
    try {
      const result = await client.rpc(settingsRpc(usageSettings.id).read, {});
      if (!active || current !== request) return;
      const parsed = result.status === "ready" ? UsageSettingsSchema.safeParse(result.values) : null;
      if (!parsed?.success) {
        // Preserve invalid stored data. The always-registered settings screen can recover it.
        apply(false, false);
        return;
      }
      apply(parsed.data.visibility.composerPill, parsed.data.visibility.sidebar);
    } catch {
      // Keep the last confirmed visibility through a transient disconnect; retry on the timer.
    } finally {
      pending -= 1;
    }
  }

  const timer = setInterval(() => {
    if (pending === 0) void refresh();
  }, VISIBILITY_REFRESH_INTERVAL_MS);
  void refresh();

  return {
    refresh,
    dispose() {
      if (!active) return;
      active = false;
      request += 1;
      clearInterval(timer);
      apply(false, false);
    },
  };
}
