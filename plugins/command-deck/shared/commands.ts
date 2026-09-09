import { defineRpc, defineSettings } from "@getpaseo/plugin";
import { z } from "zod";

const id = z.string().uuid();
const workspaceId = z.string().min(1).max(200);
export const CommandSchema = z.object({
  id, projectId: z.string().max(200).default(""), legacyWorkspaceId: workspaceId.optional(),
  name: z.string().trim().min(1).max(80).refine(value => !/[\r\n\0\u2028\u2029]/.test(value), "Enter a single-line name"),
  command: z.string().min(1).max(8000).refine(value => value.trim().length > 0 && !/[\r\n\0]/.test(value), "Enter one PowerShell command line"),
  cwd: z.string().max(2000).refine(value => !/[\r\n\0]/.test(value), "Enter a directory path").default(""),
}).refine(value => Boolean(value.projectId) !== Boolean(value.legacyWorkspaceId), "Choose a Project");
export function migrateCommands(values: unknown, fromVersion: number): unknown {
  if (fromVersion !== 1) return values;
  const previous = z.object({ installationId: z.string(), commands: z.array(z.object({ workspaceId }).passthrough()) }).passthrough().parse(values);
  return { ...previous, commands: previous.commands.map(({ workspaceId: legacyWorkspaceId, ...task }) => ({ ...task, projectId: "", legacyWorkspaceId })) };
}
export function resolveProjectCommands(commands: Command[], workspaceProjects: Readonly<Record<string, string>>): Command[] {
  return commands.map(task => {
    const projectId = task.legacyWorkspaceId ? workspaceProjects[task.legacyWorkspaceId] : undefined;
    if (!projectId) return task;
    const { legacyWorkspaceId: _, ...rest } = task;
    return { ...rest, projectId };
  });
}
export const CommandSettingsSchema = z.object({
  installationId: z.union([id, z.literal("")]).default(""),
  commands: z.array(CommandSchema).max(100).default([]),
}).refine(value => new Set(value.commands.map(command => command.id)).size === value.commands.length, "Duplicate command IDs")
  .refine(value => value.commands.length === 0 || value.installationId !== "", "Save an installation identifier with the commands");
export const commandSettings = defineSettings({ id: "commands", scope: "host", version: 2, schema: CommandSettingsSchema, migrate: migrateCommands });
export type Command = z.infer<typeof CommandSchema>;
export type CommandSettings = z.infer<typeof CommandSettingsSchema>;

export const ScopeSchema = z.object({ installationId: id, workspaceId });
export type Scope = z.infer<typeof ScopeSchema>;
export const RunSchema = z.object({
  taskId: id, runId: id, terminalId: z.string(), name: z.string(), cwd: z.string(),
  command: z.string().nullable(),
  status: z.enum(["connected", "stop-requested", "unknown"]),
  ambiguous: z.boolean(),
});
export type Run = z.infer<typeof RunSchema>;
export const listRuns = defineRpc({ name: "runs.list", input: ScopeSchema, output: z.object({ runs: z.array(RunSchema) }) });
export const startRun = defineRpc({ name: "runs.start", input: ScopeSchema.extend({ task: CommandSchema, requestId: id }), output: RunSchema });
const target = ScopeSchema.extend({ terminalId: z.string().min(1), taskId: id, runId: id });
export const captureRun = defineRpc({ name: "runs.capture", input: target, output: z.object({ lines: z.array(z.string()), exists: z.boolean() }) });
export const stopRun = defineRpc({ name: "runs.stop", input: target.extend({ terminate: z.boolean() }), output: z.object({ status: z.enum(["stop-requested", "terminated"]) }) });
export const forgetUnknownRun = defineRpc({ name: "runs.forget-unknown", input: ScopeSchema.extend({ taskId: id }), output: z.object({ cleared: z.boolean() }) });
