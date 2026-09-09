import { describe, expect, it } from "vitest";
import { PromptSchema, PromptSettingsSchema, promptSettings } from "./prompt-settings";
describe("prompt library contract", () => {
  const prompt = { id: "p", name: "Review", description: "", body: "  한글\n\tcode\n  " };
  it("preserves prompt whitespace and Unicode exactly", () => {
    expect(PromptSchema.parse(prompt).body).toBe(prompt.body);
    expect(PromptSettingsSchema.parse({})).toEqual({ prompts: [] });
    expect(promptSettings).toMatchObject({ id: "library", scope: "host", version: 1 });
  });
  it("rejects blank fields, excessive input and duplicate identities", () => {
    for (const bad of [{ ...prompt, name: "  " }, { ...prompt, body: "\n\t" },
      { ...prompt, body: "a".repeat(20001) }, { ...prompt, name: "a".repeat(81) },
      { ...prompt, description: "a".repeat(241) }]) expect(PromptSchema.safeParse(bad).success).toBe(false);
    expect(PromptSettingsSchema.safeParse({ prompts: [prompt, prompt] }).success).toBe(false);
    expect(PromptSettingsSchema.safeParse({ prompts: Array.from({ length: 101 }, (_, i) => ({ ...prompt, id: String(i) })) }).success).toBe(false);
  });
  it("allows duplicate names but keeps separate identities and order", () => {
    const values = { prompts: [prompt, { ...prompt, id: "other" }] };
    expect(PromptSettingsSchema.parse(values)).toEqual(values);
  });
});

