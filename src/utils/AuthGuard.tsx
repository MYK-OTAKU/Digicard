// src/utils/AuthGuard.tsx
import React, { useEffect, ReactNode } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigation = useNavigation();
  const { isAuthenticated, checkAuthStatus, isAuthEnabled } = useContext(AuthContext);

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (isAuthEnabled) { // Vérifie si l'authentification est activée
        await checkAuthStatus();
        if (!isAuthenticated) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'FingerprintAuth' as never }],
          });
        }
      }
    };

    checkAndRedirect();
  }, [isAuthenticated, isAuthEnabled]);

  // Si l'authentification n'est pas activée, le composant affiche simplement les enfants
  if (!isAuthEnabled) {
    return <>{children}</>;
  }

  // Si l'authentification est activée, attendre la vérification de l'authentification
  return isAuthenticated ? <>{children}</> : null;
};

export default AuthGuard;
