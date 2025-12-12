import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Pressable, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient"; // Assumindo que queres o mesmo fundo

import { UserRequest } from "./models/UserModels";
import { AGMessageType, AGShowMessage } from "../../shared/components/AGShowMessage";
import { useAuth } from '../../shared/contexts/AuthContext';
import { AuthData } from "../../shared/models/baseServiceModels";
import { BaseService } from "../../shared/services/baseService";

// Imports dos teus serviços e componentes

export default function LoginScreen() {
  const { signIn } = useAuth(); // Pegamos a função de login global
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loginRequest, setLoginRequest] = useState<UserRequest>({
    FullName: "",
    email: "",
    password: "",
  });

  const handleInputChange = (field: keyof UserRequest, value: string) => {
    setLoginRequest({ ...loginRequest, [field]: value });
  };

  const handleLogin = async () => {
    // Validação básica
    if (!loginRequest.email || !loginRequest.password) {
      AGShowMessage("Por favor, preencha todos os campos.", AGMessageType.error);
      return;
    }
    setIsLoading(true);

    try {
      // 1. Faz a requisição na API
      // Nota: Ajusta o endpoint se necessário ("/totem/identity/login")
      const response = await BaseService.PostAsync<AuthData, UserRequest>(
        "/totem/identity/login", 
        loginRequest
      );

      if (response.success) {
        // 2. SUCESSO NA API -> Atualiza o Contexto
        // Isso salva no storage e atualiza o estado global 'user'
        await signIn(response.data);        
        AGShowMessage("Bem-vindo de volta!", AGMessageType.success);

        // 3. Redirecionamento
        // Se viemos de algum lugar, voltamos. Senão, vamos para a Home.
        GobackHome();

      } else {
        // Erro da API (ex: senha errada)
        AGShowMessage(response.error.message, AGMessageType.error);
      }
    } catch (error) {
      console.error("Erro no login:", error);
      AGShowMessage("Ocorreu um erro inesperado. Tente novamente.", AGMessageType.error);
    } finally {
      setIsLoading(false);
    }
  };

  const GobackHome = () => {
     if (router.canGoBack()) {
      console.log("Voltando para a tela anterior");
        router.back();
      } else {
        router.replace('/');
      }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#121212', '#2a1a4a', '#4a1a2a']}
          style={StyleSheet.absoluteFill}
        />

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Acesso ao Sistema</Text>
            <Text style={styles.subtitle}>Entre com as suas credenciais</Text>

            {/* Campo E-mail */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput 
                value={loginRequest.email}
                onChangeText={(txt) => handleInputChange("email", txt)}
                style={styles.input}
                placeholder="exemplo@email.com"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Campo Senha */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <TextInput 
                value={loginRequest.password}
                onChangeText={(txt) => handleInputChange("password", txt)}
                style={styles.input}
                placeholder="********"
                placeholderTextColor="#666"
                secureTextEntry
              />
            </View>

            {/* Botão de Entrar */}
            <Pressable 
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </Pressable>

            {/* Botão Voltar (Opcional) */}
            <Pressable onPress={() => GobackHome()} style={styles.backButton}>
              <Text style={styles.backButtonText}>Voltar</Text>
            </Pressable>

          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '85%',
    maxWidth: 400,
    padding: 24,
    backgroundColor: 'rgba(30, 30, 30, 0.9)', // Fundo semi-transparente
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#DDD',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  button: {
    backgroundColor: '#6830c0', // Cor primária (Roxo)
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: "#6830c0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#AAA',
    fontSize: 14,
  }
});