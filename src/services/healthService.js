// src/services/healthService.js
import { formatSecondsToMMSS } from '../utils/dataUtils';

const handleFetchError = async (response, dataType) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`${dataType} fetch error (${response.status}):`, errorText);
    throw new Error(`Failed to fetch ${dataType} data`);
  }
  return response.json();
};

const enrichRunningData = (data) => {
  return data.map(run => ({
    ...run,
    date: run.date,
    distance: Number(run.distance),
    distance_imperial: Number(run.distance) * 0.621371,
    calories: Number(run.calories),
    vo2_max: Number(run.vo2_max),
    five_k_seconds: Number(run.five_k_seconds),
    five_k_formatted: formatSecondsToMMSS(run.five_k_seconds)
  }));
};

export const fetchHealthData = async () => {
  try {
    const days = 5000; // Extended range for more comprehensive data

    // Fetch all data sources in parallel
    const [
      ouraFullRes,
      ouraSparkRes,
      withingsRes,
      runningSparkRes,
      runningFullRes,
      clinicalRes,
      clinicalSparkRes
    ] = await Promise.all([
      fetch(`/api/oura?days=${days}`),
      fetch(`/api/oura?days=45`),
      fetch(`/api/withings?days=${days}`),
      fetch(`/api/running?days=45`),
      fetch(`/api/running?days=${days}`),
      fetch(`/api/clinical?days=${days}`),
      fetch(`/api/clinical?days=45`)
    ]);

    // Process all responses with error handling
    const [
      ouraFull,
      ouraSpark,
      withings,
      runningSpark,
      runningFull,
      clinical,
      clinicalSpark
    ] = await Promise.all([
      handleFetchError(ouraFullRes, 'Oura full').catch(() => []),
      handleFetchError(ouraSparkRes, 'Oura spark').catch(() => []),
      handleFetchError(withingsRes, 'Withings').catch(() => []),
      handleFetchError(runningSparkRes, 'Running spark').catch(() => []),
      handleFetchError(runningFullRes, 'Running full').catch(() => []),
      handleFetchError(clinicalRes, 'Clinical').catch(() => []),
      handleFetchError(clinicalSparkRes, 'Clinical spark').catch(() => [])
    ]);

    // Enrich running data with additional fields
    const enrichedRunning = enrichRunningData(runningFull);
    const enrichedRunningSpark = enrichRunningData(runningSpark);

    // Ensure all arrays are valid
    return {
      oura: Array.isArray(ouraFull) ? ouraFull : [],
      ouraSpark: Array.isArray(ouraSpark) ? ouraSpark : [],
      withings: Array.isArray(withings) ? withings : [],
      running: Array.isArray(enrichedRunning) ? enrichedRunning : [],
      runningSpark: Array.isArray(enrichedRunningSpark) ? enrichedRunningSpark : [],
      clinical: Array.isArray(clinical) ? clinical : [],
      clinicalSpark: Array.isArray(clinicalSpark) ? clinicalSpark : []
    };
  } catch (error) {
    console.error('Error in fetchHealthData:', error);
    // Return empty arrays for all data sources on error
    return {
      oura: [],
      ouraSpark: [],
      withings: [],
      running: [],
      runningSpark: [],
      clinical: [],
      clinicalSpark: []
    };
  }
};