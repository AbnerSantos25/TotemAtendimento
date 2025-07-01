import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#222222",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}>
      <Stack.Screen name="/app/features/homeScreen/index.tsx" options={{ title: "Serviços", headerTitleAlign:"center" }} />
    </Stack>
  );
}
