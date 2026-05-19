import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator, StatusBar } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from '../shared/contexts/AuthContext';
import { GetLocalized } from '../shared/localization/i18n';
import { Errors, Messages } from '../shared/localization/keys';
import { AGMessageType, AGShowMessage } from '../shared/components/AGShowMessage';
import AGButton from '../shared/components/AGButton';
import ConfirmDialog from '../shared/components/ConfirmDialog';
import { MenuQueue, QueueRequest } from '../shared/models/menuModels';
import { MenuService } from '../shared/services/menuService';
import { GlobalStyles } from '../shared/styles/mainStyles';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const { user, isLoading, signOut } = useAuth();

  const [menus, setMenus] = useState<MenuQueue[]>([]);
  const [loadingMenus, setLoadingMenus] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuQueue | null>(null);

  const loadMenus = useCallback(async (isReload = false) => {
    if (isReload) setReloading(true);
    else setLoadingMenus(true);

    try {
      const availableMenus = await MenuService.getAvailableMenus();
      setMenus(availableMenus);
      if (isReload) {
        AGShowMessage('Serviços atualizados!', AGMessageType.success);
      }
    } catch {
      AGShowMessage(GetLocalized(Errors.ErrorLoadingAvailableQueues), AGMessageType.error);
    } finally {
      if (isReload) setReloading(false);
      else setLoadingMenus(false);
    }
  }, []);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

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
    setDialogVisible(true);
    setSelectedMenu(menu);
  };

  const processQueueRequest = async (menu: MenuQueue, isPreferential: boolean) => {
    try {
      const request: QueueRequest = {
        queueId: menu.queueId,
        preferential: isPreferential
      };

      const response = await MenuService.generatePassword(request);

      if (response.success) {
        AGShowMessage(`${GetLocalized(Messages.PasswordGeneratedFor)} ${menu.title}`, AGMessageType.success);
      } else {
        AGShowMessage(response.error.message, AGMessageType.error);
      }
    } catch {
      AGShowMessage(GetLocalized(Errors.UnexpectedErrorGeneratingPassword), AGMessageType.error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      AGShowMessage(GetLocalized(Messages.LoggedOutSuccess), AGMessageType.success);
    } catch {
      AGShowMessage('Erro ao sair!', AGMessageType.error);
    }
  };

  return (
    <>
      <LinearGradient
        colors={['#000000', '#1c2044ff', '#272b4eff', '#05050cff']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <StatusBar barStyle="light-content" />

      <View style={GlobalStyles.centeredContainer}>
        <View style={GlobalStyles.buttonsContainer}>
          {menus.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum serviço disponível.</Text>
          ) : (
            menus.map((menu, index) => (
              <AGButton
                key={`${menu.queueId}-${index}`}
                title={menu.title}
                color={menu.color}
                width="100%"
                onPress={() => handleMenuClick(menu)}
              />
            ))
          )}
        </View>

        {/* Botão de recarregar */}
        <Pressable
          style={({ pressed }) => [styles.reloadButton, pressed && styles.reloadButtonPressed]}
          onPress={() => loadMenus(true)}
          disabled={reloading}
        >
          {reloading ? (
            <ActivityIndicator size="small" color="#a78bfa" />
          ) : (
            <Text style={styles.reloadButtonText}>↺  Recarregar serviços</Text>
          )}
        </Pressable>
      </View>

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
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 24,
  },
  reloadButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 206, 250, 0.4)',
    backgroundColor: 'rgba(139, 165, 250, 0.08)',
    alignItems: 'center',
    minWidth: 200,
  },
  reloadButtonPressed: {
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
  },
  reloadButtonText: {
    color: '#8ba5faff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});