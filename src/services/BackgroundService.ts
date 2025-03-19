import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import {
  BACKGROUND_LOAD_TEST_TASK,
  LoadIntensity,
  testIntervals,
} from '../constants/sites';
import { TestResult, runLoadTestBatch } from '../utils/loadTest';

// Storage for test results
let testResults: TestResult[] = [];

// Flag to track if load testing is active
let isLoadTestActive = false;
let currentIntensity: LoadIntensity = LoadIntensity.MEDIUM;

// Define the background task
TaskManager.defineTask(BACKGROUND_LOAD_TEST_TASK, async () => {
  console.log('[BackgroundFetch] Running background task');

  if (!isLoadTestActive) {
    console.log('[BackgroundFetch] Test not active, returning NO_DATA');
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }

  try {
    // Run a batch of load tests
    const results = await runLoadTestBatch(currentIntensity);

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
  intensity: LoadIntensity
): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    console.warn('Background load testing is only supported on Android');
    return false;
  }

  isLoadTestActive = true;
  currentIntensity = intensity;

  try {
    // Register the background fetch task
    await BackgroundFetch.registerTaskAsync(BACKGROUND_LOAD_TEST_TASK, {
      minimumInterval: testIntervals[intensity],
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
