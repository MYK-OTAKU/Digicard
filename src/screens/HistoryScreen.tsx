import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Linking } from 'react-native';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { fetchData, toggleFavorite, deleteScan, deleteAllScans } from '../../api';
import { RootStackParamList, Scan } from '../types';
import Footer from '../components/Footer';
import { NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import moment from 'moment';
import * as LocalAuthentication from 'expo-local-authentication';

type HistoryScreenRouteProp = RouteProp<RootStackParamList, 'History'>;

const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<Scan[]>([]);
  const [originalHistory, setOriginalHistory] = useState<Scan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortOption, setSortOption] = useState<string>('date');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<HistoryScreenRouteProp>();

  useEffect(() => {
    // Customiser le header pour inclure l'icône de menu
    navigation.setOptions({
      headerRight: () => (
        <Menu>
          <MenuTrigger>
            <Icon  style={styles.iconmenu} name="more-vert" size={28} color="#4A4A4A" />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption onSelect={() => handleMenuAction('sortByDate')}>
              <Text style={styles.menuOptionText}>Trier par date</Text>
            </MenuOption>
            <MenuOption onSelect={() => handleMenuAction('sortByType')}>
              <Text style={styles.menuOptionText}>Trier par type</Text>
            </MenuOption>
            <MenuOption onSelect={() => handleMenuAction('clearHistory')}>
              <Text style={[styles.menuOptionText, { color: 'red' }]}>Vider l'historique</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      ),
    });
  }, [navigation]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    const response = await fetchData('scans/history/1');
    if (response.success) {
      setHistory(response.data.scans);
      setOriginalHistory(response.data.scans); // Save the original data
    } else {
      console.error('Error fetching history:', response.message);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  useEffect(() => {
    sortHistory(sortOption);
  }, [sortOption]);

  useEffect(() => {
    if (route.params?.action) {
      handleMenuAction(route.params.action);
    }
  }, [route.params]);

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'sortByDate':
        setSortOption('date');
        break;
      case 'sortByType':
        setSortOption('type');
        break;
      case 'clearHistory':
        handleDeleteAllScans();
        break;
      default:
        break;
    }
  };

  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to proceed',
    });
    return result.success;
  };

  const handleDeleteAllScans = async () => {
    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      Alert.alert('Authentication failed', 'Unable to delete all scans.');
      return;
    }

    Alert.alert(
      'Confirm Delete All',
      'Are you sure you want to delete all scans?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: async () => {
          const response = await deleteAllScans(1);
          if (response.success) {
            setHistory([]);
            setOriginalHistory([]);
          } else {
            Alert.alert('Erreur', response.message);
            console.error('Error deleting all scans:', response.message);
          }
        }},
      ]
    );
  };

  const handleDeleteScan = async (id: number) => {
    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      Alert.alert('Authentication failed', 'Unable to delete the scan.');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this scan?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: async () => {
          const response = await deleteScan(id);
          if (response.success) {
            setHistory((prevHistory) => prevHistory.filter((scan) => scan.id !== id));
            setOriginalHistory((prevHistory) => prevHistory.filter((scan) => scan.id !== id));
          } else {
            Alert.alert('Erreur', response.message);
            console.error(`Error deleting scan ID ${id}:`, response.message);
          }
        }},
      ]
    );
  };

  const handleToggleFavorite = async (id: number, isFavorite: boolean) => {
    const response = await toggleFavorite(id, isFavorite);
    if (response.success) {
      setHistory((prevHistory) =>
        prevHistory.map((scan) =>
          scan.id === id ? { ...scan, isFavorite: !isFavorite } : scan
        )
      );
      setOriginalHistory((prevHistory) =>
        prevHistory.map((scan) =>
          scan.id === id ? { ...scan, isFavorite: !isFavorite } : scan
        )
      );
    } else {
      Alert.alert('Erreur', response.message);
      console.error(`Error toggling favorite status for scan ID ${id}:`, response.message);
    }
  };

  const sortHistory = (option: string) => {
    let sortedHistory = [...originalHistory]; // Start with the original data
    if (option === 'date') {
      sortedHistory.sort((a, b) => {
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        return a.type.localeCompare(b.type);
      });
    } else if (option === 'type') {
      sortedHistory.sort((a, b) => {
        const typeComparison = a.type.localeCompare(b.type);
        if (typeComparison !== 0) return typeComparison;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }
    setHistory(sortedHistory);
  };

  const getIconName = (type: string) => {
    switch (type) {
      case 'WiFi':
        return 'wifi';
      case 'URL':
        return 'link';
      case 'vCard':
        return 'account-box';
      case 'SMS':
        return 'message';
      case 'Email':
        return 'email';
      case 'Geo':
        return 'location-on';
      default:
        return 'qr-code';
    }
  };

  const groupHistoryByDate = (scans: Scan[]) => {
    const grouped: { [key: string]: Scan[] } = {};
    scans.forEach(scan => {
      const date = moment(scan.date).format('YYYY-MM-DD');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(scan);
    });
    return Object.entries(grouped);
  };

  const generateUniqueId = (() => {
    let counter = 0;
    return () => {
      counter += 1;
      return `${Date.now()}-${counter}`;
    };
  })();

  const renderGroupedScans = ({ item }: { item: [string, Scan[]] }) => {
    const [date, scans] = item;
    return (
      <View key={date}>
        <Text style={styles.dateHeader}>{moment(date).format('LL')}</Text>
        {scans.map((scan, index) => renderScanCard({ item: scan, index }))}
      </View>
    );
  };

  const renderScanCard = ({ item, index }: { item: Scan, index: number }) => (
    <React.Fragment key={item.id || generateUniqueId()}>
      {(index + 1) % 4 === 0 && (
        <TouchableOpacity
          style={styles.adCard}
          onPress={() => Linking.openURL('https://mycard.digicard')}
          key={`ad-${generateUniqueId()}`}
        >
          <Text style={styles.adText}>Publicité pour notre société</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.card} onPress={() => {
        if (item.id !== undefined) {
          navigation.navigate('Result', {
            type: item.type,
            data: item.data,
            urlSafety: item.urlSafety,
            id: item.id,
            date: item.date,
            isFavorite: item.isFavorite,
            onToggleFavorite: () => handleToggleFavorite(item.id, item.isFavorite),
            imageUrl: item.imageUrl
          });
          navigation.setOptions({
            onToggleFavorite: () => handleToggleFavorite(item.id, item.isFavorite)
          });
        } else {
          console.error('Scan ID is undefined');
        }
      }}>
        <View style={styles.iconContainer}>
          <Icon name={getIconName(item.type)} size={25} color="gray" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.data}</Text>
          <Text style={styles.cardSubtitle}>{item.type}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => handleToggleFavorite(item.id, item.isFavorite)}>
            <Icon name={item.isFavorite ? "favorite" : "favorite-border"} size={25} color={item.isFavorite ? 'red' : 'gray'} />
          </TouchableOpacity>
          <Menu>
            <MenuTrigger>
              <Icon name="more-vert" size={25} color="gray" />
            </MenuTrigger>
            <MenuOptions>
              <MenuOption onSelect={() => handleDeleteScan(item.id)}>
                <Text style={styles.menuOptionText}>Supprimer</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      </TouchableOpacity>
    </React.Fragment>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={groupHistoryByDate(history)}
        keyExtractor={(item) => item[0]}
        renderItem={renderGroupedScans}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun historique trouvé.</Text>}
        contentContainerStyle={styles.listContent}
      />
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#343a40',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 10,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuOptionText: {
    padding: 10,
    fontSize: 16,
  },
  dateHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginVertical: 5,
    color: '#343a40',
  },
  adCard: {
    backgroundColor: '#e0f7fa',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  adText: {
    textAlign: 'center',
    color: '#00796b',
    fontSize: 16,
  },iconmenu :{
    marginRight : 10,
  }
});

export default HistoryScreen;
