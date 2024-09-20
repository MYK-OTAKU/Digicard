// src/screens/UserScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Alert } from 'react-native';

const UserScreen: React.FC = () => {
  const [user, setUser] = useState({ name: '', email: '' });

  useEffect(() => {
    // Fetch user data from backend
    fetch('http://192.168.11.109:3100/api/user/1') // Remplacez par l'ID de l'utilisateur connecté
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        } else {
          Alert.alert('Error', data.message);
        }
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  }, []);

  const handleUpdate = () => {
    // Update user data in backend
    fetch('http://192.168.11.109:3100/api/user/1', { // Remplacez par l'ID de l'utilisateur connecté
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          Alert.alert('Success', 'User updated successfully');
        } else {
          Alert.alert('Error', data.message);
        }
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={user.name}
        onChangeText={(text) => setUser({ ...user, name: text })}
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={user.email}
        onChangeText={(text) => setUser({ ...user, email: text })}
      />
      <Button title="Update" onPress={handleUpdate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default UserScreen;