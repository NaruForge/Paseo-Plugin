import type { PluginHandlerContext } from "@getpaseo/plugin/server";
import type { Command, Run, Scope } from "../shared/commands";
import { findPowerShell, resolveDirectory } from "./environment";

type Paseo = PluginHandlerContext["paseo"];
type Terminal = Awaited<ReturnType<Paseo["terminals"]["list"]>>["entries"][number];
type Target = Scope & { terminalId: string; taskId: string; runId: string };
const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const marker = new RegExp(`^\\[command-deck:(${uuid}):(${uuid}):(${uuid})\\] (.*)$`, "i");
export function terminalName(scope: Scope, task: Command, requestId: string) {
  return `[command-deck:${scope.installationId}:${task.id}:${requestId}] ${task.name}`;
}
export function readTerminal(scope: Scope, terminal: Terminal): Run | null {
  const match = marker.exec(terminal.name);
  if (!match || match[1] !== scope.installationId || terminal.workspaceId !== scope.workspaceId) return null;
  return { taskId: match[2], runId: match[3], terminalId: terminal.id, name: match[4], cwd: terminal.cwd,
    command: null, status: "connected", ambiguous: false };
}

export function createRunner(environment = { findPowerShell, resolveDirectory }) {
  const locks = new Map<string, Promise<unknown>>();
  const starts = new Map<string, Promise<Run>>();
  const remembered = new Map<string, Run>();
  // Retain accepted request IDs for this plugin lifetime, including fast exits.
  const requests = new Set<string>();
  let disposed = false;
  const key = (scope: Scope, taskId: string) => `${scope.installationId}/${scope.workspaceId}/${taskId}`;
  function serialized<T>(scope: Scope, taskId: string, work: () => Promise<T>): Promise<T> {
    const k = key(scope, taskId);
    const previous = locks.get(k) ?? Promise.resolve();
    const result = previous.catch(() => {}).then(() => {
      if (disposed) throw new Error("Command Deck is reloading. Reconnect and check existing terminals before running again.");
      return work();
    });
    locks.set(k, result);
    void result.finally(() => { if (locks.get(k) === result) locks.delete(k); }).catch(() => {});
    return result;
  }
  async function list(scope: Scope, paseo: Paseo): Promise<Run[]> {
    const { entries } = await paseo.terminals.list({ workspaceId: scope.workspaceId });
    const runs = entries.map(entry => readTerminal(scope, entry)).filter((run): run is Run => !!run);
    for (const run of runs) {
      const old = remembered.get(key(scope, run.taskId));
      if (old?.runId === run.runId) {
        run.command = old.command;
        run.status = old.status === "stop-requested" ? "stop-requested" : "connected";
      }
      run.ambiguous = runs.filter(other => other.taskId === run.taskId).length > 1;
      if (!run.ambiguous) remembered.set(key(scope, run.taskId), run);
    }
    const prefix = `${scope.installationId}/${scope.workspaceId}/`;
    for (const [k, old] of remembered) {
      if (!k.startsWith(prefix) || runs.some(run => run.taskId === old.taskId)) continue;
      const renamed = entries.some(entry => entry.id === old.terminalId);
      if (old.status === "unknown" || renamed) {
        const unknown: Run = { ...old, status: "unknown" };
        remembered.set(k, unknown); runs.push(unknown);
      } else remembered.delete(k);
    }
    return runs;
  }
  async function verified(target: Target, paseo: Paseo) {
    const runs = await list(target, paseo);
    const run = runs.find(candidate => candidate.terminalId === target.terminalId && candidate.runId === target.runId && candidate.taskId === target.taskId);
    if (!run) return null;
    if (run.ambiguous || run.status === "unknown") throw new Error("Terminal ownership is unclear. Inspect this workspace's terminals manually.");
    return run;
  }
  return {
    list,
    start(scope: Scope, task: Command, requestId: string, paseo: Paseo) {
      if (!task.projectId || task.legacyWorkspaceId) return Promise.reject(new Error("Assign this command to a Project in Settings before running it."));
      const k = `${key(scope, task.id)}/${task.projectId}`;
      const inFlight = starts.get(k);
      if (inFlight) return inFlight;
      const result = serialized(scope, task.id, async () => {
        const workspace = paseo.workspaces.ref(scope.workspaceId);
        const snapshot = await workspace.refresh();
        if (!snapshot || snapshot.archivingAt || !workspace.directory) throw new Error("Workspace is unavailable or archived.");
        if (workspace.projectId !== task.projectId) throw new Error("Command belongs to a different project.");
        const existing = (await list(scope, paseo)).filter(run => run.taskId === task.id);
        if (existing.length > 1 || existing.some(run => run.ambiguous || run.status === "unknown")) {
          throw new Error("An earlier run could not be confirmed. Check existing terminals before allowing another run.");
        }
        if (existing[0]) return existing[0];
        const requestKey = `${key(scope, task.id)}/${requestId}`;
        if (requests.has(requestKey)) throw new Error("This run request was already submitted. Refresh the terminal list; it will not be sent again.");
        const executable = await environment.findPowerShell();
        const cwd = await environment.resolveDirectory(workspace.directory, task.cwd);
        if (disposed) throw new Error("Command Deck is reloading. Refresh before running again.");
        const pending: Run = { taskId: task.id, runId: requestId, terminalId: "", name: task.name, cwd,
          command: task.command, status: "unknown", ambiguous: false };
        requests.add(requestKey); remembered.set(key(scope, task.id), pending);
        // No retry: a rejection can mean the response was lost after process creation.
        const terminal = await paseo.terminals.create({ workspaceId: scope.workspaceId, cwd,
          name: terminalName(scope, task, requestId), command: executable,
          args: ["-NoLogo", "-NoProfile", "-Command", task.command] });
        const run: Run = { ...pending, terminalId: terminal.id, status: "connected" };
        remembered.set(key(scope, task.id), run);
        return run;
      });
      starts.set(k, result);
      void result.finally(() => { if (starts.get(k) === result) starts.delete(k); }).catch(() => {});
      return result;
    },
    async capture(target: Target, paseo: Paseo) {
      if (!await verified(target, paseo)) return { lines: [], exists: false };
      const output = await paseo.terminals.ref(target.terminalId).capture({ start: -200, stripAnsi: true });
      // Bound responses even when a process writes very long lines.
      let remaining = 32000;
      const lines: string[] = [];
      for (const line of output.lines.slice(-200)) {
        const clipped = line.slice(0, Math.min(4000, remaining));
        lines.push(clipped + (clipped.length < line.length ? " … [truncated]" : ""));
        remaining -= clipped.length;
        if (remaining <= 0) { lines.push("[Output truncated; inspect the Workspace terminal for more.]"); break; }
      }
      return { lines, exists: true };
    },
    stop(target: Target, terminate: boolean, paseo: Paseo) {
      return serialized(target, target.taskId, async () => {
        const run = await verified(target, paseo);
        if (!run) return { status: "terminated" as const };
        const terminal = paseo.terminals.ref(target.terminalId);
        if (terminate) {
          await terminal.kill(); remembered.delete(key(target, target.taskId));
          return { status: "terminated" as const };
        }
        terminal.sendKeys(["C-c"]);
        remembered.set(key(target, target.taskId), { ...run, status: "stop-requested" });
        return { status: "stop-requested" as const };
      });
    },
    forget(scope: Scope, taskId: string, paseo: Paseo) {
      return serialized(scope, taskId, async () => {
        const runs = await list(scope, paseo);
        if (runs.some(run => run.taskId === taskId && run.status !== "unknown")) throw new Error("A terminal is still connected. Stop it before starting another run.");
        remembered.delete(key(scope, taskId)); return { cleared: true };
      });
    },
    dispose() { disposed = true; /* Paseo owns terminal lifetime. Never kill here. */ },
  };
}
