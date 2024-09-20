// src/components/AuthGuard.tsx
import React, { useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import FingerprintAuthScreen from './FingerprintAuthScreen';
import { AuthContext } from '../Context/AuthContext';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isFingerprintAuthEnabled, checkAuthStatus } = useContext(AuthContext);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    (async () => {
      console.log("AuthGuard: Checking authentication...");
      await checkAuthStatus();
      setIsCheckingAuth(false);
    })();
  }, []);

  if (isCheckingAuth) {
    console.log("AuthGuard: Checking authentication...");
    return <ActivityIndicator />;
  }

  if (!isAuthenticated && isFingerprintAuthEnabled) {
    console.log("AuthGuard: User not authenticated and fingerprint auth enabled. Showing FingerprintAuthScreen.");
    return <FingerprintAuthScreen />;
  }

  console.log("AuthGuard: User authenticated or fingerprint auth not enabled. Showing children.");
  return <>{children}</>;
};

export default AuthGuard;
