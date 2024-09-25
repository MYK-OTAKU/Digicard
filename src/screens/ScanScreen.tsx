import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { FontAwesome, MaterialIcons, Entypo } from '@expo/vector-icons';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { analyzeQRCode } from '../utils/analyzeQRCode';
import { postData } from '../../api'; // Assurez-vous que le chemin est correct

// Types des paramètres utilisés dans les routes de navigation
type RootStackParamList = {
  Scan: { action?: string }; // Paramètre optionnel pour indiquer l'action à effectuer lors du scan
  Result: { type: string; data: string; id: number; imageUrl: string }; // Paramètres à passer lors de la navigation vers l'écran des résultats
  History: undefined; // Aucun paramètre requis pour l'historique
  Favorites: undefined; // Aucun paramètre requis pour les favoris
};

// Composant principal pour l'écran de scan
const ScanScreen: React.FC = () => {
  // États locaux pour gérer la caméra, la torche, le zoom, etc.
  const [facing, setFacing] = useState<CameraType>('back'); // Caméra arrière par défaut
  const [torch, setTorch] = useState<boolean>(false); // La torche est désactivée par défaut
  const [zoom, setZoom] = useState(0); // Niveau de zoom initial
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null); // Dernier code scanné
  const [isScanning, setIsScanning] = useState(false); // Indicateur pour éviter les scans multiples
  const [permission, requestPermission] = useCameraPermissions(); // Permissions pour utiliser la caméra
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Navigation entre les écrans
  const route = useRoute<RouteProp<RootStackParamList, 'Scan'>>(); // Accès aux paramètres de la route actuelle

  // useEffect pour gérer les actions reçues via les paramètres de navigation
  useEffect(() => {
    if (route.params?.action) {
      if (route.params.action === 'toggleTorch') {
        toggleTorch(); // Si l'action est "toggleTorch", on active/désactive la torche
      } else if (route.params.action === 'switchCamera') {
        switchCamera(); // Si l'action est "switchCamera", on change la caméra
      } else if (route.params.action === 'zoomIn') {
        zoomIn(); // Zoom avant
      } else if (route.params.action === 'zoomOut') {
        zoomOut(); // Zoom arrière
      }
    }
	}, [route.params?.action]);

	useEffect(() => {
		// Customiser le header pour inclure les actions
		navigation.setOptions({
			headerRight: () => (
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
			),
		});
	}, [navigation, torch]);

  if (!permission) {
    return <View />;
  }

  // Si la permission n'est pas accordée, on affiche un message et un bouton pour demander la permission
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
		setTorch((current) => !current);  // Change the torch state on each button press
  };

  // Fonction pour zoomer
  const zoomIn = () => {
		setZoom((current) => (current < 1 ? current + 0.1 : 1));
  };

  // Fonction pour dézoomer
  const zoomOut = () => {
		setZoom((current) => (current > 0 ? current - 0.1 : 0));
  };

 // Gestion de l'événement de scan de code-barres
 const handleBarcodeScanned = async (scanningResult: { type: string; data: string }) => {
  if (isScanning || scanningResult.data === lastScannedCode) {
    return;
  }

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


// Fonction pour choisir une image depuis la galerie
const pickImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled) {
    console.log("Image sélectionnée :", result.assets[0].uri); // Log de l'URI de l'image
  }
};

  // Rendu de l'interface utilisateur
  return (
		<SafeAreaView style={styles.container}>
			<View style={styles.backgroundHeader} />
      <CameraView
        style={styles.camera}
				facing={facing}
				enableTorch={torch}  // Bind the torch state to the camera
				zoom={zoom}
				onBarcodeScanned={handleBarcodeScanned}
      >
        <View style={styles.scannerFrame}>
          <View style={styles.scannerFrameInner} />
        </View>
      </CameraView>

			{/* Footer pour Historique et Favoris */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('History')}>
          <FontAwesome name="history" size={24} color="black" />
          <Text>Historique</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.scanButton} onPress={pickImage}>
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
  backgroundHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'blue',
    zIndex: 0,
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
    // top: 0,
    right: 10,
    // backgroundColor: 'red',
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
