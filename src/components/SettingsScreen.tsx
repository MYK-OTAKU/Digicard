import React, { useState, useEffect } from 'react';
import { View, Button, Switch, StyleSheet, Alert } from 'react-native';
import { loadSettings, saveSettings } from '../utils/settings';
import * as LocalAuthentication from 'expo-local-authentication';

const SettingsScreen: React.FC = () => {
  const [fingerprintAuthEnabled, setFingerprintAuthEnabled] = useState(true);

  useEffect(() => {
    (async () => {
      const settings = await loadSettings();
      console.log('Loaded settings:', settings);
      setFingerprintAuthEnabled(settings.fingerprintAuthEnabled);
    })();
  }, []);

  const toggleFingerprintAuth = async () => {
    if (fingerprintAuthEnabled) {
      // Authentification avant désactivation
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to disable fingerprint',
      });

      if (result.success) {
        setFingerprintAuthEnabled(false);
        await saveSettings({ fingerprintAuthEnabled: false });
        console.log('Fingerprint authentication disabled');
        Alert.alert('Fingerprint authentication disabled');
      } else {
        console.log('Authentication failed, unable to disable fingerprint authentication.');
        Alert.alert('Authentication failed', 'Unable to disable fingerprint authentication.');
      }
    } else {
      setFingerprintAuthEnabled(true);
      await saveSettings({ fingerprintAuthEnabled: true });
      console.log('Fingerprint authentication enabled');
      Alert.alert('Fingerprint authentication enabled');
    }
  };

  return (
    <View style={styles.container}>
      <Switch
        value={fingerprintAuthEnabled}
        onValueChange={toggleFingerprintAuth}
      />
      <Button title="Toggle Fingerprint Authentication" onPress={toggleFingerprintAuth} />
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

export default SettingsScreen;
