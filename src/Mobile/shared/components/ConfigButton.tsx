// src/shared/components/ConfigButton.tsx
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Importa o hook de navegação

export default function ConfigButton() {
  const router = useRouter(); // Instancia o hook para poder navegar

  return (
    <Pressable
      onPress={() => {
        // Usa o router para navegar para a tela de configurações.
        // O caminho pode ser "/features/configurations" ou algo similar.
        // Se a navegação já estiver no contexto de "configurations", você pode usar `router.push("/")`
        // Ou o caminho completo, se o botão estiver em outra tela.
        router.push("/features/configurations");
      }}
      style={{ marginRight: 15 }} // Estilo para dar um espaçamento
    >
      <Ionicons name="settings-outline" size={24} color="black" />
    </Pressable>
  );
}