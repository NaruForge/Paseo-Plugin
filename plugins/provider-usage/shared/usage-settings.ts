import { defineSettings } from "@getpaseo/plugin";
import { z } from "zod";

export const UsageSettingsSchema = z.object({
  resetTimeFormat: z.enum(["date-time", "time-remaining"]).default("date-time"),
  visibility: z.object({
    composerPill: z.boolean().default(true),
  }).default({ composerPill: true }),
  pill: z.object({
    showRemainingPercent: z.boolean().default(true),
    showProviderName: z.boolean().default(true),
    showResetTime: z.boolean().default(false),
  }).default({ showRemainingPercent: true, showProviderName: true, showResetTime: false }),
});

export const usageSettings = defineSettings({
  id: "display",
  scope: "host",
  version: 3,
  schema: UsageSettingsSchema,
  migrate(values, fromVersion) {
    if (fromVersion !== 1 && fromVersion !== 2) throw new Error("Unsupported Provider Usage settings version.");
    // Preserve existing choices, remove retired fields and default to the original time format.
    return UsageSettingsSchema.parse(values);
  },
});

export type UsageSettings = z.infer<typeof UsageSettingsSchema>;
export type PillSettings = UsageSettings["pill"];
export type ResetTimeFormat = UsageSettings["resetTimeFormat"];
export const DEFAULT_USAGE_SETTINGS = UsageSettingsSchema.parse({});
