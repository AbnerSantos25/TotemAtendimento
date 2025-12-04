import { Stack } from 'expo-router';
import HeaderConfigButton from '../shared/components/HeaderConfigButton';

export default function RootLayout() {
  return (
    <Stack screenOptions={{
        headerStyle: { backgroundColor: '#121212' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerTitleAlign: 'center'
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Início',
          headerRight: () => <HeaderConfigButton />,
        }}
      />
      <Stack.Screen name="atendimento" options={{ title: 'Atendimento' }} />
      {/* <Stack.Screen name="login" options={{ title: 'Login', headerRight: () => <HeaderConfigButton /> }} /> */}
      <Stack.Screen name="preferencial" options={{ title: 'Preferencial' }} />
      <Stack.Screen name="retirada-exames" options={{ title: 'Retirada de Exames' }} />
      <Stack.Screen name="/configuration/configurationPage/configuration" options={{ title: 'Configurações', presentation: 'modal'}}/>
    </Stack>
  );
}