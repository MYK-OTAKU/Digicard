import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { FontAwesome, MaterialIcons, Entypo } from '@expo/vector-icons';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { analyzeQRCode } from '../utils/analyzeQRCode';
import { postData } from '../../api';

type RootStackParamList = {
  Scan: { action?: string };
  Result: { type: string; data: string; id: number; imageUrl: string };
  History: undefined;
  Favorites: undefined;
};

const ScanScreen: React.FC = () => {
	const [facing, setFacing] = useState<CameraType>('back');
	const [torch, setTorch] = useState<boolean>(false);
	const [zoom, setZoom] = useState(0);
	const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
	const [isScanning, setIsScanning] = useState(false);
	const [permission, requestPermission] = useCameraPermissions();
	const navigation = useNavigation<NavigationProp<RootStackParamList>>();
	const route = useRoute<RouteProp<RootStackParamList, 'Scan'>>();

	useEffect(() => {
		if (route.params?.action) {
			if (route.params.action === 'toggleTorch') {
				toggleTorch();
			} else if (route.params.action === 'switchCamera') {
				switchCamera();
			} else if (route.params.action === 'zoomIn') {
				zoomIn();
			} else if (route.params.action === 'zoomOut') {
				zoomOut();
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

	if (!permission.granted) {
		return (
			<View style={styles.container2}>
				<Text style={styles.message}>Nous avons besoin de la permission pour utiliser la caméra</Text>
				<Button onPress={requestPermission} title="Autoriser la caméra" />
			</View>
		);
	}

	const switchCamera = () => {
		setFacing((current) => (current === 'back' ? 'front' : 'back'));
	};

	const toggleTorch = () => {
		setTorch((current) => !current);  // Change the torch state on each button press
	};

	const zoomIn = () => {
		setZoom((current) => (current < 1 ? current + 0.1 : 1));
	};

	const zoomOut = () => {
		setZoom((current) => (current > 0 ? current - 0.1 : 0));
	};

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

	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});

		if (!result.canceled) {
			console.log("Image sélectionnée :", result.assets[0].uri);
		}
	};

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
