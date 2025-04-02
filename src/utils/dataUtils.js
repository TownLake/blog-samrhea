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
        return;
      }

      try {
        const date = new Date(item.date);
        if (isNaN(date.getTime())) {
          console.warn(`Invalid date encountered for item key "${key}":`, item.date, item);
          return;
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

        const numericValue = Number(item[key]);
        if (!isNaN(numericValue)) {
            monthlyData[monthKey].values.push(numericValue);
            monthlyData[monthKey].count += 1;
        } else {
             console.warn(`Non-numeric value encountered for item key "${key}":`, item[key], item);
        }

      } catch (error) {
          console.error("Error processing item for monthly average:", item, error);
          return;
      }
    });

    return Object.values(monthlyData)
      .map(month => {
          const average = (month.count > 0)
            ? month.values.reduce((sum, val) => sum + val, 0) / month.count
            : 0;

          return {
            month: month.month,
            monthName: month.monthName,
            average: average,
            count: month.count
          };
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  };

// Note: The trend-related functions (getTrendInfo) have been removed as they're replaced by
// the category-based functionality in healthCategories.js