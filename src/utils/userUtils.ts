  // src/utils/userUtils.ts
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { v4 as uuidv4 } from 'uuid';

export const createRandomUser = async () => {
  const randomUser = {
    name: `User${Math.floor(Math.random() * 1000)}`,
    email: `user${Math.floor(Math.random() * 1000)}@example.com`,
    googleId: null,
    password: null,
  };

  try {
    const response = await fetch('http://votre-backend.com/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(randomUser),
    });

    const data = await response.json();
    if (data.success) {
      await AsyncStorage.setItem('userId', data.user.id.toString());
      return data.user;
    } else {
      console.error('Erreur lors de la création de l\'utilisateur :', data.message);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Erreur lors de la création de l\'utilisateur :', error.message);
    } else {
      console.error('Erreur inconnue lors de la création de l\'utilisateur');
    }
  }
};
