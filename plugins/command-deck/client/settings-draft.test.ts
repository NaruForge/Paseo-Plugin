import { describe, expect, it } from "vitest";
import { applyCommand, canSaveDraft } from "./settings-draft";
import { CommandSettingsSchema, migrateCommands, resolveProjectCommands, type CommandSettings } from "../shared/commands";
const values: CommandSettings = { installationId: "11111111-1111-4111-8111-111111111111", commands: [
  { id: "22222222-2222-4222-8222-222222222222", projectId: "first", name: "Dev", command: "npm run dev", cwd: "" },
  { id: "33333333-3333-4333-8333-333333333333", projectId: "second", name: "Dev", command: ".\\dashboard.ps1", cwd: "" },
] };
describe("project command drafts", () => {
  it("migrates legacy Workspace commands without losing identities or unresolved commands", () => {
    const legacy = { ...values, commands: values.commands.map(({ projectId, ...task }) => ({ ...task, workspaceId: projectId })) };
    const migrated = CommandSettingsSchema.parse(migrateCommands(legacy, 1));
    expect(migrated.installationId).toBe(values.installationId);
    const resolved = resolveProjectCommands(migrated.commands, { first: "project-a" });
    expect(resolved[0]).toEqual({ ...values.commands[0], projectId: "project-a" });
    expect(resolved[1]).toEqual({ ...values.commands[1], projectId: "", legacyWorkspaceId: "second" });
    expect(migrated.commands[0].legacyWorkspaceId).toBe("first");
    expect(CommandSettingsSchema.safeParse({ ...values, commands: resolved }).success).toBe(true);
  });
  it("edits only the chosen command and preserves installation identity and other projects", () => {
    const draft = applyCommand(values, { ...values.commands[0], command: "npm test" });
    expect(draft.commands[1]).toEqual(values.commands[1]); expect(values.commands[0].command).toBe("npm run dev");
    expect(draft.installationId).toBe(values.installationId);
  });
  it("rejects a stale revision without changing the local draft", () => {
    const draft = applyCommand(values, { ...values.commands[0], command: "npm test" });
    expect(canSaveDraft("old", "new", draft)).toBe(false); expect(draft.commands[0].command).toBe("npm test");
    expect(canSaveDraft("same", "same", draft)).toBe(true);
  });
  it("rejects multiline commands and duplicate IDs; empty libraries keep their namespace", () => {
    expect(CommandSettingsSchema.safeParse({ ...values, commands: [values.commands[0], values.commands[0]] }).success).toBe(false);
    expect(CommandSettingsSchema.safeParse(applyCommand(values, { ...values.commands[0], command: "npm test\nexit" })).success).toBe(false);
    expect(CommandSettingsSchema.safeParse(applyCommand(values, { ...values.commands[0], name: "Dev\nserver" })).success).toBe(false);
    expect(CommandSettingsSchema.parse({ ...values, commands: [] }).installationId).toBe(values.installationId);
  });
});
