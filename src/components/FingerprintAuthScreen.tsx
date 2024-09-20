// src/components/FingerprintAuthScreen.tsx
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, AppState, AppStateStatus, Image, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { AuthContext } from '../Context/AuthContext';
import { navigate, navigationRef } from '../navigation/navigationService';

const FingerprintAuthScreen: React.FC = () => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const { authenticate, isAuthenticated, setAuthInProgress } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
      console.log(`Biometric hardware supported: ${compatible}`);
    })();
  }, []);

  const handleBiometricAuth = async () => {
    if (isAuthenticated) return;
    try {
      console.log("Starting biometric authentication...");
      setAuthInProgress(true);
      setLoading(true); // Afficher l'écran de chargement

      const savedBiometrics = await LocalAuthentication.isEnrolledAsync();
      if (!savedBiometrics) {
        setAuthInProgress(false);
        setLoading(false); // Masquer l'écran de chargement
        console.log('Biometric record not found');
        return Alert.alert(
          'Biometric record not found',
          'Please verify your identity with your password',
          [{ text: 'OK' }]
        );
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate',
        fallbackLabel: 'Enter Password',
      });

      if (result.success) {
        console.log("Biometric authentication succeeded");
        authenticate();
        setLoading(false); // Masquer l'écran de chargement
        if (navigationRef.isReady()) {
          navigate('Scan');
        } else {
          // console.error('Navigation object is not ready yet. Retrying...');
          setTimeout(() => {
            if (navigationRef.isReady()) {
              navigate('Scan');
            }
          }, 2000); // Retarder la navigation de 2 secondes
        }
      } else if (result.error === 'user_cancel') {
        setAuthInProgress(false);
        setLoading(false); // Masquer l'écran de chargement
        console.log('Authentication cancelled by user');
        Alert.alert('Authentication cancelled', 'You cancelled the authentication process.');
      } else if (result.error === 'system_cancel') {
        setAuthInProgress(false);
        setLoading(false); // Masquer l'écran de chargement
        console.log('Authentication interrupted');
      } else {
        setAuthInProgress(false);
        setLoading(false); // Masquer l'écran de chargement
        console.log('Biometric authentication failed');
        Alert.alert('Authentication failed', 'Please try again');
      }
    } catch (error) {
      setAuthInProgress(false);
      setLoading(false); // Masquer l'écran de chargement
      console.error('Error during biometric authentication:', error);
      Alert.alert('Error', 'An error occurred during authentication.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Authenticating...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isBiometricSupported ? (
        <>
          <Image style={styles.logo} source={require('../../assets/logo.png')} />
          <Text style={styles.title}>Authenticate with Biometrics</Text>
          <TouchableOpacity style={styles.button} onPress={handleBiometricAuth}>
            <Text style={styles.buttonText}>Authenticate</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.errorText}>Biometric Authentication not supported on this device</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});

export default FingerprintAuthScreen;
