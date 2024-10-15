import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { FontAwesome, MaterialIcons, Entypo } from '@expo/vector-icons';
import { analyzeQRCode } from '../utils/analyzeQRCode';
import { postData } from '../../api'; // Assurez-vous que le chemin est correct
import { StackNavigationProp } from '@react-navigation/stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { CompositeNavigationProp } from '@react-navigation/native';
import { ThemeContext } from '../Context/ThemeContext';

// Définir les types de navigation
type ScanScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<{
    Result: { type: string; data: any; id: any; imageUrl: any };
  }>,
  StackNavigationProp<{
    Result: { type: string; data: any; id: any; imageUrl: any };
  }>
>;

// Définir les props du composant
type Props = {
  navigation: ScanScreenNavigationProp;
};

const ScanScreen: React.FC<Props> = ({ navigation }) => {
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    throw new Error('ThemeContext must be used within a ThemeProvider');
  }

  const { themeColor, textColor, iconColor, scanButtonColor, scanButtonIconColor } = themeContext;
  const [facing, setFacing] = useState<CameraType>('back');
  const [torch, setTorch] = useState<boolean>(false);
  const [zoom, setZoom] = useState(0);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container2}>
        <Text style={styles.message}>Nous avons besoin de la permission pour utiliser la caméra</Text>
        <Button onPress={requestPermission} title="Autoriser la caméra" />
      </View>
    );
  }

  const switchCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleTorch = () => {
    setTorch((current) => !current);
  };

  const zoomIn = () => {
    console.log('Zoom avant');
    setZoom((current) => (current < 1 ? current + 0.1 : 1));
  };

  const zoomOut = () => {
    console.log('Zoom arrière');
    setZoom((current) => (current > 0 ? current - 0.1 : 0));
  };

  const handleBarcodeScanned = async (scanningResult: { type: string; data: string }) => {
    if (isScanning || scanningResult.data === lastScannedCode) {
      return;
    }

    console.log('Code-barres scanné :', scanningResult.data);

    setIsScanning(true);
    setLastScannedCode(scanningResult.data);

    const { type, content } = analyzeQRCode(scanningResult.data);

    try {
      const response = await postData('scans', { type, data: scanningResult.data, userId: 1 });
      if (response.success) {
        navigation.navigate('Result', { type, data: content, id: response.scanId, imageUrl: response.imageUrl });
      } else {
        Alert.alert('Erreur', response.message);
      }
    } catch (error) {
      console.error("Erreur lors de la requête ! " + error);
      Alert.alert('Erreur', 'Échec du traitement du scan.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColor }]}>
      <View style={[styles.header, { backgroundColor: 'transparent' }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconButton}>
          <MaterialIcons name="menu" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>
      <CameraView
        style={styles.camera}
        facing={facing}
        enableTorch={torch}
        zoom={zoom}
        onBarcodeScanned={handleBarcodeScanned}
      >
        <View style={styles.scannerFrame}>
          <View style={styles.scannerFrameInner} />
        </View>
      </CameraView>

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.iconButton} onPress={toggleTorch}>
          <MaterialIcons name={torch ? "flash-off" : "flash-on"} size={24} color={iconColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={switchCamera}>
          <MaterialIcons name="rotate-right" size={24} color={iconColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={zoomIn}>
          <MaterialIcons name="zoom-in" size={24} color={iconColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={zoomOut}>
          <MaterialIcons name="zoom-out" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>

      <View style={[styles.footer, { backgroundColor: themeColor }]}>
        <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('History')}>
          <FontAwesome name="history" size={24} color={textColor} />
          <Text style={{ color: textColor }}>Historique</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.scanButton, { backgroundColor: scanButtonColor }]}>
          <Entypo name="image" size={24} color={scanButtonIconColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('Favorites')}>
          <FontAwesome name="heart" size={24} color={textColor} />
          <Text style={{ color: textColor }}>Favoris</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'transparent', // Rendre le header transparent
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  scannerFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrameInner: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#00FF00',
    borderRadius: 10,
  },
  headerActions: {
    position: 'absolute',
    top: 30,
    right: 10,
    flexDirection: 'row',
    zIndex: 100004,
  },
  iconButton: {
    padding: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    // borderTopWidth: 1,
    borderTopColor: '#ddd',
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
  container2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 20,
  },
});

export default ScanScreen;