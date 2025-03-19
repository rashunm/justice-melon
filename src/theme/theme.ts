import { DefaultTheme } from 'react-native-paper';
import { colors, intensity } from './colors';

// Watermelon theme for React Native Paper
export const watermelonTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.background,
    surface: colors.card,
    text: colors.text,
    disabled: colors.disabled,
    placeholder: colors.textLight,
    backdrop: colors.overlay,
    error: colors.error,
    notification: colors.primary,
  },
  roundness: 8,
};

// Export a helper function to get intensity colors
export const getIntensityColor = (
  intensityLevel: string
): { background: string; text: string } => {
  const level = intensityLevel.toLowerCase();
  switch (level) {
    case 'low':
      return intensity.low;
    case 'medium':
      return intensity.medium;
    case 'high':
      return intensity.high;
    case 'very_high':
      return intensity.veryHigh;
    case 'extreme':
      return intensity.extreme;
    case 'custom':
      return intensity.custom;
    default:
      return intensity.medium;
  }
};
