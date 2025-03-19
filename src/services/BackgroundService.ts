import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import {
  IntensityLevel,
  INTENSITY_REQUESTS,
  DEFAULT_TEST_INTERVAL,
} from '../constants/sites';
import { TestResult, runLoadTestBatch } from '../utils/loadTest';
import { loadCustomSettings } from '../utils/storage';

// Define a background task identifier
const BACKGROUND_LOAD_TEST_TASK = 'background-load-test-task';

// Storage for test results
let testResults: TestResult[] = [];

// Flag to track if load testing is active
let isLoadTestActive = false;
let currentIntensity: IntensityLevel = IntensityLevel.MEDIUM;

// Custom settings for custom intensity
let customRequestsCount = 10;
let customInterval = DEFAULT_TEST_INTERVAL;

/**
 * Initialize the service by loading custom settings
 */
export const initializeService = async (): Promise<void> => {
  try {
    const settings = await loadCustomSettings();
    customRequestsCount = settings.requestsCount;
    customInterval = settings.interval;
  } catch (error) {
    console.error('[BackgroundService] Error initializing service:', error);
  }
};

// Initialize the service when the module is imported
initializeService();

// Define the background task
TaskManager.defineTask(BACKGROUND_LOAD_TEST_TASK, async () => {
  console.log('[BackgroundFetch] Running background task');

  if (!isLoadTestActive) {
    console.log('[BackgroundFetch] Test not active, returning NO_DATA');
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }

  try {
    // Determine how many parallel requests to make based on selected intensity
    let requestCount: number;
    if (currentIntensity === IntensityLevel.CUSTOM) {
      requestCount = customRequestsCount;
    } else {
      requestCount = INTENSITY_REQUESTS[currentIntensity];
    }

    // Run a batch of load tests with the determined request count
    const results = await runLoadTestBatch(requestCount);

    // Store the results
    testResults = [...testResults, ...results];

    // Limit stored results to the most recent 100
    if (testResults.length > 100) {
      testResults = testResults.slice(testResults.length - 100);
    }

    console.log(`[BackgroundFetch] Completed with ${results.length} results`);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('[BackgroundFetch] Error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Functions to control the background service
export const startBackgroundLoadTest = async (
  intensity: IntensityLevel
): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    console.warn('Background load testing is only supported on Android');
    return false;
  }

  isLoadTestActive = true;
  currentIntensity = intensity;

  try {
    // Get the appropriate interval based on intensity
    const interval =
      intensity === IntensityLevel.CUSTOM
        ? customInterval
        : DEFAULT_TEST_INTERVAL;

    // Register the background fetch task
    await BackgroundFetch.registerTaskAsync(BACKGROUND_LOAD_TEST_TASK, {
      minimumInterval: interval,
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log('[BackgroundService] Background load test started');
    return true;
  } catch (error) {
    console.error(
      '[BackgroundService] Failed to start background load test:',
      error
    );
    isLoadTestActive = false;
    return false;
  }
};

/**
 * Update the custom intensity settings
 */
export const updateCustomSettings = async (
  requestsCount: number,
  interval: number
): Promise<void> => {
  customRequestsCount = requestsCount;
  customInterval = interval;

  // If currently running with custom intensity, restart to apply new settings
  if (isLoadTestActive && currentIntensity === IntensityLevel.CUSTOM) {
    await stopBackgroundLoadTest();
    await startBackgroundLoadTest(IntensityLevel.CUSTOM);
  }
};

export const stopBackgroundLoadTest = async (): Promise<boolean> => {
  isLoadTestActive = false;

  try {
    // Unregister the background fetch task
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_LOAD_TEST_TASK);
    console.log('[BackgroundService] Background load test stopped');
    return true;
  } catch (error) {
    console.error(
      '[BackgroundService] Failed to stop background load test:',
      error
    );
    return false;
  }
};

export const isBackgroundLoadTestRunning = (): boolean => {
  return isLoadTestActive;
};

export const getTestResults = (): TestResult[] => {
  return [...testResults];
};

export const clearTestResults = (): void => {
  testResults = [];
};
