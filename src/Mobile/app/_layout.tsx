import { Stack } from 'expo-router';
import HeaderConfigButton from '../shared/components/HeaderConfigButton';
import { AuthProvider } from '../shared/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
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
        <Stack.Screen name="/configuration/login" options={{ title: 'Login' }} />
        <Stack.Screen name="preferencial" options={{ title: 'Preferencial' }} />
        <Stack.Screen name="retirada-exames" options={{ title: 'Retirada de Exames' }} />
        <Stack.Screen name="/configuration/configurationPage/configuration" options={{ title: 'Configurações', presentation: 'modal'}}/>
      </Stack>
    </AuthProvider>
  );
}