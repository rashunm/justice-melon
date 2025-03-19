import { Platform, Dimensions } from 'react-native';
import { IntensityLevel } from '../constants/sites';

// Interface for device specifications
export interface DeviceSpecs {
  manufacturer: string | null;
  modelName: string | null;
  deviceYearClass: number | null;
  totalMemory: number | null;
  osName: string | null;
  osVersion: string | null;
  osBuildId: string | null;
  deviceName: string | null;
  screenWidth: number;
  screenHeight: number;
  isDevice: boolean;
  platformApiLevel: number | null;
}

// Initialize with basic device info
const getBasicDeviceInfo = (): DeviceSpecs => {
  const { width, height } = Dimensions.get('window');

  return {
    manufacturer: null,
    modelName: Platform.OS === 'ios' ? 'iPhone/iPad' : 'Android Device',
    deviceYearClass: null,
    totalMemory: null,
    osName: Platform.OS,
    osVersion: Platform.Version.toString(),
    osBuildId: null,
    deviceName: null,
    screenWidth: width,
    screenHeight: height,
    isDevice: true, // Assume it's a real device
    platformApiLevel: null,
  };
};

/**
 * Try to safely call an async function with a fallback value if it fails
 */
const safelyCallAsync = async <T>(
  fn: Function | undefined,
  fallback: T
): Promise<T> => {
  if (!fn) return fallback;
  try {
    return (await fn()) || fallback;
  } catch (e) {
    console.warn(`Error calling device function: ${e}`);
    return fallback;
  }
};

/**
 * Get detailed device specifications
 */
export const getDeviceSpecs = async (): Promise<DeviceSpecs> => {
  // Start with basic device info that doesn't require the expo-device module
  const deviceInfo = getBasicDeviceInfo();

  // Try to load the expo-device module
  let Device: any = null;
  try {
    Device = require('expo-device');
  } catch (e) {
    console.warn('expo-device module could not be loaded:', e);
    return deviceInfo;
  }

  // If we got here, we have the Device module loaded
  try {
    // Safely try to get each piece of device information
    if (Device) {
      // Get static properties directly
      deviceInfo.osName = Device.osName || deviceInfo.osName;
      deviceInfo.osVersion = Device.osVersion || deviceInfo.osVersion;
      deviceInfo.osBuildId = Device.osBuildId || null;
      deviceInfo.isDevice =
        typeof Device.isDevice === 'boolean'
          ? Device.isDevice
          : deviceInfo.isDevice;
      deviceInfo.platformApiLevel = Device.platformApiLevel || null;

      // Try to call async methods if they exist
      if (typeof Device.getManufacturerAsync === 'function') {
        deviceInfo.manufacturer = await safelyCallAsync(
          Device.getManufacturerAsync,
          null
        );
      }

      if (typeof Device.getModelNameAsync === 'function') {
        deviceInfo.modelName = await safelyCallAsync(
          Device.getModelNameAsync,
          deviceInfo.modelName
        );
      }

      if (typeof Device.getDeviceYearClassAsync === 'function') {
        deviceInfo.deviceYearClass = await safelyCallAsync(
          Device.getDeviceYearClassAsync,
          null
        );
      }

      if (typeof Device.getTotalMemoryAsync === 'function') {
        deviceInfo.totalMemory = await safelyCallAsync(
          Device.getTotalMemoryAsync,
          null
        );
      }

      if (typeof Device.getDeviceNameAsync === 'function') {
        deviceInfo.deviceName = await safelyCallAsync(
          Device.getDeviceNameAsync,
          null
        );
      }
    }
  } catch (error) {
    console.error('Failed to get device info:', error);
  }

  return deviceInfo;
};

/**
 * Determine the recommended load testing intensity based on device resources
 * or make an educated guess based on platform
 */
export const getRecommendedIntensity = async (): Promise<IntensityLevel> => {
  try {
    // Try to get device specs
    const specs = await getDeviceSpecs();

    // If we have both deviceYearClass and totalMemory, use them to determine intensity
    if (specs.deviceYearClass && specs.totalMemory) {
      const EXTREME_MEMORY_THRESHOLD = 6 * 1024 * 1024 * 1024; // 6GB
      const HIGH_MEMORY_THRESHOLD = 4 * 1024 * 1024 * 1024; // 4GB
      const MEDIUM_MEMORY_THRESHOLD = 2 * 1024 * 1024 * 1024; // 2GB

      // If device year class is 2020 or newer and has over 6GB of RAM, use VERY_HIGH
      if (
        specs.deviceYearClass >= 2020 &&
        specs.totalMemory >= EXTREME_MEMORY_THRESHOLD
      ) {
        return IntensityLevel.VERY_HIGH;
      }

      // If device year class is 2018 or newer and has over 4GB of RAM, use HIGH
      if (
        specs.deviceYearClass >= 2018 &&
        specs.totalMemory >= HIGH_MEMORY_THRESHOLD
      ) {
        return IntensityLevel.HIGH;
      }

      // If device year class is 2016 or newer and has over 2GB of RAM, use MEDIUM
      if (
        specs.deviceYearClass >= 2016 &&
        specs.totalMemory >= MEDIUM_MEMORY_THRESHOLD
      ) {
        return IntensityLevel.MEDIUM;
      }

      // Otherwise, use LOW for older or less capable devices
      return IntensityLevel.LOW;
    }

    // If we don't have detailed specs, make an educated guess based on OS
    if (Platform.OS === 'ios') {
      // iOS devices tend to be more powerful
      return IntensityLevel.MEDIUM;
    } else if (Platform.OS === 'android') {
      // Be more conservative on Android due to greater device variety
      return IntensityLevel.LOW;
    }

    // Default fallback
    return IntensityLevel.MEDIUM;
  } catch (error) {
    console.error('Failed to get recommended intensity:', error);
    // Default to MEDIUM in case of errors
    return IntensityLevel.MEDIUM;
  }
};
