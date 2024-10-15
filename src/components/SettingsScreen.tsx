// src/components/SettingsScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Button, Switch, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { loadSettings, saveSettings } from '../utils/settings';
import * as LocalAuthentication from 'expo-local-authentication';
import { ThemeContext } from '../Context/ThemeContext';

const SettingsScreen: React.FC = () => {
  const [fingerprintAuthEnabled, setFingerprintAuthEnabled] = useState(true);
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    throw new Error('ThemeContext must be used within a ThemeProvider');
  }

  const { themeColor, textColor, iconColor, scanButtonColor, scanButtonIconColor, changeThemeColor } = themeContext;

  useEffect(() => {
    (async () => {
      const settings = await loadSettings();
      console.log('Loaded settings:', settings);
      setFingerprintAuthEnabled(settings.fingerprintAuthEnabled);
    })();
  }, []);

  const toggleFingerprintAuth = async () => {
    if (fingerprintAuthEnabled) {
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
      <View style={styles.themeContainer}>
        <Text>Choose Theme Color</Text>
        <View style={styles.colorOptions}>
          <TouchableOpacity
            style={[styles.colorOption, { backgroundColor: '#ffffff' }]}
            onPress={() => changeThemeColor('#ffffff', '#333533', '#ffffff')}
          />
          <TouchableOpacity
            style={[styles.colorOption, { backgroundColor: '#333533' }]}
            onPress={() => changeThemeColor('#333533', '#ffffff', '#ffffff')}
          />
          <TouchableOpacity
            style={[styles.colorOption, { backgroundColor: '#FFD0E6' }]} // Rose clair
            onPress={() => changeThemeColor('#FFD0E6', '#333533', '#ffffff')}
          />
          <TouchableOpacity
            style={[styles.colorOption, { backgroundColor: '#27C7D4' }]} // Cyan clair
            onPress={() => changeThemeColor('#27C7D4', '#333533', '#ffffff')}
          />
          <TouchableOpacity
            style={[styles.colorOption, { backgroundColor: '#FF9CB6' }]} // Rose saumon clair
            onPress={() => changeThemeColor('#FF9CB6', '#333533', '#ffffff')}
          />
          <TouchableOpacity
            style={[styles.colorOption, { backgroundColor: '#7D4FFE' }]} // Violet clair
            onPress={() => changeThemeColor('#7D4FFE', '#ffffff', '#ffffff')}
          />
          <TouchableOpacity
            style={[styles.colorOption, { backgroundColor: '#8a2be2' }]} // Violet
            onPress={() => changeThemeColor('#8a2be2', '#ffffff', '#ffffff')}
          />
          <TouchableOpacity
            style={[styles.colorOption, { backgroundColor: '#0000ff' }]} // Bleu
            onPress={() => changeThemeColor('#0000ff', '#ffffff', '#ffffff')}
          />
          <TouchableOpacity
            style={[styles.colorOption, { backgroundColor: '#008000' }]} // Vert
            onPress={() => changeThemeColor('#008000', '#ffffff', '#ffffff')}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 10,
  },
});

export default SettingsScreen;