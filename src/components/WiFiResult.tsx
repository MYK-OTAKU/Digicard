import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share, Platform, Linking } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import WifiManager from "react-native-wifi-reborn";
import { useNavigation } from '@react-navigation/native';

interface WiFiResultProps {
  data: { ssid: string, password: string, type?: string };
  date: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const connectToWiFi = async (ssid: string, password: string) => {
  console.log('Attempting to connect to WiFi:', ssid);
  Alert.alert('Connecting', `Attempting to connect to the WiFi network "${ssid}"...`);
  try {
    if (Platform.OS === 'android') {
      await WifiManager.connectToProtectedSSID(ssid, password, false);
      Alert.alert("Success", `Connected to WiFi network "${ssid}".`);
    } else {
      Alert.alert("Info", "Connecting to WiFi is not supported on iOS through this method.");
    }
  } catch (error) {
    Alert.alert("Error", "Failed to connect to WiFi.");
    console.error("Error in connectToWiFi:", error);
  }
};

const openWiFiSettings = () => {
  if (Platform.OS === 'android') {
    Linking.openSettings();
  } else {
    Linking.openURL('App-Prefs:root=WIFI');
  }
};

const copyPassword = (password: string) => {
  console.log('Copying WiFi password to clipboard:', password);
  Clipboard.setString(password);
  Alert.alert('Password Copied', 'The WiFi password has been copied to your clipboard.');
};

const shareWiFiInfo = async (ssid: string, password: string) => {
  console.log('Sharing WiFi info:', ssid, password);
  const message = `WiFi SSID: ${ssid}\nPassword: ${password}`;
  try {
    await Share.share({ message });
  } catch (error) {
    Alert.alert('Error', 'Failed to share WiFi information');
    console.error("Error in shareWiFiInfo:", error);
  }
};

export const WiFiResult: React.FC<WiFiResultProps> = ({ data, date, isFavorite, onToggleFavorite }) => {
  const navigation = useNavigation();

  React.useEffect(() => {
    navigation.setOptions({
      onToggleFavorite,
    });
  }, [navigation, onToggleFavorite]);

  console.log('Rendering WiFiResult component with data:', data);

  if (!data.ssid || !data.password) {
    console.error("WiFi data is missing ssid or password. Data:", data);
    return (
      <View style={styles.container}>
        <Text style={styles.dataText}>Error: WiFi data is missing SSID or password.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="wifi" size={24} color="#1E88E5" />
        <Text style={styles.title}>WiFi</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <Text style={styles.dataText}>Network Name: {data.ssid || 'N/A'}</Text>
      <Text style={styles.dataText}>Type: {data.type || 'N/A'}</Text>
      <Text style={styles.dataText}>Password: {data.password || 'N/A'}</Text>
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton} onPress={() => {
          openWiFiSettings();
          copyPassword(data.password);
        }}>
          <MaterialIcons name="wifi" size={30} color="white" />
          <Text style={styles.buttonText}>Connect</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => copyPassword(data.password)}>
          <FontAwesome name="copy" size={30} color="white" />
          <Text style={styles.buttonText}>Copy Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => shareWiFiInfo(data.ssid, data.password)}>
          <FontAwesome name="share" size={30} color="white" />
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onToggleFavorite}>
          <MaterialIcons name={isFavorite ? "favorite" : "favorite-border"} size={30} color="white" />
          <Text style={styles.buttonText}>{isFavorite ? "Unfavorite" : "Favorite"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginLeft: 8,
  },
  date: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#777',
  },
  dataText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    lineHeight: 24,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#1E88E5',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    width: 80,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default WiFiResult;