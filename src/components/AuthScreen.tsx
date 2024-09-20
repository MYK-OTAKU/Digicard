import React, { useEffect, useState } from 'react';
import { View, Button, Alert, StyleSheet, Text } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types'; // Importer les types de navigation

WebBrowser.maybeCompleteAuthSession();

const AuthScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>(); // Utiliser le hook useNavigation pour obtenir l'objet navigation
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '68761760333-9f99v3urkljgupe5fb7ts0d3s7rur73b.apps.googleusercontent.com',
    androidClientId: '68761760333-9f99v3urkljgupe5fb7ts0d3s7rur73b.apps.googleusercontent.com',
    redirectUri: 'digicard://redirect' // Utilisez le schéma URI personnalisé ici
  });

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
    })();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      // Envoyer le token au backend pour vérification et création de session
      fetch('http://192.168.11.109:3100/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: authentication?.accessToken }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            Alert.alert('Success', 'Logged in successfully');
            navigation.navigate('Scan', { action: undefined }); // Utiliser un objet avec la propriété params
          } else {
            Alert.alert('Error', data.error);
          }
        })
        .catch((error) => {
          Alert.alert('Error', error.message);
        });
    }
  }, [response]);

  const handleBiometricAuth = async () => {
    const result = await LocalAuthentication.authenticateAsync();
    if (result.success) {
      navigation.navigate('Scan', { action: undefined }); // Utiliser un objet avec la propriété params
    } else {
      Alert.alert('Authentication failed', 'Please try again');
    }
  };

  return (
    <View style={styles.container}>
      {isBiometricSupported ? (
        <Button title="Login with Fingerprint" onPress={handleBiometricAuth} />
      ) : (
        <Text>Biometric authentication is not supported on this device</Text>
      )}
      <Button
        disabled={!request}
        title="Login with Google"
        onPress={() => {
          promptAsync();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuthScreen;