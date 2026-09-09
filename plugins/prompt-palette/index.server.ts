import type { PluginServerContext } from "@getpaseo/plugin/server";
import { promptSettings } from "./shared/prompt-settings";
export default function contribute(server: PluginServerContext) {
  server.registerSettings(promptSettings);
  return () => {};
}
