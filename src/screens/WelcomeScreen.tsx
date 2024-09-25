import React, { useEffect } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { useNavigation } from '@react-navigation/native';
import { googleClientId } from '../utils/authConfig';
import { MaterialIcons } from '@expo/vector-icons';

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: googleClientId,
    redirectUri: 'digicard://redirect', // Utilisez le schéma URI personnalisé
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      // Envoyer le token au backend pour vérification et gestion de la session
      fetch('http://192.168.11.105:3100/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: authentication?.accessToken }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            // Rediriger vers la page de scan après une connexion réussie
            navigation.navigate('Scan' as never);
          } else {
            console.error('Login failed');
          }
        });
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.quitButton} onPress={() => navigation.navigate('Scan' as never)}>
        <MaterialIcons name="close" size={28} color="black" />
      </TouchableOpacity>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <TouchableOpacity
        style={styles.authButton}
        disabled={!request}
        onPress={() => {
          promptAsync();
        }}
      >
        {/* <Image source={require('../../assets/logo.png')} style={styles.authButtonIcon} /> */}
        <Text style={styles.authButtonText}>Login with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.authButton}
        onPress={() => {
          // Ajouter la logique pour une autre méthode d'authentification
        }}
      >
        <MaterialIcons name="fingerprint" size={24} color="white" style={styles.authButtonIcon} />
        <Text style={styles.authButtonText}>Other Auth Method</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  quitButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 40,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: '80%',
    justifyContent: 'center',
  },
  authButtonIcon: {
    marginRight: 10,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default WelcomeScreen;