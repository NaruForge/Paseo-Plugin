import { type PluginSurfaceProps, type SettingsState, useSettings } from "@getpaseo/plugin/client";
import { SettingsSection, SettingsCard, SettingsRow, SettingsSelect } from "@getpaseo/plugin/client/ui";
import { Modal, copyText } from "@getpaseo/plugin/client/react-native";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { commandSettings, CommandSchema, CommandSettingsSchema, type CommandSettings, type Command, resolveProjectCommands } from "../shared/commands";
import { applyCommand, canSaveDraft } from "./settings-draft";
import { newId } from "./ids";
import { Action, Confirm, Field } from "./ui";

import { useProjectCatalog, type ProjectOption } from "./projects";
type Props = PluginSurfaceProps & { initialWorkspace?: string };
export function CommandSettingsScreen(props: Props) {
  return <SettingsSession key={props.host.id} {...props} />;
}
function SettingsSession(props: Props) {
  const settings = useSettings(commandSettings);
  const catalog = useProjectCatalog();
  const initial = useRef<{ values: CommandSettings; revision: string } | null>(null);
  if (!initial.current && settings.status === "ready") initial.current = { values: settings.values, revision: settings.revision };
  if (!initial.current) return <SettingsSection title="Command library"><SettingsCard>
    <SettingsRow label={settings.status === "loading" ? "Loading commands…" : "Commands unavailable"}
      error={settings.status === "error" || settings.status === "invalid" ? settings.error : null} />
    <Action theme={props.theme} label="Reload settings" onPress={() => { void settings.reload(); }} />
  </SettingsCard></SettingsSection>;
  return <SettingsForm {...props} initial={initial.current} settings={settings} projects={catalog.projects} workspaceProjects={catalog.workspaceProjects}
    projectError={catalog.error} reloadProjects={catalog.reload} />;
}

