import { useStore } from "../../store";
import { Tabs } from "expo-router";
import { Icon, C } from "../../ui";
export default function TabLayout() {
  const { scale } = useStore();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.teal,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: {
          backgroundColor: C.bg,
          borderTopColor: C.line,
          minHeight: 76 * scale,
          paddingTop: 10,
          paddingBottom: 12,
        },
        tabBarLabelStyle: { fontSize: 14 * scale, marginTop: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Guidance",
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
          tabBarIcon: ({ color }) => (
            <Icon
              name="layers"
              color={typeof color === "string" ? color : C.teal}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
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
