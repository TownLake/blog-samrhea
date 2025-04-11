// src/utils/dataUtils.js

/**
 * Formats seconds to MM:SS format for display
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time
 */
export const formatSecondsToMMSS = (seconds) => {
  if (seconds === null || seconds === undefined) return '--:--';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Creates date-normalized sparkline data for the last 45 days
 * @param {Array} fullData - Complete dataset with date property
 * @param {string} dataKey - Key to extract value from
 * @returns {Array} Last 45 days worth of data
 */
export const createSparklineData = (fullData, dataKey) => {
  if (!fullData || !Array.isArray(fullData) || fullData.length === 0) {
    return [];
  }

  // Calculate date 45 days ago from now
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize time to start of day
  const cutoffDate = new Date(today);
  cutoffDate.setDate(today.getDate() - 45);
  
  // Filter data to only include measurements from last 45 days
  const recentData = fullData.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= cutoffDate;
  });

  // Sort by date ascending (oldest first)
  const sortedData = [...recentData].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  // For sparkline, we only need date and value
  return sortedData.map(item => ({
    date: item.date,
    value: item[dataKey],
    // Preserve the fill flag if present
    ...(item[`is_fill_value_${dataKey?.split('_')[0]}`] ? 
        { isFilled: true } : {})
  }));
};

/**
 * Creates data for the detailed line chart showing the last 3 months
 * @param {Array} fullData - Complete dataset with date property
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
    const itemDate = new Date(item.date);
    return itemDate >= threeMonthsAgo;
  });

  // Return in reverse chronological order (newest first) for the daily chart
  return [...recentData].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
};

/**
 * Creates monthly average data that includes ALL available data for each month
 * @param {Array} data - Data array with date property 
 * @param {string} dataKey - Key to extract value from
 * @returns {Array} Monthly averaged data
 */
export const createMonthlyAverageData = (data, dataKey) => {
  if (!data || !Array.isArray(data) || data.length === 0 || !dataKey) {
    return [];
  }

  // Group by month and year
  const monthlyGroups = {};
  
  data.forEach(item => {
    if (item[dataKey] === null || item[dataKey] === undefined) return;
    
    const date = new Date(item.date);
    const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
    
    if (!monthlyGroups[monthYear]) {
      monthlyGroups[monthYear] = {
        month: date.getMonth(),
        year: date.getFullYear(),
        values: [],
        count: 0,
        sum: 0
      };
    }
    
    monthlyGroups[monthYear].values.push(item[dataKey]);
    monthlyGroups[monthYear].sum += item[dataKey];
    monthlyGroups[monthYear].count++;
  });
  
  // Convert to array with averages
  const result = Object.values(monthlyGroups).map(group => {
    const avg = group.count > 0 ? group.sum / group.count : 0;
    const monthDate = new Date(group.year, group.month, 1);
    
    return {
      month: group.month,
      year: group.year,
      monthYear: `${group.year}-${group.month + 1}`, // 1-indexed for display
      monthName: monthDate.toLocaleString('default', { month: 'short' }),
      date: `${group.year}-${(group.month + 1).toString().padStart(2, '0')}-01`,
      average: avg,
      count: group.count,
      min: Math.min(...group.values),
      max: Math.max(...group.values)
    };
  });
  
  // Sort by date (oldest first)
  return result.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
};