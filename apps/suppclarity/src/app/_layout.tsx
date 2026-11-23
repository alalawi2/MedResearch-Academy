import {
  useFonts,
  Manrope_400Regular,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Store } from "../store";
import { MeasurementProvider } from "../ad-measurement";
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
        <MeasurementProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
        </MeasurementProvider>
      </Store>
    </SafeAreaProvider>
  );
}