export function SettingsForm({ theme, host, layout, initialWorkspace, initial, settings, projects, workspaceProjects, projectError, reloadProjects }: Props & {
  initial: { values: CommandSettings; revision: string }; settings: SettingsState<typeof CommandSettingsSchema>;
  projects: ProjectOption[]; workspaceProjects: Record<string, string>; projectError: string | null; reloadProjects(): void;
}) {
  const [draft, setDraft] = useState(initial.values);
  const [original, setOriginal] = useState(initial.values);
  const [base, setBase] = useState(initial.revision);
  const [workspace, setWorkspace] = useState("");
  const [editor, setEditor] = useState<Command | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [discard, setDiscard] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const revision = settings.status === "ready" ? settings.revision : base;
  const dirty = JSON.stringify(draft) !== JSON.stringify(original);
  const conflict = base !== revision;
  const disabled = pending || settings.saving || settings.status !== "ready";
  useEffect(() => {
    if (!workspace && projects[0]) setWorkspace((initialWorkspace && workspaceProjects[initialWorkspace]) || projects[0].id);
  }, [projects, workspace, workspaceProjects, initialWorkspace]);
  useEffect(() => {
    if (settings.status === "ready" && !dirty && !editor && !deleting && !pending) {
      setDraft(settings.values); setOriginal(settings.values); setBase(settings.revision);
    }
  }, [settings.status, revision, dirty, editor, deleting, pending]);
  async function save() {
    if (busy.current || disabled || !canSaveDraft(base, revision, draft)) return;
    busy.current = true; setPending(true); setError(null);
    const submitted = { ...draft, commands: resolveProjectCommands(draft.commands, workspaceProjects) };
    try {
      const ok = await settings.save(submitted, base);
      if (!mounted.current) return;
      if (ok) { setDraft(submitted); setOriginal(submitted); setNotice("Commands saved."); }
      else setError("Settings changed or could not be saved. Your draft is preserved. Copy it before loading the latest settings.");
    } finally { busy.current = false; if (mounted.current) setPending(false); }
  }
  const resolvedCommands = resolveProjectCommands(draft.commands, workspaceProjects);
  const options = projects.map(value => ({ value: value.id, label: projects.filter(other => other.name === value.name).length > 1 ? `${value.name} · ${value.directory}` : value.name }));
  for (const task of resolvedCommands) if (task.projectId && !options.some(value => value.value === task.projectId)) options.push({ value: task.projectId, label: `Unavailable Project · ${task.projectId}` });
  if (resolvedCommands.some(task => task.legacyWorkspaceId)) options.push({ value: "legacy", label: "Needs Project assignment" });
  const currentTasks = resolvedCommands.filter(task => workspace === "legacy" ? !!task.legacyWorkspaceId : task.projectId === workspace);
  return <View style={{ backgroundColor: theme.colors.surface0, gap: 16 }}>
    <SettingsSection title="Command library">
      <SettingsCard><SettingsRow label={`Saved on ${host.label}`} hint="Commands are shared by all Workspaces and worktrees in a Project. Save changes before leaving Settings. PowerShell runs without your interactive profile." /></SettingsCard>
      {options.length ? <SettingsSelect label="Project" value={workspace} options={options} onValueChange={value => { setWorkspace(value); setEditor(null); }} disabled={disabled} /> : <SettingsRow label="No Projects available" />}
      {projects.find(value => value.id === workspace) ? <SettingsRow label="Project root" hint={projects.find(value => value.id === workspace)?.directory} /> : null}
      {resolvedCommands.some(task => task.legacyWorkspaceId) ? <SettingsRow label="Older commands need a Project" hint="Choose Needs Project assignment, edit each command and select its Project. Existing commands are preserved." /> : null}
      {projectError ? <SettingsRow label="Project list unavailable" error={projectError} /> : null}
      <Action theme={theme} label="Reload Projects" onPress={reloadProjects} />
      {!currentTasks.length ? <SettingsRow label="No commands in this Project" hint="Add a command such as npm run dev or .\dashboard.ps1." /> : <SettingsCard>
        {currentTasks.map(task => <View key={task.id} style={{ gap: 8 }}><SettingsRow label={task.name} hint={`${task.command} · ${task.cwd || "Workspace root"}`} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Action theme={theme} label={`Edit ${task.name}`} disabled={disabled} onPress={() => setEditor({ ...task })} />
            <Action theme={theme} label={`Delete ${task.name}`} disabled={disabled} onPress={() => setDeleting(task.id)} />
          </View>
        </View>)}
      </SettingsCard>}
      <Action theme={theme} label="Add command" disabled={disabled || !!projectError || !projects.some(value => value.id === workspace) || draft.commands.length >= 100}
        onPress={() => setEditor({ id: newId(), projectId: workspace, name: "", command: "", cwd: "" })} />
    </SettingsSection>
    {conflict ? <SettingsRow label="Settings changed on another client" hint="Your draft is preserved. Copy it before loading the latest settings." /> : null}
    {error || settings.saveError ? <SettingsRow label="Changes not saved" error={error || settings.saveError} /> : null}
    {settings.status !== "ready" ? <SettingsRow label="Settings unavailable — draft preserved" error={settings.status === "loading" ? null : settings.error} /> : null}
    {notice ? <Text accessibilityLiveRegion="polite" style={{ color: theme.colors.foregroundMuted }}>{notice}</Text> : null}
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      <Action theme={theme} label={pending ? "Saving…" : "Save changes"} primary disabled={disabled || (!dirty && JSON.stringify(resolvedCommands) === JSON.stringify(draft.commands)) || !canSaveDraft(base, revision, draft)} onPress={() => { void save(); }} />
      <Action theme={theme} label="Load latest…" disabled={pending} onPress={() => { void settings.reload(); setDiscard(true); }} />
      <Action theme={theme} label="Copy draft" onPress={() => { void copyText(JSON.stringify(draft, null, 2)).then(() => { if (mounted.current) setNotice("Draft copied."); })
        .catch(() => { if (mounted.current) setError("Could not copy. Your draft is still available here."); }); }} />
    </View>
    {editor ? <Modal title={draft.commands.some(task => task.id === editor.id) ? "Edit command" : "Add command"} open onOpenChange={open => { if (!open) setEditor(null); }}>
      <Modal.Content style={{ backgroundColor: theme.colors.surface0 }} contentContainerStyle={{ padding: layout.compact ? 16 : 24, gap: 16 }}>
        <SettingsSelect label="Command Project" value={editor.projectId} options={[{ value: "", label: "Choose a Project" }, ...projects.map(value => ({ value: value.id, label: value.name }))]} disabled={!!projectError}
          onValueChange={projectId => { const { legacyWorkspaceId: _, ...rest } = editor; setEditor({ ...rest, projectId }); }} />
        <Field theme={theme} label="Name" value={editor.name} onChange={name => setEditor({ ...editor, name })} />
        <Field theme={theme} label="PowerShell command" value={editor.command} onChange={command => setEditor({ ...editor, command })} />
        <Field theme={theme} label="Working directory (optional)" value={editor.cwd} onChange={cwd => setEditor({ ...editor, cwd })} />
        <Text style={{ color: theme.colors.foregroundMuted, fontSize: 12 }}>Leave the directory empty for the Workspace root. Relative paths and full Windows absolute paths are supported. Environment variables and PowerShell profiles are not configured here.</Text>
        {!CommandSchema.safeParse(editor).success ? <Text style={{ color: theme.colors.foregroundMuted, fontSize: 12 }}>Enter a name and one PowerShell command line.</Text> : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Action theme={theme} label="Cancel" onPress={() => setEditor(null)} />
          <Action theme={theme} label="Apply to draft" primary disabled={!CommandSchema.safeParse(editor).success} onPress={() => {
            const task = CommandSchema.parse(editor);
            setDraft(applyCommand({ ...draft, installationId: draft.installationId || newId() }, task)); setEditor(null);
          }} />
        </View>
      </Modal.Content>
    </Modal> : null}
    {deleting ? <Confirm theme={theme} title="Delete command?" message="Remove this command from the draft? Save changes to update the library. Its existing terminal will remain available in the panel."
      confirm="Delete command" onCancel={() => setDeleting(null)} onConfirm={() => { setDraft({ ...draft, commands: draft.commands.filter(task => task.id !== deleting) }); setDeleting(null); }} /> : null}
    {discard ? <Confirm theme={theme} title="Load latest settings?" message="Discard unsaved changes and use the latest loaded settings? Copy your draft first if you want to keep it."
      confirm="Discard draft" busy={pending || settings.saving} confirmDisabled={settings.status !== "ready"} onCancel={() => setDiscard(false)} onConfirm={() => {
        if (settings.status !== "ready") return;
        setDraft(settings.values); setOriginal(settings.values); setBase(settings.revision); setEditor(null); setDiscard(false); setError(null);
      }} /> : null}
  </View>;
}
