import { StyleSheet, Text, View, Dimensions, Image, ImageBackground } from "react-native";
import MainStyles from "../../shared/styles/mainStyles";
import BackgroundImage from "../../assets/images/background.png";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function configuration() {
  return (
  <ImageBackground
      source={BackgroundImage}
      resizeMode="cover"
      style={ConfigStyle.backgroundImage}
    >
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
              <View><Text>2Configurações Gerais</Text></View>
              <View></View>
          </View>
          <View id="3">

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
    color: "#fff",          
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
});