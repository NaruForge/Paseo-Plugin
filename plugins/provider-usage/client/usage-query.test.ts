import { environmentManager, QueryClient, QueryObserver } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  USAGE_QUERY_KEY,
  bindUsageQueryClient,
  clearUsageQueryClient,
  refreshUsageSnapshot,
  usageQueryOptions,
} from "./usage-query";

const originalIsServer = environmentManager.isServer();

beforeEach(() => {
  vi.useFakeTimers();
  // QueryObserver suppresses polling in Node; exercise client-side timers instead.
  environmentManager.setIsServer(() => false);
});

afterEach(() => {
  clearUsageQueryClient();
  environmentManager.setIsServer(() => originalIsServer);
  vi.useRealTimers();
});

describe("usage query", () => {
  it("reads on mount and manual refresh without polling, even with a host polling default", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity, refetchInterval: 120_000 } },
    });
    const queryFn = vi.fn(async () => ({ fetchedAt: new Date().toISOString(), providers: [] }));
    const observer = new QueryObserver(client, usageQueryOptions(queryFn));
    bindUsageQueryClient(client);
    const unsubscribe = observer.subscribe(() => {});
    try {
      await vi.advanceTimersByTimeAsync(0);
      expect(queryFn).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(10 * 60_000);
      expect(queryFn).toHaveBeenCalledTimes(1);

      // The surface refreshes its observer; pills and catalog changes refresh the shared query.
      await observer.refetch();
      expect(queryFn).toHaveBeenCalledTimes(2);
      await refreshUsageSnapshot();
      expect(queryFn).toHaveBeenCalledTimes(3);

      await vi.advanceTimersByTimeAsync(10 * 60_000);
      expect(queryFn).toHaveBeenCalledTimes(3);
    } finally {
      unsubscribe();
      client.clear();
    }
  });

  it("refetches the shared snapshot query", async () => {
    const refetchQueries = vi.fn(async () => []);
    bindUsageQueryClient({ refetchQueries } as unknown as QueryClient);
    await refreshUsageSnapshot();
    expect(refetchQueries).toHaveBeenCalledWith({ queryKey: USAGE_QUERY_KEY });
  });
});
