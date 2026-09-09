import type { PluginTheme } from "@getpaseo/plugin";
import { Pressable, Text } from "react-native";
export function Action({ theme, label, accessibilityLabel = label, onPress, disabled = false, primary = false }: {
  theme: PluginTheme; label: string; accessibilityLabel?: string; onPress(): void; disabled?: boolean; primary?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel}
    accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={{ minHeight: 44, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8,
      opacity: disabled ? 0.5 : 1, backgroundColor: primary ? theme.colors.accent : theme.colors.surface0 }}>
    <Text style={{ color: primary ? theme.colors.accentForeground : theme.colors.foreground, fontSize: 14 }}>{label}</Text>
  </Pressable>;
}
