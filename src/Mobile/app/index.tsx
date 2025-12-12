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

// Ajuste os caminhos abaixo conforme a estrutura real das suas pastas no VS Code
import BackgroundImage from "../assets/images/background.png"; 
import { useAuth } from '../shared/contexts/AuthContext';
import { AGMessageType, AGShowMessage } from '../shared/components/AGShowMessage';
import AGButton from '../shared/components/AGButton';

export default function HomeScreen() {
  // 1. CONEXÃO COM O CONTEXTO
  // Pegamos o estado global do usuário e a função de sair
  const { user, isLoading, signOut } = useAuth();

  // 2. LOADING INICIAL (Splash Screen)
  // Enquanto o AuthProvider verifica o AsyncStorage, mostramos isso
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Carregando sistema...</Text>
      </View>
    );
  }

  // 3. GUARDA DE ROTA (Auth Guard)
  // Se o usuário não existir (null), redireciona automaticamente para o login.
  if (!user) {
    return <Redirect href="/configuration/login" />;
  }

  // 4. FUNÇÃO DE LOGOUT
  const handleLogout = async () => {
    try {
      await signOut(); // Limpa o contexto e storage
      AGShowMessage("Você saiu com sucesso!", AGMessageType.success);
      // Não precisa navegar manualmente, o 'if (!user)' acima fará o redirect automaticamente
    } catch (error) {
      console.error("Erro ao sair", error);
    }
  };

  // 5. RENDERIZAÇÃO DA TELA LOGADA
  return (
    <>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={BackgroundImage}
        resizeMode="cover"
        style={styles.backgroundImage}
      >
        <View style={styles.container}>
          
          {/* CABEÇALHO DO USUÁRIO */}
          <View style={styles.header}>
            <Text style={styles.welcomeLabel}>Bem-vindo,</Text>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>

          {/* BOTÃO DE SAIR */}
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && { opacity: 0.8 }
            ]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </Pressable>

          {/* MENU PRINCIPAL DE BOTÕES */}
          <View style={styles.buttonsContainer}>
            <AGButton title="Atendimento" route="/atendimento" width={"100%"} />
            <AGButton title="Preferencial" route="/preferencial" width={"100%"} />
            <AGButton title="Retirada de Exames" route="/retirada-exames" width={"90%"} />
          </View>
        
        </View>
      </ImageBackground>
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