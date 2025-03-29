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


// *** CHANGE #1: Define HEX colors for trends ***
const TREND_COLORS_HEX = {
    positive: '#22c55e', // green-500
    negative: '#ef4444', // red-500
    neutral: '#a1a1aa'   // gray-400 (Ensure this looks okay in both light/dark)
};

/**
 * Calculates trend information for a metric based on the last two data points.
 * @param {Array | null | undefined} data - The source data array (needs at least 2 items, sorted DESC)
 * @param {string} key - The property key to analyze
 * @param {string} type - The type of metric (e.g., 'hrv', 'rhr', 'weight') to determine if increase/decrease is positive
 * @returns {Object} Trend info: { trend: string, trendColor: string, trendHexColor: string } // <-- Added trendHexColor
 */
export const getTrendInfo = (data, key, type) => {
  // *** CHANGE #2: Add trendHexColor to defaultTrend ***
  const defaultTrend = {
      trend: 'No trend data',
      trendColor: 'text-gray-500 dark:text-gray-400',
      trendHexColor: TREND_COLORS_HEX.neutral
  };

  if (!data || !Array.isArray(data) || data.length < 2) {
    return defaultTrend;
  }

  const currentItem = data[0];
  const previousItem = data[1];

  if (currentItem == null || previousItem == null ||
      currentItem[key] === null || currentItem[key] === undefined || isNaN(Number(currentItem[key])) ||
      previousItem[key] === null || previousItem[key] === undefined || isNaN(Number(previousItem[key])) ) {
    return defaultTrend;
  }

  const current = Number(currentItem[key]);
  const previous = Number(previousItem[key]);

  if (previous === 0) {
      // Simplified handling for zero previous value, adapt if specific hex colors needed
      if (current > 0) return { trend: 'Increased ↑', trendColor: 'text-green-500', trendHexColor: TREND_COLORS_HEX.positive };
      if (current < 0) return { trend: 'Decreased ↓', trendColor: 'text-red-500', trendHexColor: TREND_COLORS_HEX.negative }; // Or green depending on type
      return { trend: 'No change', trendColor: 'text-gray-500 dark:text-gray-400', trendHexColor: TREND_COLORS_HEX.neutral };
  }

  const diff = current - previous;
  const percentChange = (diff / Math.abs(previous)) * 100;

  let trendText = `${Math.abs(percentChange).toFixed(1)}% `;
  let directionArrow = '';

  if (Math.abs(percentChange) < 0.05) {
      trendText = 'No change';
      directionArrow = '';
  } else if (diff > 0) {
      trendText += '↑';
      directionArrow = 'up';
  } else {
      trendText += '↓';
      directionArrow = 'down';
  }

  // *** CHANGE #3: Return defaultTrend (which includes hex) for No Change ***
  if (trendText === 'No change') {
      return {
          trend: trendText,
          trendColor: 'text-gray-500 dark:text-gray-400',
          trendHexColor: TREND_COLORS_HEX.neutral
      };
  }

  const isPositiveChange = (() => {
    if (directionArrow === '') return null;

    switch (type) {
      case 'hrv':
      case 'sleep':
      case 'deep_sleep':
      case 'efficiency':
      case 'vo2max':
        return directionArrow === 'up';

      case 'rhr':
      case 'weight':
      case 'bodyFat':
      case 'delay':
      case 'five_k_seconds':
        return directionArrow === 'down';

      default:
        console.warn(`Unknown trend type: ${type}. Assuming increase is positive.`);
        return directionArrow === 'up';
    }
  })();

  const trendColorClass = isPositiveChange === true ? 'text-green-500'
                   : isPositiveChange === false ? 'text-red-500'
                   : 'text-gray-500 dark:text-gray-400';

  // *** CHANGE #4: Determine hex color based on positive/negative change ***
  const trendHexColorValue = isPositiveChange === true ? TREND_COLORS_HEX.positive
                         : isPositiveChange === false ? TREND_COLORS_HEX.negative
                         : TREND_COLORS_HEX.neutral;

  return {
    trend: trendText,
    trendColor: trendColorClass,
    trendHexColor: trendHexColorValue // <-- Return the determined hex color
  };
};