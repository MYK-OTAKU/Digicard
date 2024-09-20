export const analyzeQRCode = (data: string): { type: string, content: any } => {
    // Vérification des URLs
    if (isValidURL(data)) {
        return { type: 'URL', content: data };
    } 
    // Vérification des informations Wi-Fi avec un format non standard
    else if (isPotentialWiFi(data)) {
        const wifiData = parseWiFiData(data);
        if (wifiData) {
            return { type: 'WiFi', content: wifiData };
        } else {
            return { type: 'Text', content: data }; // Si le parsing échoue, traiter comme du texte
        }
    }
    // Vérification des vCards
    else if (data.includes('BEGIN:VCARD')) {
        const vCardData = parseVCardData(data);
        return { type: 'vCard', content: vCardData };
    } 
    // Vérification des SMS
    else if (data.startsWith('SMSTO:')) {
        const smsData = parseSMSData(data);
        return { type: 'SMS', content: smsData };
    } 
    // Vérification des emails
    else if (data.startsWith('mailto:')) {
        const emailData = parseEmailData(data);data.split
        return { type: 'Email', content: emailData };
    } 
    // Vérification des coordonnées géographiques
    else if (data.startsWith('geo:')) {
        const geoData = parseGeoData(data);
        return { type: 'Geo', content: geoData };
    } 
    // Cas général de texte
    else {
        return { type: 'Text', content: data };
    }
};

const isValidURL = (data: string) => {
    const urlPattern = new RegExp('^(https?:\\/\\/)?' + // protocole
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domaine
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // IP
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port et chemin
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // requête
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment
    return !!urlPattern.test(data);
};

const isPotentialWiFi = (data: string) => {
    const wifiPattern = /^(.+)\s(.+)$/;
    return wifiPattern.test(data);
};

const parseWiFiData = (data: string) => {
    console.log('Parsing WiFi data:', data);

    // Tentative de parsing du format standard
    const standardMatch = data.match(/^WIFI:T:(.*?);S:(.*?);P:(.*?);H:(.*?);;$/);
    if (standardMatch) {
        const parsedData = {
            type: standardMatch[1],
            ssid: standardMatch[2],
            password: standardMatch[3],
            hidden: standardMatch[4] === 'true'
        };
        console.log('Parsed standard WiFi data:', parsedData);
        return parsedData;
    }

    // Tentative de parsing du format non standard (SSID suivi de mot de passe)
    const nonStandardMatch = data.match(/^(.+)\s(.+)$/);
    if (nonStandardMatch) {
        const parsedData = {
            ssid: nonStandardMatch[1],
            password: nonStandardMatch[2]
        };
        console.log('Parsed non-standard WiFi data:', parsedData);
        return parsedData;
    }

    console.log('Failed to parse WiFi data');
    return null;
};

const parseVCardData = (data: string) => {
    // Parsing de données vCard
    return data;
};

const parseSMSData = (data: string) => {
    const match = data.match(/^SMSTO:(.*?):(.*?)$/);
    if (match) {
        return {
            phoneNumber: match[1],
            message: match[2]
        };
    }
    return null;
};

const parseEmailData = (data: string) => {
    const match = data.match(/^mailto:(.*?)(\?subject=(.*?)&body=(.*?))?$/);
    if (match) {
        return {
            email: match[1],
            subject: match[3] || '',
            body: match[4] || ''
        };
    }
    return null;
};

const parseGeoData = (data: string) => {
    const match = data.match(/^geo:(.*?),(.*?)$/);
    if (match) {
        return {
            latitude: match[1],
            longitude: match[2]
        };
    }
    return null;
};
