import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Définir les types pour le contexte
interface ThemeContextType {
  themeColor: string;
  textColor: string;
  iconColor: string;
  scanButtonColor: string;
  scanButtonIconColor: string;
  changeThemeColor: (color: string, textColor: string, iconColor: string) => Promise<void>;
}

// Définir les types pour les props du fournisseur de contexte
interface ThemeProviderProps {
  children: ReactNode;
}

// Créer le contexte avec un type par défaut
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeColor, setThemeColor] = useState<string>('#ffffff'); // Couleur par défaut
  const [textColor, setTextColor] = useState<string>('#000000'); // Couleur de texte par défaut
  const [iconColor, setIconColor] = useState<string>('#000000'); // Couleur d'icône par défaut
  const [scanButtonColor, setScanButtonColor] = useState<string>('#000000'); // Couleur du bouton de scan par défaut
  const [scanButtonIconColor, setScanButtonIconColor] = useState<string>('#ffffff'); // Couleur de l'icône du bouton de scan par défaut

  useEffect(() => {
    const loadTheme = async () => {
      const savedThemeColor = await AsyncStorage.getItem('themeColor');
      const savedTextColor = await AsyncStorage.getItem('textColor');
      const savedIconColor = await AsyncStorage.getItem('iconColor');
      const savedScanButtonColor = await AsyncStorage.getItem('scanButtonColor');
      const savedScanButtonIconColor = await AsyncStorage.getItem('scanButtonIconColor');
      if (savedThemeColor && savedTextColor && savedIconColor && savedScanButtonColor && savedScanButtonIconColor) {
        setThemeColor(savedThemeColor);
        setTextColor(savedTextColor);
        setIconColor(savedIconColor);
        setScanButtonColor(savedScanButtonColor);
        setScanButtonIconColor(savedScanButtonIconColor);
      }
    };
    loadTheme();
  }, []);

  const changeThemeColor = async (color: string, textColor: string, iconColor: string) => {
    setThemeColor(color);
    setTextColor(textColor);
    setIconColor(iconColor);
    const newScanButtonColor = color === '#000000' ? '#ffffff' : '#000000'; // Blanc si le thème est noir, sinon noir
    const newScanButtonIconColor = newScanButtonColor === '#000000' ? '#ffffff' : '#000000'; // Inverse de la couleur du bouton
    setScanButtonColor(newScanButtonColor);
    setScanButtonIconColor(newScanButtonIconColor);
    await AsyncStorage.setItem('themeColor', color);
    await AsyncStorage.setItem('textColor', textColor);
    await AsyncStorage.setItem('iconColor', iconColor);
    await AsyncStorage.setItem('scanButtonColor', newScanButtonColor);
    await AsyncStorage.setItem('scanButtonIconColor', newScanButtonIconColor);
  };

  return (
    <ThemeContext.Provider value={{ themeColor, textColor, iconColor, scanButtonColor, scanButtonIconColor, changeThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
};