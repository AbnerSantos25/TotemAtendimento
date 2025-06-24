import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function DetailsScreen() {
  const router = useRouter(); // Hook para navegação programática

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Página de Detalhes</Text>

      {/* Botão para voltar para a página anterior (equivalente a goBack()) */}
      <Button
        title="Voltar para Home"
        onPress={() => router.back()} // Ou router.replace('/') se quiser ir diretamente para a Home
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
});