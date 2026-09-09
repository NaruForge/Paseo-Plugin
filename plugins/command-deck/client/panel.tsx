import { type PluginWorkspacePanelProps, useRpc, useSettings, useWorkspace } from "@getpaseo/plugin/client";
import { ScrollView } from "@getpaseo/plugin/client/react-native";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Text, View } from "react-native";
import { captureRun, commandSettings, forgetUnknownRun, listRuns, startRun, stopRun, resolveProjectCommands, type Command, type Run } from "../shared/commands";
import { createRunController, type RunState } from "./run-controller";
import { Action, Confirm } from "./ui";

import { useProjectCatalog } from "./projects";

type Props = PluginWorkspacePanelProps & { openSettings(): void };
export function CommandPanel(props: Props) {
  return <PanelSession key={`${props.host.id}/${props.workspaceId}`} {...props} />;
}
function PanelSession(props: Props) {
  const settings = useSettings(commandSettings);
  const projectId = useWorkspace(props.workspaceId, workspace => workspace.projectId);
  const catalog = useProjectCatalog(settings.status === "ready" && settings.values.commands.some(task => !!task.legacyWorkspaceId));
  if (settings.status !== "ready") return <View style={{ padding: 16, gap: 12, backgroundColor: props.theme.colors.surface0 }}>
    <Text style={{ color: props.theme.colors.foreground }}>{settings.status === "loading" ? "Loading commands…" : settings.error}</Text>
    <Action theme={props.theme} label="Reload settings" onPress={() => { void settings.reload(); }} />
  </View>;
  if (!settings.values.installationId) return <View style={{ padding: 16, gap: 12, backgroundColor: props.theme.colors.surface0 }}>
    <Text style={{ color: props.theme.colors.foreground }}>No saved commands yet.</Text>
    <Action theme={props.theme} label="Manage commands" onPress={props.openSettings} />
  </View>;
  return <ConnectedPanel key={settings.values.installationId} {...props} installationId={settings.values.installationId}
    commands={resolveProjectCommands(settings.values.commands, catalog.workspaceProjects).filter(task => !!projectId && task.projectId === projectId)} />;
}
function ConnectedPanel(props: Props & { installationId: string; commands: Command[] }) {
  const list = useRpc(listRuns); const start = useRpc(startRun); const capture = useRpc(captureRun);
  const stop = useRpc(stopRun); const forget = useRpc(forgetUnknownRun);
  const controller = useMemo(() => {
    const scope = { installationId: props.installationId, workspaceId: props.workspaceId };
    const target = (run: Run) => ({ ...scope, taskId: run.taskId, terminalId: run.terminalId, runId: run.runId });
    return createRunController({ list: () => list(scope), start: (task, requestId) => start({ ...scope, task, requestId }),
      capture: run => capture(target(run)), stop: (run, terminate) => stop({ ...target(run), terminate }),
      forget: taskId => forget({ ...scope, taskId }) });
  }, [props.installationId, props.workspaceId, list, start, capture, stop, forget]);
  useEffect(() => { controller.begin(); return () => controller.dispose(); }, [controller]);
  const state = useSyncExternalStore(controller.subscribe, controller.snapshot, controller.snapshot);
  return <PanelView {...props} state={state} onSelect={id => controller.select(id)} onRefresh={() => { void controller.refresh(); }}
    onStart={task => { void controller.start(task); }} onStop={(run, terminate) => { void controller.stop(run, terminate); }}
    onForget={id => { void controller.forget(id); }} />;
}

