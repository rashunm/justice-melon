import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { Platform, StatusBar, View } from 'react-native';

// Import screens - fixing paths to match actual location
import HomeScreen from '../../src/screens/HomeScreen';
import SettingsScreen from '../../src/screens/SettingsScreen';
import ResultsScreen from '../../src/screens/ResultsScreen';

// Define the stack navigator parameter list
export type AppStackParamList = {
  Home: undefined;
  Settings: undefined;
  Results: undefined;
};

// Create the stack navigator
const Stack = createNativeStackNavigator<AppStackParamList>();

// Enhanced watermelon header background component with reduced height
const WatermelonHeaderBackground = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: colors.primary,
      // Reduced overall dimensions
      paddingTop: 0,
      paddingBottom: 0,
    }}
  >
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3, // Reduced from 5 to 3
        backgroundColor: colors.secondary,
        shadowColor: colors.secondaryDark,
        shadowOffset: { width: 0, height: 1 }, // Reduced shadow
        shadowOpacity: 0.3,
        shadowRadius: 1, // Reduced shadow radius
        elevation: 2, // Reduced elevation
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
            fontSize: 14, // Further reduced from 16 to 14
          },
          // Remove large title option to make header smaller
          headerLargeTitle: false,
          headerLargeTitleShadowVisible: false,
          headerShadowVisible: false,
          // Reduce header height
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
          options={{
            title: '🍉 Mr. Justice Melon',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name='Settings'
          component={SettingsScreen}
          options={{
            title: '🍉 Justice Settings',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name='Results'
          component={ResultsScreen}
          options={{
            title: '🍉 Justice Results',
            headerTitleAlign: 'center',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
