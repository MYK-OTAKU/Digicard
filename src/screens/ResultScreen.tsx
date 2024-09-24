import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { postData, toggleFavorite } from '../../api';
import { URLResult } from '../components/URLResult';
import { WiFiResult } from '../components/WiFiResult';
import { VCardResult } from '../components/VCardResult';
import { SMSResult } from '../components/SMSResult';
import { GeoResult } from '../components/GeoResult';
import { EmailResult } from '../components/EmailResult';
import { TextResult } from '../components/TextResult';

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
    console.log("Params updated:", route.params);
    console.log('Favoris/Historique Data:', { type, data });
    setSafetyData(urlSafety);
    setFavorite(isFavorite);
    setKey(id ? id.toString() : 'defaultKey');
  }, [route.params]);

  useEffect(() => {
    navigation.setOptions({
      onToggleFavorite: handleToggleFavorite,
    });
  }, [favorite]);

  const handleCheckSafety = async () => {
    if (!id) {
      Alert.alert('Erreur', "L'ID du scan est manquant");
      return;
    }

    setLoading(true);
    try {
      const result = await postData('scans/analyse', { url: data, scanId: id });
      if (result.success) {
        setSafetyData(result.urlSafety);
        Alert.alert('Vérification de sécurité', 'La vérification de l\'URL est terminée.');
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la vérification de la sécurité de l\'URL');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const result = await toggleFavorite(id, favorite);
      if (result.success) {
        setFavorite(!favorite);
        Alert.alert('Succès', result.message);
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Échec du changement d\'état favori');
    }
  };

  const renderWiFiResult = () => {
    let wifiData = data;

    // Check if the data is a string and not an object
    if (typeof wifiData === 'string') {
      try {
        // Try parsing it as JSON (in case it's serialized JSON)
        wifiData = JSON.parse(wifiData);
      } catch {
        // If not JSON, treat it as a custom string format like "SSID PASSWORD"
        const wifiDataArray = wifiData.split(/\s+/);
        if (wifiDataArray.length >= 2) {
          wifiData = {
            ssid: wifiDataArray[0],
            password: wifiDataArray[1],
            type: 'WPA' // Ajout de la propriété 'type'
          } as any; // Cast pour éviter l'erreur de type
        } else {
          console.error('Erreur de parsing des données WiFi:', wifiData);
          Alert.alert('Erreur', 'Les données WiFi sont mal formatées.');
          return <TextResult data={wifiData} />;
        }
      }
    }

    if (typeof wifiData !== 'object' || !('ssid' in wifiData) || !('password' in wifiData)) {
      console.error('Données WiFi invalides:', wifiData);
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
});

export default ResultScreen;
