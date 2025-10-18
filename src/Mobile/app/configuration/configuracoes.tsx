import { StyleSheet, Text, View, Dimensions, Image } from "react-native";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function configuration() {
  return (
      <View style={[ConfigStyle.MainContainer]}>
        <View>
          <View id="UserInfo" style={[ConfigStyle.UserInfo]}>
              <View id="img" style={[ConfigStyle.ViewPersonImage]}>
                  <Image
                    source={require("../../assets/images/personImage.png")}
                    style={{ width: 120, height: 120, borderRadius:100 }}/>
              </View>
              <View id="Name">
                  <Text style={[ConfigStyle.UserName]}>Abner Da Silva Santos</Text>
                  <Text style={[ConfigStyle.UserEmail]}>Abner@gmail.com</Text>
              </View>
          </View>
          <View id="2">

          </View>
          <View id="3">

          </View>
        </View>
      </View>
  );
}

const ConfigStyle = StyleSheet.create({
  MainContainer:{
    width: screenWidth,
    height: screenHeight,
    backgroundColor: "#363636ff",
    flex:1,
  },
  ViewPersonImage:{
    padding:10,
    alignItems: 'center'
  },
  UserInfo:{
    alignItems: 'center',
  },
  UserName:{
    marginTop: 10,          // espaço entre a imagem e o texto
    fontSize: 20,           // tamanho da fonte
    fontWeight: "bold",     // negrito
    color: "#fff",          // cor do texto
    textAlign: "center",    // centralizado na tela
    textTransform: "capitalize", // primeira letra maiúscula
    letterSpacing: 1,       // espaço entre letras
  },
  UserEmail:{
    marginTop: 10,          // espaço entre a imagem e o texto
    fontSize: 10,           // tamanho da fonte
    fontWeight: "bold",     // negrito
    color: "#fff",          // cor do texto
    textAlign: "center",    // centralizado na tela
    textTransform: "capitalize", // primeira letra maiúscula
    letterSpacing: 1, 
  }
});