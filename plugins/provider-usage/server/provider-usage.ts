import type { PluginHandlerContext } from "@getpaseo/plugin/server";
import type { ProviderUsage, ProviderUsageSnapshot } from "../shared/provider-usage";
import { toneFromUsedPercent } from "../shared/provider-usage.logic";

export type UsageSource = Pick<PluginHandlerContext["paseo"]["providers"], "snapshot" | "listUsage">;

/** Credentials, HTTP requests and quota caching belong to the host. */
export async function listProviderUsageSnapshot(source: UsageSource, input: { providerId?: string } = {}): Promise<ProviderUsageSnapshot> {
  const catalog = await source.snapshot().catch(() => { throw new Error("Could not read enabled Provider connections."); });
  const enabled = catalog.entries.filter((entry) => entry.enabled && (!input.providerId || entry.provider === input.providerId));
  if (!enabled.length) return { fetchedAt: new Date().toISOString(), providers: [] };
  const usage = await source.listUsage().catch(() => { throw new Error("Could not read Provider usage from Paseo."); });
  const providers: ProviderUsage[] = enabled.map((entry) => {
    const reading = usage.providers.find((value) => value.providerId === entry.provider);
    return {
      id: entry.provider,
      label: reading?.displayName || entry.label || entry.provider,
      status: reading?.status ?? "unavailable",
      planLabel: reading?.planLabel ?? null,
      windows: (reading?.windows ?? []).map((window) => {
        const usedPercent = window.usedPct ?? (window.remainingPct == null ? null : 100 - window.remainingPct);
        return {
          id: window.id, label: window.label, usedPercent,
          remainingPercent: window.remainingPct ?? (usedPercent === null ? null : Math.max(0, 100 - usedPercent)),
          resetsAt: window.resetsAt ?? null, tone: window.tone ?? toneFromUsedPercent(usedPercent),
        };
      }),
      balances: (reading?.balances ?? []).map((balance) => ({
        id: balance.id, label: balance.label, used: balance.used ?? null,
        remaining: balance.remaining ?? null, limit: balance.limit ?? null,
        unit: balance.unit, resetsAt: balance.resetsAt ?? null, tone: balance.tone ?? "default",
      })),
      details: (reading?.details ?? []).map(({ id, label, value }) => ({ id, label, value })),
      error: reading?.status === "error" ? "Paseo could not read this Provider's usage." : null,
    };
  });
  return { fetchedAt: usage.fetchedAt, providers };
}
