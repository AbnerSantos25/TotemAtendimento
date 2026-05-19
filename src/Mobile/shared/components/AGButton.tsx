import React, { useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  DimensionValue,
  Animated,
  View,
} from "react-native";

interface AGButtonProps {
  title: string;
  route?: string;
  width?: DimensionValue;
  height?: DimensionValue;
  color?: string;
  onPress?: () => void;
}

export default function AGButton({
  title,
  route,
  width = "90%",
  height,
  color,
  onPress,
}: AGButtonProps) {
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
        bounciness: 4,
      }),
      Animated.timing(opacity, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 6,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    animateOut();
    if (onPress) {
      onPress();
    } else if (route) {
      router.push(route);
    }
  };

  // Cor de acento: usa a cor do menu ou um roxo padrão
  const accentColor = color ?? "#7c3aed";
  const accentLight = color ?? "#a78bfa";

  return (
    <Animated.View style={[{ width }, { transform: [{ scale }], opacity }]}>
      {/* Borda com gradiente via layer sobreposto */}
      <LinearGradient
        colors={[accentLight, accentColor, "#ffffffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.borderGradient}
      >
        <TouchableOpacity
          onPressIn={animateIn}
          onPressOut={animateOut}
          onPress={handlePress}
          activeOpacity={1}
          style={styles.touchable}
        >
          {/* Fundo glassmorphism */}
          <View style={styles.glass}>
            <Text style={styles.buttonText} numberOfLines={2}>{title}</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  borderGradient: {
    borderRadius: 20,
    padding: 1.5,          // espessura da borda gradiente
    marginVertical: 8,
    marginHorizontal: 4,
    // Sombra colorida
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  touchable: {
    borderRadius: 19,
    overflow: "hidden",
  },
  glass: {
    backgroundColor: "rgba(20, 12, 40, 0.72)",
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 22,
    paddingHorizontal: 20,
    // Reflexo sutil no topo
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.16)",
  },
  buttonText: {
    color: "#f0e6ff",
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
    textShadowColor: "rgba(167, 139, 250, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
});
