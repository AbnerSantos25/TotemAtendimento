// Exemplo: src/shared/components/HeaderConfigButton.tsx
import { Pressable } from 'react-native';
// import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // CHAVE: Usa o hook aqui!

export default function HeaderConfigButton() {
  const router = useRouter(); // O hook é chamado dentro de um componente de função

  return (
    <Pressable
      onPress={() => router.push('/configuration/configuracoes')}
      style={{ marginRight: 15 }}
    >
      {/* <FontAwesome
        name="cog"
        size={25}
        color="lightgray"
      /> */}
    </Pressable>
  );
}