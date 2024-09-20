// src/screens/ResultScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
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

  const handleCheckSafety = async () => {
    if (!id) {
      Alert.alert('Erreur', 'L\'ID du scan est manquant');
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
        setFavorite(!favorite); // Inverse l'état du favori
        Alert.alert('Succès', result.message);
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Échec du changement d\'état favori');
    }
  };

  // Fonction pour afficher le résultat du scan en fonction de son type
  const renderResult = () => {
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
        if (typeof data !== 'string' || !data.includes(' ')) {
          // Check if data is valid before attempting to split
          Alert.alert('Erreur', 'Les données WiFi sont mal formatées');
          return <TextResult data={data} />;
        }

        const wifiDataArray = data.split(/\s+/); // Utilise un `split` sécurisé pour les WiFi
        if (wifiDataArray.length < 2) {
          Alert.alert('Erreur', 'Les données WiFi sont mal formatées');
          return <TextResult data={data} />;
        }

        return (
          <WiFiResult
            data={JSON.stringify({ ssid: wifiDataArray[0], password: wifiDataArray[1] })}
            date={date}
            isFavorite={favorite}
            onToggleFavorite={handleToggleFavorite}
          />
        );
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
