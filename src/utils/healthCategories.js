// src/utils/healthCategories.js
/**
 * Health metrics categories and ranges
 * Categories: 'excellent', 'good', 'fair', 'poor'
 */

// Category color mappings (hex values)
export const CATEGORY_COLORS = {
    excellent: '#22c55e', // green for excellent
    good: '#3b82f6',      // blue for good
    fair: '#eab308',      // yellow for fair
    poor: '#ef4444',      // red for poor
    default: '#a1a1aa'    // gray for no category or unknown
  };
  
  // Tailwind class mappings
  export const CATEGORY_TEXT_CLASSES = {
    excellent: 'text-green-500',
    good: 'text-blue-500',
    fair: 'text-yellow-500',
    poor: 'text-red-500',
    default: 'text-gray-500 dark:text-gray-400'
  };
  
  // Range definitions (derived from CSV data)
  const METRIC_RANGES = {
    // Heart metrics
    'average_hrv': [
      { category: 'excellent', min: 80, max: Infinity },
      { category: 'good', min: 65, max: 80 },
      { category: 'fair', min: 45, max: 64 },
      { category: 'poor', min: 0, max: 45 }
    ],
    'resting_heart_rate': [
      { category: 'excellent', min: 0, max: 55 },
      { category: 'good', min: 55, max: 63 },
      { category: 'fair', min: 63, max: 73 },
      { category: 'poor', min: 73, max: Infinity }
    ],
    
    // Body metrics
    'fat_ratio': [
      { category: 'excellent', min: 10, max: 14 },
      { category: 'good', min: 15, max: 17 },
      { category: 'fair', min: 18, max: 22 },
      { category: 'poor', min: 22, max: Infinity }
    ],
    
    // Sleep metrics
    'total_sleep': [
      { category: 'excellent', min: 7.5, max: 8.5 },
      { category: 'good', min: 7.0, max: 7.5 },
      { category: 'fair', min: 6.5, max: 7.0 },
      { category: 'poor', min: 0, max: 6.5 }
    ],
    'deep_sleep_minutes': [
      { category: 'excellent', min: 90, max: 120 },
      { category: 'good', min: 70, max: 90 },
      { category: 'fair', min: 50, max: 70 },
      { category: 'poor', min: 0, max: 50 }
    ],
    'delay': [
      { category: 'excellent', min: 0, max: 10 },
      { category: 'good', min: 10, max: 20 },
      { category: 'fair', min: 20, max: 30 },
      { category: 'poor', min: 30, max: Infinity }
    ],
    'efficiency': [
      { category: 'excellent', min: 90, max: 100 },
      { category: 'good', min: 85, max: 90 },
      { category: 'fair', min: 75, max: 85 },
      { category: 'poor', min: 0, max: 75 }
    ],
    
    // Running metrics
    'vo2_max': [
      { category: 'excellent', min: 52, max: Infinity },
      { category: 'good', min: 46, max: 52 },
      { category: 'fair', min: 40, max: 46 },
      { category: 'poor', min: 0, max: 40 }
    ]
    // 5K time is handled separately since it's in seconds
  };
  
  // Special handling for 5K time (seconds)
  // Assuming 5K times where lower is better
  const FIVE_K_RANGES = {
    // Example ranges in seconds:
    // excellent: < 22:00 (1320 seconds)
    // good: 22:00-25:00 (1320-1500 seconds)
    // fair: 25:00-30:00 (1500-1800 seconds)
    // poor: > 30:00 (1800+ seconds)
    'five_k_seconds': [
      { category: 'excellent', min: 0, max: 1320 },
      { category: 'good', min: 1320, max: 1500 },
      { category: 'fair', min: 1500, max: 1800 },
      { category: 'poor', min: 1800, max: Infinity }
    ]
  };
  
  /**
   * Get category for a given metric value
   * @param {string} metricKey - The metric key (e.g., 'average_hrv')
   * @param {number} value - The metric value
   * @returns {string} Category ('excellent', 'good', 'fair', 'poor', or 'default')
   */
  export const getMetricCategory = (metricKey, value) => {
    // Handle null or undefined values
    if (value === null || value === undefined || isNaN(value)) {
      return 'default';
    }
    
    // Choose the appropriate ranges based on metric key
    let ranges;
    if (metricKey === 'five_k_seconds') {
      ranges = FIVE_K_RANGES[metricKey];
    } else {
      ranges = METRIC_RANGES[metricKey];
    }
    
    // If no ranges found for this metric, return default
    if (!ranges) {
      return 'default';
    }
    
    // Find matching range
    for (const range of ranges) {
      if (value >= range.min && value < range.max) {
        return range.category;
      }
    }
    
    return 'default';
  };
  
  /**
   * Get category display info for a metric
   * @param {string} metricKey - The metric key
   * @param {number} value - The metric value
   * @returns {Object} { category, label, textColorClass, hexColor }
   */
  export const getMetricCategoryInfo = (metricKey, value) => {
    const category = getMetricCategory(metricKey, value);
    
    return {
      category,
      label: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize
      textColorClass: CATEGORY_TEXT_CLASSES[category],
      hexColor: CATEGORY_COLORS[category]
    };
  };