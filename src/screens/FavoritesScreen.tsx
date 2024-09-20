// src/screens/FavoritesScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { fetchData, toggleFavorite, deleteScan } from '../../api';
import { RootStackParamList, Scan } from '../types';
import Footer from '../components/Footer';
import { NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import moment from 'moment';

type FavoritesScreenRouteProp = RouteProp<RootStackParamList, 'Favorites'>;

const FavoritesScreen: React.FC = () => {
    const [favorites, setFavorites] = useState<Scan[]>([]);
    const [originalFavorites, setOriginalFavorites] = useState<Scan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [sortOption, setSortOption] = useState<string>('date');
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<FavoritesScreenRouteProp>();

    const fetchFavorites = useCallback(async () => {
        setLoading(true);
        const response = await fetchData('scans/favorites/1'); // Replace with current user ID
        if (response.success) {
            setFavorites(response.data.scans);
            setOriginalFavorites(response.data.scans); // Save the original data
        } else {
            console.error('Error fetching favorites:', response.message);
        }
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchFavorites();
        }, [fetchFavorites])
    );

    useEffect(() => {
        sortFavorites(sortOption);
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
            default:
                break;
        }
    };

    const handleToggleFavorite = async (id: number, isFavorite: boolean) => {
        const response = await toggleFavorite(id, isFavorite);
        if (response.success) {
            setFavorites((prevFavorites) =>
                prevFavorites.map((scan) =>
                    scan.id === id ? { ...scan, isFavorite: !isFavorite } : scan
                )
            );
            setOriginalFavorites((prevFavorites) =>
                prevFavorites.map((scan) =>
                    scan.id === id ? { ...scan, isFavorite: !isFavorite } : scan
                )
            );
        } else {
            Alert.alert('Erreur', response.message);
            console.error(`Error toggling favorite status for scan ID ${id}:`, response.message);
        }
    };

    const handleDeleteScan = async (id: number) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this scan?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes', onPress: async () => {
                    const response = await deleteScan(id);
                    if (response.success) {
                        setFavorites((prevFavorites) => prevFavorites.filter((scan) => scan.id !== id));
                        setOriginalFavorites((prevFavorites) => prevFavorites.filter((scan) => scan.id !== id));
                    } else {
                        Alert.alert('Erreur', response.message);
                        console.error(`Error deleting scan ID ${id}:`, response.message);
                    }
                }},
            ]
        );
    };

    const sortFavorites = (option: string) => {
        let sortedFavorites = [...originalFavorites]; // Start with the original data
        if (option === 'date') {
            sortedFavorites.sort((a, b) => {
                const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
                if (dateComparison !== 0) return dateComparison;
                return a.type.localeCompare(b.type); // Secondary sort by type
            });
        } else if (option === 'type') {
            sortedFavorites.sort((a, b) => {
                const typeComparison = a.type.localeCompare(b.type);
                if (typeComparison !== 0) return typeComparison;
                return new Date(b.date).getTime() - new Date(a.date).getTime(); // Secondary sort by date
            });
        }
        setFavorites(sortedFavorites);
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

    const renderFavoriteCard = ({ item, index }: { item: Scan, index: number }) => (
        <>
            {(index + 1) % 4 === 0 && (
                <View style={styles.adCard}>
                    <Text style={styles.adText}>Publicité pour notre société</Text>
                </View>
            )}
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Result', { 
                type: item.type, 
                data: item.data, 
                urlSafety: item.urlSafety, 
                id: item.id, 
                date: item.date, // Ajout de la propriété date
                isFavorite: item.isFavorite, // Ajout de la propriété isFavorite
                onToggleFavorite: () => handleToggleFavorite(item.id, item.isFavorite),
                imageUrl: item.imageUrl // Ajout de la propriété imageUrl
            })}>
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
        </>
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
                data={favorites}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderFavoriteCard}
                ListEmptyComponent={<Text style={styles.emptyText}>Aucun favori trouvé.</Text>}
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
        marginLeft: 8,
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
    },
});

export default FavoritesScreen;