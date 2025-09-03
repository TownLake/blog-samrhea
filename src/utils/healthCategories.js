// src/utils/healthCategories.js

/**
 * Health metrics categories and ranges.
 * Categories: 'excellent', 'good', 'fair', 'poor'
 */

// Category color mappings (hex values)
export const CATEGORY_COLORS = {
  excellent: '#22c55e', // green-500
  good: '#3b82f6',       // blue-500
  fair: '#eab308',       // yellow-500
  poor: '#ef4444',       // red-500
  default: '#a1a1aa'     // gray-400
};

// Tailwind CSS class mappings for text color
export const CATEGORY_TEXT_CLASSES = {
  excellent: 'text-green-500',
  good: 'text-blue-500',
  fair: 'text-yellow-500',
  poor: 'text-red-500',
  default: 'text-gray-500 dark:text-gray-400'
};

/**
 * Defines the value ranges for different health metrics.
 * Ranges are defined as [min, max), meaning min is inclusive, max is exclusive.
 */
// --- MODIFIED: Added 'export' to the constant ---
export const METRIC_RANGES = {
  // Heart Metrics
  'average_hrv': [ // Higher is better
    { category: 'excellent', min: 80, max: Infinity },
    { category: 'good', min: 65, max: 80 },
    { category: 'fair', min: 45, max: 65 },
    { category: 'poor', min: 0, max: 45 }
  ],
  'resting_heart_rate': [ // Lower is better
    { category: 'excellent', min: 0, max: 55 },
    { category: 'good', min: 55, max: 63 },
    { category: 'fair', min: 63, max: 73 },
    { category: 'poor', min: 73, max: Infinity }
  ],

  // Body Metrics
  'fat_ratio': [ // Lower is generally better
    { category: 'excellent', min: 10, max: 15 }, 
    { category: 'good', min: 15, max: 18 },      
    { category: 'fair', min: 18, max: 23 },      
    { category: 'poor', min: 23, max: Infinity } 
  ],

  // Sleep Metrics
  'total_sleep': [ // Higher is better
    { category: 'excellent', min: 7.5, max: 8.6 },
    { category: 'good', min: 7.0, max: 7.5 },
    { category: 'fair', min: 6.5, max: 7.0 },
    { category: 'poor', min: 0, max: 6.5 }
  ],
  'deep_sleep_minutes': [ // Higher is better
    { category: 'excellent', min: 90, max: 121 },
    { category: 'good', min: 70, max: 90 },
    { category: 'fair', min: 50, max: 70 },
    { category: 'poor', min: 0, max: 50 }
  ],
  'delay': [ // Sleep latency - Lower is better
    { category: 'excellent', min: 0, max: 10 },
    { category: 'good', min: 10, max: 21 },
    { category: 'fair', min: 21, max: 31 },
    { category: 'poor', min: 31, max: Infinity }
  ],
  'efficiency': [ // Higher is better
    { category: 'excellent', min: 90, max: 101 },
    { category: 'good', min: 85, max: 90 },
    { category: 'fair', min: 75, max: 85 },
    { category: 'poor', min: 0, max: 75 }
  ],

  // Running & Fitness Metrics
  'vo2_max': [ // Higher is better
    { category: 'excellent', min: 50, max: Infinity },
    { category: 'good', min: 42, max: 50 },
    { category: 'fair', min: 36, max: 42 },
    { category: 'poor', min: 0, max: 36 }
  ],
  'vo2_max_clinical': [ // Same ranges as watch VO2 Max
    { category: 'excellent', min: 50, max: Infinity },
    { category: 'good', min: 42, max: 50 },
    { category: 'fair', min: 36, max: 42 },
    { category: 'poor', min: 0, max: 36 }
  ],
  'five_k_seconds': [ // Lower is better
    { category: 'excellent', min: 0, max: 1260 },      // Under 21:00
    { category: 'good', min: 1260, max: 1471 },     // 21:00 to 24:30
    { category: 'fair', min: 1471, max: 1681 },     // 24:31 to 28:00
    { category: 'poor', min: 1681, max: Infinity }  // Over 28:00
  ],
  'ten_k_seconds': [], // Placeholder

  // Other Fitness Metrics
  'peak_flow': [ // Higher is better
    { category: 'excellent', min: 700.000001, max: Infinity },
    { category: 'good', min: 600, max: 700.000001 },
    { category: 'fair', min: 500, max: 600 },
    { category: 'poor', min: 0, max: 500 }
  ],
  'power_breathe_level': [ // Higher is better
    { category: 'excellent', min: 8, max: Infinity },
    { category: 'good', min: 6, max: 8 },
    { category: 'fair', min: 4, max: 6 },
    { category: 'poor', min: 0, max: 4 }
  ],
    
  // Macro Metrics
  'calories_kcal': [
    { category: 'excellent', min: 1980, max: 2420 },
    { category: 'good', min: 1760, max: 1980 },
    { category: 'good', min: 2420, max: 2640 },
    { category: 'fair', min: 1540, max: 1760 },
    { category: 'fair', min: 2640, max: 2860 },
    { category: 'poor', min: 0, max: 1540 },
    { category: 'poor', min: 2860, max: Infinity },
  ],
  'protein_g': [
    { category: 'excellent', min: 148.5, max: 181.5 },
    { category: 'good', min: 132, max: 148.5 },
    { category: 'good', min: 181.5, max: 198 },
    { category: 'fair', min: 115.5, max: 132 },
    { category: 'fair', min: 198, max: 214.5 },
    { category: 'poor', min: 0, max: 115.5 },
    { category: 'poor', min: 214.5, max: Infinity },
  ],
  'fat_g': [
    { category: 'excellent', min: 51.8, max: 70.2 },
    { category: 'good', min: 42.7, max: 51.8 },
    { category: 'good', min: 70.2, max: 79.3 },
    { category: 'fair', min: 30.5, max: 42.7 },
    { category: 'fair', min: 79.3, max: 91.5 },
    { category: 'poor', min: 0, max: 30.5 },
    { category: 'poor', min: 91.5, max: Infinity },
  ],
  'carbs_g': [
    { category: 'excellent', min: 223.2, max: 272.8 },
    { category: 'good', min: 198.4, max: 223.2 },
    { category: 'good', min: 272.8, max: 297.6 },
    { category: 'fair', min: 173.6, max: 198.4 },
    { category: 'fair', min: 297.6, max: 322.4 },
    { category: 'poor', min: 0, max: 173.6 },
    { category: 'poor', min: 322.4, max: Infinity },
  ],
  'sugar_g': [
    { category: 'excellent', min: 0, max: 35 },
    { category: 'good', min: 35, max: 50.00001 },
    { category: 'fair', min: 50.00001, max: 70 },
    { category: 'poor', min: 70, max: Infinity },
  ],
  'sat_fat_g': [
    { category: 'excellent', min: 0, max: 15 },
    { category: 'good', min: 15, max: 20.00001 },
    { category: 'fair', min: 20.00001, max: 28 },
    { category: 'poor', min: 28, max: Infinity },
  ],
};