export function PanelView({ theme, layout, commands, state, openSettings, onSelect, onRefresh, onStart, onStop, onForget }: Props & {
  commands: Command[]; state: RunState; onSelect(id: string | null): void; onRefresh(): void;
  onStart(task: Command): void; onStop(run: Run, terminate: boolean): void; onForget(taskId: string): void;
}) {
  const [selection, setSelection] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ run: Run; unknown: boolean } | null>(null);
  const selectedTask = commands.find(task => task.id === selection) ?? (!selection ? commands[0] : undefined);
  const selectedRun = state.runs.find(run => run.taskId === (selectedTask?.id ?? selection));
  const lastRun = selectedRun ?? state.lastRuns[selectedTask?.id ?? selection ?? ""];
  const selectionId = lastRun?.runId ?? null;
  useEffect(() => { onSelect(selectionId); }, [selectionId]);
  const choose = (id: string) => { setSelection(id); };
  const text = { color: theme.colors.foreground, fontSize: 14 };
  const muted = { color: theme.colors.foregroundMuted, fontSize: 12 };
  const label = !state.loaded ? "Loading terminals…" : selectedRun?.ambiguous ? "Ownership unclear" : selectedRun?.status === "unknown" ? "Run could not be confirmed"
    : selectedRun?.status === "stop-requested" ? "Stop requested" : selectedRun ? "Terminal connected" : lastRun ? "Terminal ended — result unknown" : "No connected terminal";
  return <ScrollView style={{ flex: 1, backgroundColor: theme.colors.surface0 }}
    contentContainerStyle={{ padding: layout.compact ? 16 : 24, gap: 16 }}>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      <Action theme={theme} label="Manage commands" onPress={openSettings} />
      <Action theme={theme} label="Refresh" disabled={state.busy} onPress={onRefresh} />
    </View>
    <View style={{ flexDirection: layout.compact ? "column" : "row", gap: 16, alignItems: "stretch" }}>
      <View style={{ flex: layout.compact ? undefined : 1, minWidth: 0, gap: 8 }}>
        <Text style={muted}>SAVED COMMANDS</Text>
        {!commands.length ? <Text style={text}>No commands for this Project. Add one in Settings.</Text> : null}
        {commands.map(task => <Action key={task.id} theme={theme} label={`${task.id === selectedTask?.id ? "› " : ""}${task.name}`} onPress={() => choose(task.id)} />)}
        {state.runs.filter(run => !commands.some(task => task.id === run.taskId)).map(run => <Action key={run.terminalId || run.runId} theme={theme}
          label={`${run.name} (removed command)`} onPress={() => choose(run.taskId)} />)}
      </View>
      <View style={{ flex: layout.compact ? undefined : 2, minWidth: 0, gap: 12, padding: 16, borderRadius: 8, backgroundColor: theme.colors.surface1 }}>
        <Text style={text}>{selectedTask?.name ?? selectedRun?.name ?? "Select a command"}</Text>
        <Text style={muted}>{label}</Text>
        {selectedTask ? <><Text selectable style={text}>{selectedTask.command}</Text>
          <Text selectable style={muted}>Next run directory: {selectedTask.cwd || "Workspace root"}</Text></> : null}
        {lastRun ? <><Text selectable style={muted}>Terminal directory: {lastRun.cwd}</Text>
          <Text selectable style={muted}>{lastRun.command ? `Submitted command: ${lastRun.command}` : "Submitted command details are unavailable after reconnecting to this terminal."}</Text></> : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {selectedTask ? <Action theme={theme} primary label={state.busy ? "Please wait…" : "Run command"}
            disabled={!state.loaded || state.busy || !!state.error || !!selectedRun} onPress={() => onStart(selectedTask)} /> : null}
          {selectedRun && !selectedRun.ambiguous && selectedRun.status !== "unknown" ? <>
            <Action theme={theme} label="Send Ctrl+C" disabled={state.busy} onPress={() => onStop(selectedRun, false)} />
            <Action theme={theme} label="Terminate terminal" disabled={state.busy} onPress={() => setConfirm({ run: selectedRun, unknown: false })} />
          </> : null}
          {selectedRun?.status === "unknown" ? <Action theme={theme} label="Allow another run…" disabled={state.busy}
            onPress={() => setConfirm({ run: selectedRun, unknown: true })} /> : null}
        </View>
        <Text style={muted}>RECENT OUTPUT · LAST 200 LINES</Text>
        <Text selectable style={{ ...text, fontFamily: "monospace", lineHeight: 20 }}>
          {(selectionId ? state.output[selectionId]?.join("\n").trimEnd() : "") || "No output captured. Short commands may finish before their output can be read."}
        </Text>
        <Text style={muted}>Terminal presence does not mean success or server readiness. Output is not a permanent log. Use the Workspace terminal for interactive input.</Text>
      </View>
    </View>
    {state.error || state.requestError ? <Text accessibilityRole="alert" style={{ color: theme.colors.statusDanger, fontSize: 14 }}>{state.error || state.requestError}</Text> : null}
    {state.notice ? <Text accessibilityLiveRegion="polite" style={muted}>{state.notice}</Text> : null}
    {confirm ? <Confirm theme={theme} title={confirm.unknown ? "Allow another run?" : "Terminate terminal?"}
      message={confirm.unknown ? "An earlier command may still be running. Inspect this Workspace's terminals first. Clearing this record does not stop any process and can allow a duplicate run."
        : "Close this terminal and interrupt its process? Unsaved work in the terminal may be lost."}
      confirm={confirm.unknown ? "Clear unknown run" : "Terminate terminal"} busy={state.busy} onCancel={() => setConfirm(null)}
      onConfirm={() => { if (confirm.unknown) onForget(confirm.run.taskId); else onStop(confirm.run, true); setConfirm(null); }} /> : null}
  </ScrollView>;
}
