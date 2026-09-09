import type { PluginClientContext } from "@getpaseo/plugin/client";
import { PromptSettingsScreen } from "./client/prompt-settings";
import { PromptPill } from "./client/prompt-pill";
import { registerPromptPills } from "./client/prompt-registration";
export default function contribute(client: PluginClientContext) {
  const removeSettings = client.addSettingsScreen({
    id: "library", title: "Prompt Palette", icon: "MessagesSquare", Component: PromptSettingsScreen,
  });
  const removePills = registerPromptPills(client, (controller, sender) => props =>
    <PromptPill {...props} controller={controller} sender={sender} openSettings={() => client.openSettings("library")} />);
  return () => { removePills(); void removeSettings(); };
}
