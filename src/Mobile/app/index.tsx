// Arquivo: app/index.tsx
import { StyleSheet, ImageBackground, View } from "react-native";
// A DEFINIÇÃO do seu componente é importada daqui (como sugeri na estrutura)
import BackgroundImage from "../assets/images/background.png";
import AGHomeButton from "../shared/components/AGHomeButton";

export default function InitialScreen() {
  return (
    <ImageBackground
      source={BackgroundImage}
      resizeMode="cover"
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <AGHomeButton title="Atendimento" route="/atendimento" />
        <AGHomeButton title="Preferencial" route="/preferencial" />
        <AGHomeButton title="Retirada de Exames" route="/retirada-exames" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
});
