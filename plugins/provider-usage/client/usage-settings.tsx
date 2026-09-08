import { type PluginSurfaceProps, type SettingsState, useSettings } from "@getpaseo/plugin/client";
import { SettingsAction, SettingsCard, SettingsRow, SettingsSection, SettingsSwitch } from "@getpaseo/plugin/client/ui";
import { useRef, useState } from "react";
import { Text, View } from "react-native";
import { usageSettings, type UsageSettings, type UsageSettingsSchema } from "../shared/usage-settings";

interface SettingsProps extends PluginSurfaceProps {
  onChanged(): Promise<void>;
}

export function UsageSettingsScreen(props: SettingsProps) {
  const settings = useSettings(usageSettings);
  return <UsageSettingsForm {...props} settings={settings} />;
}

export function UsageSettingsForm({ theme, settings, onChanged }: SettingsProps & {
  settings: SettingsState<typeof UsageSettingsSchema>;
}) {
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const disabled = settings.saving || pending;

  async function run(action: () => Promise<boolean>) {
    if (busy.current || settings.saving) return;
    busy.current = true;
    setPending(true);
    setActionError(null);
    try {
      if (await action()) await onChanged();
    } catch {
      setActionError("Could not update settings. Try again.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  function save(values: UsageSettings) {
    if (settings.status !== "ready") return;
    const revision = settings.revision;
    void run(() => settings.save(values, revision));
  }

  const reload = () => void run(async () => { await settings.reload(); return true; });
  const error = settings.saveError ?? actionError;
  const errorFeedback = error ? (
    <SettingsSection title="Changes not saved">
      <SettingsCard>
        <SettingsRow label="Your saved settings are unchanged" error={error} />
        <SettingsAction label="Load the latest settings before trying again" actionLabel="Reload" onPress={reload} disabled={disabled} />
      </SettingsCard>
    </SettingsSection>
  ) : null;

  if (settings.status === "loading") {
    return <SettingsSection title="Preferences"><SettingsCard><SettingsRow label="Loading settings…" /></SettingsCard></SettingsSection>;
  }
  if (settings.status !== "ready") {
    return (
      <View style={{ backgroundColor: theme.colors.surface0 }}>
        <SettingsSection title="Preferences">
          <SettingsCard>
            <SettingsRow label={settings.status === "invalid" ? "Saved settings could not be read" : "Settings unavailable"} error={settings.error} />
            <SettingsAction label="Read settings again" actionLabel="Reload" onPress={reload} disabled={disabled} />
            {settings.status === "invalid" ? (
              <SettingsAction label="Replace invalid settings with the defaults" actionLabel="Restore defaults" onPress={() => void run(() => settings.reset())} disabled={disabled} />
            ) : null}
          </SettingsCard>
        </SettingsSection>
        {errorFeedback}
      </View>
    );
  }

  const { values } = settings;
  const setVisibility = (key: keyof UsageSettings["visibility"], value: boolean) =>
    save({ ...values, visibility: { ...values.visibility, [key]: value } });
  const setPill = (key: keyof UsageSettings["pill"], value: boolean) =>
    save({ ...values, pill: { ...values.pill, [key]: value } });

  return (
    <View style={{ backgroundColor: theme.colors.surface0 }}>
      <SettingsSection title="Visibility">
        <SettingsCard>
          <SettingsSwitch label="Composer pill" value={values.visibility.composerPill} onValueChange={(value) => setVisibility("composerPill", value)} disabled={disabled} />
        </SettingsCard>
      </SettingsSection>
      <SettingsSection title="Pill">
        <SettingsCard>
          <SettingsSwitch label="Show remaining %" value={values.pill.showRemainingPercent} onValueChange={(value) => setPill("showRemainingPercent", value)} disabled={disabled} />
          <SettingsSwitch label="Show provider name" value={values.pill.showProviderName} onValueChange={(value) => setPill("showProviderName", value)} disabled={disabled} />
          <SettingsSwitch label="Show reset time" value={values.pill.showResetTime} onValueChange={(value) => setPill("showResetTime", value)} disabled={disabled} />
        </SettingsCard>
      </SettingsSection>
      {disabled ? <Text accessibilityLiveRegion="polite" style={{ color: theme.colors.foregroundMuted, fontSize: 12 }}>Saving settings…</Text> : null}
      {errorFeedback}
    </View>
  );
}
