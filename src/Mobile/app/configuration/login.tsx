import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { UserRequest, UserView } from "./models/UserModels";
import { BaseService } from "../../shared/services/baseService";
import { SessionService } from "../../shared/services/sessionServices";
import { AuthData, Status } from "../../shared/services/models/baseServiceModels";
import TemporaryComponent from "./temporaryComponent";

export default function ConfigurationsScreen() {
  const [loginRequest, setLoginRequest] = useState<UserRequest>({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState<string | null>(null);

  const handleInputChange = (field: keyof UserRequest, value: string) => {
    setLoginRequest({ ...loginRequest, [field]: value });
  };

  useEffect(() => {
    async () => {
      const storedStatus = await SessionService.getJwtTokenAsync();
      setStatus(storedStatus);
    }
  }, [10])

  const handleLogin = async () => {
    console.log("Tentando fazer login com:", loginRequest);
    const response = await BaseService.PostAsync<AuthData, UserRequest>("/totem/identity/login", loginRequest);

    if (response.success) {
      await SessionService.saveAuthDataAsync(response.data);

      Alert.alert("Logado com sucesso")

      setStatus(Status.loggedIn.toString())

      await AsyncStorage.setItem("jwt", response.data.jwt);
      await AsyncStorage.setItem("newToken", response.data.newToken);
    } else {
      console.error("Falha na requisição:", response.error.message);
      Alert.alert("Erro no Login", response.error.message);
    }
  };
  return (
    <View style={{ width: "50%", flex: 1, alignSelf: "center", justifyContent: "center", gap: 30 }}>
      <View >
      <Text style={formStyles.label}>E-mail:</Text>
      <TextInput value={loginRequest.email} onChangeText={(txt) => handleInputChange("email", txt)} style={formStyles.input} />
      <Text style={formStyles.label}>Senha:</Text>
      <TextInput value={loginRequest.password} onChangeText={(txt) => handleInputChange("password", txt)} style={formStyles.input} secureTextEntry />
      <Button title="Entrar" onPress={handleLogin} />
    </View>
      <View style={{ borderWidth: 1, display: "flex", alignSelf: "center", width: 400 }}>
        <Text style={{ textAlign: 'center', fontSize: 25 }}>Situação Login:</Text>
        {
          status == Status.loggedIn.toString()
            ? <Text style={{ fontSize: 28, textAlign: 'center', color: 'green' }}>Logado</Text>
            : <Text style={{ fontSize: 28, textAlign: 'center', color: 'red' }}>Não Logado!!!</Text>
        }
      </View>
      <TemporaryComponent/>
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
