import { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { UserRequest } from "./models/UserModels";
import { SessionService } from "../../shared/services/sessionServices";
import { RootSiblingParent } from 'react-native-root-siblings';
import { AGMessageType, AGShowMessage } from "../../shared/components/AGShowMessage";
import { LoginServices } from "./services/loginService";
import { FormStyles } from "../../shared/styles/mainStyles";

export default function ConfigurationsScreen() {
  const [loginRequest, setLoginRequest] = useState<UserRequest>({
    email: "",
    password: "",
  });

  const handleInputChange = (field: keyof UserRequest, value: string) => {
    setLoginRequest({ ...loginRequest, [field]: value });
  };

  const handleLogin = async () => {

    const response = await LoginServices.TryLoginAsync(loginRequest);

    if (response.success) {
      await SessionService.saveAuthDataAsync(response.data);
      AGShowMessage("Login feito com sucesso!", AGMessageType.success);

    } else {
      AGShowMessage(response.error.message, AGMessageType.error);
    }
  };

  return (
    <RootSiblingParent>
      <View style={styles.mainContainerSolidFallback}>
        <View style={styles.contentCenter}>
          <View style={styles.cardContainer}>
            <View style={formStyles.inputGroup}>
              <Text style={formStyles.label}>Login:</Text>
              <TextInput
                value={loginRequest.email}
                onChangeText={(txt) => handleInputChange("email", txt)}
                style={formStyles.input}
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={formStyles.inputGroup}>
              <Text style={formStyles.label}>Senha:</Text>
              <TextInput
                value={loginRequest.password}
                onChangeText={(txt) => handleInputChange("password", txt)}
                style={formStyles.input}
                secureTextEntry
                placeholderTextColor="#888"
              />
            </View>

            <TouchableOpacity style={formStyles.primaryButtonContainer} onPress={handleLogin}>
              <Text style={formStyles.primaryButtonText}>Entrar</Text>
            </TouchableOpacity>

          </View>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Acesso apenas para administradores.</Text>
        </View>
      </View>
    </RootSiblingParent>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  mainContainerSolidFallback: {
    flex: 1,
    backgroundColor: '#120d1c',
  },
  contentCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  cardContainer: {
    width: '60%',
    backgroundColor: 'rgba(60, 60, 60, 0.5)',
    borderRadius: 30,
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  footerContainer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: 'white',
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.8,
  },
});

const formStyles = FormStyles();
