import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons'; // Icons

interface URLResultProps {
    data: string;
    onCheckSafety: () => void;
    urlSafety: any; // or the appropriate type for urlSafety
}

interface ResultProps {
    data: string;
}

export const WiFiResult: React.FC<ResultProps> = ({ data }) => {
    let wifiData;

    try {
        // Tentative de parsing du JSON
        wifiData = JSON.parse(data);
    } catch (error) {
        console.error("Invalid JSON:", error);
        return (
            <View style={styles.container}>
                <Text style={styles.dataText}>Error: Invalid WiFi data format.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <MaterialIcons name="wifi" size={24} color="black" />
                <Text style={styles.title}>WiFi</Text>
            </View>
            <Text style={styles.dataText}>{`SSID: ${wifiData.ssid}`}</Text>
            <Text style={styles.dataText}>{`Password: ${wifiData.password}`}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button}>
                    <MaterialIcons name="wifi" size={24} color="black" />
                    <Text>Connect</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <MaterialIcons name="content-copy" size={24} color="black" />
                    <Text>Copy Password</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <FontAwesome name="share-square" size={24} color="black" />
                    <Text>Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};


export const VCardResult: React.FC<ResultProps> = ({ data }) => (
    <View style={styles.container}>
        <View style={styles.header}>
            <FontAwesome name="address-card" size={24} color="black" />
            <Text style={styles.title}>vCard</Text>
        </View>
        <Text style={styles.dataText}>{data}</Text>
    </View>
);

export const SMSResult: React.FC<ResultProps> = ({ data }) => (
    <View style={styles.container}>
        <View style={styles.header}>
            <MaterialIcons name="message" size={24} color="black" />
            <Text style={styles.title}>SMS</Text>
        </View>
        <Text style={styles.dataText}>{data}</Text>
    </View>
);

export const EmailResult: React.FC<ResultProps> = ({ data }) => (
    <View style={styles.container}>
        <View style={styles.header}>
            <MaterialIcons name="email" size={24} color="black" />
            <Text style={styles.title}>Email</Text>
        </View>
        <Text style={styles.dataText}>{data}</Text>
    </View>
);

export const GeoResult: React.FC<ResultProps> = ({ data }) => (
    <View style={styles.container}>
        <View style={styles.header}>
            <MaterialIcons name="location-on" size={24} color="black" />
            <Text style={styles.title}>Geo</Text>
        </View>
        <Text style={styles.dataText}>{data}</Text>
    </View>
);

export const TextResult: React.FC<ResultProps> = ({ data }) => (
    <View style={styles.container}>
        <View style={styles.header}>
            <MaterialIcons name="text-fields" size={24} color="black" />
            <Text style={styles.title}>Text</Text>
        </View>
        <Text style={styles.dataText}>{data}</Text>
    </View>
);
const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f5f5f5', // Fond doux
        marginBottom: 20,
        borderRadius: 15, // Bords plus arrondis
        elevation: 5, // Ombre légère pour un effet de profondeur
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15, // Plus d'espace
    },
    title: {
        fontSize: 22, // Police légèrement plus grande
        fontWeight: 'bold',
        color: '#333', // Couleur de texte douce
        marginLeft: 12, // Plus d'espace entre l'icône et le texte
    },
    dataText: {
        fontSize: 18,
        color: '#4a4a4a', // Texte légèrement gris pour un contraste doux
        marginBottom: 20,
        lineHeight: 26, // Meilleure lisibilité avec un espacement de ligne
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly', // Espacement égal des boutons
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8e8e8', // Couleur de bouton plus douce
        padding: 12, // Un peu plus d'espace pour toucher
        borderRadius: 10, // Bords arrondis
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    safetyContainer: {
        marginTop: 25,
        backgroundColor: '#fafafa', // Zone de sécurité avec un fond distinct
        padding: 15,
        borderRadius: 10,
    },
    safetyText: {
        fontSize: 16,
        color: '#5a5a5a',
        marginBottom: 5,
    },
});
