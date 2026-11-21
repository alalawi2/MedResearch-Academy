import React from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { useStore } from "./store";
export const C = {
  bg: "#F8F8FA",
  ink: "#20232B",
  muted: "#646873",
  teal: "#6955DF",
  lime: "#F66B4E",
  line: "#E7E7ED",
  white: "#FFFFFF",
  pale: "#F0EDFC",
  amber: "#78501C",
  amberBg: "#FFF3DD",
};
export function Copy({
  children,
  kind = "body",
  style,
  ...props
}: React.ComponentProps<typeof Text> & {
  kind?: "title" | "heading" | "body" | "small" | "label";
}) {
  const { scale } = useStore();
  const sizes = { title: 34, heading: 22, body: 17, small: 14, label: 14 };
  const extra = StyleSheet.flatten(style) || {};
  const finalSize =
    typeof extra.fontSize === "number" ? extra.fontSize : sizes[kind];
  return (
    <Text
      {...props}
      style={[
        {
          fontSize: finalSize * scale,
          lineHeight:
            (typeof extra.lineHeight === "number"
              ? extra.lineHeight
              : finalSize * (kind === "title" ? 1.16 : 1.5)) * scale,
          color: C.ink,
          fontFamily:
            kind === "title"
              ? "Manrope_800ExtraBold"
              : kind === "heading" || kind === "label"
                ? "Manrope_700Bold"
                : "Manrope_400Regular",
          fontWeight:
            kind === "title" || kind === "heading"
              ? "600"
              : kind === "label"
                ? "600"
                : "400",
          letterSpacing: kind === "title" ? -1 : 0,
        },
        style,
        {
          fontSize: finalSize * scale,
          lineHeight:
            (typeof extra.lineHeight === "number"
              ? extra.lineHeight
              : finalSize * (kind === "title" ? 1.16 : 1.5)) * scale,
        },
      ]}
    >
      {children}
    </Text>
  );
}
export function Icon({
  name,
  size = 22,
  color = C.teal,
}: {
  name: React.ComponentProps<typeof Feather>["name"];
  size?: number;
  color?: string;
}) {
  return (
    <Feather
      aria-hidden={true}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      name={name}
      size={size}
      color={color}
    />
  );
}
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Feather>["name"];
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        S.button,
        secondary ? S.secondary : { backgroundColor: C.teal },
        disabled && { opacity: 0.45 },
        pressed && { opacity: 0.8 },
      ]}
    >
      {icon && <Icon name={icon} color={secondary ? C.teal : C.white} />}
      <Copy
        style={{
          color: secondary ? C.teal : C.white,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {label}
      </Copy>
    </Pressable>
  );
}
export function Page({
  children,
  title,
  back = false,
  right,
}: {
  children: React.ReactNode;
  title?: string;
  back?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: C.bg }}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={S.scroll}
        >
          <View style={S.content}>
            {(title || back) && (
              <View style={S.top}>
                {back && (
                  <Pressable
                    onPress={() =>
                      router.canGoBack() ? router.back() : router.replace("/")
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    style={S.iconButton}
                  >
                    <Icon name="chevron-left" />
                  </Pressable>
                )}
                <Copy kind="label" style={{ flex: 1 }}>
                  {title}
                </Copy>
                {right}
              </View>
            )}
            {children}
            <View style={{ height: 24 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.ComponentProps<typeof View>["style"];
}) {
  return <View style={[S.card, style]}>{children}</View>;
}
export function Field({
  label,
  value,
  onChange,
  number = false,
  hint,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  number?: boolean;
  hint?: string;
  maxLength?: number;
}) {
  return (
    <View style={{ gap: 7 }}>
      <Copy kind="label">{label}</Copy>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        keyboardType={number ? "decimal-pad" : "default"}
        maxLength={maxLength ?? (number ? 12 : 100)}
        style={S.input}
        placeholderTextColor={C.muted}
      />
      {hint && (
        <Copy kind="small" style={{ color: C.muted }}>
          {hint}
        </Copy>
      )}
    </View>
  );
}
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: C.amberBg,
        padding: 16,
        borderRadius: 16,
        gap: 6,
      }}
    >
      <Copy kind="small" style={{ color: C.amber }}>
        {children}
      </Copy>
    </View>
  );
}
export const S = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  content: { width: "100%", maxWidth: 620, alignSelf: "center", gap: 22 },
  top: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 52 },
  iconButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: C.line,
    gap: 14,
  },
  button: {
    minHeight: 58,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  secondary: { backgroundColor: C.white, borderWidth: 1, borderColor: C.line },
  input: {
    fontSize: 18,
    color: C.ink,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    padding: 16,
    minHeight: 56,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  eyebrow: {
    color: C.muted,
    letterSpacing: 1.5,
    fontSize: 12,
    fontWeight: "700",
  },
  choice: {
    padding: 20,
    minHeight: 68,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 18,
    backgroundColor: C.white,
    gap: 5,
  },
  chosen: { borderColor: C.teal, backgroundColor: C.pale, borderWidth: 2 },
  divider: { height: 1, backgroundColor: C.line },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: C.pale,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
});
