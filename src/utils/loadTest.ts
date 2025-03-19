import {
  testSites,
  requestsPerIntensity,
  LoadIntensity,
} from '../constants/sites';

// Simple interface to store result statistics
export interface TestResult {
  url: string;
  responseTime: number;
  statusCode: number | null;
  error: string | null;
  timestamp: number;
}

/**
 * Runs a load test on a single URL and returns the result
 */
export const testSingleUrl = async (url: string): Promise<TestResult> => {
  const startTime = Date.now();
  const result: TestResult = {
    url,
    responseTime: 0,
    statusCode: null,
    error: null,
    timestamp: startTime,
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'text/html',
        'User-Agent': 'LoadTestingApp/1.0',
      },
    });

    result.responseTime = Date.now() - startTime;
    result.statusCode = response.status;
  } catch (error) {
    result.responseTime = Date.now() - startTime;
    result.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return result;
};

/**
 * Runs a batch of load tests in parallel
 */
export const runLoadTestBatch = async (
  intensity: LoadIntensity
): Promise<TestResult[]> => {
  // Determine how many parallel requests to make based on selected intensity
  const parallelRequests = requestsPerIntensity[intensity];

  // Pick random sites to test from the list
  const sitesToTest: string[] = [];
  for (let i = 0; i < parallelRequests; i++) {
    const randomIndex = Math.floor(Math.random() * testSites.length);
    sitesToTest.push(testSites[randomIndex]);
  }

  // Run tests in parallel
  const testPromises = sitesToTest.map((site) => testSingleUrl(site));
  return Promise.all(testPromises);
};

/**
 * Aggregates test results to provide summary statistics
 */
export const calculateStats = (results: TestResult[]) => {
  if (results.length === 0) return null;

  let totalResponseTime = 0;
  let successCount = 0;
  let failureCount = 0;

  results.forEach((result) => {
    totalResponseTime += result.responseTime;
    if (result.error) {
      failureCount++;
    } else {
      successCount++;
    }
  });

  return {
    averageResponseTime: totalResponseTime / results.length,
    successRate: (successCount / results.length) * 100,
    totalRequests: results.length,
    successCount,
    failureCount,
  };
};
