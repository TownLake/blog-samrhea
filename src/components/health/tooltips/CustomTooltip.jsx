// src/components/health/tooltips/CustomTooltip.jsx
import React, { memo } from 'react';
import { formatSecondsToMMSS } from '../../../utils/dataUtils'; // Adjust path as needed

const CustomTooltip = memo(({ active, payload, label, unit, dataKey }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    // Handle potential fill value indication (assuming flag exists like `is_fill_value_hrv`)
    const fillValueKey = `is_fill_value_${dataKey?.split('_')[0]}`;
    const isFilled = dataPoint?.[fillValueKey];
    const value = payload[0].value;

    const displayValue = dataKey === 'five_k_seconds' ?
      formatSecondsToMMSS(value) :
      value?.toFixed(1) ?? '--';

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
              (est.) {/* Or (carried forward) */}
            </span>
          )}
        </p>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

export default CustomTooltip;