import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_CUSTOM_REQUESTS,
  DEFAULT_CUSTOM_INTERVAL,
  CUSTOM_REQUESTS_COUNT_KEY,
  CUSTOM_INTERVAL_KEY,
  INTENSITY_LEVEL_KEY,
  AUTO_DETECT_INTENSITY_KEY,
  IntensityLevel,
} from '../constants/sites';

/**
 * Save the intensity level
 */
export const saveIntensityLevel = async (
  level: IntensityLevel
): Promise<void> => {
  try {
    await AsyncStorage.setItem(INTENSITY_LEVEL_KEY, level);
  } catch (error) {
    console.error('Error saving intensity level:', error);
  }
};

/**
 * Get the intensity level
 */
export const getIntensityLevel = async (): Promise<IntensityLevel> => {
  try {
    const value = await AsyncStorage.getItem(INTENSITY_LEVEL_KEY);
    if (
      value !== null &&
      Object.values(IntensityLevel).includes(value as IntensityLevel)
    ) {
      return value as IntensityLevel;
    }
    return IntensityLevel.MEDIUM;
  } catch (error) {
    console.error('Error getting intensity level:', error);
    return IntensityLevel.MEDIUM;
  }
};

/**
 * Save auto detect intensity setting
 */
export const saveAutoDetectIntensity = async (
  autoDetect: boolean
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      AUTO_DETECT_INTENSITY_KEY,
      autoDetect.toString()
    );
  } catch (error) {
    console.error('Error saving auto detect setting:', error);
  }
};

/**
 * Get auto detect intensity setting
 */
export const getAutoDetectIntensity = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(AUTO_DETECT_INTENSITY_KEY);
    if (value !== null) {
      return value === 'true';
    }
    return true; // Default to auto-detect enabled
  } catch (error) {
    console.error('Error getting auto detect setting:', error);
    return true;
  }
};

/**
 * Save the custom requests count
 */
export const saveCustomRequestsCount = async (count: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(CUSTOM_REQUESTS_COUNT_KEY, count.toString());
  } catch (error) {
    console.error('Error saving custom requests count:', error);
  }
};

/**
 * Get the custom requests count
 */
export const getCustomRequestsCount = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(CUSTOM_REQUESTS_COUNT_KEY);
    if (value !== null) {
      return parseInt(value, 10);
    }
    return DEFAULT_CUSTOM_REQUESTS;
  } catch (error) {
    console.error('Error getting custom requests count:', error);
    return DEFAULT_CUSTOM_REQUESTS;
  }
};

/**
 * Save the custom interval
 */
export const saveCustomInterval = async (interval: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(CUSTOM_INTERVAL_KEY, interval.toString());
  } catch (error) {
    console.error('Error saving custom interval:', error);
  }
};

/**
 * Get the custom interval
 */
export const getCustomInterval = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(CUSTOM_INTERVAL_KEY);
    if (value !== null) {
      return parseInt(value, 10);
    }
    return DEFAULT_CUSTOM_INTERVAL;
  } catch (error) {
    console.error('Error getting custom interval:', error);
    return DEFAULT_CUSTOM_INTERVAL;
  }
};

/**
 * Load all custom settings at once
 */
export const loadCustomSettings = async (): Promise<{
  requestsCount: number;
  interval: number;
}> => {
  const [requestsCount, interval] = await Promise.all([
    getCustomRequestsCount(),
    getCustomInterval(),
  ]);

  return { requestsCount, interval };
};
