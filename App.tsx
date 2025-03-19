import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { LogBox } from 'react-native';
import { watermelonTheme } from './src/theme/theme';
import SplashScreen from './src/components/SplashScreen';
import { initializeAvailableSites } from './src/utils/loadTest';

// Ignore specific warnings that might appear due to dependencies
LogBox.ignoreLogs([
  'Require cycle:', // Ignore require cycle warnings
  'AsyncStorage has been extracted', // Ignore AsyncStorage warnings
]);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Optional: load any initial data or perform any setup tasks here
  useEffect(() => {
    // Load sites from GitHub or cache
    const initialize = async () => {
      try {
        await initializeAvailableSites();
      } catch (error) {
        console.error('Failed to initialize sites:', error);
      }

      // Delay a bit to ensure splash screen is visible
      setTimeout(() => {
        // This is intentionally left empty for demonstration purposes
      }, 1000);
    };

    initialize();
  }, []);

  // Function to handle splash screen completion
  const handleSplashComplete = () => {
    setIsLoading(false);
  };

  // Show splash screen during loading
  if (isLoading) {
    return <SplashScreen onFinish={handleSplashComplete} />;
  }

  // Show main app after loading
  return (
    <PaperProvider theme={watermelonTheme}>
      <StatusBar style='auto' />
      <AppNavigator />
    </PaperProvider>
  );
}
