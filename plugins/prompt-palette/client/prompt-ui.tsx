import type { PluginTheme } from "@getpaseo/plugin";
import { Icon } from "@getpaseo/plugin/client/react-native";
import { Pressable, Text, View } from "react-native";
import type { Prompt } from "../shared/prompt-settings";
export function Action({ theme, label, accessibilityLabel = label, onPress, disabled = false, primary = false, secondary = false }: {
  theme: PluginTheme; label: string; accessibilityLabel?: string; onPress(): void; disabled?: boolean; primary?: boolean; secondary?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel}
    accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8,
      opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
      backgroundColor: primary ? theme.colors.accent : secondary ? theme.colors.surface2 : theme.colors.surface0 })}>
    <Text style={{ color: primary ? theme.colors.accentForeground : theme.colors.foreground, fontSize: 14 }}>{label}</Text>
  </Pressable>;
}

export function PromptRow({ theme, prompt, disabled, onPress }: {
  theme: PluginTheme; prompt: Prompt; disabled: boolean; onPress(): void;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={prompt.name}
    accessibilityHint="Review the full prompt before sending"
    accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => ({ minHeight: 44, padding: 12, flexDirection: "row", alignItems: "center", gap: 12,
      opacity: disabled ? 0.5 : 1, backgroundColor: pressed ? theme.colors.surface2 : theme.colors.surface1 })}>
    <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
      <Text numberOfLines={2} style={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 20 }}>{prompt.name}</Text>
      <Text numberOfLines={2} style={{ color: theme.colors.foregroundMuted, fontSize: 12, lineHeight: 18 }}>
        {prompt.description || prompt.body}
      </Text>
    </View>
    <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Icon name="ChevronRight" size={16} color={theme.colors.foregroundMuted} />
    </View>
  </Pressable>;
}
