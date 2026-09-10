import type { PluginButtonIconProps } from "@getpaseo/plugin/client";
import { useEffect, useSyncExternalStore } from "react";
import { Icon } from "@getpaseo/plugin/client/react-native";
import type { PromptController } from "./prompt-controller";
import type { PromptSender } from "./prompt-send";
import { PromptPicker } from "./prompt-picker";
export function PromptPill(props: PluginButtonIconProps & {
  controller: PromptController; sender: PromptSender; openSettings(): void;
}) {
  const open = useSyncExternalStore(props.controller.subscribe, props.controller.snapshot, props.controller.snapshot);
  useEffect(() => () => props.controller.close(), [props.controller]);
  return <>
    <Icon name="MessagesSquare" size={props.size} color={props.color} />
    {open && props.context === "agent" ? <PromptPicker key={props.host.id + ":" + props.agentId} {...props}
      close={() => props.controller.close()} /> : null}
  </>;
}
