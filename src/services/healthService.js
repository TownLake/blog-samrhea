// src/services/healthService.js
import { processAndDeriveHealthMetrics } from '/src/utils/dataUtils.js';
import { formatSecondsToMMSS } from '../utils/dataUtils';

const handleFetchError = async (response, dataType) => {
  if (!response.ok) {
    let errorText = '';
    try { errorText = await response.text(); } catch (e) { /* ignore */ }
    console.error(`${dataType} fetch error (${response.status} ${response.statusText}):`, errorText);
    throw new Error(`Failed to fetch ${dataType} data. Status: ${response.status}`);
  }
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
    date: run.date,
    distance_imperial: Number(run.distance) * 0.621371,
    five_k_formatted: formatSecondsToMMSS(run.five_k_seconds)
  }));
};

// A generic enricher to ensure all data values are numbers
const enrichNumericData = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map(item => {
        const enrichedItem = { date: item.date };
        for (const key in item) {
            if (key !== 'date') {
                const value = item[key];
                // THIS IS THE FIX: Explicitly check for empty strings ('') in addition to null/undefined.
                // This prevents Number('') from becoming 0.
                if (value !== null && value !== undefined && value !== '') {
                    enrichedItem[key] = Number(value);
                } else {
                    enrichedItem[key] = null; // Ensure all non-values become null.
                }
            }
        }
        return enrichedItem;
    });
};

export const fetchHealthData = async () => {
  try {
    const days = 5000;
    const sparklineDays = 45;

    const responses = await Promise.allSettled([
      fetch(`/api/oura?days=${days}`),
      fetch(`/api/oura?days=${sparklineDays}`),
      fetch(`/api/withings?days=${days}`),
      fetch(`/api/running?days=${sparklineDays}`),
      fetch(`/api/running?days=${days}`),
      fetch(`/api/clinical?days=${days}`),
      fetch(`/api/clinical?days=${sparklineDays}`),
      fetch(`/api/otherdata?days=${days}`),
      fetch(`/api/otherdata?days=${sparklineDays}`),
      fetch(`/api/macros?days=${days}`),
      fetch(`/api/macros?days=${sparklineDays}`)
    ]);

    const processResponse = async (promiseResult, dataType, enricher) => {
      if (promiseResult.status === 'rejected') {
        console.error(`Workspace failed for ${dataType}:`, promiseResult.reason);
        return [];
      }
      try {
        const data = await handleFetchError(promiseResult.value, dataType);
        return enricher ? enricher(data) : (Array.isArray(data) ? data : []);
      } catch (err) {
        return [];
      }
    };
    
    const [
      ouraFull, ouraSpark,
      withings,
      runningSpark, runningFull,
      clinical, clinicalSpark,
      otherDataFull, otherDataSpark,
      macrosFull, macrosSpark
    ] = await Promise.all([
        processResponse(responses[0], 'Oura full'),
        processResponse(responses[1], 'Oura spark'),
        processResponse(responses[2], 'Withings', enrichNumericData),
        processResponse(responses[3], 'Running spark', enrichRunningData),
        processResponse(responses[4], 'Running full', enrichRunningData),
        processResponse(responses[5], 'Clinical', enrichNumericData),
        processResponse(responses[6], 'Clinical spark', enrichNumericData),
        processResponse(responses[7], 'OtherData full', enrichNumericData),
        processResponse(responses[8], 'OtherData spark', enrichNumericData),
        processResponse(responses[9], 'Macros full', enrichNumericData),
        processResponse(responses[10], 'Macros spark', enrichNumericData)
    ]);
    
    // The new code doesn't merge data, but we can still process it after fetching
    const rawData = {
        oura: ouraFull,
        withings,
        macros: macrosFull,
        running: runningFull,
        clinical,
        otherData: otherDataFull
    };
    
    const processed = processAndDeriveHealthMetrics(rawData);

    return {
      ...processed,
      ouraSpark,
      runningSpark,
      clinicalSpark,
      otherDataSpark,
      macrosSpark
    };

  } catch (error) {
    console.error('Critical error in fetchHealthData:', error);
    return { // Ensure defaults on critical failure
      oura: [], ouraSpark: [], withings: [], running: [], runningSpark: [],
      clinical: [], clinicalSpark: [], otherData: [], otherDataSpark: [],
      macros: [], macrosSpark: [], processedData: [], weightVsDeficitData: []
    };
  }
};