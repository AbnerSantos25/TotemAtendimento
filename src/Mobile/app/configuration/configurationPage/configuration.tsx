import { StyleSheet, Text, View, Dimensions, Image, ImageBackground, Pressable, ActivityIndicator } from "react-native";
import ConfigButton from "../../../shared/components/ConfigButton";
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";
import { AGMessageType, AGShowMessage } from "../../../shared/components/AGShowMessage";
import { ThemeModal, ThemeType } from "./ThemeModel";
import { ButtonStyles } from "../../../shared/styles/mainStyles";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { GetLocalized } from "../../../shared/localization/i18n";
import { Labels } from "../../../shared/localization/keys";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function configuration() {
  const {user, isLoading, signOut} = useAuth();

  //#region ThemeModel
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('dark');
  const handleThemeSelect = (newTheme: ThemeType) => {
    setCurrentTheme(newTheme);
    setModalVisible(false);
    // TODO: Salvar no AsyncStorage/Context
  };
  const getThemeLabel = (theme: ThemeType) => {
    switch (theme) {
      case 'dark': return GetLocalized(Labels.ThemeDark);
      case 'light': return GetLocalized(Labels.ThemeLight);
      case 'system': return GetLocalized(Labels.ThemeSystem);
    }
  }

    const handleLogout = async () => {
      try {
        await signOut(); 
          AGShowMessage("Você saiu com sucesso!", AGMessageType.success);
          router.replace('/');
      } catch (error) {
          AGShowMessage("Erro ao Sair!", AGMessageType.success);
      }
    };

  return (
      <>
        <LinearGradient
        colors={['#000000', '#121018','#2a1a4a', '#4a1a2a']}
        style={StyleSheet.absoluteFill}
        />
        <View style={[ConfigStyle.MainContainer]}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View id="UserInfo" style={[ConfigStyle.UserInfo]}>
            <Pressable onPress={() => {
              console.log("Usuário quer editar a foto!");
            }}>
              <View style={ConfigStyle.ProfileImageContainer}>
                <Image
                  source={require("../../../assets/images/personImage.png")}
                  style={ConfigStyle.ProfileImage} />
                <View style={ConfigStyle.EditIconContainer}>
                  <Ionicons name="pencil" size={20} color="#ffffff" />
                </View>
              </View>
            </Pressable>
            {/* FIM DO NOVO CONTÊINER */}
            <View id="Name">
              <Text style={[ConfigStyle.UserName]}>{user?.name}</Text>
              <Text style={[ConfigStyle.UserEmail]}>{user?.email}</Text>
            </View>
          </View>
          <View id="Configurations" style={{ width: "90%", marginTop: 20, alignItems: 'center' }}>
            <View style={[ConfigStyle.DivConfig]}>
              <Text style={[ConfigStyle.ManuTitle]}>{GetLocalized(Labels.SettingsGeneral)}</Text>
            </View>
            <View style={{ width: "90%", marginTop: 2, rowGap: 2 }}>
              <ConfigButton
                iconName="color-palette-outline"
                title={GetLocalized(Labels.SettingsThemes)}
                value={getThemeLabel(currentTheme)}
                onPress={() => setModalVisible(true)}
              />
              <ConfigButton title={GetLocalized(Labels.SettingsLanguages)} route="/" iconName="language-outline"></ConfigButton>
            </View>
          </View>
          <View id="Informações" style={{ width: "90%", marginTop: 20, alignItems: 'center' }}>
            <View style={[ConfigStyle.DivConfig]}>
              <Text style={[ConfigStyle.ManuTitle]}>{GetLocalized(Labels.SettingsInformation)}</Text>
            </View>
            <View style={{ width: "90%", marginTop: 2, rowGap: 2 }}>
              <ConfigButton title={GetLocalized(Labels.SettingsAboutApp)} route="/" iconName="phone-portrait-outline"></ConfigButton>
              <ConfigButton title={GetLocalized(Labels.SettingsTerms)} route="/" iconName="reader-outline"></ConfigButton>
              <ConfigButton title={GetLocalized(Labels.SettingsPrivacy)} route="/" iconName="shield-half-outline"></ConfigButton>
            </View>
          </View>
          <View style={{margin:10}}>
              <Pressable
                style={({ pressed }) => [ButtonStyles.logoutButton,
                  pressed && { opacity: 0.8 }
                ]}
                onPress={handleLogout}
              >
                <Text style={ButtonStyles.logoutText}>Sair da Conta</Text>
              </Pressable>
          </View>
        </View>

        <ThemeModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSelectTheme={handleThemeSelect}
          currentTheme={currentTheme}
        />
      </View>
      </>
  );
}

const ConfigStyle = StyleSheet.create({
  MainContainer: {
    width: screenWidth,
    height: screenHeight,
    flex: 1,
  },
  DivConfig: {
    backgroundColor: "#ffffffaa",
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 10,
    padding: 10,
    width: "100%",
    textAlign: "center",
  },
  ViewPersonImage: {
    padding: 10,
    alignItems: 'center'
  },
  UserInfo: {
    alignItems: 'center',
  },
  UserName: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    textTransform: "capitalize",
    letterSpacing: 1,
  },
  UserEmail: {
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
  ManuTitle: {
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