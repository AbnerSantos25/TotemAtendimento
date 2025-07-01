import { StyleSheet, ImageBackground } from "react-native";
import AGButton from "../../../shared/components/AGButton";
import BackgroundImage from "../assets/images/background.png";

export default function HomeScreen() {
  return (
    <ImageBackground
      source={BackgroundImage}
      resizeMode="cover"
      style={estiloTests.backgroundImage}
    >
      <AGButton title="Atendimento" route="" />
      <AGButton title="Preferencial" route="" />
      <AGButton title="Retirada de Exames" route="" />
    </ImageBackground>
  );
}
const estiloTests = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
});
