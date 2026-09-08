import type { PluginComposerPillProps } from "@getpaseo/plugin/client";
import { useAgent, useRpc, useSettings } from "@getpaseo/plugin/client";
import { Icon } from "@getpaseo/plugin/client/react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { findProviderUsage, parseAgentProviderId, pickPrimaryBalance, pickPrimaryWindow } from "../shared/provider-usage.logic";
import { providerUsageSnapshot } from "../shared/provider-usage";
import { formatResetAt, pillAccessibilityLabel, pillLabel, toneColor } from "./provider-usage.view";
import { bindUsageQueryClient, usageQueryOptions } from "./usage-query";
import { usageSettings } from "../shared/usage-settings";
import { useResetClock } from "./use-reset-clock";

export function UsagePill({ theme, agentId }: PluginComposerPillProps) {
  const preferences = useSettings(usageSettings);
  const now = useResetClock(preferences.status === "ready" && preferences.values.pill.showResetTime && preferences.values.resetTimeFormat === "time-remaining");
  const providerValue = useAgent(agentId, (agent) => agent.provider);
  const providerId = parseAgentProviderId(providerValue);
  const snapshot = useRpc(providerUsageSnapshot);
  bindUsageQueryClient(useQueryClient());
  const query = useQuery(usageQueryOptions(() => snapshot({})));
  const provider = findProviderUsage(query.data?.providers ?? [], providerId);
  const tone = pickPrimaryWindow(provider?.windows ?? [])?.tone ?? pickPrimaryBalance(provider?.balances ?? [])?.tone ?? "default";
  const color = useMemo(() => toneColor(theme, tone), [theme, tone]);
  const label = preferences.status === "ready" ? pillLabel(provider ?? null, providerId, preferences.values.pill, now, preferences.values.resetTimeFormat) : "…";
  const resetDescription = preferences.status === "ready" && preferences.values.pill.showResetTime
    ? formatResetAt(provider?.status === "available" ? (pickPrimaryWindow(provider.windows)?.resetsAt ?? pickPrimaryBalance(provider.balances)?.resetsAt) : null, now, preferences.values.resetTimeFormat) ?? "Reset time unavailable"
    : "";

  return (
    <View accessible accessibilityLabel={[pillAccessibilityLabel(provider ?? null, providerId), resetDescription].filter(Boolean).join(". ")} style={{ flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 }}>
      <Icon name="Gauge" size={14} color={color} />
      {label ? <Text numberOfLines={1} style={{ color, flexShrink: 1 }}>
        {label}
      </Text> : null}
    </View>
  );
}
