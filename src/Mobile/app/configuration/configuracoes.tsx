import { StyleSheet, Text, View, Dimensions, Image, ImageBackground } from "react-native";
import BackgroundImage from "../../assets/images/background.png";
import ConfigButton from "../../shared/components/ConfigButton";

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
        <View style={{flex:1, alignItems: 'center'}}>
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
          <View id="Configurations" style={{width: "90%", marginTop:20, alignItems: 'center'}}>
              <View style={[ConfigStyle.DivConfig]}>
                <Text style={{textAlign:"center"}}>Configurações Gerais</Text>
              </View>
              <View style={{width: "90%", marginTop:2}}>
                <ConfigButton title="Temas" route="/" iconName="settings-outline"></ConfigButton>
              </View>
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