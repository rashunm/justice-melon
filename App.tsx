import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { LogBox } from 'react-native';
import { watermelonTheme } from './src/theme/theme';
import SplashScreen from './src/components/SplashScreen';

// Ignore specific warnings that might appear due to dependencies
LogBox.ignoreLogs([
  'Require cycle:', // Ignore require cycle warnings
  'AsyncStorage has been extracted', // Ignore AsyncStorage warnings
]);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Optional: load any initial data or perform any setup tasks here
  useEffect(() => {
    // Simulate loading time for demonstration purposes
    // In a real app, you would load actual data or resources here
    setTimeout(() => {
      // This timeout is just for demo purposes to ensure the splash screen is visible
    }, 1000);
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
