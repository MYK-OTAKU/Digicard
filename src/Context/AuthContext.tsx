// src/Context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { loadSettings, saveSettings } from '../utils/settings';

interface AuthContextProps {
  isAuthenticated: boolean;
  authenticate: () => void;
  logout: () => void;
  checkAuthStatus: () => void;
  setAuthInProgress: (inProgress: boolean) => void;
  toggleAuthEnabled: () => void;
  isFingerprintAuthEnabled: boolean;
  toggleFingerprintAuth: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  authenticate: () => {},
  logout: () => {},
  checkAuthStatus: () => {},
  setAuthInProgress: () => {},
  toggleAuthEnabled: () => {},
  isFingerprintAuthEnabled: false,
  toggleFingerprintAuth: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthInProgress, setAuthInProgress] = useState<boolean>(false);
  const [isAuthEnabled, setIsAuthEnabled] = useState<boolean>(true);
  const [isFingerprintAuthEnabled, setIsFingerprintAuthEnabled] = useState<boolean>(false);

  const checkAuthStatus = async () => {
    console.log("Checking auth status...");
    const lastAuthTime = await AsyncStorage.getItem('lastAuthTime');
    const currentTime = new Date().getTime();

    if (lastAuthTime && currentTime - parseInt(lastAuthTime) <= 5 * 60 * 1000) {
      setIsAuthenticated(true);
      console.log("User is authenticated");
    } else {
      setIsAuthenticated(false);
      console.log("User is not authenticated");
    }
  };

  const toggleAuthEnabled = async () => {
    const newValue = !isAuthEnabled;
    setIsAuthEnabled(newValue);
    await AsyncStorage.setItem('isAuthEnabled', JSON.stringify(newValue));
    console.log(`Auth enabled set to: ${newValue}`);
  };

  const toggleFingerprintAuth = async () => {
    const newValue = !isFingerprintAuthEnabled;
    setIsFingerprintAuthEnabled(newValue);
    await saveSettings({ fingerprintAuthEnabled: newValue });
    console.log(`Fingerprint Auth set to: ${newValue}`);
  };

  useEffect(() => {
    const loadAuthSettings = async () => {
      const settings = await loadSettings();
      console.log('Loaded settings:', settings);
      setIsFingerprintAuthEnabled(settings.fingerprintAuthEnabled);

      const savedAuthEnabled = await AsyncStorage.getItem('isAuthEnabled');
      if (savedAuthEnabled !== null) {
        setIsAuthEnabled(JSON.parse(savedAuthEnabled));
      }
    };

    loadAuthSettings();

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      console.log(`AppState changed to ${nextAppState}`);
      if (nextAppState === 'active' && isAuthEnabled) {
        console.log("App moved to foreground, checking auth status...");
        await checkAuthStatus();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isAuthEnabled]);

  const authenticate = async () => {
    await AsyncStorage.setItem('lastAuthTime', new Date().getTime().toString());
    setIsAuthenticated(true);
    console.log("User authenticated successfully");
    setAuthInProgress(false);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('lastAuthTime');
    setIsAuthenticated(false);
    console.log("User logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authenticate,
        logout,
        checkAuthStatus,
        setAuthInProgress,
        toggleAuthEnabled,
        isFingerprintAuthEnabled,
        toggleFingerprintAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
