import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ResultProps {
    data: string;
}

export const SMSResult: React.FC<ResultProps> = ({ data }) => (
    <View style={styles.container}>
        <View style={styles.header}>
            <MaterialIcons name="message" size={24} color="black" />
            <Text style={styles.title}>SMS</Text>
        </View>
        <Text style={styles.dataText}>{data}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f5f5f5',
        marginBottom: 20,
        borderRadius: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 12,
    },
    dataText: {
        fontSize: 18,
        color: '#4a4a4a',
        marginBottom: 20,
        lineHeight: 26,
    },
});