import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

interface Scan {
    id: number;
    data: string;
    type: string;
    date: string;
    userId: number;
    favoris: boolean;
    createdAt: string;
    updatedAt: string;
}

interface ScanListProps {
    scans: Scan[];
}

const ScanList: React.FC<ScanListProps> = ({ scans }) => {
    return (
        <FlatList
            data={scans}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View style={styles.item}>
                    <Text style={styles.itemText}>{item.data}</Text>
                    <Text style={styles.itemType}>{item.type}</Text>
                </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>Aucun scan trouvé.</Text>}
        />
    );
};

const styles = StyleSheet.create({
    item: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    itemText: {
        fontSize: 18,
    },
    itemType: {
        fontSize: 14,
        color: '#888',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18,
        color: '#888',
    },
});

export default ScanList;