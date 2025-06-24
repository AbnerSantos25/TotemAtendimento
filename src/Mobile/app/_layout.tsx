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
      <Stack.Screen name="index" options={{ title: "Serviços", headerTitleAlign:"center" }} />
      <Stack.Screen name="details" options={{ title: "Detalhes" }} />
    </Stack>
  );
}
