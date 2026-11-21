import { useStore } from "../../store";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, C } from "../../ui";
export default function TabLayout() {
  const { scale } = useStore();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.teal,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: {
          backgroundColor: C.bg,
          borderTopColor: C.line,
          height: 64 * scale + bottom,
          paddingTop: 8,
          paddingBottom: bottom,
        },
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 14 * scale, marginTop: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Guidance",
          tabBarButtonTestID: "tab-guidance",
          tabBarIcon: ({ color }) => (
            <Icon
              name="sun"
              color={typeof color === "string" ? color : C.teal}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarButtonTestID: "tab-products",
          tabBarIcon: ({ color }) => (
            <Icon
              name="layers"
              color={typeof color === "string" ? color : C.teal}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ask"
        options={{
          title: "Ask",
          tabBarButtonTestID: "tab-ask",
          tabBarIcon: ({ color }) => (
            <Icon
              name="message-circle"
              color={typeof color === "string" ? color : C.teal}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarButtonTestID: "tab-account",
          tabBarIcon: ({ color }) => (
            <Icon
              name="user"
              color={typeof color === "string" ? color : C.teal}
            />
          ),
        }}
      />
    </Tabs>
  );
}
