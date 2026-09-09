import { CommandSettingsSchema, type Command, type CommandSettings } from "../shared/commands";

export function applyCommand(values: CommandSettings, command: Command): CommandSettings {
  return { ...values, commands: values.commands.some(value => value.id === command.id)
    ? values.commands.map(value => value.id === command.id ? command : value) : [...values.commands, command] };
}
export function canSaveDraft(base: string, revision: string, draft: CommandSettings): boolean {
  return base === revision && CommandSettingsSchema.safeParse(draft).success;
}
