import { StyleSheet, Text, View } from "react-native";
import AGButton from "../../shared/components/AGButton";

export default function configuration() {
  return (
      <View>
        <AGButton title="Temas" subtitle="Escalas de Cores" route="/configuration/configuracoes" icon="Home" size={24}/>
      </View>
  );
}