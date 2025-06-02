// src/utils/healthCategories.js
/**
 * Health metrics categories and ranges.
 * Categories: 'excellent', 'good', 'fair', 'poor'
 */

// Category color mappings (hex values)
export const CATEGORY_COLORS = {
  excellent: '#22c55e', // green for excellent
  good: '#3b82f6',       // blue for good
  fair: '#eab308',       // yellow for fair
  poor: '#ef4444',       // red for poor
  default: '#a1a1aa'     // gray for no category or unknown
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
 * The structure assumes that for a given metric, higher values are better,
 * unless the metric typically implies lower is better (e.g., resting_heart_rate).
 * Ranges are defined as [min, max), meaning min is inclusive, max is exclusive.
 * The order of categories within each metric's array matters for the getMetricCategory function.
 * It's generally best to order from "excellent" to "poor" or vice-versa consistently.
 * Current implementation iterates and takes the first match.
 */
const METRIC_RANGES = {
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
  'fat_ratio': [ // Lower is generally better (within healthy limits)
    { category: 'excellent', min: 10, max: 15 }, // Represents 10-14.99...%
    { category: 'good', min: 15, max: 18 },      // Represents 15-17.99...%
    { category: 'fair', min: 18, max: 23 },      // Represents 18-22.99...%
    { category: 'poor', min: 23, max: Infinity } // Represents >= 23%
  ],

  // Sleep Metrics
  'total_sleep': [ // Higher is better (within limits)
    { category: 'excellent', min: 7.5, max: 8.6 },  // 7.5 to 8.59... hours
    { category: 'good', min: 7.0, max: 7.5 },
    { category: 'fair', min: 6.5, max: 7.0 },
    { category: 'poor', min: 0, max: 6.5 }
  ],
  'deep_sleep_minutes': [ // Higher is better
    { category: 'excellent', min: 90, max: 121 },  // 90-120 minutes
    { category: 'good', min: 70, max: 90 },
    { category: 'fair', min: 50, max: 70 },
    { category: 'poor', min: 0, max: 50 }
  ],
  'delay': [ // Sleep latency - Lower is better
    { category: 'excellent', min: 0, max: 10 },    // < 10 minutes
    { category: 'good', min: 10, max: 21 },        // 10-20 minutes
    { category: 'fair', min: 21, max: 31 },        // 21-30 minutes
    { category: 'poor', min: 31, max: Infinity }  // >= 31 minutes
  ],
  'efficiency': [ // Higher is better
    { category: 'excellent', min: 90, max: 101 }, // 90-100% (max 101 to include 100.x values if they occur)
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
  'vo2_max_clinical': [ // Assuming same ranges as watch VO2 Max; adjust if different
    { category: 'excellent', min: 50, max: Infinity },
    { category: 'good', min: 42, max: 50 },
    { category: 'fair', min: 36, max: 42 },
    { category: 'poor', min: 0, max: 36 }
  ],
  'five_k_seconds': [ // Lower is better for time
    // Under 21:00 (1260 seconds)
    { category: 'excellent', min: 0, max: 1260 },
    // 21:00 (1260 seconds) – 24:30 (1470 seconds)
    { category: 'good', min: 1260, max: 1470 + 1 }, // Added 1 to max to ensure 1470 is included
    // 24:31 (1471 seconds) – 28:00 (1680 seconds)
    { category: 'fair', min: 1470 + 1, max: 1680 + 1 }, // Added 1 to max to ensure 1680 is included, and 1 to min to ensure 1471 is included
    // Over 28:00 (1680 seconds)
    { category: 'poor', min: 1680 + 1, max: Infinity } // Added 1 to min to ensure values greater than 1680 are poor
  ],


  // New Fitness Metrics (from user request)
  // Peak Flow Measure (L/min): E(>700), G(600-700), F(500-599), P(<500)
  // Higher is better.
  'peak_flow': [
    // Order E, G, F, P. If value is 700.000000, it's Good. If 700.000001, it's Excellent.
    { category: 'excellent', min: 700.000001, max: Infinity }, // Strictly > 700
    { category: 'good', min: 600, max: 700.000001 },            // 600 to 700 (inclusive)
    { category: 'fair', min: 500, max: 600 },                   // 500 to 599.99... (covers 500-599)
    { category: 'poor', min: 0, max: 500 }                      // < 500
  ],

  // Right Hand Grip Strength (kg): E(>58), G(52-58), F(44-51.9), P(<44)
  // Higher is better. Data key: 'strong_grip'
  'strong_grip': [
    // Order E, G, F, P. If value is 58.0, it's Good. If 58.000001, it's Excellent.
    // Fair range 44-51.9 means values up to 51.999... are fair.
    { category: 'excellent', min: 58.000001, max: Infinity },   // Strictly > 58
    { category: 'good', min: 52, max: 58.000001 },              // 52 to 58 (inclusive)
    { category: 'fair', min: 44, max: 52 },                     // 44 to 51.99... (covers 44-51.9)
    { category: 'poor', min: 0, max: 44 }                       // < 44
  ],

  // Left Hand Grip Strength (kg): E(>54), G(48-54), F(40-47.9), P(<40)
  // Higher is better. Data key: 'weak_grip'
  'weak_grip': [
    // Order E, G, F, P. If value is 54.0, it's Good. If 54.000001, it's Excellent.
    // Fair range 40-47.9 means values up to 47.999... are fair.
    { category: 'excellent', min: 54.000001, max: Infinity },   // Strictly > 54
    { category: 'good', min: 48, max: 54.000001 },              // 48 to 54 (inclusive)
    { category: 'fair', min: 40, max: 48 },                     // 40 to 47.99... (covers 40-47.9)
    { category: 'poor', min: 0, max: 40 }                       // < 40
  ],
  
  // Placeholder for new metric
  'power_breathe_4_min': [],
};

/**
 * Determines the health category for a given metric and its value.
 * @param {string} metricKey The key for the metric (e.g., 'average_hrv', 'peak_flow').
 * @param {number | null | undefined} value The numerical value of the metric.
 * @returns {string} The category ('excellent', 'good', 'fair', 'poor', or 'default').
*/
export const getMetricCategory = (metricKey, value) => {
  if (value === null || value === undefined || isNaN(parseFloat(value))) {
    return 'default'; // Handle invalid or missing values
  }
  const numericValue = parseFloat(value);

  // Specific metrics without standard categories
  if (metricKey === 'weight') { // 'five_k_seconds' is now categorized
    return 'default';
  }

  const ranges = METRIC_RANGES[metricKey];

  if (!ranges) {
    // console.warn(`[getMetricCategory] No ranges defined for metric key: ${metricKey}`);
    return 'default'; // No ranges defined for this metric
  }

  // Iterate through the defined ranges for the metric.
  // The order in the METRIC_RANGES array is important here.
  for (const range of ranges) {
    if (numericValue >= range.min && numericValue < range.max) {
      return range.category;
    }
  }

  return 'default'; // Fallback if no range is matched (e.g., value outside all defined ranges)
};

/**
 * Retrieves comprehensive display information for a metric's category.
 * @param {string} metricKey The key for the metric.
 * @param {number | null | undefined} value The numerical value of the metric.
 * @returns {{category: string, label: string, textColorClass: string, hexColor: string}}
 * An object containing category name, display label, Tailwind CSS class, and hex color.
*/
export const getMetricCategoryInfo = (metricKey, value) => {
  const category = getMetricCategory(metricKey, value);

  // Handle metrics that are explicitly 'default' and don't need a category label
  // 'five_k_seconds' is now categorized, so it's removed from this condition
  if (metricKey === 'weight' || category === 'default') {
    return {
      category: 'default',
      label: '', // No label for 'default' or specifically excluded metrics
      textColorClass: CATEGORY_TEXT_CLASSES.default,
      hexColor: CATEGORY_COLORS.default
    };
  }

  return {
    category,
    label: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize first letter for display
    textColorClass: CATEGORY_TEXT_CLASSES[category] || CATEGORY_TEXT_CLASSES.default,
    hexColor: CATEGORY_COLORS[category] || CATEGORY_COLORS.default
  };
};