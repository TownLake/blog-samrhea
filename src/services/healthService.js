// src/services/healthService.js
import { formatSecondsToMMSS } from '../utils/dataUtils';

const handleFetchError = async (response, dataType) => {
  if (!response.ok) {
    let errorText = '';
    try {
      errorText = await response.text();
    } catch (e) {
      // ignore if reading text fails
    }
    console.error(`${dataType} fetch error (${response.status} ${response.statusText}):`, errorText);
    throw new Error(`Failed to fetch ${dataType} data. Status: ${response.status}`);
  }
  // Handle cases where response might be empty or not valid JSON
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`Error parsing JSON for ${dataType}:`, text);
    throw new Error(`Failed to parse JSON for ${dataType}`);
  }
};

const enrichRunningData = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map(run => ({
    ...run,
    date: run.date, // Ensure date is present
    distance: Number(run.distance),
    distance_imperial: Number(run.distance) * 0.621371,
    calories: Number(run.calories),
    vo2_max: Number(run.vo2_max),
    five_k_seconds: Number(run.five_k_seconds),
    five_k_formatted: formatSecondsToMMSS(run.five_k_seconds)
  }));
};

// Added a generic enricher for otherData if needed in the future,
// for now, it just ensures numbers are numbers.
const enrichOtherData = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map(item => ({
    ...item,
    date: item.date, // Ensure date is present
    peak_flow: item.peak_flow != null ? Number(item.peak_flow) : null,
    strong_grip: item.strong_grip != null ? Number(item.strong_grip) : null,
    weak_grip: item.weak_grip != null ? Number(item.weak_grip) : null,
  }));
};

export const fetchHealthData = async () => {
  try {
    const days = 5000; // Extended range for more comprehensive data
    const sparklineDays = 45;

    // Fetch all data sources in parallel
    const responses = await Promise.allSettled([
      fetch(`/api/oura?days=${days}`),
      fetch(`/api/oura?days=${sparklineDays}`),
      fetch(`/api/withings?days=${days}`),
      fetch(`/api/running?days=${sparklineDays}`),
      fetch(`/api/running?days=${days}`),
      fetch(`/api/clinical?days=${days}`),
      fetch(`/api/clinical?days=${sparklineDays}`),
      fetch(`/api/otherdata?days=${days}`),       // New endpoint for full data
      fetch(`/api/otherdata?days=${sparklineDays}`) // New endpoint for sparkline data
    ]);

    const processResponse = async (promiseResult, dataType, enricher) => {
      if (promiseResult.status === 'rejected') {
        console.error(`Workspace failed for ${dataType}:`, promiseResult.reason);
        return []; // Return empty array on fetch failure
      }
      try {
        const data = await handleFetchError(promiseResult.value, dataType);
        return enricher ? enricher(data) : (Array.isArray(data) ? data : []);
      } catch (err) {
        // Error already logged by handleFetchError or JSON parsing
        return []; // Return empty array on processing error
      }
    };
    
    const [
      ouraFull,
      ouraSpark,
      withings,
      runningSpark,
      runningFull,
      clinical,
      clinicalSpark,
      otherDataFull,     // New data
      otherDataSpark     // New data
    ] = await Promise.all([
        processResponse(responses[0], 'Oura full'),
        processResponse(responses[1], 'Oura spark'),
        processResponse(responses[2], 'Withings'),
        processResponse(responses[3], 'Running spark', enrichRunningData),
        processResponse(responses[4], 'Running full', enrichRunningData),
        processResponse(responses[5], 'Clinical'),
        processResponse(responses[6], 'Clinical spark'),
        processResponse(responses[7], 'OtherData full', enrichOtherData), // Enrich otherData
        processResponse(responses[8], 'OtherData spark', enrichOtherData) // Enrich otherData spark
    ]);


    return {
      oura: ouraFull,
      ouraSpark: ouraSpark,
      withings: withings,
      running: runningFull,
      runningSpark: runningSpark,
      clinical: clinical,
      clinicalSpark: clinicalSpark,
      otherData: otherDataFull,         // Add to returned object
      otherDataSpark: otherDataSpark,   // Add to returned object
    };

  } catch (error) { // This outer catch might be redundant if all promises are handled
    console.error('Critical error in fetchHealthData:', error);
    return {
      oura: [], ouraSpark: [], withings: [],
      running: [], runningSpark: [], clinical: [], clinicalSpark: [],
      otherData: [], otherDataSpark: [] // Ensure defaults on critical failure
    };
  }
};