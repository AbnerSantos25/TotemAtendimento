import React, { useEffect, useState } from 'react';
import { StyleSheet, ImageBackground, View, Text, Pressable, ActivityIndicator, StatusBar } from "react-native";
import { Redirect } from "expo-router";
import BackgroundImage from "../assets/images/background.png";
import { useAuth } from '../shared/contexts/AuthContext';
import { GetLocalized } from '../shared/localization/i18n';
import { Errors, Messages } from '../shared/localization/keys';
import { AGMessageType, AGShowMessage } from '../shared/components/AGShowMessage';
import AGButton from '../shared/components/AGButton';
import ConfirmDialog from '../shared/components/ConfirmDialog';
import { MenuQueue, QueueRequest } from '../shared/models/menuModels';
import { MenuService } from '../shared/services/menuService';
import { GlobalStyles, TextStyles, ButtonStyles } from '../shared/styles/mainStyles';

export default function HomeScreen() {
  const { user, isLoading, signOut } = useAuth();

  const [menus, setMenus] = useState<MenuQueue[]>([]);
  const [loadingMenus, setLoadingMenus] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuQueue | null>(null);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const availableMenus = await MenuService.getAvailableMenus();
        setMenus(availableMenus);
        AGShowMessage(GetLocalized(Errors.ErrorLoadingAvailableQueues), AGMessageType.error);
      } finally {
        setLoadingMenus(false);
      }
    };

    loadMenus();
  }, []);

  if (isLoading || loadingMenus) {
    return (
      <View style={GlobalStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={GlobalStyles.loadingText}>{GetLocalized(Messages.LoadingSystem)}</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/configuration/login" />;
  }

  const handleMenuClick = async (menu: MenuQueue) => {
    if (menu.preferential) {
      setSelectedMenu(menu);
      setDialogVisible(true);
    } else {
      await processQueueRequest(menu, false);
    }
  };

  const processQueueRequest = async (menu: MenuQueue, isPreferential: boolean) => {
    try {
      const request: QueueRequest = {
        queueId: menu.queueId,
        preferential: isPreferential
      };

      const response = await MenuService.generatePassword(request);

      if (response.success) {
        AGShowMessage(`${GetLocalized(Messages.PasswordGeneratedFor)} ${menu.name}`, AGMessageType.success);
      } else {
        AGShowMessage(response.error.message, AGMessageType.error);
      }
    } catch (error) {
      AGShowMessage(GetLocalized(Errors.UnexpectedErrorGeneratingPassword), AGMessageType.error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      AGShowMessage(GetLocalized(Messages.LoggedOutSuccess), AGMessageType.success);
    } catch (error) {
      console.error("Erro ao sair", error);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={BackgroundImage}
        resizeMode="cover"
        style={GlobalStyles.backgroundImage}
      >
        <View style={GlobalStyles.centeredContainer}>

          <View style={styles.header}>
            <Text style={TextStyles.welcomeLabel}>{GetLocalized(Messages.Welcome)}</Text>
            <Text style={TextStyles.userName}>{user.name}</Text>
            <Text style={TextStyles.userEmail}>{user.email}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              ButtonStyles.logoutButton,
              pressed && { opacity: 0.8 }
            ]}
            onPress={handleLogout}>
            <Text style={ButtonStyles.logoutText}>{GetLocalized(Messages.Logout)}</Text>
          </Pressable>

          <View style={GlobalStyles.buttonsContainer}>
            {menus.map((menu) => (
              <AGButton
                key={menu.queueId}
                title={menu.name}
                width="100%"
                onPress={() => handleMenuClick(menu)}
              />
            ))}
          </View>

        </View>
      </ImageBackground>

      <ConfirmDialog
        visible={dialogVisible}
        title={GetLocalized(Messages.TypeOfService)}
        description={GetLocalized(Messages.ChooseServiceType)}
        button1Text={GetLocalized(Messages.Common)}
        button2Text={GetLocalized(Messages.Preferential)}
        onButton1Press={() => {
          if (selectedMenu) processQueueRequest(selectedMenu, false);
          setDialogVisible(false);
        }}
        onButton2Press={() => {
          if (selectedMenu) processQueueRequest(selectedMenu, true);
          setDialogVisible(false);
        }}
        onClose={() => setDialogVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
});