import { afterEach, describe, expect, it, vi } from "vitest";
import { createRunController, type RunApi } from "./run-controller";
import type { Command, Run } from "../shared/commands";
const task: Command = { id: "22222222-2222-4222-8222-222222222222", projectId: "p", name: "Dev", command: "npm run dev", cwd: "" };
const run: Run = { taskId: task.id, runId: "33333333-3333-4333-8333-333333333333", terminalId: "t", name: "Dev", command: task.command, cwd: "C:\\repo", status: "connected", ambiguous: false };
function setup() {
  const api = { list: vi.fn(async () => ({ runs: [run] })), capture: vi.fn(async () => ({ lines: ["ready"], exists: true })),
    start: vi.fn(async () => run), stop: vi.fn(async () => ({ status: "stop-requested" as const })), forget: vi.fn(async () => ({})) } satisfies RunApi;
  return { api, controller: createRunController(api) };
}
afterEach(() => vi.useRealTimers());
describe("run controller", () => {
  it("preserves output on capture failure and recovers on the next read", async () => {
    const { controller, api } = setup(); controller.select(run.runId); await controller.refresh();
    api.capture.mockRejectedValueOnce(new Error("offline")); await controller.refresh();
    expect(controller.snapshot().output[run.runId]).toEqual(["ready"]); expect(controller.snapshot().error).toBe("offline");
    await controller.refresh(); expect(controller.snapshot().error).toBeNull(); controller.dispose();
  });
  it("coalesces overlapping reads", async () => {
    const { controller, api } = setup(); let resolve!: (value: { runs: Run[] }) => void;
    api.list.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
    const first = controller.refresh(); const second = controller.refresh(); expect(api.list).toHaveBeenCalledTimes(1);
    resolve({ runs: [run] }); await Promise.all([first, second]); controller.dispose();
  });
  it("drops late results after unmount and removes its timer", async () => {
    vi.useFakeTimers(); const { controller, api } = setup(); let resolve!: (value: { runs: Run[] }) => void;
    api.list.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
    const listener = vi.fn(); controller.subscribe(listener); controller.begin(); controller.dispose();
    resolve({ runs: [run] }); await Promise.resolve(); await Promise.resolve(); await vi.advanceTimersByTimeAsync(6000);
    expect(listener).not.toHaveBeenCalled(); expect(api.list).toHaveBeenCalledTimes(1); expect(controller.snapshot().runs).toEqual([]);
  });
  it("does not retry a failed mutation and guards double presses", async () => {
    const { controller, api } = setup(); api.start.mockRejectedValueOnce(new Error("response lost"));
    await Promise.all([controller.start(task), controller.start(task)]);
    expect(api.start).toHaveBeenCalledTimes(1); expect(controller.snapshot().requestError).toBe("response lost");
    expect(api.list).toHaveBeenCalledTimes(1);
    await controller.refresh(); expect(controller.snapshot().requestError).toBe("response lost"); controller.dispose();
  });
  it("finishes an old read before running and refreshes after the mutation", async () => {
    const { controller, api } = setup(); let resolve!: (value: { runs: Run[] }) => void;
    api.list.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
    void controller.refresh(); const action = controller.start(task); expect(api.start).not.toHaveBeenCalled();
    resolve({ runs: [] }); await action;
    expect(api.start).toHaveBeenCalledTimes(1); expect(api.list).toHaveBeenCalledTimes(2); expect(controller.snapshot().runs).toEqual([run]); controller.dispose();
  });
  it("keeps the last submitted command and output when the terminal disappears", async () => {
    const { controller, api } = setup(); controller.select(run.runId); await controller.refresh();
    api.list.mockResolvedValueOnce({ runs: [] }); await controller.refresh();
    expect(controller.snapshot().runs).toEqual([]);
    expect(controller.snapshot().lastRuns[task.id]).toEqual(run);
    expect(controller.snapshot().output[run.runId]).toEqual(["ready"]); controller.dispose();
  });
  it("can restart its effect without accepting a result from the previous generation", async () => {
    vi.useFakeTimers(); const { controller, api } = setup(); let resolve!: (value: { runs: Run[] }) => void;
    api.list.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
    controller.begin(); controller.dispose(); controller.begin(); await controller.refresh();
    resolve({ runs: [] }); await Promise.resolve(); await Promise.resolve();
    expect(controller.snapshot().runs).toEqual([run]); controller.dispose();
  });
});
