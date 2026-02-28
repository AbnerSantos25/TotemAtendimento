import { Stack } from 'expo-router';
import HeaderConfigButton from '../shared/components/HeaderConfigButton';
import { AuthProvider } from '../shared/contexts/AuthContext';
import { RootSiblingParent } from 'react-native-root-siblings';
import '../shared/localization/i18n';
import { GetLocalized } from '../shared/localization/i18n';
import { Labels } from '../shared/localization/keys';

export default function RootLayout() {
  return (
    <RootSiblingParent>
      <AuthProvider>
        <Stack screenOptions={{
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerTitleAlign: 'center'
        }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: GetLocalized(Labels.NavigationHome),
              headerRight: () => <HeaderConfigButton />,
            }}
          />
          <Stack.Screen name="configuration/login" options={{ title: GetLocalized(Labels.NavigationLogin) }} />
          <Stack.Screen name="configuration/configurationPage/configuration" options={{ title: GetLocalized(Labels.NavigationSettings), presentation: 'modal' }} />
        </Stack>
      </AuthProvider>
    </RootSiblingParent>
  );
}