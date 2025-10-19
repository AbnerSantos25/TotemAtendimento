import { StyleSheet, ImageBackground, View } from "react-native";
import BackgroundImage from "../assets/images/background.png";
import AGButton from "../shared/components/AGButton";

export default function HomeScreen() {
  return (
    <ImageBackground
      source={BackgroundImage}
      resizeMode="cover"
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <AGButton title="Atendimento" route="/atendimento"  width={"100%"}/>
        <AGButton title="Preferencial" route="/preferencial"  width={"100%"}/>
        <AGButton title="Retirada de Exames" route="/retirada-exames" width={"90%"} />
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
