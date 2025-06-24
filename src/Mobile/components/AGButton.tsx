import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { TouchableHighlight, Text, StyleSheet } from "react-native";

export default function AGButton({ title, route }: { title: string; route: string }) {
  const [pressed, setPressed] = useState(false);
  const router = useRouter();

  const handlePressWithAnimation = () => {
    setPressed(true);

    setTimeout(() => {
      router.push(route);
      setPressed(false);
    }, 500); // 200ms de delay
  };

  return (
    <TouchableHighlight
      onPress={handlePressWithAnimation}
      style={[buttonStyles.buttonContainer, { width: "75%",  }]}
      underlayColor="transparent" // Desativa o efeito padrão do TouchableHighlight
    >
      <LinearGradient  colors={pressed ? ["#6830c0", "#f75f6c"] : ["rgba(74,73,76,.5)", "rgba(74,73,76,.5)"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={[buttonStyles.gradient, { paddingVertical: "12.5%" }]}>
        <Text style={[buttonStyles.buttonText, { fontSize: 44 }]}>{title}</Text>
      </LinearGradient>
    </TouchableHighlight>
  );
}

const buttonStyles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 20,
    margin: 15,
    
  },
  gradient: {
    paddingVertical: 38,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
});
