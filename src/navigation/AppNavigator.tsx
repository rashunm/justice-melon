import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { Platform, StatusBar, View } from 'react-native';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ResultsScreen from '../screens/ResultsScreen';

// Define the stack navigator parameter list
export type AppStackParamList = {
  Home: undefined;
  Settings: undefined;
  Results: undefined;
};

// Create the stack navigator
const Stack = createNativeStackNavigator<AppStackParamList>();

// Custom watermelon header background component
const WatermelonHeaderBackground = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: colors.primary,
    }}
  >
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: colors.secondary,
      }}
    />
  </View>
);

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor={colors.primary} barStyle='light-content' />
      <Stack.Navigator
        initialRouteName='Home'
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.textInverted,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
          // Add watermelon rind styling to the bottom of the header
          headerBackground: () => <WatermelonHeaderBackground />,
        }}
      >
        <Stack.Screen
          name='Home'
          component={HomeScreen}
          options={{ title: '🍉 Load Testing App' }}
        />
        <Stack.Screen
          name='Settings'
          component={SettingsScreen}
          options={{ title: '🍉 Settings' }}
        />
        <Stack.Screen
          name='Results'
          component={ResultsScreen}
          options={{ title: '🍉 Test Results' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
