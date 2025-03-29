// src/services/healthService.js

/**
 * Fetches health data from Cloudflare API endpoints.
 * Assumes the API functions are served relative to the app's origin.
 * @returns {Promise<Object>} The health data from various sources.
 */
export const fetchHealthData = async () => {
  try {
    // Define the API endpoints
    const endpoints = {
      oura: '/api/oura',
      withings: '/api/withings',
      running: '/api/running',
    };

    // Helper function to fetch and parse JSON from an endpoint
    const fetchData = async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        // Attempt to parse error details if available
        let errorDetails = `HTTP status ${response.status}`;
        try {
          const errorJson = await response.json();
          errorDetails = errorJson.error || errorJson.message || JSON.stringify(errorJson);
        } catch (e) {
          // Ignore if error response is not JSON
        }
        throw new Error(`Failed to fetch ${url}: ${errorDetails}`);
      }
      return response.json();
    };

    // Fetch data from all endpoints in parallel
    const [ouraData, withingsData, runningData] = await Promise.all([
      fetchData(endpoints.oura),
      fetchData(endpoints.withings),
      fetchData(endpoints.running),
    ]);

    // Return the data in the structure expected by the context/dashboard
    return {
      oura: ouraData || [],
      withings: withingsData || [],
      running: runningData || [],
    };

  } catch (error) {
    console.error('Error fetching health data from API:', error);
    // Re-throw the error so the HealthDataContext can catch it and set the error state
    throw error;
  }
};