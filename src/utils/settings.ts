import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../settings.json'; // Charger le fichier settings.json

const SETTINGS_KEY = 'app_settings';

// Fonction pour charger les paramètres
export const loadSettings = async () => {
  try {
    console.log('Attempting to load settings from AsyncStorage...');
    
    // Charger depuis AsyncStorage
    const settings = await AsyncStorage.getItem(SETTINGS_KEY);
    if (settings) {
      console.log('Settings loaded from AsyncStorage:', JSON.parse(settings));
      return JSON.parse(settings);
    }
    
    // Si rien n'est trouvé dans AsyncStorage, on utilise settings.json comme fallback
    console.log('No settings found in AsyncStorage. Using settings.json as fallback:', config);
    return config;

  } catch (error) {
    // En cas d'erreur, retourner les paramètres par défaut et loguer l'erreur
    console.error('Error loading settings from AsyncStorage:', error);
    console.log('Returning settings from settings.json as fallback:', config);
    return config; // Retourne les paramètres par défaut en cas d'erreur
  }
};

// Fonction pour sauvegarder les paramètres
export const saveSettings = async (newSettings: any) => {
  try {
    console.log('Attempting to save settings to AsyncStorage:', newSettings);
    
    // Sauvegarder dans AsyncStorage
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    
    console.log('Settings successfully saved to AsyncStorage.');

  } catch (error) {
    // En cas d'erreur, loguer l'erreur
    console.error('Error saving settings to AsyncStorage:', error);
  }
};
