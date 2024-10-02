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
import WelcomeScreen from './src/screens/WelcomeScreen';

SplashScreen.preventAutoHideAsync();

const Drawer = createDrawerNavigator();

const App: React.FC = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const { checkAuthStatus, isFingerprintAuthEnabled } = useContext(AuthContext);

  const loadAssetsAsync = async () => {
    await Promise.all([
      Font.loadAsync({
        ...MaterialIcons.font,
        ...FontAwesome.font,
      }),
      Asset.loadAsync([require('./assets/logo.png')]),
    ]);

    await checkAuthStatus();
    setIsAppReady(true);
    await SplashScreen.hideAsync();
  };

  useEffect(() => {
    loadAssetsAsync();
  }, []);

  useEffect(() => {
    if (isAppReady) {
      handlePendingNavigation();
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
        Alert.alert('Exit App', 'Are you sure you want to exit the app?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes', onPress: () => BackHandler.exitApp() },
        ]);
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
    return null;
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
                name="Welcome"
                component={WelcomeScreen}
                options={{
                  drawerItemStyle: { display: 'none' },
                  headerShown: false,
                }}
              />
              <Drawer.Screen
                name="Scan"
                component={ScanScreen}
                options={({ navigation }) => ({
                  drawerIcon: ({ color, size }) => (
                    <MaterialIcons name="camera-alt" size={size} color={color} />
                  ),
                  headerTransparent: true,
                  headerTitle: '',
                  headerLeft: () => (
                    <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconButton}>
                      <MaterialIcons name="menu" size={28} color="white" />
                    </TouchableOpacity>
                  ),
                  headerRight: () => (
                    <View style={styles.headerRight}>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('Scan', { action: 'toggleTorch' })}
                      >
                        <MaterialIcons name="flash-on" size={24} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('Scan', { action: 'switchCamera' })}
                      >
                        <MaterialIcons name="rotate-right" size={24} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('Scan', { action: 'zoomIn' })}
                      >
                        <MaterialIcons name="zoom-in" size={24} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('Scan', { action: 'zoomOut' })}
                      >
                        <MaterialIcons name="zoom-out" size={24} color="white" />
                      </TouchableOpacity>
                    </View>
                  ),
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
