import type { PluginClientContext, PluginComposerPillContribution } from "@getpaseo/plugin/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { registerPromptPills } from "./prompt-registration";
type Update = Parameters<Parameters<PluginClientContext["paseo"]["agents"]["subscribe"]>[0]>[0];
type Page = Awaited<ReturnType<PluginClientContext["paseo"]["agents"]["list"]>>;
const page = (ids: string[], cursor: string | null = null) => ({
  requestId: "test", entries: ids.map(id => ({ agent: { id, workspaceId: "w" } })),
  pageInfo: { nextCursor: cursor, prevCursor: null, hasMore: !!cursor },
}) as Page;
const upsert = (id: string, workspaceId = "w", archivedAt: string | null = null) => ({ kind: "upsert", agent: { id, workspaceId, archivedAt } }) as Update;
function setup(list = vi.fn<PluginClientContext["paseo"]["agents"]["list"]>(async () => page([]))) {
  let emit!: (u: Update) => void;
  const unsubscribe = vi.fn();
  const entries: PluginComposerPillContribution[] = [];
  const remove = vi.fn();
  const client = { paseo: { agents: { list, subscribe: (fn: typeof emit) => { emit = fn; return unsubscribe; } } },
    addComposerPill: (p: PluginComposerPillContribution) => { entries.push(p); return remove; } } as unknown as PluginClientContext;
  const component = vi.fn<Parameters<typeof registerPromptPills>[1]>(() => () => null);
  const cleanup = registerPromptPills(client, component);
  return { entries, component, cleanup, remove, unsubscribe, list, emit: (u: Update) => emit(u) };
}
afterEach(() => { vi.useRealTimers(); });
describe("prompt registrations", () => {
  it("loads every page and registers new providers without filtering", async () => {
    vi.useFakeTimers();
    const list = vi.fn<PluginClientContext["paseo"]["agents"]["list"]>()
      .mockResolvedValueOnce(page(["a"], "next")).mockResolvedValueOnce(page(["b"]));
    const t = setup(list); await vi.advanceTimersByTimeAsync(0);
    expect(t.entries.map(p => p.agentId)).toEqual(["a", "b"]);
    expect(list.mock.calls[1][0]?.page?.cursor).toBe("next");
    t.emit(upsert("new")); expect(t.entries.at(-1)?.agentId).toBe("new");
    t.cleanup(); expect(vi.getTimerCount()).toBe(0);
  });
  it("does not resurrect an Agent removed while the initial list is pending", async () => {
    vi.useFakeTimers();
    let resolve!: (p: Page) => void;
    const t = setup(vi.fn(() => new Promise<Page>(r => { resolve = r; })));
    t.emit({ kind: "remove", agentId: "a" } as Update);
    resolve(page(["a"])); await vi.advanceTimersByTimeAsync(0);
    expect(t.entries).toHaveLength(0); t.cleanup();
  });
  it("preserves a newer workspace event over stale list data and disposes moved pills", async () => {
    vi.useFakeTimers();
    let resolve!: (p: Page) => void;
    const t = setup(vi.fn(() => new Promise<Page>(r => { resolve = r; })));
    t.emit(upsert("a", "new")); resolve(page(["a"])); await vi.advanceTimersByTimeAsync(0);
    expect(t.entries[0].workspaceId).toBe("new");
    t.entries[0].onPress();
    const controller = t.component.mock.calls[0][0];
    expect(controller.snapshot()).toBe(true);
    t.emit(upsert("a", "moved"));
    expect(controller.snapshot()).toBe(false); expect(t.remove).toHaveBeenCalledTimes(1);
    t.emit(upsert("a", "moved", "archived"));
    expect(t.remove).toHaveBeenCalledTimes(2); t.cleanup();
  });
  it("retries failed enumeration and removes pills missing from a complete refresh", async () => {
    vi.useFakeTimers();
    const list = vi.fn<PluginClientContext["paseo"]["agents"]["list"]>()
      .mockRejectedValueOnce(Error("offline")).mockResolvedValueOnce(page(["a"])).mockResolvedValue(page([]));
    const t = setup(list); await vi.advanceTimersByTimeAsync(30000);
    expect(t.entries).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(30000); expect(t.remove).toHaveBeenCalledTimes(1);
    t.cleanup(); expect(t.unsubscribe).toHaveBeenCalledTimes(1);
  });
  it("ignores late list results, events and clicks after disposal", async () => {
    vi.useFakeTimers();
    let resolve!: (p: Page) => void;
    const t = setup(vi.fn(() => new Promise<Page>(r => { resolve = r; })));
    t.emit(upsert("a")); t.cleanup(); resolve(page(["b"])); t.emit(upsert("c"));
    await vi.advanceTimersByTimeAsync(0);
    expect(t.entries).toHaveLength(1);
    t.entries[0].onPress(); expect(t.component.mock.calls[0][0].snapshot()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("does not prune existing pills after a malformed incomplete page", async () => {
    vi.useFakeTimers();
    const malformed = page([]);
    malformed.pageInfo.hasMore = true;
    const list = vi.fn<PluginClientContext["paseo"]["agents"]["list"]>()
      .mockResolvedValueOnce(page(["a"])).mockResolvedValue(malformed);
    const t = setup(list); await vi.advanceTimersByTimeAsync(30000);
    expect(t.entries).toHaveLength(1);
    expect(t.remove).not.toHaveBeenCalled();
    t.cleanup(); t.cleanup();
    expect(t.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
