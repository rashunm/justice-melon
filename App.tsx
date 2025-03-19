import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { LogBox } from 'react-native';
import { watermelonTheme } from './src/theme/theme';

// Ignore specific warnings that might appear due to dependencies
LogBox.ignoreLogs([
  'Require cycle:', // Ignore require cycle warnings
  'AsyncStorage has been extracted', // Ignore AsyncStorage warnings
]);

export default function App() {
  return (
    <PaperProvider theme={watermelonTheme}>
      <StatusBar style='auto' />
      <AppNavigator />
    </PaperProvider>
  );
}
