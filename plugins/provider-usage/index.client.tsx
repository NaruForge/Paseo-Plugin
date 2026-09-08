import type { PluginClientContext, PluginSurfaceProps } from "@getpaseo/plugin/client";
import { MainSurface } from "./client/main";
import { UsagePill } from "./client/usage-pill";
import { clearUsageQueryClient, refreshUsageSnapshot } from "./client/usage-query";
import { registerUsagePills } from "./client/usage-registration";
import { UsageSettingsScreen } from "./client/usage-settings";
import { registerUsageVisibility } from "./client/usage-visibility";

export default function contribute(client: PluginClientContext) {
  client.addSurface("main", MainSurface);
  const unsubscribeProviders = client.paseo.providers.subscribe(() => { void refreshUsageSnapshot().catch(() => {}); });
  const visibility = registerUsageVisibility(client, () =>
    registerUsagePills(client, UsagePill, refreshUsageSnapshot));
  client.addSettingsScreen({
    id: "display", title: "Provider Usage Settings", icon: "Gauge",
    Component: (props: PluginSurfaceProps) => <UsageSettingsScreen {...props} onChanged={visibility.refresh} />,
  });
  client.addCommandCenterItem({
    id: "open-usage", title: "Open provider usage", icon: "Gauge",
    keywords: ["quota", "limits", "credits"], context: "global",
    onSelect({ openSurface }) { openSurface("main"); },
  });
  client.addCommandCenterItem({
    id: "open-usage-settings", title: "Provider Usage Settings", icon: "Settings2",
    keywords: ["usage", "pill", "sidebar", "visibility"], context: "global",
    onSelect({ openSettings }) { openSettings("display"); },
  });
  return () => {
    visibility.dispose();
    unsubscribeProviders();
    clearUsageQueryClient();
  };
}
