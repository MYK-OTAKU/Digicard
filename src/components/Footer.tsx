import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome, Entypo } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  Scan: undefined;
  History: undefined;
  Favorites: undefined;
};

const Footer: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('History')}>
        <FontAwesome name="history" size={24} color="black" />
        <Text>Historique</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('Scan')}>
        <Entypo name="camera" size={24} color="white" />
        {/* <Text>Scan</Text> */}
        
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('Favorites')}>
        <FontAwesome name="heart" size={24} color="black" />
        <Text>Favoris</Text>
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
    backgroundColor: '#f8f8f8',
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
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:20,
    textDecorationColor:'white',
  },
});

export default Footer;