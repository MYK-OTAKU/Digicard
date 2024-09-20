import { createNavigationContainerRef, ParamListBase, DrawerActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<ParamListBase>();

let pendingNavigation: { name: string, params?: object } | null = null;

export function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    console.log("Navigation is ready, navigating to", name);
    navigationRef.navigate(name, params);
  } else {
    // console.error("Navigation object is not ready yet. Storing pending navigation.");
    pendingNavigation = { name, params }; // Stocke la redirection
  }
}

// Quand la navigation est prête, si une redirection est en attente, l'exécute
export function handlePendingNavigation() {
  if (pendingNavigation && navigationRef.isReady()) {
    const { name, params } = pendingNavigation;
    console.log("Executing pending navigation to", name);
    navigationRef.navigate(name, params);
    pendingNavigation = null; // Clear pending navigation
  }
}

export function openDrawer() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(DrawerActions.openDrawer());
  } else {
    // console.error("Navigation object is not ready yet.");
  }
}

export function closeDrawer() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(DrawerActions.closeDrawer());
  } else {
    // console.error("Navigation object is not ready yet.");
  }
}
