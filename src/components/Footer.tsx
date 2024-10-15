import React, { useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome, Entypo } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ThemeContext } from '../Context/ThemeContext';

type RootStackParamList = {
  Scan: undefined;
  History: undefined;
  Favorites: undefined;
};

const Footer: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    throw new Error('ThemeContext must be used within a ThemeProvider');
  }

  const { themeColor, textColor, iconColor, scanButtonColor, scanButtonIconColor } = themeContext;

  return (
    <View style={[styles.footer, { backgroundColor: themeColor }]}>
      <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('History')}>
        <FontAwesome name="history" size={24} color={iconColor} />
        <Text style={{ color: textColor }}>Historique</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.scanButton, { backgroundColor: scanButtonColor }]} onPress={() => navigation.navigate('Scan')}>
        <Entypo name="camera" size={24} color={scanButtonIconColor} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('Favorites')}>
        <FontAwesome name="heart" size={24} color={iconColor} />
        <Text style={{ color: textColor }}>Favoris</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    height: 95,
  },
  footerButton: {
    alignItems: 'center',
    flex: 1,
  },
  scanButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default Footer;