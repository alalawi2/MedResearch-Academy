import {
  useFonts,
  Manrope_400Regular,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { ActivityIndicator, View, Pressable } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Store } from "../store";
import { MembershipProvider, useMembership } from "../membership";
import { ReminderSync } from "../reminder-sync";
import { plusPreview } from "../plus-preview";
import { Copy } from "../ui";
function PreviewBanner() {
  const { setPreview } = useMembership();
  if (!plusPreview || !setPreview) return null;
  return <View style={{ padding: 8, backgroundColor: "#FFF3DD" }}><Copy kind="small">Design preview · sample entries · purchases disabled</Copy><View style={{ flexDirection: "row", gap: 20 }}><Pressable accessibilityRole="button" onPress={() => setPreview(false)} style={{ paddingVertical: 8 }}><Copy kind="small">Preview Free</Copy></Pressable><Pressable accessibilityRole="button" onPress={() => setPreview(true)} style={{ paddingVertical: 8 }}><Copy kind="small">Preview Plus</Copy></Pressable></View></View>;
}
export default function Root() {
  const [loaded, error] = useFonts({
    Manrope_400Regular,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  if (!loaded && !error)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8F8FA",
        }}
      >
        <ActivityIndicator
          color="#6955DF"
          accessibilityLabel="Loading SuppClarity"
        />
      </View>
    );
  return (
    <SafeAreaProvider>
      <Store>
        <MembershipProvider>
          <PreviewBanner />
          <ReminderSync />
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </MembershipProvider>
      </Store>
    </SafeAreaProvider>
  );
}
