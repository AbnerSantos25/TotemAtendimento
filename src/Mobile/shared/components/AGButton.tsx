import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  TouchableHighlight,
  Text,
  StyleSheet,
  DimensionValue,
} from "react-native";

interface AGButtonProps {
  title: string;
  route: string;
  width?: DimensionValue;
  height?: DimensionValue;
}

export default function AGButton({
  title,
  route,
  width = "90%",
  height,
}: AGButtonProps) {
  const [pressed, setPressed] = useState(false);
  const router = useRouter();

  const handlePressWithAnimation = () => {
    setPressed(true);
    setTimeout(() => {
      router.push(route);
      setPressed(false);
    }, 500);
  };

  return (
    <TouchableHighlight
      onPress={handlePressWithAnimation}
      style={[buttonStyles.buttonContainer, { width }]} // ✅ agora o tipo é aceito
      underlayColor="transparent"
    >
      <LinearGradient
        colors={
          pressed
            ? ["#6830c0", "#f75f6c"]
            : ["rgba(74,73,76,.5)", "rgba(74,73,76,.5)"]
        }
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[buttonStyles.gradient, { height }]}
      >
        <Text style={buttonStyles.buttonText}>{title}</Text>
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
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 44,
    fontWeight: "bold",
    textAlign: "center",
    padding: 15,
  },
});
