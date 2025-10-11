import { Stack, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// Este arquivo define a navegação em pilha para o seu aplicativo.
export default function RootLayout() {
  const router = useRouter();

  return (
    <Stack screenOptions={{
        headerStyle: {
          backgroundColor: '#121212',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center'
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Início',
          headerRight: () => (
            <Pressable onPress={() => router.push('/configuration/configuracoes')}>
              <FontAwesome 
                name="cog" 
                size={25} 
                color="lightgray" 
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="atendimento" options={{ title: 'Atendimento' }} />
      <Stack.Screen name="preferencial" options={{ title: 'Preferencial' }} />
      <Stack.Screen name="retirada-exames" options={{ title: 'Retirada de Exames' }} />
      <Stack.Screen name="configuration/configuracoes" options={{ title: 'Configurações', presentation: 'modal'}}/>
    </Stack>
  );
}