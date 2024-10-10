import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { FontAwesome, MaterialIcons, Entypo } from '@expo/vector-icons';
import { analyzeQRCode } from '../utils/analyzeQRCode';
import { postData } from '../../api'; // Assurez-vous que le chemin est correct
import { StackNavigationProp } from '@react-navigation/stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { CompositeNavigationProp } from '@react-navigation/native';

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
  // États locaux pour gérer la caméra, la torche, le zoom, etc.
  const [facing, setFacing] = useState<CameraType>('back'); // Caméra arrière par défaut
  const [torch, setTorch] = useState<boolean>(false); // La torche est désactivée par défaut
  const [zoom, setZoom] = useState(0); // Niveau de zoom initial
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null); // Dernier code scanné
  const [isScanning, setIsScanning] = useState(false); // Indicateur pour éviter les scans multiples
  const [permission, requestPermission] = useCameraPermissions(); // Permissions pour utiliser la caméra

  // Vérification des permissions
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

  // Fonction pour changer la caméra (avant/arrière)
  const switchCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Fonction pour activer/désactiver la torche
  const toggleTorch = () => {
    setTorch((current) => !current);  // Change l'état de la torche à chaque pression de bouton
  };

  // Fonction pour zoomer
  const zoomIn = () => {
    console.log('Zoom avant');
    setZoom((current) => (current < 1 ? current + 0.1 : 1));
  };

  // Fonction pour dézoomer
  const zoomOut = () => {
    console.log('Zoom arrière');
    setZoom((current) => (current > 0 ? current - 0.1 : 0));
  };

  // Gestion de l'événement de scan de code-barres
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

  // Rendu de l'interface utilisateur
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconButton}>
          <MaterialIcons name="menu" size={24} color="white" />
        </TouchableOpacity>
        {/* <Text style={styles.headerTitle}>Scan Screen</Text> */}
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

      {/* Boutons d'action positionnés au-dessus du header */}
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.iconButton} onPress={toggleTorch}>
          <MaterialIcons name={torch ? "flash-off" : "flash-on"} size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={switchCamera}>
          <MaterialIcons name="rotate-right" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={zoomIn}>
          <MaterialIcons name="zoom-in" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={zoomOut}>
          <MaterialIcons name="zoom-out" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Footer pour Historique et Favoris */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('History')}>
          <FontAwesome name="history" size={24} color="black" />
          <Text>Historique</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.scanButton}>
          <Entypo name="image" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('Favorites')}>
          <FontAwesome name="heart" size={24} color="black" />
          <Text>Favoris</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


// Styles pour le composant
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute', // Positionner le header de manière absolue
    top: 30, // Placer le header en haut
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'headerTransparent', // Couleur de fond bleue avec transparence
    // padding: 10,
    zIndex: 1000, // Assurez-vous que le header est au-dessus des autres éléments
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    marginLeft: 10,
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
    top: 30, // Ajustez la position selon vos besoins
    right: 10,
    flexDirection: 'row',
    zIndex: 100004, // Assurez-vous que les boutons sont au-dessus des autres éléments
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
    backgroundColor: '#f8f8f8',
    paddingVertical: 10,
    borderTopWidth: 1,
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
    backgroundColor: '#000',
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