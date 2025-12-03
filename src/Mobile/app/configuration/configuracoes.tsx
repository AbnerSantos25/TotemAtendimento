import { StyleSheet, Text, View, Dimensions, Image, ImageBackground, Pressable, ActivityIndicator } from "react-native";
import BackgroundImage from "../../assets/images/background.png";
import ConfigButton from "../../shared/components/ConfigButton";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { GetUserDataAsync } from "./services/configService";
import { UserView } from "../../shared/models/CommonModels";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function configuration() {
  const [user, setUser] = useState<UserView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      const loggedUser = await GetUserDataAsync();
      setUser(loggedUser);
      setLoading(false);
    };

    loadUserData();
  });

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
  <ImageBackground
      source={BackgroundImage}
      resizeMode="cover"
      style={ConfigStyle.backgroundImage}
    >
      <View style={[ConfigStyle.MainContainer]}>
        <View style={{flex:1, alignItems: 'center'}}>
          <View id="UserInfo" style={[ConfigStyle.UserInfo]}>
              <Pressable  onPress={() => {
                  console.log("Usuário quer editar a foto!");
              }}>
              <View style={ConfigStyle.ProfileImageContainer}>
                <Image
                source={require("../../assets/images/personImage.png")}
                  style={ConfigStyle.ProfileImage}/>
                <View style={ConfigStyle.EditIconContainer}>
                  <Ionicons name="pencil" size={20} color="#ffffff" />
                </View>
              </View>
              </Pressable>
            {/* FIM DO NOVO CONTÊINER */}
              <View id="Name">
                  <Text style={[ConfigStyle.UserName]}>Abner Da Silva Santos</Text>
                  <Text style={[ConfigStyle.UserEmail]}>Abner@gmail.com</Text>
              </View>
          </View>
          <View id="Configurations" style={{width: "90%", marginTop:20, alignItems: 'center'}}>
              <View style={[ConfigStyle.DivConfig]}>
                <Text style={[ConfigStyle.ManuTitle]}>Configurações Gerais</Text>
              </View>
              <View style={{width: "90%", marginTop:2, rowGap:2}}>
                <ConfigButton title="Temas" route="/" iconName="invert-mode-outline"></ConfigButton>
                <ConfigButton title="Idiomas" route="/" iconName="language-outline"></ConfigButton>
              </View>
          </View>
          <View id="Informações" style={{width: "90%", marginTop:20, alignItems: 'center'}}>
              <View style={[ConfigStyle.DivConfig]}>
                <Text style={[ConfigStyle.ManuTitle]}>Informações</Text>
              </View>
              <View style={{width: "90%", marginTop:2, rowGap:2}}>
                <ConfigButton title="Sobre o Aplicativo" route="/" iconName="phone-portrait-outline"></ConfigButton>
                <ConfigButton title="Termos & Condições" route="/" iconName="reader-outline"></ConfigButton>
                <ConfigButton title="Políticas de Privacidade" route="/" iconName="shield-half-outline"></ConfigButton>
              </View>
          </View>
        </View>
      </View>
  </ImageBackground>
  );
}

const ConfigStyle = StyleSheet.create({
  MainContainer:{
    width: screenWidth,
    height: screenHeight,
    // backgroundColor: "#363636ff",
    flex:1,
  },
  DivConfig:{
    backgroundColor: "#ffffffaa",
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 10,
    padding: 10,
    width: "100%",
    textAlign: "center",
  },
  ViewPersonImage:{
    padding:10,
    alignItems: 'center'
  },
  UserInfo:{
    alignItems: 'center',
  },
  UserName:{
    marginTop: 10,          
    fontSize: 20,           
    fontWeight: "bold",     
    color: "#fff",          
    textAlign: "center",    
    textTransform: "capitalize", 
    letterSpacing: 1,      
  },
  UserEmail:{
    marginTop: 5,       
    fontSize: 15,           
    color: "#b7b5b5ff",          
    textAlign: "center",   
    textTransform: "capitalize", 
    letterSpacing: 1, 
  },  
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  ManuTitle:{
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
ProfileImageContainer: {
    position: 'relative',
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },

  ProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  EditIconContainer: {
    position: 'absolute',
    bottom: 7,     
    right: 15,     
    backgroundColor: '#4359e9ff',
    borderRadius: 15,
    padding: 5,
    zIndex: 10, 
  },
});