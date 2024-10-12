import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Share } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { postData, toggleFavorite, deleteScan } from '../../api'; // Removed toggleUrlSafety
import { URLResult } from '../components/URLResult';
import { WiFiResult } from '../components/WiFiResult';
import { VCardResult } from '../components/VCardResult';
import { SMSResult } from '../components/SMSResult';
import { GeoResult } from '../components/GeoResult';
import { EmailResult } from '../components/EmailResult';
import { TextResult } from '../components/TextResult';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { MaterialIcons } from '@expo/vector-icons';

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

const ResultScreen: React.FC = () => {
  const route = useRoute<ResultScreenRouteProp>();
  const navigation = useNavigation();
  const { type, data, urlSafety, id, date, isFavorite, imageUrl } = route.params;

  const [safetyData, setSafetyData] = useState<any>(urlSafety);
  const [loading, setLoading] = useState(false);
  const [favorite, setFavorite] = useState(isFavorite);
  const [key, setKey] = useState<string>(id ? id.toString() : 'defaultKey');

  useEffect(() => {
    setSafetyData(urlSafety);
    setFavorite(isFavorite);
    setKey(id ? id.toString() : 'defaultKey');
  }, [route.params]);

  useEffect(() => {
    navigation.setOptions({
      onToggleFavorite: handleToggleFavorite,
      headerRight: () => (
        <Menu>
          <MenuTrigger>
            <MaterialIcons style={styles.iconmenu} name="more-vert" size={28} color="#4A4A4A" />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption style={styles.menuOptionText} onSelect={handleToggleFavorite} text={favorite ? 'Remove from Favorites' : 'Add to Favorites'} />
            {type === 'URL' && safetyData && ( // Only show for URL and if safety data exists
              <MenuOption style={styles.menuOptionText} onSelect={handleCheckSafety} text="Re-check URL Safety" />
            )}
            <MenuOption style={styles.menuOptionText} onSelect={handleDelete} text="Delete" />
          </MenuOptions>
        </Menu>
      ),
    });
  }, [favorite]);

  // Function to check safety (Re-check)
  const handleCheckSafety = async () => {
    if (!id) {
      Alert.alert('Error', "The scan ID is missing");
      return;
    }

    setLoading(true);
    try {
      const result = await postData('scans/analyse', { url: data, scanId: id });
      if (result.success) {
        setSafetyData(result.urlSafety);
        Alert.alert('URL Safety Check', 'The URL has been analyzed.');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze URL safety.');
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle favorite status
  const handleToggleFavorite = async () => {
    try {
      const result = await toggleFavorite(id, favorite);
      if (result.success) {
        setFavorite(!favorite);
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  // Function to delete the scan
  const handleDelete = async () => {
    Alert.alert(
      'Delete Confirmation',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteScan(id);
              if (result.success) {
                Alert.alert('Deleted', 'The scan was successfully deleted.');
                navigation.goBack();
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete the scan.');
            }
          },
        },
      ],
    );
  };

  // Function to share the scan data
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this data: ${data}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share the data.');
    }
  };

  const renderWiFiResult = () => {
    let wifiData = data;

    if (typeof wifiData === 'string') {
      try {
        wifiData = JSON.parse(wifiData);
      } catch {
        const wifiDataArray = wifiData.split(/\s+/);
        if (wifiDataArray.length >= 2) {
          wifiData = {
            ssid: wifiDataArray[0],
            password: wifiDataArray[1],
            type: 'WPA',
          } as any;
        } else {
          console.error('Erreur de parsing des données WiFi:', wifiData);
          Alert.alert('Erreur', 'Les données WiFi sont mal formatées.');
          return <TextResult data={wifiData} />;
        }
      }
    }

    if (typeof wifiData !== 'object' || !('ssid' in wifiData) || !('password' in wifiData)) {
      Alert.alert('Erreur', 'Les données WiFi sont mal formatées.');
      return <TextResult data={JSON.stringify(wifiData)} />;
    }

    return (
      <WiFiResult
        data={wifiData}
        date={date}
        isFavorite={favorite}
        onToggleFavorite={handleToggleFavorite}
      />
    );
  };

  const renderResult = () => {
    console.log("Rendering result for type:", type);
    switch (type) {
      case 'URL':
        return (
          <URLResult 
            key={key}
            data={data}
            onCheckSafety={handleCheckSafety}
            urlSafety={safetyData}
            type={type}
            date={date}
            isFavorite={favorite}
            onToggleFavorite={handleToggleFavorite}
            id={id}
          />
        );
      case 'WiFi':
        return renderWiFiResult();
      case 'vCard':
        return <VCardResult data={data} />;
      case 'SMS':
        return <SMSResult data={data} />;
      case 'Email':
        return <EmailResult data={data} />;
      case 'Geo':
        return <GeoResult data={data} />;
      default:
        return <TextResult data={data} />;
    }
  };

  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator size="large" color="#0000ff" /> : renderResult()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  menuOptionText: {
    padding: 10,
    fontSize: 16,
  },
  iconmenu: {
    marginRight: 10,
  },
});

export default ResultScreen;
