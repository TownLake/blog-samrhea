// src/components/health/tooltips/MonthlyTooltip.jsx
import React, { memo } from 'react';
import { formatSecondsToMMSS } from '../../../utils/dataUtils'; // Adjust path as needed
import { getMetricCategoryInfo } from '../../../utils/healthCategories'; // Import category utility

const MonthlyTooltip = memo(({ active, payload, unit, dataKey }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload; // Contains monthName, average, count
    const value = dataPoint?.average;

    // Exit if no value
    if (value === null || value === undefined) return null;

    const displayValue = dataKey === 'five_k_seconds' ?
      formatSecondsToMMSS(value) :
      value?.toFixed(1) ?? '--';

    // Get category information
    const { label: categoryLabel, textColorClass } = getMetricCategoryInfo(dataKey, value);

    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
          {dataPoint?.monthName} {/* Display month name from payload */}
        </p>
        <p className="text-gray-900 dark:text-white font-semibold">
          {displayValue}{unit} <span className="text-sm font-normal">(avg)</span>
        </p>
        <p className={`text-xs mt-1 ${textColorClass}`}>
          {categoryLabel}
        </p>
        {dataPoint?.count !== undefined && ( // Show count if available
           <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
            From {dataPoint.count} data points
          </p>
        )}
      </div>
    );
  }
  return null;
});

MonthlyTooltip.displayName = 'MonthlyTooltip';

export default MonthlyTooltip;