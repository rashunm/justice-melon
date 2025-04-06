import AsyncStorage from '@react-native-async-storage/async-storage';
import { testSites } from './testSites';

// GitHub URL for sites.json
export const GITHUB_SITES_URL =
  'https://raw.githubusercontent.com/rashunm/justice-melon/main/sites.json';

// Intensity levels for load testing with watermelon-themed names
export enum IntensityLevel {
  LOW = 'WATERMELON_SEED', // Lightest intensity (small like seeds)
  MEDIUM = 'WATERMELON_SLICE', // Medium intensity (a slice)
  HIGH = 'WATERMELON_HALF', // High intensity (half a watermelon)
  VERY_HIGH = 'FULL_WATERMELON', // Very high intensity (full watermelon)
  EXTREME = 'WATERMELON_PATCH', // Extreme intensity (a whole patch of watermelons)
  CUSTOM = 'CUSTOM_MELON', // Custom settings
}

// Parallel request counts for each intensity level
export const INTENSITY_REQUESTS = {
  [IntensityLevel.LOW]: 2,
  [IntensityLevel.MEDIUM]: 5,
  [IntensityLevel.HIGH]: 10,
  [IntensityLevel.VERY_HIGH]: 15,
  [IntensityLevel.EXTREME]: 20,
};

// Default interval between tests in milliseconds
export const DEFAULT_TEST_INTERVAL = 2000;

// Default values for custom settings
export const DEFAULT_CUSTOM_REQUESTS = 10;
export const DEFAULT_CUSTOM_INTERVAL = 2000;

// Storage keys
export const INTENSITY_LEVEL_KEY = 'intensity_level';
export const AUTO_DETECT_INTENSITY_KEY = 'auto_detect_intensity';
export const CUSTOM_REQUESTS_COUNT_KEY = 'custom_requests_count';
export const CUSTOM_INTERVAL_KEY = 'custom_interval';
export const CUSTOM_SITES_STORAGE_KEY = 'custom_sites';
export const SITES_CACHE_KEY = 'sites_cache';
export const SITES_CACHE_TIMESTAMP_KEY = 'sites_cache_timestamp';

// Cache duration in milliseconds (24 hours)
export const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Fetches test sites from GitHub with fallback to default sites
 * and caching for 24 hours
 */
export const fetchTestSites = async (): Promise<string[]> => {
  try {
    // Check if we have a valid cache
    const cachedTimestampStr = await AsyncStorage.getItem(
      SITES_CACHE_TIMESTAMP_KEY
    );

    if (cachedTimestampStr) {
      const cachedTimestamp = parseInt(cachedTimestampStr, 10);
      const currentTime = Date.now();

      // If the cache is less than 24 hours old, use it
      if (currentTime - cachedTimestamp < CACHE_DURATION_MS) {
        const cachedSites = await AsyncStorage.getItem(SITES_CACHE_KEY);
        if (cachedSites) {
          return JSON.parse(cachedSites);
        }
      }
    }

    // Fetch from GitHub if no valid cache exists
    const response = await fetch(GITHUB_SITES_URL);
    if (response.ok) {
      const sites = await response.json();

      // Cache the results
      await AsyncStorage.setItem(SITES_CACHE_KEY, JSON.stringify(sites));
      await AsyncStorage.setItem(
        SITES_CACHE_TIMESTAMP_KEY,
        Date.now().toString()
      );

      return sites;
    } else {
      // Fall back to default sites if fetch fails
      return testSites;
    }
  } catch (error) {
    console.error('Error fetching sites from GitHub:', error);
    // Fall back to default sites on error
    return testSites;
  }
};
