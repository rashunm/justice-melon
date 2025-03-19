import { LoadIntensity, testIntervals } from '../constants/sites';
import { TestResult, runLoadTestBatch } from '../utils/loadTest';

// Storage for test results
let testResults: TestResult[] = [];

// Flag to track if load testing is active
let isLoadTestActive = false;

// Reference to the interval timer
let testIntervalId: NodeJS.Timeout | null = null;

// Current testing intensity
let currentIntensity: LoadIntensity = LoadIntensity.MEDIUM;

// Callbacks for UI updates
type ResultCallback = (results: TestResult[]) => void;
const resultCallbacks: ResultCallback[] = [];

/**
 * Start load testing in the foreground
 */
export const startForegroundLoadTest = (intensity: LoadIntensity): boolean => {
  if (isLoadTestActive) {
    console.log('[ForegroundService] Load test already running');
    return false;
  }

  isLoadTestActive = true;
  currentIntensity = intensity;

  // Schedule periodic load tests
  testIntervalId = setInterval(async () => {
    if (!isLoadTestActive) return;

    try {
      console.log('[ForegroundService] Running load test batch');
      const results = await runLoadTestBatch(currentIntensity);

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
  }, testIntervals[intensity]);

  console.log('[ForegroundService] Foreground load test started');
  return true;
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
