import { type PluginComposerPillProps, usePaseo, useSettings, useAgent } from "@getpaseo/plugin/client";
import { Modal, ScrollView, copyText } from "@getpaseo/plugin/client/react-native";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { promptSettings, type Prompt } from "../shared/prompt-settings";
import type { PromptSender } from "./prompt-send";
import { Action } from "./prompt-ui";

export function PromptPicker({ theme, layout, host, agentId, workspaceId, sender, close, openSettings }: PluginComposerPillProps & {
  sender: PromptSender; close(): void; openSettings(): void;
}) {
  const settings = useSettings(promptSettings);
  const paseo = usePaseo();
  const agent = useAgent(agentId, value => ({ title: value.title, workspaceId: value.workspaceId }));
  const [selected, setSelected] = useState<Prompt | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(sender.uncertain ? "Delivery is uncertain. Check the conversation before sending again." : null);
  const [reloading, setReloading] = useState(true);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    void settings.reload().catch(() => { if (alive.current) setError("Could not refresh prompts."); })
      .finally(() => { if (alive.current) setReloading(false); });
    return () => { alive.current = false; };
  }, []);
  const unavailable = !agent || agent.workspaceId !== workspaceId;
  async function send() {
    if (!selected || pending || sender.pending || sender.uncertain || unavailable) return;
    const body = selected.body;
    setPending(true); setError(null);
    const handle = paseo.agents.ref(agentId);
    const result = await sender.send(async () => {
      const latest = await handle.refresh();
      return alive.current && !!latest && !latest.agent.archivedAt && latest.agent.workspaceId === workspaceId;
    }, () => handle.send(body));
    if (!alive.current) return;
    setPending(false);
    if (result === "sent") close();
    else if (result === "unknown") setError("Delivery is uncertain. Check the conversation before sending again.");
    else if (result === "unavailable") setError("Agent unavailable. Check the Host connection and try again.");
  }
  const message = (text: string) => <Text style={{ color: theme.colors.foregroundMuted, fontSize: 12 }}>{text}</Text>;
  return <Modal title={selected ? selected.name : "Quick prompts"} open onOpenChange={open => { if (!open && !sender.pending) close(); }}>
    <Modal.Content style={{ backgroundColor: theme.colors.surface0 }} contentContainerStyle={{ padding: layout.compact ? 16 : 24, gap: 16 }} scrollable={false}>
      {message(`Host: ${host.label} · Agent: ${agent?.title || agentId}`)}
      {unavailable ? message("This Agent is no longer available.") : null}
      {error ? <Text accessibilityRole="alert" style={{ color: theme.colors.foreground, fontSize: 14 }}>{error}</Text> : null}
      {selected ? <>
        <ScrollView style={{ maxHeight: layout.compact ? 280 : 400 }}>
          <Text selectable style={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 22 }}>{selected.body}</Text>
        </ScrollView>
        {message("Sends this text as a separate message. Your Composer draft and attachments stay in place. A running Agent may receive it as a follow-up.")}
        {sender.uncertain ? <Action theme={theme} label="I checked the conversation — allow another send" disabled={pending}
          onPress={() => { sender.acknowledge(); setError(null); }} /> : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Action theme={theme} label="Back" disabled={pending} onPress={() => { setSelected(null); setError(null); }} />
          <Action theme={theme} label="Copy text" disabled={pending} onPress={() => {
            void copyText(selected.body).then(() => { if (alive.current) setError("Prompt copied."); })
              .catch(() => { if (alive.current) setError("Could not copy the prompt."); });
          }} />
          <Action theme={theme} label={pending ? "Sending…" : "Send"} primary
            disabled={pending || sender.uncertain || unavailable} onPress={() => { void send(); }} />
        </View>
      </> : reloading || settings.status === "loading" ? message("Loading prompts…") :
        settings.status !== "ready" ? <>
          {message("Saved prompts could not be loaded.")}
          <Action theme={theme} label="Retry" disabled={reloading} onPress={() => {
            setReloading(true);
            void settings.reload().catch(() => { if (alive.current) setError("Could not refresh prompts."); })
              .finally(() => { if (alive.current) setReloading(false); });
          }} />
        </> : <>
          <ScrollView style={{ maxHeight: layout.compact ? 300 : 440 }}>
            <View style={{ gap: 8 }}>
              {settings.values.prompts.length === 0 ? message("No saved prompts yet. Add your first prompt in Settings.") :
                settings.values.prompts.map(prompt => <View key={prompt.id}>
                  <Action theme={theme} label={prompt.name} disabled={unavailable}
                    onPress={() => { setSelected({ ...prompt }); }} />
                  <Text numberOfLines={2} style={{ color: theme.colors.foregroundMuted, fontSize: 12, paddingHorizontal: 12 }}>
                    {prompt.description || prompt.body}
                  </Text>
                </View>)}
            </View>
          </ScrollView>
          <Action theme={theme} label={settings.values.prompts.length ? "Manage prompts" : "Add prompts"} onPress={() => { close(); openSettings(); }} />
        </>}
    </Modal.Content>
  </Modal>;
}
