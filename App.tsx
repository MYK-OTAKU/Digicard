// App.tsx
import React, { useEffect, useState, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, StyleSheet, TouchableOpacity, BackHandler, Alert, AppState, AppStateStatus } from 'react-native';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import ScanScreen from './src/screens/ScanScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ResultScreen from './src/screens/ResultScreen';
import UserScreen from './src/components/UserScreen';
import SettingsScreen from './src/components/SettingsScreen';
import FingerprintAuthScreen from './src/components/FingerprintAuthScreen';
import CustomDrawerContent from './src/components/CustomDrawerContent';
import { MenuProvider } from 'react-native-popup-menu';
import { AuthProvider, AuthContext } from './src/Context/AuthContext';
import AuthGuard from './src/components/AuthGuard';
import LoadingScreen from './src/screens/LoadingScreen';
import { navigationRef, handlePendingNavigation } from './src/navigation/navigationService';
import * as SplashScreen from 'expo-splash-screen';
// import WelcomeScreen from './src/screens/WelcomeScreen';

SplashScreen.preventAutoHideAsync();

const Drawer = createDrawerNavigator();

const App: React.FC = () => {
  const [isAppReady, setIsAppReady] = useState(false); // Nouvel état de chargement
  const { checkAuthStatus, isFingerprintAuthEnabled } = useContext(AuthContext);
  const [torch, setTorch] = useState(false); // État de la torche

  const loadAssetsAsync = async () => {
    await Promise.all([
      Font.loadAsync({
        ...MaterialIcons.font,
        ...FontAwesome.font,
      }),
      Asset.loadAsync([require('./assets/logo.png')]),
    ]);

    await checkAuthStatus(); // Vérification de l'authentification
    setIsAppReady(true); // L'application est prête
    await SplashScreen.hideAsync(); // Cache le splash screen
  };


  useEffect(() => {
    loadAssetsAsync();
  }, []);

  // Ajoutez un effet pour gérer la navigation différée quand la navigation est prête
  useEffect(() => {
    if (isAppReady) {
      handlePendingNavigation(); // Gérer les redirections différées une fois que la navigation est prête
    }
  }, [isAppReady]);

  useEffect(() => {
    const handleBackPress = () => {
      if (!navigationRef.current) {
        return false;
      }

      const currentRoute = navigationRef.current.getCurrentRoute();
      console.log(`Current route: ${currentRoute?.name}`);
      if (currentRoute?.name === 'Scan') {
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit the app?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Yes', onPress: () => BackHandler.exitApp() },
          ]
        );
        return true;
      } else {
        navigationRef.current?.navigate('Scan' as never);
        return true;
      }
    };

    const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandlerSubscription.remove();
  }, []);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      console.log(`AppState changed to ${nextAppState}`);
      if (nextAppState === 'active') {
        await checkAuthStatus();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  if (!isAppReady) {
    return null; // Retourne null pendant le chargement
  }

  return (
    <AuthProvider>
      <MenuProvider>
        <NavigationContainer ref={navigationRef}>
          <AuthGuard>
            <Drawer.Navigator
              initialRouteName={isFingerprintAuthEnabled ? 'FingerprintAuth' : 'Scan'}
              drawerContent={(props) => <CustomDrawerContent {...props} />}
            >
              <Drawer.Screen
                name="Scan"
                component={ScanScreen} // Utiliser le composant ScanScreen directement
                options={({ navigation }) => ({
                  drawerIcon: ({ color, size }) => (
                    <MaterialIcons name="camera-alt" size={size} color={color} />
                  ),
                  headerShown: false, // Masquer le header par défaut
                })}
              />
              <Drawer.Screen
                name="FingerprintAuth"
                component={FingerprintAuthScreen}
                options={{
                  drawerItemStyle: { display: 'none' },
                  headerTransparent: false,
                  headerTitle: 'Fingerprint Authentication',
                }}
              />
              <Drawer.Screen
                name="History"
                component={HistoryScreen}
                options={{
                  drawerIcon: ({ color, size }) => (
                    <MaterialIcons name="history" size={size} color={color} />
                  ),
                  headerTransparent: false,
                  headerTitle: 'History',
                }}
              />
              <Drawer.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{
                  drawerIcon: ({ color, size }) => (
                    <MaterialIcons name="favorite" size={size} color={color} />
                  ),
                  headerTransparent: false,
                  headerTitle: 'Favorites',
                }}
              />
              <Drawer.Screen
                name="Result"
                component={ResultScreen}
                options={({ navigation }) => ({
                  drawerItemStyle: { display: 'none' },
                  headerLeft: () => (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                      <MaterialIcons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                  ),
                })}
              />
              <Drawer.Screen
                name="User"
                component={UserScreen}
                options={{
                  drawerIcon: ({ color, size }) => (
                    <FontAwesome name="user" size={size} color={color} />
                  ),
                  headerTransparent: false,
                  headerTitle: 'User',
                }}
              />
              <Drawer.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                  drawerIcon: ({ color, size }) => (
                    <MaterialIcons name="settings" size={size} color={color} />
                  ),
                  headerTransparent: false,
                  headerTitle: 'Settings',
                }}
              />
            </Drawer.Navigator>
          </AuthGuard>
        </NavigationContainer>
      </MenuProvider>
    </AuthProvider>
  );
};


const styles = StyleSheet.create({
  iconButton: {
    marginHorizontal: 10,
  },
  headerRight: {
    flexDirection: 'row',
  },
});

export default App;