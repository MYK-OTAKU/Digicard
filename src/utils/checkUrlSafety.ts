import axios from 'axios';

const API_URL = 'http://localhost:3100/api/scans/analyse'; // Assurez-vous que l'URL est correcte

export const checkUrlSafety = async (url: string, scanId: number) => {
    try {
        console.log('Sending request to:', API_URL);
        const response = await axios.post(API_URL, { url, scanId });
        console.log('Response received:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error checking URL safety:', error);
        throw new Error('Error checking URL safety');
    }
};