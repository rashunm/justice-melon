// Test sites to check
export const testSites = [
  'https://www.google.com',
  'https://www.facebook.com',
  'https://www.amazon.com',
  'https://www.youtube.com',
  'https://www.netflix.com',
  'https://www.twitter.com',
  'https://www.instagram.com',
];

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
