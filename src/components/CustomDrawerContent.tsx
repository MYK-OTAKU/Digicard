import React, { useContext } from 'react';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeContext } from '../Context/ThemeContext';

const CustomDrawerContent = (props: any) => {
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    throw new Error('ThemeContext must be used within a ThemeProvider');
  }

  const { textColor,themeColor, iconColor } = themeContext;

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/Designer.jpeg')} // Chemin relatif à votre image locale
          style={styles.profileImage}
        />
        <Text style={[styles.profileName, { color: themeColor }]}>Digicard-Qr-Code-Scanner</Text>
      </View>
      <DrawerItemList {...props} />
      {/* <DrawerItem
        label="Déconnexion"
        icon={({ color, size }) => (
          <MaterialIcons name="logout" size={size} color={color} />
        )}
        onPress={() => alert('Déconnexion')}
      /> */}
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CustomDrawerContent;