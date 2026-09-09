import type { Command, Run } from "../shared/commands";
import { newId } from "./ids";

export interface RunApi {
  list(): Promise<{ runs: Run[] }>;
  capture(run: Run): Promise<{ lines: string[]; exists: boolean }>;
  start(task: Command, requestId: string): Promise<Run>;
  stop(run: Run, terminate: boolean): Promise<{ status: "stop-requested" | "terminated" }>;
  forget(taskId: string): Promise<unknown>;
}
export interface RunState {
  runs: Run[]; lastRuns: Record<string, Run>; output: Record<string, string[]>; loaded: boolean; busy: boolean;
  error: string | null; requestError: string | null; notice: string | null;
}
export function createRunController(api: RunApi) {
  let state: RunState = { runs: [], lastRuns: {}, output: {}, loaded: false, busy: false, error: null, requestError: null, notice: null };
  let active = true;
  let generation = 0;
  let selected: string | null = null;
  let poll: Promise<void> | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  const listeners = new Set<() => void>();
  const publish = (changes: Partial<RunState>) => {
    if (!active) return;
    state = { ...state, ...changes }; for (const listener of listeners) listener();
  };
  function refresh(): Promise<void> {
    if (!active || state.busy) return Promise.resolve();
    if (poll) return poll;
    const epoch = generation;
    poll = (async () => {
      try {
        const { runs } = await api.list();
        if (!active || epoch !== generation) return;
        const run = runs.find(value => value.runId === selected);
        let output = state.output;
        if (run && !run.ambiguous && run.status !== "unknown") {
          // A failed capture must not erase the last known output.
          const capture = await api.capture(run);
          if (!active || epoch !== generation) return;
          if (capture.exists) output = { ...output, [run.runId]: capture.lines };
        }
        publish({ runs, lastRuns: { ...state.lastRuns, ...Object.fromEntries(runs.map(value => [value.taskId, value])) }, output, loaded: true, error: null });
      } catch (error) { if (active && epoch === generation) publish({ loaded: true, error: error instanceof Error ? error.message : "Could not refresh terminals." }); }
    })().finally(() => { if (epoch === generation) poll = null; });
    return poll;
  }
  async function action(work: () => Promise<string>) {
    if (!active || state.busy) return;
    const epoch = generation;
    publish({ busy: true, error: null, requestError: null, notice: null });
    // Finish any old read before changing terminal state.
    await poll;
    if (!active || epoch !== generation) return;
    let failure: string | null = null;
    try { const notice = await work(); if (epoch === generation) publish({ notice }); }
    catch (error) { failure = error instanceof Error ? error.message : "Request failed. Refresh before trying again."; }
    finally {
      if (!active || epoch !== generation) return;
      publish({ busy: false });
      await refresh();
      if (failure && active && epoch === generation) publish({ requestError: failure });
    }
  }
  return {
    snapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    begin() { if (!timer) { active = true; void refresh(); timer = setInterval(() => { void refresh(); }, 2000); } },
    refresh,
    select(runId: string | null) { selected = runId; void refresh(); },
    start(task: Command) { return action(async () => {
      const epoch = generation;
      const run = await api.start(task, newId());
      if (active && epoch === generation) {
        selected = run.runId;
        publish({ runs: [...state.runs.filter(value => value.taskId !== task.id), run], lastRuns: { ...state.lastRuns, [task.id]: run } });
      }
      return "Run submitted. Terminal presence does not indicate command success.";
    }); },
    stop(run: Run, terminate: boolean) { return action(async () => {
      const result = await api.stop(run, terminate);
      return result.status === "terminated" ? "Terminal terminated." : "Ctrl+C requested. Check the output; the process may still be running.";
    }); },
    forget(taskId: string) { return action(async () => { await api.forget(taskId); return "Unknown run cleared. You may explicitly start another run."; }); },
    dispose() { active = false; generation++; if (timer) clearInterval(timer); timer = null; poll = null; state = { ...state, busy: false }; listeners.clear(); },
  };
}
