import { CompositeNavigationProp, DrawerNavigationProp } from '@react-navigation/drawer';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Scan: { action?: string }; // Paramètre optionnel pour indiquer l'action à effectuer lors du scan
  Result: { type: string; data: string; id: number; imageUrl: string }; // Paramètres à passer lors de la navigation vers l'écran des résultats
  History: undefined; // Aucun paramètre requis pour l'historique
  Favorites: undefined; // Aucun paramètre requis pour les favoris
};

export type ScanScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<RootStackParamList, 'Scan'>,
  StackNavigationProp<RootStackParamList>
>;
