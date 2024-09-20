// src/types.ts
export type RootStackParamList = {
    Auth: undefined;
    Scan: { action?: string };
    Result: {
        type: string;
        data: string;
        urlSafety?: any; // urlSafety est optionnel
        id: number;
        date: string;
        isFavorite: boolean;
        onToggleFavorite: () => void; // Ajout de la propriété onToggleFavorite
        imageUrl: string; // Ajout de la propriété imageUrl
    };
    History: { action?: string }; // Ajout de l'action ici
    Favorites: { action?: string }; // Ajout de l'action ici
    User: undefined; // Ajout de User
    Settings: undefined; // Ajout de Settings
    FingerprintAuth: undefined; // Ajout de FingerprintAuth
};

export interface Scan {
    id: number;
    data: string;
    type: string;
    date: string;
    userId: number;
    isFavorite: boolean;
    urlSafety: JSON;
    imageUrl: string; // Ajout de la propriété imageUrl
}