import type { PromptSettings } from "../shared/prompt-settings";
export function movePrompt(values: PromptSettings, id: string, direction: -1 | 1): PromptSettings {
  const index = values.prompts.findIndex(p => p.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= values.prompts.length) return values;
  const prompts = [...values.prompts];
  [prompts[index], prompts[target]] = [prompts[target], prompts[index]];
  return { prompts };
}
export function newPromptId(prompts: PromptSettings["prompts"]): string {
  const ids = new Set(prompts.map(p => p.id));
  let n = 1;
  while (ids.has(`prompt-${n}`)) n++;
  return `prompt-${n}`;
}
export function canSaveDraft(baseRevision: string, currentRevision: string, valid: boolean) {
  return valid && baseRevision === currentRevision;
}

