import { defineSettings } from "@getpaseo/plugin";
import { z } from "zod";
export const PromptSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(80).refine(s => s.trim().length > 0, "Enter a name"),
  description: z.string().max(240).default(""),
  body: z.string().min(1).max(20000).refine(s => s.trim().length > 0, "Enter a prompt"),
});
export const PromptSettingsSchema = z.object({ prompts: z.array(PromptSchema).max(100).default([]) })
  .refine(({ prompts }) => new Set(prompts.map(p => p.id)).size === prompts.length, "Duplicate prompt IDs");
export const promptSettings = defineSettings({
  id: "library", scope: "host", version: 1, schema: PromptSettingsSchema,
});
export type Prompt = z.infer<typeof PromptSchema>;
export type PromptSettings = z.infer<typeof PromptSettingsSchema>;

