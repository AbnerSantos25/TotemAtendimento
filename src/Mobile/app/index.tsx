import { Link, useRouter } from "expo-router";
import { View, Text, StyleSheet, Button, TouchableOpacity, ImageBackground } from "react-native";
import styles from "../assets/styles/test"; // Importando o arquivo de estilos
import { LinearGradient } from "expo-linear-gradient";
import AGButton from "../components/AGButton";
import BackgroundImage from "../assets/images/background.png";

export default function HomeScreen() {
  return (
    <ImageBackground
      source={BackgroundImage}
      resizeMode="cover" // "cover" ou "stretch" costumam ser melhores para fundos de tela inteira
      style={estiloTests.backgroundImage} // Aplique um estilo para que ele ocupe todo o espaço
    >
      <AGButton title="Atendimento" route="" />
      <AGButton title="Preferencial" route="" />
      <AGButton title="Retirada de Exames" route="" />
    </ImageBackground>
  );
}
const estiloTests = StyleSheet.create({
  container: {
    flex: 1, // Essencial para que o container principal ocupe a tela toda
  },
  backgroundImage: {
    flex: 1, // Faz a imagem de fundo ocupar todo o espaço do container pai
    justifyContent: "center", // Centraliza os botões verticalmente (opcional)
    alignItems: "center", // Centraliza os botões horizontalmente (opcional)
    gap: 16, // Adiciona um espaço entre os botões (opcional)
  },
});
