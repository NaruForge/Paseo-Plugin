import type { PluginClientContext } from "@getpaseo/plugin/client";
import { PromptSettingsScreen } from "./client/prompt-settings";
import { PromptPickerContent } from "./client/prompt-picker";
import { registerPromptPills } from "./client/prompt-registration";
export default function contribute(client: PluginClientContext) {
  const removeSettings = client.addSettingsScreen({
    id: "library", title: "Prompt Palette", icon: "MessagesSquare", Component: PromptSettingsScreen,
  });
  const removePills = registerPromptPills(client, sender => props =>
    <PromptPickerContent {...props} sender={sender} openSettings={() => client.openSettings("library")} />);
  return () => { removePills(); void removeSettings(); };
}
