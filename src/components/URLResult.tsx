import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as Clipboard from 'expo-clipboard';

interface URLResultProps {
    data: string;
    onCheckSafety: () => void; // Fonction pour vérifier la sécurité
    urlSafety: any; // Données de sécurité de l'URL
    type: string; // Type de résultat (doit être 'URL' pour afficher les options de sécurité)
    date: string;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    id: number; // ID du scan
}

const openURL = (url: string) => {
    Linking.openURL(url).catch((err) => Alert.alert('Error', 'Failed to open URL'));
};

const copyToClipboard = (url: string) => {
    Clipboard.setString(url);
    Alert.alert('Copied', 'URL copied to clipboard');
};

const shareURL = async (url: string) => {
    try {
        await Share.share({
            message: `Check out this URL: ${url}`,
        });
    } catch (error) {
        Alert.alert('Error', 'Failed to share URL');
    }
};

export const URLResult: React.FC<URLResultProps> = ({ data, onCheckSafety, urlSafety, isFavorite, onToggleFavorite, date, id }) => {
    const [isSafe, setIsSafe] = useState(urlSafety?.safe);
    const isMalicious = urlSafety && urlSafety.stats.malicious > 0;
    const isSuspicious = urlSafety && urlSafety.stats.suspicious > 0;

    return (
        <View style={[
            styles.container,
            !urlSafety ? styles.initialContainer :
            isSafe ? styles.safeContainer :
            isMalicious ? styles.maliciousContainer : styles.suspiciousContainer
        ]}>
            <View style={styles.header}>
                <MaterialIcons name="link" size={24} color={isSafe ? "#4CAF50" : isMalicious ? "#F44336" : isSuspicious ? "#FF9800" : "#2196F3"} />
                <Text style={styles.title}>URL</Text>
                <Text style={styles.date}>{date}</Text>
            </View>

            <View style={styles.contentSection}>
                <Text style={styles.dataText}>{data}</Text>
            </View>

            {!urlSafety && (
                <View style={styles.initialActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={onCheckSafety}>
                        <FontAwesome name="shield" size={24} color="white" />
                        <Text style={styles.buttonText}>Check Safety</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={onToggleFavorite}>
                        <MaterialIcons name={isFavorite ? "favorite" : "favorite-border"} size={24} color="white" />
                        <Text style={styles.buttonText}>{isFavorite ? "Unfavorite" : "Favorite"}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {urlSafety && (
                <View style={styles.actionsSection}>
                    {isSafe && (
                        <>
                            <TouchableOpacity style={styles.actionButton} onPress={() => openURL(data)}>
                                <FontAwesome name="external-link" size={24} color="white" />
                                <Text style={styles.buttonText}>Open URL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={() => copyToClipboard(data)}>
                                <FontAwesome name="copy" size={24} color="white" />
                                <Text style={styles.buttonText}>Copy URL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={() => shareURL(data)}>
                                <FontAwesome name="share" size={24} color="white" />
                                <Text style={styles.buttonText}>Share URL</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    {!isSafe && (
                        <TouchableOpacity style={[styles.actionButton, styles.warningButton]} onPress={() => openURL(data)}>
                            <FontAwesome name="exclamation-triangle" size={24} color="white" />
                            <Text style={styles.buttonText}>Proceed with Caution</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {urlSafety && (
                <View style={styles.safetyContainer}>
                    <Text style={styles.safetyText}>Safety: {urlSafety.message}</Text>
                    <Text style={styles.safetyText}>Malicious: {urlSafety.stats.malicious}</Text>
                    <Text style={styles.safetyText}>Suspicious: {urlSafety.stats.suspicious}</Text>
                    {/* <TouchableOpacity
                        style={[styles.actionButton, isSafe ? styles.dangerButton : styles.safeButton]}
                        onPress={handleToggleUrlSafety}
                    >
                        <Text style={styles.buttonText}>
                            {isSafe ? "Marquer Dangereux" : "Marquer Sûr"}
                        </Text>
                    </TouchableOpacity> */}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        marginBottom: 20,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
    },
    initialContainer: {
        borderColor: '#2196F3',
        borderWidth: 1,
        shadowColor: '#2196F3',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    safeContainer: {
        borderColor: '#4CAF50',
        shadowColor: '#4CAF50',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    maliciousContainer: {
        borderColor: '#F44336',
        shadowColor: '#F44336',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    suspiciousContainer: {
        borderColor: '#FF9800',
        shadowColor: '#FF9800',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#333',
    },
    date: {
        marginLeft: 'auto',
        fontSize: 12,
        color: '#777',
    },
    contentSection: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    dataText: {
        fontSize: 18,
        color: '#333',
        marginBottom: 15,
        lineHeight: 22,
    },
    actionsSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    initialActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    actionButton: {
        alignItems: 'center',
        backgroundColor: '#1E88E5',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 10,
        minWidth: 80,
    },
    warningButton: {
        backgroundColor: '#FF9800',
    },
    safeButton: {
        backgroundColor: '#4CAF50',
    },
    dangerButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: 'white',
        marginTop: 5,
        fontSize: 12,
        textAlign: 'center',
    },
    safetyContainer: {
        marginTop: 15,
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#FAFAFA',
        borderColor: '#E0E0E0',
        borderWidth: 1,
    },
    safetyText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
    },
});

export default URLResult;
