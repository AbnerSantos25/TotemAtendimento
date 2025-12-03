import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { UserRequest } from "./models/UserModels";
import { BaseService } from "../../shared/services/baseService";
import { SessionService } from "../../shared/services/sessionServices";
import { AuthData, Status } from "../../shared/models/baseServiceModels";
import TemporaryComponent from "./temporaryComponent";
import { RootSiblingParent } from 'react-native-root-siblings';
import { AGMessageType, AGShowMessage } from "../../shared/components/AGShowMessage";
import { Redirect } from "expo-router";
import AGButton from "../../shared/components/AGButton";

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

       AGShowMessage("Login feito com sucesso!", AGMessageType.success);
       console.log("Success - ResponseData", response.data);

      setStatus(Status.loggedIn.toString())

    } else {
       AGShowMessage(response.error.message, AGMessageType.error);
       console.log(response.error.message);
    }
  };
  
  return (
    <RootSiblingParent>
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
        {/* botao para redirecionar para a tela de configuracoes */}
        <AGButton title="Configurações" route="/configuration/configuracoes" />
      </View>
    </RootSiblingParent>
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
