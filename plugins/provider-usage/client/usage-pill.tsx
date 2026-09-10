import type { PluginButtonIconProps, PluginButton } from "@getpaseo/plugin/client";
import { useAgent, useRpc, useSettings } from "@getpaseo/plugin/client";
import { Icon } from "@getpaseo/plugin/client/react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { findProviderUsage, parseAgentProviderId, pickPrimaryBalance, pickPrimaryWindow } from "../shared/provider-usage.logic";
import { providerUsageSnapshot } from "../shared/provider-usage";
import { formatResetAt, pillAccessibilityLabel, pillLabel, toneColor } from "./provider-usage.view";
import { bindUsageQueryClient, usageQueryOptions } from "./usage-query";
import { usageSettings } from "../shared/usage-settings";
import { useResetClock } from "./use-reset-clock";

export function UsagePill(props: PluginButtonIconProps & { updateButton(patch: Partial<PluginButton>): void }) {
  const { theme, size, updateButton } = props;
  const agentId = props.context === "agent" ? props.agentId : "";
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

  const title = ["Refresh provider usage", pillAccessibilityLabel(provider ?? null, providerId), resetDescription].filter(Boolean).join(". ");
  useEffect(() => { updateButton({ label, title }); }, [updateButton, label, title]);
  return <Icon name="Gauge" size={size} color={color} />;
}
