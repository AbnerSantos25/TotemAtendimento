import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { UserRequest, UserView } from "./models/UserModels";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

    try {
      const response = await fetch("http://10.0.2.2:50633/api/totem/identity/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginRequest),
      });

      if (!response.ok) {
        const errorBody = await response.text();

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("Sucesso! Dados recebidos:", data);

      await AsyncStorage.setItem("jwt", data.data.jwt);
      await AsyncStorage.setItem("newToken", data.data.newToken);

      AsyncStorage.getAllKeys().then((keys) => {
        console.log("Chaves armazenadas no AsyncStorage:", keys);
      });
      
    } catch (error) {
      console.error("Falha na requisição fetch:", error);
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
