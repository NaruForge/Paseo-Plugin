import { pickPrimaryBalance, pickPrimaryWindow, remainingPercentForProvider } from "../shared/provider-usage.logic";
import type { PluginTheme } from "@getpaseo/plugin";
import type { ProviderUsage, UsageTone } from "../shared/provider-usage";
import { DEFAULT_USAGE_SETTINGS, type PillSettings, type ResetTimeFormat } from "../shared/usage-settings";

export type UsageViewStatus = "loading" | "empty" | "available" | "unavailable" | "error";

const COPY: Record<Exclude<UsageViewStatus, "available">, { title: string; description: string }> = {
  loading: {
    title: "Reading usage",
    description: "Reading usage for enabled Provider connections on the selected Host.",
  },
  empty: {
    title: "No enabled Providers",
    description: "There are no enabled Provider connections on this Host.",
  },
  unavailable: {
    title: "Usage unavailable",
    description: "Paseo does not provide usage for this Provider or cannot read it right now.",
  },
  error: {
    title: "Could not read usage",
    description: "Check the selected Host connection and Provider setup, then try again.",
  },
};

export function usageCopy(status: Exclude<UsageViewStatus, "available">) {
  return COPY[status];
}

export function snapshotStatus(providers: readonly ProviderUsage[], loading: boolean, failed: boolean): UsageViewStatus {
  if (loading && providers.length === 0) return "loading";
  if (failed && providers.length === 0) return "error";
  if (providers.length === 0) return "empty";
  return "available";
}

export function toneColor(theme: PluginTheme, tone: UsageTone): string {
  if (tone === "danger") return theme.colors.statusDanger;
  if (tone === "warning") return theme.colors.statusWarning;
  if (tone === "ok") return theme.colors.statusSuccess;
  return theme.colors.foregroundMuted;
}

export function formatPercent(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return `${Math.round(value)}%`;
}

export function formatResetAt(resetsAt: string | null | undefined, now = new Date(), format: ResetTimeFormat = "date-time"): string | null {
  if (format === "time-remaining") return formatResetRemaining(resetsAt, now);
  if (!resetsAt) return null;
  const date = new Date(resetsAt);
  if (!Number.isFinite(date.getTime())) return null;
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const label = formatter.format(date);
  return date.getTime() <= now.getTime() ? `Reset ${label}` : `Resets ${label}`;
}

export function formatBalance(remaining: number | null, limit: number | null, unit: string | null): string {
  if (typeof remaining === "number" && typeof limit === "number") {
    return `${formatCount(remaining)} / ${formatCount(limit)}${unitSuffix(unit)}`;
  }
  if (typeof remaining === "number") return `${formatCount(remaining)}${unitSuffix(unit)}`;
  if (typeof limit === "number") return `limit ${formatCount(limit)}${unitSuffix(unit)}`;
  return "—";
}

export function formatResetRemaining(resetsAt: string | null | undefined, now = new Date(), compact = false): string | null {
  if (!resetsAt) return null;
  const remaining = new Date(resetsAt).getTime() - now.getTime();
  if (!Number.isFinite(remaining)) return null;
  if (remaining <= 0) return compact ? "Due" : "Reset due";
  if (remaining < 60_000) return compact ? "<1m" : "Resets in <1m";
  const minutes = Math.ceil(remaining / 60_000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const parts = [days ? `${days}d` : "", hours ? `${hours}h` : "", minutes % 60 ? `${minutes % 60}m` : ""].filter(Boolean);
  return compact ? parts.slice(0, 2).join(" ") : `Resets in ${parts.join(" ")}`;
}

export function formatPillResetAt(resetsAt: string | null | undefined, now = new Date(), format: ResetTimeFormat = "date-time"): string | null {
  if (format === "time-remaining") return formatResetRemaining(resetsAt, now, true);
  if (!resetsAt) return null;
  const date = new Date(resetsAt);
  if (!Number.isFinite(date.getTime())) return null;
  const sameDay = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  const label = new Intl.DateTimeFormat(undefined, {
    ...(sameDay ? {} : { month: "short" as const, day: "numeric" as const }),
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(date);
  return label;
}

export function pillLabel(
  provider: ProviderUsage | null,
  providerId: string | null,
  settings: PillSettings = DEFAULT_USAGE_SETTINGS.pill,
  now = new Date(),
  resetTimeFormat: ResetTimeFormat = "date-time",
): string {
  const name = provider?.label ?? displayNameForProviderId(providerId);
  const parts: string[] = [];
  if (settings.showProviderName) parts.push(name);
  if (settings.showRemainingPercent) parts.push(formatPercent(remainingPercentForProvider(provider)));
  const label = parts.join(" ");
  if (!settings.showResetTime) return label;
  const resetsAt = provider?.status === "available" ? (pickPrimaryWindow(provider.windows)?.resetsAt ?? pickPrimaryBalance(provider.balances)?.resetsAt) : null;
  const reset = formatPillResetAt(resetsAt, now, resetTimeFormat) ?? "—";
  return label ? `${label} · ${reset}` : reset;
}

export function pillAccessibilityLabel(provider: ProviderUsage | null, providerId: string | null): string {
  const name = provider?.label ?? displayNameForProviderId(providerId);
  if (!provider) return `${name} usage unavailable`;
  if (provider.status === "error") return `${name} usage failed`;
  if (provider.status === "unavailable") return `${name} usage unavailable`;
  const remaining = remainingPercentForProvider(provider);
  if (remaining === null) return `${name} usage available`;
  return `${name} ${Math.round(remaining)} percent remaining`;
}

export function displayNameForProviderId(providerId: string | null): string {
  if (providerId === "codex") return "Codex";
  if (providerId === "grok") return "Grok";
  return providerId ? providerId : "Provider";
}

function formatCount(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/u, "");
}

function unitSuffix(unit: string | null): string {
  if (!unit) return "";
  if (unit === "usd") return " USD";
  return ` ${unit}`;
}
