import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{
        headerStyle: {
          backgroundColor: "#222222",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}>
        
      <Stack.Screen name="index" options={{ title: "Teste", headerTitleAlign:"center" }} />
      <Stack.Screen name="features/login" options={{ title: "Login", headerTitleAlign:"center" }} />
      <Stack.Screen name="features/configurations" options={{ title: "Configurações", headerTitleAlign:"center" }} />
    </Stack>
  );
}
