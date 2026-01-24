import React from 'react';
import { 
  StyleSheet, 
  ImageBackground, 
  View, 
  Text, 
  Pressable, 
  ActivityIndicator,
  StatusBar
} from "react-native";
import { Redirect } from "expo-router";

import BackgroundImage from "../assets/images/background.png"; 
import { useAuth } from '../shared/contexts/AuthContext';
import { AGMessageType, AGShowMessage } from '../shared/components/AGShowMessage';
import AGButton from '../shared/components/AGButton';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const { user, isLoading, signOut } = useAuth();
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Carregando sistema...</Text>
      </View>
    );
  }


  if (!user) {
    return <Redirect href="/configuration/login" />;
  }

  const handleLogout = async () => {
    try {
      await signOut(); 
        AGShowMessage("Você saiu com sucesso!", AGMessageType.success);
    } catch (error) {
        AGShowMessage("Erro ao Sair!", AGMessageType.success);
    }
  };

  /**
  * 5. RENDERIZAÇÃO DA TELA LOGADA 
  */ 
  return (
    <>
      <LinearGradient
        colors={['#000000', '#121018','#2a1a4a', '#4a1a2a']}
        style={StyleSheet.absoluteFill}
      />

      <StatusBar barStyle="light-content" />
        <View style={styles.container}>
          <View style={styles.buttonsContainer}>
            <AGButton title="Atendimento" route="/atendimento" width={"100%"} />
            <AGButton title="Preferencial" route="/preferencial" width={"100%"} />
            <AGButton title="Retirada de Exames" route="/retirada-exames" width={"90%"} />
          </View>
        
        </View>
    </>
  );
}

const styles = StyleSheet.create({
  // Estilos de Loading
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#121212'
  },
  loadingText: {
    color: 'white', 
    marginTop: 10,
    fontSize: 16
  },

  // Estilos Principais
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    width: '100%',
    gap: 16,
  },

  // Header
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  welcomeLabel: {
    color: '#CCC',
    fontSize: 16,
  },
  userName: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 4,
  },
  userEmail: {
    color: '#AAA',
    fontSize: 14,
  },

  // Logout
  logoutButton: {
    backgroundColor: "rgba(211, 47, 47, 0.2)", // Vermelho translúcido
    borderWidth: 1,
    borderColor: "#d32f2f",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginBottom: 30,
  },
  logoutText: {
    color: "#ff8a80",
    fontWeight: "600",
    fontSize: 14,
  },

  // Botões do Menu
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  }
});