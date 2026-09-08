import { afterEach, describe, expect, it, vi } from "vitest";

const hooks = vi.hoisted(() => ({ effect: null as null | (() => void | (() => void)), setNow: vi.fn() }));
vi.mock("react", () => ({
  useState: (initial: () => Date) => [initial(), hooks.setNow],
  useEffect: (effect: () => void | (() => void)) => { hooks.effect = effect; },
}));
import { useResetClock } from "./use-reset-clock";

afterEach(() => { vi.useRealTimers(); vi.clearAllMocks(); });

describe("reset clock lifetime", () => {
  it("uses current wall time after delayed ticks and cleans up when disabled or unmounted", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-09T00:00:00Z"));
    useResetClock(true);
    const cleanup = hooks.effect?.();
    expect(vi.getTimerCount()).toBe(1);
    vi.setSystemTime(new Date("2026-09-09T03:00:00Z"));
    vi.advanceTimersByTime(30_000);
    expect(hooks.setNow).toHaveBeenLastCalledWith(new Date("2026-09-09T03:00:30Z"));
    cleanup?.();
    expect(vi.getTimerCount()).toBe(0);
    hooks.setNow.mockClear();
    useResetClock(false);
    expect(hooks.effect?.()).toBeUndefined();
    vi.advanceTimersByTime(60_000);
    expect(hooks.setNow).not.toHaveBeenCalled();
  });
});
