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
import { ThemeProvider, ThemeContext } from './src/Context/ThemeContext';
import AuthGuard from './src/components/AuthGuard';
import LoadingScreen from './src/screens/LoadingScreen';
import { navigationRef, handlePendingNavigation } from './src/navigation/navigationService';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const Drawer = createDrawerNavigator();

const App: React.FC = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const { checkAuthStatus, isFingerprintAuthEnabled } = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);

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
      } else if (navigationRef.current.canGoBack()) {
        navigationRef.current.goBack();
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
      <ThemeProvider>
        <MenuProvider>
          <NavigationContainer ref={navigationRef}>
            <AuthGuard>
              <Drawer.Navigator
                initialRouteName={isFingerprintAuthEnabled ? 'FingerprintAuth' : 'Scan'}
                drawerContent={(props) => <CustomDrawerContent {...props} />}
              >
                <Drawer.Screen
                  name="Scan"
                  component={ScanScreen}
                  options={({ navigation }) => {  
                    const themeContext = useContext(ThemeContext);
                    return {
                    drawerIcon: ({ color, size }) => (
                      <MaterialIcons name="camera-alt" size={size} color={themeContext?.themeColor} />
                    ),
                    headerTransparent: false,
                    headerShown: false,
                  }}}
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
                  options={({ navigation }) => {
                    const themeContext = useContext(ThemeContext);
                    return {
                      drawerIcon: ({ color, size }) => (
                        <MaterialIcons name="history" size={size} color={themeContext?.themeColor} />
                      ),
                      headerTransparent: false,
                      headerTitle: 'History',
                      headerTitleStyle : themeContext?.themeColor ,
                      headerStyle: { backgroundColor: themeContext?.themeColor },
                      headerTintColor: themeContext?.textColor,
                      headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconButton}>
                          <MaterialIcons name="menu" size={24} color={themeContext?.iconColor} />
                        </TouchableOpacity>
                      ),
                    };
                  }}
                />
                <Drawer.Screen
                  name="Favorites"
                  component={FavoritesScreen}
                  options={({ navigation }) => {
                    const themeContext = useContext(ThemeContext);
                    return {
                      drawerIcon: ({ color, size }) => (
                        <MaterialIcons name="favorite" size={size} color={themeContext?.themeColor} />
                      ),
                      headerTransparent: false,
                      headerTitle: 'Favorites',
                      headerStyle: { backgroundColor: themeContext?.themeColor },
                      headerTintColor: themeContext?.textColor,
                      headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconButton}>
                          <MaterialIcons name="menu" size={24} color={themeContext?.iconColor} />
                        </TouchableOpacity>
                      ),
                    };
                  }}
                />
                <Drawer.Screen
                  name="Result"
                  component={ResultScreen}
                  options={({ navigation }) => {
                    const themeContext = useContext(ThemeContext);
                    return {
                      drawerItemStyle: { display: 'none' },
                      headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                          <MaterialIcons name="arrow-back" size={24} color={themeContext?.iconColor} />
                        </TouchableOpacity>
                      ),
                      headerStyle: { backgroundColor: themeContext?.themeColor },
                      headerTintColor: themeContext?.textColor,
                    };
                  }}
                />
                <Drawer.Screen
                  name="User"
                  component={UserScreen}
                  options={({ navigation }) => {
                    const themeContext = useContext(ThemeContext);
                    return {
                      drawerIcon: ({ color, size }) => (
                        <FontAwesome name="user" size={size} color={themeContext?.themeColor} />
                      ),
                      headerTransparent: false,
                      headerTitle: 'User',
                      headerStyle: { backgroundColor: themeContext?.themeColor },
                      headerTintColor: themeContext?.textColor,
                      headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconButton}>
                          <MaterialIcons name="menu" size={24} color={themeContext?.iconColor} />
                        </TouchableOpacity>
                      ),
                    };
                  }}
                />
                <Drawer.Screen
                  name="Settings"
                  component={SettingsScreen}
                  options={({ navigation }) => {
                    const themeContext = useContext(ThemeContext);
                    return {
                      drawerIcon: ({ color, size }) => (
                        <MaterialIcons name="settings" size={size} color={themeContext?.themeColor} />
                      ),
                      headerTransparent: false,
                      headerTitle: 'Settings',
                      headerStyle: { backgroundColor: themeContext?.themeColor },
                      headerTintColor: themeContext?.textColor,
                      headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconButton}>
                          <MaterialIcons name="menu" size={24} color={themeContext?.iconColor} />
                        </TouchableOpacity>
                      ),
                    };
                  }}
                />
              </Drawer.Navigator>
            </AuthGuard>
          </NavigationContainer>
        </MenuProvider>
      </ThemeProvider>
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