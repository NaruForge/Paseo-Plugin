import { defineSettings } from "@getpaseo/plugin";
import { z } from "zod";

export const UsageSettingsSchema = z.object({
  visibility: z.object({
    composerPill: z.boolean().default(true),
    sidebar: z.boolean().default(false),
  }).default({ composerPill: true, sidebar: false }),
  pill: z.object({
    showRemainingPercent: z.boolean().default(true),
    showProviderName: z.boolean().default(true),
    showResetTime: z.boolean().default(false),
  }).default({ showRemainingPercent: true, showProviderName: true, showResetTime: false }),
});

export const usageSettings = defineSettings({
  id: "display",
  scope: "host",
  version: 1,
  schema: UsageSettingsSchema,
});

export type UsageSettings = z.infer<typeof UsageSettingsSchema>;
export type PillSettings = UsageSettings["pill"];
export const DEFAULT_USAGE_SETTINGS = UsageSettingsSchema.parse({});
