/**
 * Formats seconds to a MM:SS format
 * @param {number} seconds - The seconds to format
 * @returns {string} Formatted time string
 */
export const formatSecondsToMMSS = (seconds) => {
    if (!seconds && seconds !== 0) return '--:--';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  /**
   * Validates if the data arrays contain meaningful data
   * @param {Array} ouraData - Oura ring data
   * @param {Array} withingsData - Withings scale data 
   * @returns {boolean} Whether valid data exists
   */
  export const hasValidData = (ouraData, withingsData) => {
    return Array.isArray(ouraData) && 
           Array.isArray(withingsData) && 
           (ouraData.length > 0 || withingsData.length > 0);
  };
  
  /**
   * Creates data for sparkline charts
   * @param {Array} data - The source data array
   * @param {string} key - The property key to extract
   * @returns {Array} Formatted data for sparkline visualization
   */
  export const createSparklineData = (data, key) => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    // Take last 14 days and reverse to show chronologically
    return data
      .slice(0, 14)
      .map(item => ({
        date: item.date,
        value: item[key]
      }))
      .reverse();
  };
  
  /**
   * Creates monthly average data from daily data points
   * @param {Array} data - The source data array
   * @param {string} key - The key to average
   * @returns {Array} Monthly averaged data
   */
  export const createMonthlyAverageData = (data, key) => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    // Group by month
    const monthlyData = {};
    
    data.forEach(item => {
      if (item[key] === null || item[key] === undefined) return;
      
      const date = new Date(item.date);
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
      
      monthlyData[monthKey].values.push(item[key]);
      monthlyData[monthKey].count += 1;
    });
    
    // Calculate averages
    return Object.values(monthlyData)
      .map(month => ({
        month: month.month,
        monthName: month.monthName,
        average: month.values.reduce((sum, val) => sum + val, 0) / month.values.length,
        count: month.count
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };
  
  /**
   * Calculates trend information for a metric
   * @param {Array} data - The source data array
   * @param {string} key - The property key to analyze
   * @param {string} type - The type of metric (for special handling)
   * @returns {Object} Trend information including direction and color
   */
  export const getTrendInfo = (data, key, type) => {
    if (!data || !Array.isArray(data) || data.length < 2) {
      return { trend: 'No change', trendColor: 'text-gray-500' };
    }
    
    // Get current and previous values
    const current = data[0][key];
    const previous = data[1][key];
    
    if (current === undefined || previous === undefined) {
      return { trend: 'No change', trendColor: 'text-gray-500' };
    }
    
    // Calculate percent change
    const diff = current - previous;
    const percentChange = (diff / Math.abs(previous)) * 100;
    
    // Format the trend text
    let trendText = `${Math.abs(percentChange).toFixed(1)}% `;
    
    // Determine if increase is good or bad based on the metric type
    const isPositiveChange = (() => {
      switch (type) {
        // Metrics where increase is good
        case 'hrv':
        case 'sleep':
        case 'deep_sleep':
        case 'efficiency':
        case 'vo2max':
          return diff > 0;
        
        // Metrics where decrease is good
        case 'rhr':
        case 'weight':
        case 'bodyFat':
        case 'delay':
        case 'five_k_seconds':
          return diff < 0;
        
        default:
          return diff > 0;
      }
    })();
    
    // Add direction indicator and set color
    if (diff > 0) {
      trendText += '↑';
    } else if (diff < 0) {
      trendText += '↓';
    } else {
      trendText = 'No change';
    }
    
    const trendColor = isPositiveChange ? 'text-green-500' : 'text-red-500';
    
    return {
      trend: trendText,
      trendColor: Math.abs(percentChange) < 0.5 ? 'text-gray-500' : trendColor
    };
  };