import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { AuthData, UserRequest, UserView } from "./models/UserModels";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BaseService } from "../../shared/services/baseService";

export default function ConfigurationsScreen() {
  const [loginRequest, setLoginRequest] = useState<UserRequest>({
    email: "",
    password: "",
  });

  const handleInputChange = (field: keyof UserRequest, value: string) => {
    setLoginRequest({ ...loginRequest, [field]: value });
  };

  const handleLogin = async () => {
    console.log("Tentando fazer login com:", loginRequest);
    // Muito estranho.. preciso usar esse IP para funcionar: '10.0.2.2' (se for testar pelo emulador.)
    // pelo que me lembro, usava o ip da minha máquina quando testava... E no final passei a API pro servidor... enfim.

    /*
      "email": "user@example.com"
      "password": "Teste@123" 
    */

    // Próximos passos:
    // instalar o dotEnv
    // pensar em como criar services para essas requisições.
    // pensar em o que fazer com o token que recebo de volta.

    const response = await BaseService.PostAsync<AuthData, UserRequest>("/totem/identity/login", loginRequest);

    if (response.success) {
      console.log("ResponseData", response.data);

      await AsyncStorage.setItem("jwt", response.data.jwt);
      await AsyncStorage.setItem("newToken", response.data.newToken);
    } else {
      // console.error("Falha na requisição:", response.error.message);
      Alert.alert("Erro no Login", response.error.message);
    }
  };
  return (
    <View style={{ width: "50%", flex: 1, alignSelf: "center", justifyContent: "center" }}>
      <Text style={formStyles.label}>E-mail:</Text>
      <TextInput value={loginRequest.email} onChangeText={(txt) => handleInputChange("email", txt)} style={formStyles.input} />
      <Text style={formStyles.label}>Senha:</Text>
      <TextInput value={loginRequest.password} onChangeText={(txt) => handleInputChange("password", txt)} style={formStyles.input} secureTextEntry />
      <Button title="Entrar" onPress={handleLogin} />
    </View>
  );
}

const formStyles = StyleSheet.create({
  label: { fontSize: 22 },
  input: {
    borderWidth: 1,
    borderColor: "rgb(0,0,0)",
    fontSize: 20,
  },
});
