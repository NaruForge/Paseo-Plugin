import { describe, expect, it } from "vitest";
import { canSaveDraft, movePrompt, newPromptId } from "./prompt-draft.logic";
describe("prompt draft operations", () => {
  const values = { prompts: ["prompt-1", "prompt-3", "prompt-2"].map(id => ({ id, name: id, body: "  text\n", description: "" })) };
  it("moves by identity without mutating the original body or array", () => {
    expect(movePrompt(values, "prompt-3", -1).prompts.map(p => p.id)).toEqual(["prompt-3", "prompt-1", "prompt-2"]);
    expect(values.prompts[0].id).toBe("prompt-1");
    expect(movePrompt(values, "prompt-3", 1).prompts[2].body).toBe("  text\n");
  });
  it("keeps bounds stable and allocates an unused identity", () => {
    expect(movePrompt(values, "missing", 1)).toBe(values);
    expect(movePrompt(values, "prompt-1", -1)).toBe(values);
    expect(movePrompt(values, "prompt-2", 1)).toBe(values);
    expect(newPromptId(values.prompts)).toBe("prompt-4");
  });
  it("never saves invalid data or adopts a newer revision for an old draft", () => {
    expect(canSaveDraft("r1", "r2", true)).toBe(false);
    expect(canSaveDraft("r1", "r1", false)).toBe(false);
    expect(canSaveDraft("r1", "r1", true)).toBe(true);
  });
});

