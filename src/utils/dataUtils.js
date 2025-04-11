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
 * @returns {Array} Data from last 3 months in REVERSE chronological order (newest first)
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

  // Return in reverse chronological order (newest first)
  // The DetailedChartModal will reverse this again if needed for the DailyChart
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
  if (!data || !Array.isArray(data) || data.length === 0 || !key) {
    return [];
  }

  // Group by month and year - without filtering anything
  const monthlyGroups = {};
  
  data.forEach(item => {
    // Skip invalid items but keep filled values
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
      
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = {
          month: monthKey,
          year: date.getFullYear(),
          monthNum: date.getMonth(),
          monthName,
          values: [],
          count: 0,
          sum: 0
        };
      }
      
      const numericValue = Number(item[key]);
      if (!isNaN(numericValue)) {
        monthlyGroups[monthKey].values.push(numericValue);
        monthlyGroups[monthKey].sum += numericValue;
        monthlyGroups[monthKey].count += 1;
      } else {
        console.warn(`Non-numeric value encountered for item key "${key}":`, item[key], item);
      }
    } catch (error) {
      console.error("Error processing item for monthly average:", item, error);
      return;
    }
  });
  
  // Convert to array with averages
  const result = Object.values(monthlyGroups).map(group => {
    const avg = group.count > 0 ? group.sum / group.count : 0;
    
    return {
      month: group.month,
      year: group.year,
      monthNum: group.monthNum,
      monthYear: `${group.year}-${group.monthNum + 1}`, // 1-indexed for display
      monthName: group.monthName,
      date: `${group.year}-${(group.monthNum + 1).toString().padStart(2, '0')}-01`,
      average: avg,
      count: group.count,
      min: Math.min(...group.values),
      max: Math.max(...group.values)
    };
  });
  
  // Sort by date (oldest first)
  return result.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.monthNum - b.monthNum;
  });
};