/**
 * Determines the health category for a given metric and its value.
 * @param {string} metricKey The key for the metric (e.g., 'average_hrv').
 * @param {number | null | undefined} value The numerical value of the metric.
 * @returns {string} The category ('excellent', 'good', 'fair', 'poor', or 'default').
*/
export const getMetricCategory = (metricKey, value) => {
  if (value === null || value === undefined || isNaN(parseFloat(value))) {
    return 'default';
  }
  const numericValue = parseFloat(value);

  if (metricKey === 'weight') {
    return 'default';
  }

  const ranges = METRIC_RANGES[metricKey];

  if (!ranges) {
    return 'default';
  }

  for (const range of ranges) {
    if (numericValue >= range.min && numericValue < range.max) {
      return range.category;
    }
  }

  return 'default';
};

/**
 * Retrieves comprehensive display information for a metric's category.
 * @param {string} metricKey The key for the metric.
 * @param {number | null | undefined} value The numerical value of the metric.
 * @returns {{category: string, label: string, textColorClass: string, hexColor: string}}
*/
export const getMetricCategoryInfo = (metricKey, value) => {
  const category = getMetricCategory(metricKey, value);

  if (metricKey === 'weight' || category === 'default') {
    return {
      category: 'default',
      label: '',
      textColorClass: CATEGORY_TEXT_CLASSES.default,
      hexColor: CATEGORY_COLORS.default
    };
  }

  return {
    category,
    label: category.charAt(0).toUpperCase() + category.slice(1),
    textColorClass: CATEGORY_TEXT_CLASSES[category] || CATEGORY_TEXT_CLASSES.default,
    hexColor: CATEGORY_COLORS[category] || CATEGORY_COLORS.default
  };
};