// src/components/health/tooltips/SparklineTooltip.jsx
import React, { memo } from 'react';
import { formatSecondsToMMSS } from '../../../utils/dataUtils'; // Adjust path as needed
import { getMetricCategoryInfo } from '../../../utils/healthCategories'; // Import category utility

const SparklineTooltip = memo(({ active, payload, dataKey }) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload; // Should contain { date, value, isFilled }
        const value = dataPoint?.value;
        const isFilled = dataPoint?.isFilled;
        const date = dataPoint?.date;

        // Exit if no value
        if (value === null || value === undefined) return null;

        const displayValue = dataKey === 'five_k_seconds' ?
          formatSecondsToMMSS(value) :
          value?.toFixed(1) ?? '--';

        const formattedDate = date ? new Date(date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
        }) : '';

        // Get category info
        const { label: categoryLabel, textColorClass } = getMetricCategoryInfo(dataKey, value);

        return (
        <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
              {formattedDate}
            </p>
            <p className="text-gray-900 dark:text-white text-sm font-medium">
              {displayValue}
              {isFilled && (
                  <span className="text-xs ml-1 text-gray-500">*</span>
              )}
            </p>
            <p className={`text-xs ${textColorClass}`}>
              {categoryLabel}
            </p>
        </div>
        );
    }
    return null;
});

SparklineTooltip.displayName = 'SparklineTooltip';

export default SparklineTooltip;