// Watermelon theme color palette
export const colors = {
  // Primary watermelon flesh colors
  primary: '#FF5A76', // Bright watermelon flesh
  primaryLight: '#FF8DA1', // Light watermelon flesh
  primaryDark: '#E73E59', // Dark watermelon flesh

  // Secondary watermelon rind colors
  secondary: '#2ECC71', // Watermelon rind
  secondaryLight: '#7ED6A9', // Light watermelon rind
  secondaryDark: '#1D8C4B', // Dark watermelon rind

  // Accents and backgrounds
  accent: '#222222', // Watermelon seeds (dark gray/black)
  background: '#F8F8F8', // Light background
  card: '#FFFFFF', // Card background
  cardOutline: '#E0E0E0', // Card outline

  // Status colors
  success: '#2ECC71', // Success (using rind green)
  error: '#E73E59', // Error (using dark flesh)
  warning: '#FFA726', // Warning orange
  info: '#7ED6A9', // Info (using light rind)

  // Text colors
  text: '#333333', // Primary text
  textLight: '#757575', // Secondary text
  textInverted: '#FFFFFF', // White text for dark backgrounds

  // Additional shades for specific elements
  divider: '#EEEEEE', // Divider color
  disabled: '#BDBDBD', // Disabled elements
  overlay: 'rgba(0, 0, 0, 0.5)', // Overlay for modals
};

// Light/Dark mode indicator (for future use)
export const isDarkMode = false;

// Named modes and intensities with watermelon shades for intensity buttons
export const intensity = {
  low: {
    background: '#7ED6A9', // Light rind green
    text: '#1D8C4B', // Dark rind green
  },
  medium: {
    background: '#2ECC71', // Medium rind green
    text: '#FFFFFF', // White text
  },
  high: {
    background: '#FF8DA1', // Light watermelon flesh
    text: '#E73E59', // Dark watermelon flesh
  },
  veryHigh: {
    background: '#FF5A76', // Medium watermelon flesh
    text: '#FFFFFF', // White text
  },
  extreme: {
    background: '#E73E59', // Dark watermelon flesh
    text: '#FFFFFF', // White text
  },
  custom: {
    background: '#222222', // Watermelon seeds (black)
    text: '#FFFFFF', // White text
  },
};
