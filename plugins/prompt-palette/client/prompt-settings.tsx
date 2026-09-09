import { type PluginSurfaceProps, type SettingsState, useSettings } from "@getpaseo/plugin/client";
import { SettingsSection, SettingsCard, SettingsRow } from "@getpaseo/plugin/client/ui";
import { Modal, TextInput, copyText } from "@getpaseo/plugin/client/react-native";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { promptSettings, PromptSchema, PromptSettingsSchema, type Prompt, type PromptSettings } from "../shared/prompt-settings";
import { movePrompt, newPromptId, canSaveDraft } from "./prompt-draft.logic";
import { Action } from "./prompt-ui";

export function PromptSettingsScreen(props: PluginSurfaceProps) {
  return <PromptSettingsSession key={props.host.id} {...props} />;
}

function PromptSettingsSession(props: PluginSurfaceProps) {
  const settings = useSettings(promptSettings);
  const initial = useRef<{ values: PromptSettings; revision: string } | null>(null);
  if (!initial.current && settings.status === "ready") initial.current = settings;
  if (!initial.current) return <SettingsSection title="Prompt library"><SettingsCard>
    <SettingsRow label={settings.status === "loading" ? "Loading prompts…" : "Prompt library unavailable"}
      error={settings.status === "error" || settings.status === "invalid" ? settings.error : null} />
    <Action theme={props.theme} label="Reload" onPress={() => { void settings.reload(); }} />
  </SettingsCard></SettingsSection>;
  return <PromptSettingsForm {...props} initial={initial.current} settings={settings} />;
}

