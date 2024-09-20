import axios from 'axios';

const API_KEY = 'f3e65a1011434189597210989cea6dfee7799537ed3ab2ef6adb71bc0649bc0e';

export const checkUrlSafety = async (url: string) => {
    const apiUrl = `https://www.virustotal.com/api/v3/urls`;

    try {
        const response = await axios.post(apiUrl, { url }, {
            headers: {
                'x-apikey': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error checking URL safety:', error);
        throw new Error('Error checking URL safety');
    }
};