import type { PluginClientContext, PluginComposerPillProps } from "@getpaseo/plugin/client";
import { Text } from "react-native";
import { CommandPanel } from "./client/panel";
import { CommandSettingsScreen } from "./client/settings";
import { registerCommandPills } from "./client/registration";

function CommandsPill({ theme }: PluginComposerPillProps) {
  return <Text style={{ color: theme.colors.foreground, fontSize: 12 }}>Commands</Text>;
}

export default function contribute(client: PluginClientContext) {
  let initialWorkspace: string | undefined;
  const cleanups = [
    client.addSettingsScreen({ id: "commands", title: "Command Deck", icon: "Terminal",
      Component: props => <CommandSettingsScreen {...props} initialWorkspace={initialWorkspace} /> }),
    client.addWorkspacePanel({ id: "commands", title: "Commands", icon: "Terminal", context: "workspace",
      Component: props => <CommandPanel {...props} openSettings={() => { initialWorkspace = props.workspaceId; client.openSettings("commands"); }} /> }),
    client.addCommandCenterItem({ id: "open-commands", title: "Open workspace commands", icon: "Terminal", context: "workspace",
      onSelect: context => context.openPanel("commands") }),
    registerCommandPills(client, CommandsPill),
  ];
  let disposed = false;
  return () => { if (disposed) return; disposed = true; for (const cleanup of cleanups.reverse()) void cleanup(); };
}
