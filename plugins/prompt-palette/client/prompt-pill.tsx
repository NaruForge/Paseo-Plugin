import type { PluginComposerPillProps } from "@getpaseo/plugin/client";
import { useEffect, useSyncExternalStore } from "react";
import { Text } from "react-native";
import type { PromptController } from "./prompt-controller";
import type { PromptSender } from "./prompt-send";
import { PromptPicker } from "./prompt-picker";
export function PromptPill(props: PluginComposerPillProps & {
  controller: PromptController; sender: PromptSender; openSettings(): void;
}) {
  const open = useSyncExternalStore(props.controller.subscribe, props.controller.snapshot, props.controller.snapshot);
  const sending = useSyncExternalStore(props.sender.subscribe, props.sender.snapshot, props.sender.snapshot);
  useEffect(() => () => props.controller.close(), [props.controller]);
  return <>
    <Text accessibilityLiveRegion="polite" style={{ color: props.theme.colors.foreground, fontSize: 12 }}>{sending ? "Sending…" : "Prompts"}</Text>
    {open ? <PromptPicker key={props.host.id + ":" + props.agentId} {...props}
      close={() => props.controller.close()} /> : null}
  </>;
}
