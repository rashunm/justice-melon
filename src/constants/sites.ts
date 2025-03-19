// List of websites to test in parallel
export const testSites = [
  'https://www.google.com',
  'https://www.github.com',
  'https://www.amazon.com',
  'https://www.microsoft.com',
  'https://www.apple.com',
  'https://www.facebook.com',
  'https://www.twitter.com',
  'https://www.netflix.com',
  'https://www.reddit.com',
  'https://www.wikipedia.org',
];

// Different load test intensities based on device capabilities
export enum LoadIntensity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// Number of parallel requests for each intensity level
export const requestsPerIntensity = {
  [LoadIntensity.LOW]: 2,
  [LoadIntensity.MEDIUM]: 5,
  [LoadIntensity.HIGH]: 10,
};

// Interval between test cycles (in milliseconds)
export const testIntervals = {
  [LoadIntensity.LOW]: 5000, // 5 seconds
  [LoadIntensity.MEDIUM]: 3000, // 3 seconds
  [LoadIntensity.HIGH]: 1000, // 1 second
};

// Task identifier for background fetch
export const BACKGROUND_LOAD_TEST_TASK = 'background-load-test-task';
