import type { QueryClient } from "@tanstack/react-query";
import type { ProviderUsageSnapshot } from "../shared/provider-usage";

export const USAGE_QUERY_KEY = ["provider-usage", "snapshot"] as const;
export const USAGE_STALE_TIME_MS = 60_000;

let queryClient: QueryClient | undefined;

export function bindUsageQueryClient(client: QueryClient): void {
  queryClient = client;
}

export function clearUsageQueryClient(): void {
  queryClient = undefined;
}

export function usageQueryOptions(queryFn: () => Promise<ProviderUsageSnapshot>) {
  return {
    queryKey: USAGE_QUERY_KEY,
    queryFn,
    staleTime: USAGE_STALE_TIME_MS,
    // Paseo owns usage collection and caching; this query never polls.
    refetchInterval: false as const,
  };
}

export async function refreshUsageSnapshot(): Promise<void> {
  if (!queryClient) return;
  await queryClient.refetchQueries({ queryKey: USAGE_QUERY_KEY });
}
