// src/utils/dataUtils.js

/**
 * Helper function to format a Date object into 'YYYY-MM-DD' string.
 * Replaces date-fns.format.
 * @param {Date} date The date object to format.
 * @returns {string} The formatted date string.
 */
function formatDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Merges multiple health data sources into a single array, keyed by date.
 * @param {Object} dataSources - An object with keys as source names and values as data arrays.
 * @param {number} days - The number of days to generate a complete timeline for.
 * @returns {Array} A sorted array of objects, each representing a day with all available data.
 */
function mergeHealthData(dataSources, days = 365) {
  const mergedData = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Replaces date-fns.startOfDay

  // Initialize map with all dates in the range
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i); // Replaces date-fns.subDays
    mergedData.set(formatDate(date), { date: formatDate(date) });
  }

  // Populate the map with data from each source
  for (const sourceName in dataSources) {
    const dataArray = dataSources[sourceName];
    if (Array.isArray(dataArray)) {
      dataArray.forEach(record => {
        if (record && record.date) {
          const dateKey = record.date.split('T')[0]; // Normalize date format
          if (mergedData.has(dateKey)) {
            mergedData.set(dateKey, { ...mergedData.get(dateKey), ...record });
          }
        }
      });
    }
  }

  return Array.from(mergedData.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Calculates a rolling sum on a given key in an array of data.
 * @param {Array} data - The input data array, assumed to be sorted by date.
 * @param {string} key - The key of the data to sum.
 * @param {number} windowSize - The size of the rolling window.
 * @returns {Array} The data array with a new key '{key}_rolling_{windowSize}d' added.
 */
function calculateRollingSum(data, key, windowSize) {
  const result = [];
  let currentWindow = [];

  for (let i = 0; i < data.length; i++) {
    const record = { ...data[i] };
    const value = record[key] === undefined || record[key] === null ? null : record[key];

    if (value !== null) {
      currentWindow.push(value);
    }

    if (currentWindow.length > windowSize) {
      currentWindow.shift();
    }

    // Only calculate sum if the window is full to avoid partial sums at the beginning
    if (currentWindow.length === windowSize) {
      const sum = currentWindow.reduce((acc, val) => acc + val, 0);
      record[`${key}_rolling_${windowSize}d`] = sum;
    } else {
      record[`${key}_rolling_${windowSize}d`] = null;
    }
    result.push(record);
  }
  return result;
}

/**
 * Processes raw health data to create derived metrics and datasets for charting.
 * This is the main orchestrator function.
 * @param {Object} rawData - The raw data from APIs (oura, withings, macros).
 * @returns {Object} A structured object containing both raw and processed data.
 */
export function processAndDeriveHealthMetrics(rawData) {
  const { oura, withings, macros, running, clinical, otherData } = rawData;

  const allMerged = mergeHealthData({ oura, withings, macros, running, clinical, otherData }, 365);

  // 1. Calculate daily calorie delta with default for calories burned
  const withDelta = allMerged.map(day => {
    const caloriesIn = day.calories_kcal;
    // Use default of 2400 if total_calories is missing, but only if caloriesIn exists to calculate a delta
    const caloriesOut = (caloriesIn != null && day.total_calories == null) ? 2400 : day.total_calories;
    
    return {
      ...day,
      calorie_delta: (caloriesIn != null && caloriesOut != null) ? caloriesIn - caloriesOut : null,
    };
  });

  // 2. Calculate 14-day rolling cumulative deficit
  const withRollingDeficit = calculateRollingSum(withDelta, 'calorie_delta', 14);

  // 3. Create a clean dataset for the Weight vs. Deficit chart
  const weightVsDeficitData = withRollingDeficit
    .filter(d => d.weight != null && d.calorie_delta_rolling_14d != null)
    .map(d => ({
      date: d.date,
      weight: d.weight,
      cumulativeDeficit: d.calorie_delta_rolling_14d,
    }));

  return {
    ...rawData,
    processedData: withRollingDeficit.sort((a, b) => new Date(b.date) - new Date(a.date)),
    weightVsDeficitData,
  };
}


// --- Your existing functions below ---

/**
 * Formats seconds to a MM:SS format
 * @param {number | null | undefined} seconds - The seconds to format
 * @returns {string} Formatted time string or '--:--' if input is invalid
 */
export const formatSecondsToMMSS = (seconds) => {
  if (seconds === null || seconds === undefined || isNaN(Number(seconds))) {
    return '--:--';
  }

  const totalSeconds = Math.floor(Number(seconds));
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
  return (Array.isArray(ouraData) && ouraData.length > 0) ||
         (Array.isArray(withingsData) && withingsData.length > 0);
};

/**
 * Creates data for sparkline charts (last 45 days)
 * @param {Array} data - The source data array
 * @param {string} key - The property key to extract
 * @returns {Array} Formatted data for sparkline visualization
 */
export const createSparklineData = (data, key) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoffDate = new Date(today);
  cutoffDate.setDate(today.getDate() - 45);
  
  const recentData = data.filter(item => {
    if (!item || !item.date) return false;
    const itemDate = new Date(item.date);
    return !isNaN(itemDate.getTime()) && itemDate >= cutoffDate;
  });

  const sortedData = [...recentData].sort((a, b) => new Date(a.date) - new Date(b.date));

  return sortedData.map(item => ({
    date: item.date,
    value: item[key],
    ...(item[`is_fill_value_${key?.split('_')[0]}`] ? { isFilled: true } : {})
  }));
};

/**
 * Creates data for the detailed line chart showing the last 3 months
 * @param {Array} data - Complete dataset with date property
 * @returns {Array} Data from last 3 months in chronological order
 */
export const createDetailChartData = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  
  const recentData = data.filter(item => {
    if (!item || !item.date) return false;
    const itemDate = new Date(item.date);
    return !isNaN(itemDate.getTime()) && itemDate >= threeMonthsAgo;
  });

  return [...recentData].sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Creates monthly average data using all available data
 * @param {Array} data - The source data array
 * @param {string} key - The key to average
 * @returns {Array} Monthly averaged data sorted chronologically
 */
export const createMonthlyAverageData = (data, key) => {
  if (!data || !Array.isArray(data) || data.length === 0 || !key) {
    return [];
  }

  const monthlyGroups = {};
  
  data.forEach(item => {
    if (item == null || item[key] === null || item[key] === undefined || !item.date) {
      return;
    }
    
    try {
      const date = new Date(item.date);
      if (isNaN(date.getTime())) return;
      
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
      }
    } catch (error) {
      console.error("Error processing item for monthly average:", error);
    }
  });
  
  const result = Object.values(monthlyGroups).map(group => {
    const avg = group.count > 0 ? group.sum / group.count : 0;
    
    return {
      month: group.month,
      year: group.year,
      monthNum: group.monthNum,
      monthName: group.monthName,
      date: `${group.year}-${(group.monthNum + 1).toString().padStart(2, '0')}-01`,
      average: avg,
      count: group.count,
      min: Math.min(...group.values),
      max: Math.max(...group.values)
    };
  });
  
  return result.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.monthNum - b.monthNum;
  });
};