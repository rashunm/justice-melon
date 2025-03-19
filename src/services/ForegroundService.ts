import {
  IntensityLevel,
  INTENSITY_REQUESTS,
  DEFAULT_TEST_INTERVAL,
} from '../constants/sites';
import { TestResult, runLoadTestBatch } from '../utils/loadTest';
import { loadCustomSettings } from '../utils/storage';

// Storage for test results
let testResults: TestResult[] = [];

// Flag to track if load testing is active
let isLoadTestActive = false;

// Reference to the interval timer
let testIntervalId: NodeJS.Timeout | null = null;

// Current testing intensity
let currentIntensity: IntensityLevel = IntensityLevel.MEDIUM;

// Custom settings for custom intensity
let customRequestsCount = 10;
let customInterval = DEFAULT_TEST_INTERVAL;

// Callbacks for UI updates
type ResultCallback = (results: TestResult[]) => void;
const resultCallbacks: ResultCallback[] = [];

/**
 * Initialize the service by loading custom settings
 */
export const initializeService = async (): Promise<void> => {
  try {
    const settings = await loadCustomSettings();
    customRequestsCount = settings.requestsCount;
    customInterval = settings.interval;
  } catch (error) {
    console.error('[ForegroundService] Error initializing service:', error);
  }
};

// Initialize the service when the module is imported
initializeService();

/**
 * Start load testing in the foreground
 */
export const startForegroundLoadTest = async (
  intensity: IntensityLevel
): Promise<boolean> => {
  if (isLoadTestActive) {
    console.log('[ForegroundService] Load test already running');
    return false;
  }

  isLoadTestActive = true;
  currentIntensity = intensity;

  // Get interval based on intensity (handle custom intensity separately)
  const intervalTime =
    currentIntensity === IntensityLevel.CUSTOM
      ? customInterval
      : DEFAULT_TEST_INTERVAL;

  // Schedule periodic load tests
  testIntervalId = setInterval(async () => {
    if (!isLoadTestActive) return;

    try {
      console.log('[ForegroundService] Running load test batch');

      // For custom intensity, pass the custom request count
      // For standard intensities, get the request count from the INTENSITY_REQUESTS mapping
      let requestCount: number;
      if (currentIntensity === IntensityLevel.CUSTOM) {
        requestCount = customRequestsCount;
      } else {
        requestCount = INTENSITY_REQUESTS[currentIntensity];
      }

      const results = await runLoadTestBatch(requestCount);

      // Store the results
      testResults = [...testResults, ...results];

      // Limit stored results to the most recent 100
      if (testResults.length > 100) {
        testResults = testResults.slice(testResults.length - 100);
      }

      // Notify UI that new results are available
      notifyResultCallbacks();

      console.log(
        `[ForegroundService] Completed with ${results.length} results`
      );
    } catch (error) {
      console.error('[ForegroundService] Error:', error);
    }
  }, intervalTime);

  console.log('[ForegroundService] Foreground load test started');
  return true;
};

/**
 * Update the custom intensity settings
 */
export const updateCustomSettings = (
  requestsCount: number,
  interval: number
): void => {
  customRequestsCount = requestsCount;
  customInterval = interval;

  // If currently running with custom intensity, restart to apply new settings
  if (isLoadTestActive && currentIntensity === IntensityLevel.CUSTOM) {
    stopForegroundLoadTest();
    startForegroundLoadTest(IntensityLevel.CUSTOM);
  }
};

/**
 * Stop the foreground load testing
 */
export const stopForegroundLoadTest = (): boolean => {
  if (!isLoadTestActive) {
    console.log('[ForegroundService] No load test running');
    return false;
  }

  isLoadTestActive = false;

  // Clear the interval timer
  if (testIntervalId !== null) {
    clearInterval(testIntervalId);
    testIntervalId = null;
  }

  console.log('[ForegroundService] Foreground load test stopped');
  return true;
};

/**
 * Check if load testing is currently active
 */
export const isForegroundLoadTestRunning = (): boolean => {
  return isLoadTestActive;
};

/**
 * Get the current test results
 */
export const getTestResults = (): TestResult[] => {
  return [...testResults];
};

/**
 * Clear all test results
 */
export const clearTestResults = (): void => {
  testResults = [];
  notifyResultCallbacks();
};

/**
 * Register a callback to be notified when new results are available
 */
export const addResultCallback = (callback: ResultCallback): void => {
  resultCallbacks.push(callback);
};

/**
 * Remove a previously registered callback
 */
export const removeResultCallback = (callback: ResultCallback): void => {
  const index = resultCallbacks.indexOf(callback);
  if (index !== -1) {
    resultCallbacks.splice(index, 1);
  }
};

/**
 * Notify all registered callbacks with the current test results
 */
const notifyResultCallbacks = (): void => {
  resultCallbacks.forEach((callback) => {
    try {
      callback(getTestResults());
    } catch (error) {
      console.error('[ForegroundService] Error in result callback:', error);
    }
  });
};
