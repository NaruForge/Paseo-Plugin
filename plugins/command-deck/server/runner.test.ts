import { describe, expect, it, vi } from "vitest";
import type { PluginHandlerContext } from "@getpaseo/plugin/server";
import { createRunner, readTerminal, terminalName } from "./runner";
import type { Command } from "../shared/commands";
const scope = { installationId: "11111111-1111-4111-8111-111111111111", workspaceId: "workspace-a" };
const task: Command = { id: "22222222-2222-4222-8222-222222222222", projectId: "project-a", name: "Dev", command: "npm run dev", cwd: "" };
const request = "33333333-3333-4333-8333-333333333333";
const nextRequest = "44444444-4444-4444-8444-444444444444";
function setup() {
  const entries: { id: string; workspaceId: string; name: string; cwd: string }[] = [];
  const kill = vi.fn(async () => { entries.length = 0; });
  const sendKeys = vi.fn();
  const capture = vi.fn(async () => ({ lines: ["output"] }));
  const create = vi.fn(async (options: { workspaceId: string; name: string; cwd: string }) => {
    const entry = { id: `terminal-${entries.length}`, ...options }; entries.push(entry); return { id: entry.id };
  });
  const list = vi.fn(async () => ({ entries: [...entries] }));
  const workspace = { projectId: "project-a", directory: "C:\\repo", refresh: vi.fn(async () => ({ id: scope.workspaceId, archivingAt: null as string | null })) };
  const paseo = { terminals: { create, list, ref: vi.fn(() => ({ kill, sendKeys, capture })) }, workspaces: { ref: vi.fn(() => workspace) } } as unknown as PluginHandlerContext["paseo"];
  const environment = { findPowerShell: vi.fn(async () => "C:\\PowerShell\\pwsh.exe"), resolveDirectory: vi.fn(async () => "C:\\repo") };
  const runner = createRunner(environment);
  return { runner, paseo, environment, create, entries, kill, sendKeys, capture, list, workspace };
}
describe("Command Deck terminal ownership and lifecycle", () => {
  it("serializes two clients and returns the same terminal without submitting twice", async () => {
    const f = setup();
    const [one, two] = await Promise.all([f.runner.start(scope, task, request, f.paseo), f.runner.start(scope, task, nextRequest, f.paseo)]);
    expect(one.terminalId).toBe(two.terminalId); expect(f.create).toHaveBeenCalledTimes(1);
    expect(f.create).toHaveBeenCalledWith(expect.objectContaining({ cwd: "C:\\repo", command: "C:\\PowerShell\\pwsh.exe", args: ["-NoLogo", "-NoProfile", "-Command", "npm run dev"] }));
  });
  it("shares a Project command while keeping worktree cwd and terminals separate", async () => {
    const f = setup();
    await f.runner.start(scope, task, request, f.paseo);
    f.workspace.directory = "C:/repo-worktree";
    f.environment.resolveDirectory.mockImplementation(async () => f.workspace.directory);
    const otherScope = { ...scope, workspaceId: "worktree-b" };
    const other = await f.runner.start(otherScope, task, request, f.paseo);
    expect(other.cwd).toBe("C:/repo-worktree");
    expect(f.environment.resolveDirectory).toHaveBeenLastCalledWith("C:/repo-worktree", "");
    expect(f.create).toHaveBeenCalledTimes(2);
    expect(await f.runner.list(scope, f.paseo)).toHaveLength(1);
    expect(await f.runner.list(otherScope, f.paseo)).toHaveLength(1);
  });
  it("rejects unresolved legacy commands without creating a terminal", async () => {
    const f = setup();
    await expect(f.runner.start(scope, { ...task, projectId: "", legacyWorkspaceId: scope.workspaceId }, request, f.paseo)).rejects.toThrow("Assign");
    expect(f.create).not.toHaveBeenCalled();
  });
  it("rediscovers deleted/edited commands after runner recreation without creating or killing", async () => {
    const f = setup(); const run = await f.runner.start(scope, task, request, f.paseo);
    f.runner.dispose(); const reloaded = createRunner(f.environment);
    const runs = await reloaded.list(scope, f.paseo);
    expect(runs).toHaveLength(1); expect(runs[0]).toMatchObject({ terminalId: run.terminalId, command: null });
    await reloaded.start(scope, { ...task, command: "different" }, nextRequest, f.paseo);
    expect(f.create).toHaveBeenCalledTimes(1); expect(f.kill).not.toHaveBeenCalled();
  });
  it("does not repeat a request after a fast terminal exit", async () => {
    const f = setup(); await f.runner.start(scope, task, request, f.paseo); f.entries.length = 0;
    await expect(f.runner.start(scope, task, request, f.paseo)).rejects.toThrow("already submitted");
    expect(f.create).toHaveBeenCalledTimes(1);
  });
  it("reconciles a lost creation response and blocks retry until resolved", async () => {
    const f = setup(); f.create.mockImplementationOnce(async options => {
      f.entries.push({ id: "lost-response", ...options }); throw new Error("response timeout");
    });
    await expect(f.runner.start(scope, task, request, f.paseo)).rejects.toThrow("timeout");
    const recovered = await f.runner.start(scope, task, nextRequest, f.paseo);
    expect(recovered.terminalId).toBe("lost-response"); expect(f.create).toHaveBeenCalledTimes(1);
  });
  it("keeps an unknown run when no response or terminal is available, requiring explicit recovery", async () => {
    const f = setup(); f.create.mockRejectedValueOnce(new Error("timeout"));
    await expect(f.runner.start(scope, task, request, f.paseo)).rejects.toThrow();
    expect((await f.runner.list(scope, f.paseo))[0].status).toBe("unknown");
    await expect(f.runner.start(scope, task, nextRequest, f.paseo)).rejects.toThrow("could not be confirmed");
    expect(f.create).toHaveBeenCalledTimes(1);
    await f.runner.forget(scope, task.id, f.paseo);
    await f.runner.start(scope, task, nextRequest, f.paseo); expect(f.create).toHaveBeenCalledTimes(2);
  });
  it("never touches another workspace or installation's terminal", async () => {
    const f = setup(); const run = await f.runner.start(scope, task, request, f.paseo);
    expect(await f.runner.list({ ...scope, workspaceId: "other" }, f.paseo)).toEqual([]);
    expect(await f.runner.list({ ...scope, installationId: nextRequest }, f.paseo)).toEqual([]);
    await f.runner.stop({ ...scope, workspaceId: "other", ...run }, true, f.paseo);
    expect(f.kill).not.toHaveBeenCalled();
    await expect(f.runner.start(scope, { ...task, projectId: "other" }, nextRequest, f.paseo)).rejects.toThrow("different project");
  });
  it("rejects ambiguous or renamed terminals instead of terminating them", async () => {
    const f = setup(); const run = await f.runner.start(scope, task, request, f.paseo);
    f.entries.push({ ...f.entries[0], id: "duplicate" });
    await expect(f.runner.stop({ ...scope, ...run }, true, f.paseo)).rejects.toThrow("unclear");
    f.entries.pop(); f.entries[0].name = "renamed";
    await expect(f.runner.stop({ ...scope, ...run }, true, f.paseo)).rejects.toThrow("unclear");
    expect(f.kill).not.toHaveBeenCalled();
  });
  it("validates prerequisites before creating and preserves the previous run snapshot on edits", async () => {
    const f = setup(); f.environment.resolveDirectory.mockRejectedValueOnce(new Error("missing directory"));
    await expect(f.runner.start(scope, task, request, f.paseo)).rejects.toThrow("missing directory");
    expect(f.create).not.toHaveBeenCalled();
    await f.runner.start(scope, task, request, f.paseo);
    const run = await f.runner.start(scope, { ...task, command: "edited" }, nextRequest, f.paseo);
    expect(run.command).toBe("npm run dev");
  });
  it("does not create in an archiving workspace", async () => {
    const f = setup(); f.workspace.refresh.mockResolvedValue({ id: scope.workspaceId, archivingAt: "now" });
    await expect(f.runner.start(scope, task, request, f.paseo)).rejects.toThrow("archived");
    expect(f.create).not.toHaveBeenCalled();
  });
  it("captures only the tail and distinguishes interrupt from teardown", async () => {
    const f = setup(); const run = await f.runner.start(scope, task, request, f.paseo); const target = { ...scope, ...run };
    expect(await f.runner.capture(target, f.paseo)).toEqual({ lines: ["output"], exists: true });
    expect(f.capture).toHaveBeenCalledWith({ start: -200, stripAnsi: true });
    expect(await f.runner.stop(target, false, f.paseo)).toEqual({ status: "stop-requested" });
    expect(f.sendKeys).toHaveBeenCalledWith(["C-c"]); expect(f.kill).not.toHaveBeenCalled();
    expect(await f.runner.stop(target, true, f.paseo)).toEqual({ status: "terminated" });
    expect(await f.runner.capture(target, f.paseo)).toEqual({ lines: [], exists: false });
  });
  it("does not kill on dispose and rejects queued work", async () => {
    const f = setup(); f.runner.dispose(); f.runner.dispose();
    await expect(f.runner.start(scope, task, request, f.paseo)).rejects.toThrow("reloading");
    expect(f.kill).not.toHaveBeenCalled(); expect(f.create).not.toHaveBeenCalled();
  });
  it("matches the complete ownership marker and workspace, never a loose name prefix", () => {
    const terminal = { id: "t", workspaceId: scope.workspaceId, cwd: "C:\\repo", name: terminalName(scope, task, request) };
    expect(readTerminal(scope, terminal)?.taskId).toBe(task.id);
    expect(readTerminal(scope, { ...terminal, name: `prefix ${terminal.name}` })).toBeNull();
  });
});
