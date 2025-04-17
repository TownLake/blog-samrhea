// src/services/healthService.js

/**
 * Fetches health data from optimized API endpoints with payload slicing.
 * - ouraSpark: last 45 days for sparklines
 * - ouraFull: last 365 days for detail & monthly
 * - withings: last 365 days (body metrics)
 * - runningSpark: last 45 days for sparklines
 * - runningFull: last 365 days for detail
 */
export const fetchHealthData = async () => {
  try {
    const endpoints = {
      ouraSpark:  '/api/oura?days=45',
      ouraFull:   '/api/oura?days=365',
      withings:   '/api/withings?days=365',
      runningSpark: '/api/running?days=45',
      runningFull:  '/api/running?days=365',
    };

    const fetchData = async (url) => {
      const res = await fetch(url);
      if (!res.ok) {
        let details = `HTTP ${res.status}`;
        try { details = (await res.json()).error || details; } catch {}
        throw new Error(`Fetch ${url} failed: ${details}`);
      }
      return res.json();
    };

    const [ouraSpark, ouraFull, withingsData, runningSpark, runningFull] =
      await Promise.all([
        fetchData(endpoints.ouraSpark),
        fetchData(endpoints.ouraFull),
        fetchData(endpoints.withings),
        fetchData(endpoints.runningSpark),
        fetchData(endpoints.runningFull),
      ]);

    return {
      ouraSpark: ouraSpark || [],
      oura:      ouraFull  || [],
      withings:  withingsData || [],
      runningSpark: runningSpark  || [],
      running:      runningFull   || [],
    };
  } catch (error) {
    console.error('Error fetching health data:', error);
    throw error;
  }
};
