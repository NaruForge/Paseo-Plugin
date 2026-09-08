import type { PluginServerContext } from "@getpaseo/plugin/server";
import { listProviderUsageSnapshot } from "./server/provider-usage";
import { providerUsageSnapshot } from "./shared/provider-usage";
import { usageSettings } from "./shared/usage-settings";

export default function contribute(server: PluginServerContext) {
  server.registerSettings(usageSettings);
  server.handle(providerUsageSnapshot, (input, { paseo }) => listProviderUsageSnapshot(paseo.providers, input));
  return () => {};
}
