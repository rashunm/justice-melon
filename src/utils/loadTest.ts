import { testSites } from '../constants/sites';

// Simple interface to store result statistics
export interface TestResult {
  url: string;
  responseTime: number;
  statusCode: number | null;
  error: string | null;
  timestamp: number;
}

// Keep track of previously used sites to implement rotation
let recentlyUsedSites: string[] = [];
const MAX_RECENT_SITES = 3; // Number of sites to "remember" before reusing

// Short timeout for requests (ms) - typical for DOS attacks
const REQUEST_TIMEOUT_MS = 3000;

/**
 * Runs a load test on a single URL and returns the result with a timeout
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
    // Create a promise that will reject after the timeout
    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(
        () => reject(new Error('Request timeout')),
        REQUEST_TIMEOUT_MS
      );
    });

    // Create the fetch request
    const fetchPromise = fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'text/html',
        'User-Agent': 'MrJusticeMelonApp/1.0',
      },
    });

    // Race the fetch against the timeout
    const response = (await Promise.race([
      fetchPromise,
      timeoutPromise,
    ])) as Response;

    result.responseTime = Date.now() - startTime;
    result.statusCode = response.status;
  } catch (error) {
    result.responseTime = Date.now() - startTime;
    result.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return result;
};

/**
 * Select a random site from the available sites, avoiding recently used ones if possible
 */
export const selectRandomSite = (): string => {
  // Create a pool of sites excluding recently used ones (if possible)
  let availableSites = testSites.filter(
    (site) => !recentlyUsedSites.includes(site)
  );

  // If all sites have been recently used, just use all sites
  if (availableSites.length === 0) {
    availableSites = testSites;
  }

  // Select a random site from the available pool
  const randomIndex = Math.floor(Math.random() * availableSites.length);
  const selectedSite = availableSites[randomIndex];

  // Add to recently used sites and maintain max length
  recentlyUsedSites.push(selectedSite);
  if (recentlyUsedSites.length > MAX_RECENT_SITES) {
    recentlyUsedSites.shift(); // Remove oldest site
  }

  return selectedSite;
};

/**
 * Runs a batch of load tests concurrently without waiting for slow responses
 */
export const runLoadTestBatch = async (
  requestCount: number
): Promise<TestResult[]> => {
  // Ensure the request count is valid (allowing higher values for DOS simulation)
  const parallelRequests = Math.max(1, Math.min(requestCount, 100));

  // Pick sites to test with rotation strategy
  const sitesToTest: string[] = [];
  for (let i = 0; i < parallelRequests; i++) {
    sitesToTest.push(selectRandomSite());
  }

  // Create an array to hold all results
  const results: TestResult[] = [];

  // Use Promise.allSettled to process all requests without waiting for slow ones
  const promises = sitesToTest.map((site) =>
    testSingleUrl(site)
      .then((result) => results.push(result))
      .catch((_) => {
        /* Ignore individual failures */
      })
  );

  // Wait for all requests to either complete or timeout
  await Promise.allSettled(promises);

  return results;
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
