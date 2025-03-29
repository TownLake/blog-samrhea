// src/utils/dataUtils.js

/**
 * Formats seconds to a MM:SS format
 * @param {number | null | undefined} seconds - The seconds to format
 * @returns {string} Formatted time string or '--:--' if input is invalid
 */
export const formatSecondsToMMSS = (seconds) => {
  // Handle null, undefined, or non-numeric input gracefully
  if (seconds === null || seconds === undefined || isNaN(Number(seconds))) {
    return '--:--';
  }

  const totalSeconds = Math.floor(Number(seconds)); // Ensure it's an integer
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Validates if the primary data arrays contain meaningful data
 * @param {Array | null | undefined} ouraData - Oura ring data
 * @param {Array | null | undefined} withingsData - Withings scale data
 * @returns {boolean} Whether valid data exists in at least one source
 */
export const hasValidData = (ouraData, withingsData) => {
  // Check if both are arrays and at least one has items
  return (Array.isArray(ouraData) && ouraData.length > 0) ||
         (Array.isArray(withingsData) && withingsData.length > 0);
  // Depending on your needs, you might require *both* to have data,
  // or check other data sources like runningData as well. Adjust if necessary.
};

/**
 * Creates data for sparkline charts (last 14 days, chronological)
 * @param {Array | null | undefined} data - The source data array (expects objects with 'date' and the key)
 * @param {string} key - The property key to extract
 * @returns {Array} Formatted data [{date, value}, ...] for sparkline visualization
 */
export const createSparklineData = (data, key) => {
  if (!data || !Array.isArray(data) || data.length === 0) return [];

  // Data is expected to be sorted DESC (most recent first) from the API
  return data
    .slice(0, 14) // Take the 14 most recent entries
    .map(item => ({
      // Ensure date and value exist, provide defaults if needed
      date: item?.date ?? null,
      value: item?.[key] ?? null // Use optional chaining
    }))
    .reverse(); // Reverse to show chronologically (oldest of the 14 first)
};

/**
 * Creates monthly average data from daily data points, handling potential errors.
 * @param {Array | null | undefined} data - The source data array (expects objects with a 'date' property and the specified key)
 * @param {string} key - The key to average
 * @returns {Array} Monthly averaged data [{ month, monthName, average, count }, ...]
 */
export const createMonthlyAverageData = (data, key) => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    const monthlyData = {};

    data.forEach(item => {
      // Ensure the item, key, and date exist and the value is not null/undefined
      if (item == null || item[key] === null || item[key] === undefined || !item.date) {
        // Optionally log skipped items for debugging
        // console.log('Skipping item for monthly average due to missing data:', item);
        return;
      }

      try {
        const date = new Date(item.date);
        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn(`Invalid date encountered for item key "${key}":`, item.date, item);
          return; // Skip items with invalid dates
        }

        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleString('default', { month: 'short' });

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            monthName,
            values: [],
            count: 0
          };
        }

        // Ensure the value is a number before pushing
        const numericValue = Number(item[key]);
        if (!isNaN(numericValue)) {
            monthlyData[monthKey].values.push(numericValue);
            monthlyData[monthKey].count += 1;
        } else {
             console.warn(`Non-numeric value encountered for item key "${key}":`, item[key], item);
        }

      } catch (error) {
          console.error("Error processing item for monthly average:", item, error);
          return; // Skip items that cause errors during processing
      }
    });

    // Calculate averages, ensuring no division by zero
    return Object.values(monthlyData)
      .map(month => {
          // Check count is greater than zero before dividing
          const average = (month.count > 0)
            ? month.values.reduce((sum, val) => sum + val, 0) / month.count
            : 0; // Default average to 0 if no valid data points (or null/NaN if preferred)

          return {
            month: month.month,
            monthName: month.monthName,
            average: average,
            count: month.count
          };
      })
      .sort((a, b) => a.month.localeCompare(b.month)); // Keep sorting
  };


/**
 * Calculates trend information for a metric based on the last two data points.
 * @param {Array | null | undefined} data - The source data array (needs at least 2 items, sorted DESC)
 * @param {string} key - The property key to analyze
 * @param {string} type - The type of metric (e.g., 'hrv', 'rhr', 'weight') to determine if increase/decrease is positive
 * @returns {Object} Trend info: { trend: string, trendColor: string }
 */
export const getTrendInfo = (data, key, type) => {
  // Default trend if data is insufficient
  const defaultTrend = { trend: 'No trend data', trendColor: 'text-gray-500 dark:text-gray-400' };

  if (!data || !Array.isArray(data) || data.length < 2) {
    return defaultTrend;
  }

  // Get current and previous values (assuming data is sorted DESC)
  const currentItem = data[0];
  const previousItem = data[1];

  // Check if items and the key exist and are numeric
  if (currentItem == null || previousItem == null ||
      currentItem[key] === null || currentItem[key] === undefined || isNaN(Number(currentItem[key])) ||
      previousItem[key] === null || previousItem[key] === undefined || isNaN(Number(previousItem[key])) ) {
    return defaultTrend;
  }

  const current = Number(currentItem[key]);
  const previous = Number(previousItem[key]);

  // Avoid division by zero if previous value was 0
  if (previous === 0) {
      if (current > 0) return { trend: 'Increased ↑', trendColor: 'text-green-500' };
      if (current < 0) return { trend: 'Decreased ↓', trendColor: 'text-red-500' }; // Or green depending on type
      return { trend: 'No change', trendColor: 'text-gray-500 dark:text-gray-400' };
  }

  // Calculate percent change
  const diff = current - previous;
  const percentChange = (diff / Math.abs(previous)) * 100;

  // Format the trend text
  let trendText = `${Math.abs(percentChange).toFixed(1)}% `;
  let directionArrow = '';

  if (Math.abs(percentChange) < 0.05) { // Consider very small changes as "No change"
      trendText = 'No change';
      directionArrow = '';
  } else if (diff > 0) {
      trendText += '↑';
      directionArrow = 'up';
  } else {
      trendText += '↓';
      directionArrow = 'down';
  }

  if (trendText === 'No change') {
      return { trend: trendText, trendColor: 'text-gray-500 dark:text-gray-400' };
  }

  // Determine if the change direction is positive based on the metric type
  const isPositiveChange = (() => {
    if (directionArrow === '') return null; // No change case

    switch (type) {
      // Metrics where increase is good
      case 'hrv':
      case 'sleep': // total_sleep
      case 'deep_sleep': // deep_sleep_minutes
      case 'efficiency': // sleep efficiency
      case 'vo2max':
        return directionArrow === 'up';

      // Metrics where decrease is good
      case 'rhr': // resting_heart_rate
      case 'weight':
      case 'bodyFat': // fat_ratio
      case 'delay': // sleep delay
      case 'five_k_seconds': // 5k time
        return directionArrow === 'down';

      // Default: assume increase is good if type is unknown
      default:
        console.warn(`Unknown trend type: ${type}. Assuming increase is positive.`);
        return directionArrow === 'up';
    }
  })();

  // Assign color based on whether the change was positive
  const trendColor = isPositiveChange === true ? 'text-green-500'
                   : isPositiveChange === false ? 'text-red-500'
                   : 'text-gray-500 dark:text-gray-400'; // Should only hit this for 'No change'

  return {
    trend: trendText,
    trendColor: trendColor
  };
};

// You could add other utility functions here if needed