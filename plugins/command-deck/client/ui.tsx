import type { PluginTheme } from "@getpaseo/plugin";
import { Modal, TextInput } from "@getpaseo/plugin/client/react-native";
import { Pressable, Text, View } from "react-native";
export function Action({ theme, label, onPress, disabled = false, primary = false, danger = false }: {
  theme: PluginTheme; label: string; onPress(): void; disabled?: boolean; primary?: boolean; danger?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled}
    onPress={onPress} style={({ pressed }) => ({ minHeight: 44, padding: 12, borderRadius: 8,
      opacity: disabled ? 0.5 : pressed ? 0.8 : 1, backgroundColor: primary ? theme.colors.accent : theme.colors.surface2 })}>
    <Text style={{ color: danger ? theme.colors.statusDanger : primary ? theme.colors.accentForeground : theme.colors.foreground, fontSize: 14 }}>{label}</Text>
  </Pressable>;
}
export function Field({ theme, label, value, onChange, disabled = false }: {
  theme: PluginTheme; label: string; value: string; onChange(value: string): void; disabled?: boolean;
}) {
  return <View style={{ gap: 8 }}><Text style={{ color: theme.colors.foreground, fontSize: 14 }}>{label}</Text>
    <TextInput accessibilityLabel={label} value={value} onChangeText={onChange} editable={!disabled}
      autoCapitalize="none" autoCorrect={false} style={{ minHeight: 44, padding: 12, borderRadius: 8,
        color: theme.colors.foreground, backgroundColor: theme.colors.surface2 }} />
  </View>;
}
export function Confirm({ theme, title, message, confirm, busy = false, confirmDisabled = false, onCancel, onConfirm }: {
  theme: PluginTheme; title: string; message: string; confirm: string; busy?: boolean; confirmDisabled?: boolean; onCancel(): void; onConfirm(): void;
}) {
  return <Modal title={title} open onOpenChange={open => { if (!open && !busy) onCancel(); }}>
    <Modal.Content style={{ backgroundColor: theme.colors.surface0 }}>
      <Text style={{ color: theme.colors.foreground, fontSize: 14 }}>{message}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Action theme={theme} label="Cancel" disabled={busy} onPress={onCancel} />
        <Action theme={theme} label={confirm} danger disabled={busy || confirmDisabled} onPress={onConfirm} />
      </View>
    </Modal.Content>
  </Modal>;
}
