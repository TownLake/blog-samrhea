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
      { category: 'fair', min: 45, max: 65 },
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
      { category: 'excellent', min: 10, max: 15 }, // 10-14 --> make max 15 to include 14
      { category: 'good', min: 15, max: 18 },      // 15-17 --> make max 18 to include 17
      { category: 'fair', min: 18, max: 23 },      // 18-22 --> make max 23 to include 22
      { category: 'poor', min: 23, max: Infinity } // >22 --> min 23
    ],
    
    // Sleep metrics
    'total_sleep': [
      { category: 'excellent', min: 7.5, max: 8.6 },  // 7.5-8.5 --> make max 8.6 to include 8.5
      { category: 'good', min: 7.0, max: 7.5 },
      { category: 'fair', min: 6.5, max: 7.0 },
      { category: 'poor', min: 0, max: 6.5 }
    ],
    'deep_sleep_minutes': [
      { category: 'excellent', min: 90, max: 121 },  // 90-120 --> make max 121 to include 120
      { category: 'good', min: 70, max: 90 },
      { category: 'fair', min: 50, max: 70 },
      { category: 'poor', min: 0, max: 50 }
    ],
    'delay': [
      { category: 'excellent', min: 0, max: 10 },
      { category: 'good', min: 10, max: 21 },     // 10-20 --> make max 21 to include 20
      { category: 'fair', min: 21, max: 31 },     // 21-30 --> make max 31 to include 30
      { category: 'poor', min: 31, max: Infinity } // >30 --> min 31
    ],
    'efficiency': [
      { category: 'excellent', min: 90, max: 101 }, // >90% --> min 90, max 101 to include 100
      { category: 'good', min: 85, max: 90 },
      { category: 'fair', min: 75, max: 85 },
      { category: 'poor', min: 0, max: 75 }
    ],
    
    // Running metrics
    'vo2_max': [
      { category: 'excellent', min: 50, max: Infinity },
      { category: 'good', min: 42, max: 50 },
      { category: 'fair', min: 36, max: 42 },
      { category: 'poor', min: 0, max: 36 }
    ]
    // 5K time doesn't have categories per your note
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
    
    // Don't categorize 5K time
    if (metricKey === 'five_k_seconds') {
      return 'default';
    }
    
    const ranges = METRIC_RANGES[metricKey];
    
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
    
    // Special case for 5K time - no category
    if (metricKey === 'five_k_seconds') {
      return {
        category: 'default',
        label: '',  // No label for 5K
        textColorClass: CATEGORY_TEXT_CLASSES.default,
        hexColor: CATEGORY_COLORS.default
      };
    }
    
    return {
      category,
      label: category === 'default' ? '' : category.charAt(0).toUpperCase() + category.slice(1), // Capitalize
      textColorClass: CATEGORY_TEXT_CLASSES[category],
      hexColor: CATEGORY_COLORS[category]
    };
  };
