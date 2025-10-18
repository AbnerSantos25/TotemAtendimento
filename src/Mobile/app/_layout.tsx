// app/_layout.tsx
import { Stack } from 'expo-router';
// Importe o componente que você acabou de criar (ajuste o caminho se necessário)

// Não precisamos mais do useRouter aqui!
// import { useRouter } from 'expo-router'; // <== REMOVER OU COMENTAR
import { Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import HeaderConfigButton from '../shared/components/HeaderConfigButton';

export default function RootLayout() {
  // const router = useRouter(); // <== REMOVER OU COMENTAR

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
      <Stack.Screen name="preferencial" options={{ title: 'Preferencial' }} />
      <Stack.Screen name="retirada-exames" options={{ title: 'Retirada de Exames' }} />
      <Stack.Screen name="configuration/configuracoes" options={{ title: 'Configurações', presentation: 'modal'}}/>
    </Stack>
  );
}