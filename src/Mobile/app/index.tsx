import { StyleSheet, ImageBackground, View, Text, Pressable, ActivityIndicator } from "react-native";
import BackgroundImage from "../assets/images/background.png";
import AGButton from "../shared/components/AGButton";
import { useEffect, useState } from "react";
import { UserView } from "../shared/models/commonModels";
import { ConfigurationService } from "./configuration/services/configService";
import { AGMessageType, AGShowMessage, showSuccess } from "../shared/components/AGShowMessage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";


export default function HomeScreen() {
  const [user, setUser] = useState<UserView | null>(null);
  const [loading, setLoading] = useState(Boolean);
  
    useEffect(() => {
      const loadUserData = async () => {
        const userResponse = await ConfigurationService.GetLoggedUserAsync();
        if (userResponse.success) {
          setUser(userResponse.data)
          setLoading(false);
          
          AGShowMessage(userResponse.data.name);
          console.log(userResponse.data.name);
          console.log(loading);
        } else {
          AGShowMessage(userResponse.error.message, AGMessageType.error);
          console.log("não esta logado");
        }
      };
  
      loadUserData();
    }, []);

  if (user == null) {
    console.log("usuario: ", user);
    return <View><Text>redirecionar para o login</Text></View>;
  }

  return (
    <>
      <ImageBackground
            source={BackgroundImage}
            resizeMode="cover"
            style={styles.backgroundImage}
          >
            <View style={styles.container}>
              <Pressable
                onPress={async () => {
                  // 1. PRIMEIRO: A AÇÃO REAL (Apagar os dados)
                  // Sem essa linha, o botão é apenas um "placebo", não faz nada técnico.
                  var user =  await AsyncStorage.getItem("userView");
                  console.log(user);
                  await AsyncStorage.clear(); 
                  console.log("Depois de excluir -> ",user);
                  // 2. DEPOIS: O FEEDBACK VISUAL (Avisar o usuário)
                  AGShowMessage("Usuário removido do cache!", AGMessageType.success);
                }}
              >
                <Text style={{color:"white", backgroundColor: "green", padding:20}}>
                  Sair
                </Text>
              </Pressable>
              <AGButton title="Atendimento" route="/atendimento"  width={"100%"}/>
              <AGButton title="Preferencial" route="/preferencial"  width={"100%"}/>
              <AGButton title="Retirada de Exames" route="/retirada-exames" width={"90%"} />
            </View>
      </ImageBackground>
    </>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
});
