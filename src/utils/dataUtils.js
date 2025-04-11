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
 * Creates data for sparkline charts (last 45 days, chronological)
 * @param {Array | null | undefined} data - The source data array (expects objects with 'date' and the key)
 * @param {string} key - The property key to extract
 * @returns {Array} Formatted data [{date, value}, ...] for sparkline visualization
 */
export const createSparklineData = (data, key) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  // Calculate date 45 days ago from now
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize time to start of day
  const cutoffDate = new Date(today);
  cutoffDate.setDate(today.getDate() - 45);
  
  // Filter data to only include measurements from last 45 days
  const recentData = data.filter(item => {
    if (!item || !item.date) return false;
    const itemDate = new Date(item.date);
    return !isNaN(itemDate.getTime()) && itemDate >= cutoffDate;
  });

  // Sort by date ascending (oldest first)
  const sortedData = [...recentData].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });

  // For sparkline, we only need date and value
  return sortedData.map(item => ({
    date: item.date,
    value: item[key],
    // Preserve the fill flag if present
    ...(item[`is_fill_value_${key?.split('_')[0]}`] ? 
        { isFilled: true } : {})
  }));
};

/**
 * Creates data for the detailed line chart showing the last 3 months
 * @param {Array | null | undefined} fullData - Complete dataset with date property
 * @returns {Array} Data from last 3 months
 */
export const createDetailChartData = (fullData) => {
  if (!fullData || !Array.isArray(fullData) || fullData.length === 0) {
    return [];
  }

  // Calculate date 3 months ago from now
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize time to start of day
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  
  // Filter data to only include measurements from last 3 months
  const recentData = fullData.filter(item => {
    if (!item || !item.date) return false;
    const itemDate = new Date(item.date);
    return !isNaN(itemDate.getTime()) && itemDate >= threeMonthsAgo;
  });

  // Return in reverse chronological order (newest first) for the daily chart
  return [...recentData].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });
};

/**
 * Creates monthly average data that includes ALL available data for each month
 * @param {Array | null | undefined} data - The source data array (expects objects with 'date' property and the specified key)
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
          year: parseInt(month.month.split('-')[0], 10),
          monthNum: parseInt(month.month.split('-')[1], 10) - 1, // Convert to 0-indexed for sorting
          monthName: month.monthName,
          average: average,
          count: month.count,
          min: Math.min(...month.values),
          max: Math.max(...month.values),
          // Add formatted date for XAxis in charts
          date: `${month.month}-01`
        };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthNum - b.monthNum;
    });
};