// src/components/health/tooltips/CustomTooltip.jsx
import React, { memo } from 'react';
import { formatSecondsToMMSS } from '../../../utils/dataUtils'; // Adjust path as needed
import { getMetricCategoryInfo } from '../../../utils/healthCategories'; // Import category utility

const CustomTooltip = memo(({ active, payload, label, unit, originalDataKey, actualDataKey, filledDataKey }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    
    // Find the actual value from either the actual or filled data key
    let value = null;
    let isFilled = false;
    
    // Check which key has the value
    if (payload.some(p => p.dataKey === actualDataKey && p.value !== null)) {
      value = payload.find(p => p.dataKey === actualDataKey).value;
      isFilled = false;
    } else if (payload.some(p => p.dataKey === filledDataKey && p.value !== null)) {
      value = payload.find(p => p.dataKey === filledDataKey).value;
      isFilled = true;
    }

    // Exit if no value found
    if (value === null) return null;

    // Format the value for display
    const displayValue = originalDataKey === 'five_k_seconds' ?
      formatSecondsToMMSS(value) :
      value?.toFixed(1) ?? '--';

    // Get category info for the value
    const { label: categoryLabel, textColorClass } = getMetricCategoryInfo(originalDataKey, value);

    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
          {new Date(label).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
        <p className="text-gray-900 dark:text-white font-semibold">
          {displayValue}{unit}
          {isFilled && (
            <span className="text-xs ml-1 text-gray-500 dark:text-gray-400">
              (est.)
            </span>
          )}
        </p>
        <p className={`text-xs mt-1 ${textColorClass}`}>
          {categoryLabel}
        </p>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

export default CustomTooltip;