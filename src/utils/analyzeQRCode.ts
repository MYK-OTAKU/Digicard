export const analyzeQRCode = (data: string): { type: string, content: any } => {
    console.log("Analyzing QR Code data:", data);

    // Vérification des URLs
    if (isValidURL(data)) {
        console.log("QR Code detected as a URL:", data);
        return { type: 'URL', content: data };
    } 
    // Vérification des informations Wi-Fi avec un format non standard
    else if (isPotentialWiFi(data)) {
        console.log("QR Code detected as potential WiFi data:", data);
        const wifiData = parseWiFiData(data);
        if (wifiData) {
            console.log("Parsed WiFi data:", wifiData);
            return { type: 'WiFi', content: wifiData };
        } else {
            console.warn("WiFi data parsing failed, treating as text:", data);
            return { type: 'Text', content: data };
        }
    }
    // Vérification des vCards
    else if (data.includes('BEGIN:VCARD')) {
        console.log("QR Code detected as a vCard:", data);
        const vCardData = parseVCardData(data);
        return { type: 'vCard', content: vCardData };
    } 
    // Vérification des SMS
    else if (data.startsWith('SMSTO:')) {
        console.log("QR Code detected as SMS:", data);
        const smsData = parseSMSData(data);
        return { type: 'SMS', content: smsData };
    } 
    // Vérification des emails
    else if (data.startsWith('mailto:')) {
        console.log("QR Code detected as Email:", data);
        const emailData = parseEmailData(data);
        return { type: 'Email', content: emailData };
    } 
    // Vérification des coordonnées géographiques
    else if (data.startsWith('geo:')) {
        console.log("QR Code detected as Geo:", data);
        const geoData = parseGeoData(data);
        return { type: 'Geo', content: geoData };
    } 
    // Cas général de texte
    else {
        console.log("QR Code detected as general text:", data);
        return { type: 'Text', content: data };
    }
};

// Vérifie si une URL est valide
const isValidURL = (data: string) => {
    const urlPattern = new RegExp('^(https?:\\/\\/)?' + // protocole
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domaine
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // IP
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port et chemin
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // requête
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment
    const result = !!urlPattern.test(data);
    console.log(`isValidURL: ${result} for data: ${data}`);
    return result;
};

const isPotentialWiFi = (data: string) => {
    const wifiPattern = /^(.+)\s(.+)$/;
    const result = wifiPattern.test(data);
    console.log(`isPotentialWiFi: ${result} for data: ${data}`);
    return result;
};

// Parse les informations d'un QR code Wi-Fi
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
            password: nonStandardMatch[2],
            type: 'WPA'
        };
        console.log('Parsed non-standard WiFi data:', parsedData);
        return parsedData;
    }

    console.warn('Failed to parse WiFi data:', data);
    return null;
};

// Parse les données vCard
const parseVCardData = (data: string) => {
    // Parsing de données vCard
    return data;
};

// Parse les données SMS
const parseSMSData = (data: string) => {
    const match = data.match(/^SMSTO:(.*?):(.*?)$/);
    return match ? { phoneNumber: match[1], message: match[2] } : null;
};
const parseEmailData = (data: string) => {
    const match = data.match(/^mailto:(.*?)(\?subject=(.*?)&body=(.*?))?$/);
    return match ? { email: match[1], subject: match[3] || '', body: match[4] || '' } : null;
};
const parseGeoData = (data: string) => {
    const match = data.match(/^geo:(.*?),(.*?)$/);
    return match ? { latitude: match[1], longitude: match[2] } : null;
};
