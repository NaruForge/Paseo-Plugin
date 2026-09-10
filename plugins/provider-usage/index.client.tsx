import type { PluginClientContext, PluginSurfaceProps } from "@getpaseo/plugin/client";
import { MainSurface } from "./client/main";
import { UsagePill } from "./client/usage-pill";
import { clearUsageQueryClient, refreshUsageSnapshot } from "./client/usage-query";
import { registerUsagePills } from "./client/usage-registration";
import { UsageSettingsScreen } from "./client/usage-settings";
import { registerUsageVisibility } from "./client/usage-visibility";

export default function contribute(client: PluginClientContext) {
  client.addSurface("main", MainSurface);
  // Paseo Settings → Layout owns visibility; keep the contribution available there.
  client.addSidebarItem({ id: "main", title: "Usage", icon: "Gauge", surface: "main" });
  const unsubscribeProviders = client.paseo.providers.subscribe(() => { void refreshUsageSnapshot().catch(() => {}); });
  const visibility = registerUsageVisibility(client, () =>
    registerUsagePills(client, updateButton => props => <UsagePill {...props} updateButton={updateButton} />, refreshUsageSnapshot));
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
    keywords: ["usage", "pill", "visibility"], context: "global",
    onSelect({ openSettings }) { openSettings("display"); },
  });
  return () => {
    visibility.dispose();
    unsubscribeProviders();
    clearUsageQueryClient();
  };
}