export function PromptSettingsForm({ theme, layout, host, settings, initial }: PluginSurfaceProps & {
  settings: SettingsState<typeof PromptSettingsSchema>; initial: { values: PromptSettings; revision: string };
}) {
  const [draft, setDraft] = useState<PromptSettings>(() => initial.values);
  const [base, setBase] = useState(initial.revision);
  const [original, setOriginal] = useState(() => initial.values);
  const [editor, setEditor] = useState<Prompt | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [discard, setDiscard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const busy = useRef(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(original);
  const revision = settings.status === "ready" ? settings.revision : base;
  const conflict = base !== revision;
  const valid = PromptSettingsSchema.safeParse(draft);
  useEffect(() => {
    if (settings.status !== "ready" || pending) return;
    if ((!dirty && !editor && !deleting) || (saved && !editor && !deleting && JSON.stringify(settings.values) === JSON.stringify(draft))) {
      setDraft(settings.values); setOriginal(settings.values); setBase(settings.revision); setSaved(false);
    }
  }, [settings.status, revision, pending, saved, dirty, editor, deleting]);
  async function save() {
    if (busy.current || settings.saving || settings.status !== "ready" || !canSaveDraft(base, revision, valid.success)) return;
    busy.current = true; setPending(true); setError(null);
    try {
      const ok = await settings.save(draft, base);
      if (ok) { setSaved(true); }
      else setError("Changes were not saved. Keep a copy of your draft before loading the latest settings.");
    } finally { busy.current = false; setPending(false); }
  }
  const disabled = pending || settings.saving || settings.status !== "ready";
  const input = (label: string, value: string, update: (text: string) => void, multiline = false) => <View style={{ gap: 8 }}>
    <Text style={{ color: theme.colors.foreground, fontSize: 14 }}>{label}</Text>
    <TextInput accessibilityLabel={label} value={value} onChangeText={update} multiline={multiline}
      style={{ color: theme.colors.foreground, backgroundColor: theme.colors.surface0, borderColor: theme.colors.border,
        borderWidth: 1, borderRadius: 8, padding: 12, minHeight: multiline ? 180 : 44, textAlignVertical: "top" }} />
  </View>;
  return <View style={{ backgroundColor: theme.colors.surface0, gap: 16 }}>
    <SettingsSection title="Prompt library">
      <SettingsCard><SettingsRow label={`Saved on ${host.label}`}
        hint="Shared by clients using this plugin installation on this Host. Save changes before leaving Settings." /></SettingsCard>
      {draft.prompts.length === 0 ? <SettingsRow label="No saved prompts yet" hint="Add a prompt you use often." /> : null}
      {draft.prompts.length ? <SettingsCard>{draft.prompts.map((prompt, index) => <View key={prompt.id}
        style={{ borderTopWidth: index === 0 ? 0 : 1, borderTopColor: theme.colors.border }}>
        <SettingsRow label={prompt.name} hint={prompt.description || prompt.body.slice(0, 100)} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
          <Action theme={theme} label="Edit" accessibilityLabel={`Edit ${prompt.name}`} disabled={disabled} onPress={() => setEditor({ ...prompt })} />
          <Action theme={theme} label="Move up" accessibilityLabel={`Move ${prompt.name} up`} disabled={disabled || index === 0} onPress={() => setDraft(movePrompt(draft, prompt.id, -1))} />
          <Action theme={theme} label="Move down" accessibilityLabel={`Move ${prompt.name} down`} disabled={disabled || index === draft.prompts.length - 1} onPress={() => setDraft(movePrompt(draft, prompt.id, 1))} />
          <Action theme={theme} label="Delete" accessibilityLabel={`Delete ${prompt.name}`} disabled={disabled} onPress={() => setDeleting(prompt.id)} />
        </View>
      </View>)}</SettingsCard> : null}
      <Action theme={theme} label="Add prompt" disabled={disabled || draft.prompts.length >= 100}
        onPress={() => setEditor({ id: newPromptId(draft.prompts), name: "", description: "", body: "" })} />
    </SettingsSection>
    {conflict ? <SettingsRow label="Settings changed on another client"
      hint="Your draft is preserved. Copy it before discarding it and loading the latest library." /> : null}
    {error || settings.saveError ? <SettingsRow label="Changes not saved" error={error || settings.saveError} /> : null}
    {notice ? <Text accessibilityLiveRegion="polite" style={{ color: theme.colors.foregroundMuted, fontSize: 12 }}>{notice}</Text> : null}
    {settings.status !== "ready" ? <SettingsCard>
      <SettingsRow label={settings.status === "loading" ? "Refreshing library…" : "Library unavailable — your draft is preserved"}
        error={settings.status === "loading" ? null : settings.error} />
      <Action theme={theme} label="Retry loading" onPress={() => { void settings.reload(); }} />
    </SettingsCard> : null}
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      <Action theme={theme} label={pending || settings.saving ? "Saving…" : "Save changes"} primary
        disabled={disabled || !dirty || conflict || !valid.success} onPress={() => { void save(); }} />
      <Action theme={theme} label="Cancel / load latest" disabled={disabled} onPress={() => setDiscard(true)} />
      {conflict || error || settings.status !== "ready" ? <Action theme={theme} label="Copy draft" onPress={() => {
        void copyText(JSON.stringify(draft, null, 2)).then(() => setNotice("Draft copied."))
          .catch(() => setError("Could not copy. Your draft is still available here."));
      }} /> : null}
    </View>
    {editor ? <Modal title={draft.prompts.some(p => p.id === editor.id) ? "Edit prompt" : "Add prompt"} open onOpenChange={open => { if (!open) setEditor(null); }}>
      <Modal.Content style={{ backgroundColor: theme.colors.surface0 }} contentContainerStyle={{ padding: layout.compact ? 16 : 24, gap: 16 }}>
        {input("Name", editor.name, name => setEditor({ ...editor, name }))}
        {input("Description (optional)", editor.description, description => setEditor({ ...editor, description }))}
        {input("Prompt", editor.body, body => setEditor({ ...editor, body }), true)}
        <Text style={{ color: theme.colors.foregroundMuted, fontSize: 12 }}>Name and prompt are required. Name: up to 80 characters · Description: 240 · Prompt: 20,000</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Action theme={theme} label="Cancel" onPress={() => setEditor(null)} />
          <Action theme={theme} label="Apply to draft" primary disabled={!PromptSchema.safeParse(editor).success}
            onPress={() => {
              setDraft({ prompts: draft.prompts.some(p => p.id === editor.id)
                ? draft.prompts.map(p => p.id === editor.id ? editor : p) : [...draft.prompts, editor] });
              setEditor(null);
            }} />
        </View>
      </Modal.Content>
    </Modal> : null}
    {deleting ? <Modal title="Delete prompt?" open onOpenChange={open => { if (!open) setDeleting(null); }}>
      <Modal.Content style={{ backgroundColor: theme.colors.surface0 }}>
        <Text style={{ color: theme.colors.foreground, fontSize: 14 }}>Remove this prompt from your draft? Save changes to update the shared library.</Text>
        <Action theme={theme} label="Keep prompt" onPress={() => setDeleting(null)} />
        <Action theme={theme} label="Delete prompt" onPress={() => { setDraft({ prompts: draft.prompts.filter(p => p.id !== deleting) }); setDeleting(null); }} />
      </Modal.Content>
    </Modal> : null}
    {discard ? <Modal title="Discard draft and load latest?" open onOpenChange={open => { if (!open) setDiscard(false); }}>
      <Modal.Content style={{ backgroundColor: theme.colors.surface0 }}>
        <Text style={{ color: theme.colors.foreground, fontSize: 14 }}>Unsaved changes will be discarded. Copy your draft first if you want to keep it.</Text>
        <Action theme={theme} label="Keep editing" disabled={disabled} onPress={() => setDiscard(false)} />
        <Action theme={theme} label="Discard draft" disabled={disabled} onPress={() => {
          if (settings.status !== "ready") return;
          setDraft(settings.values); setOriginal(settings.values); setBase(settings.revision); setDiscard(false); setError(null); setSaved(false);
          void settings.reload();
        }} />
      </Modal.Content>
    </Modal> : null}
  </View>;
}
