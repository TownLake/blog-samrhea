// src/components/health/tooltips/SparklineTooltip.jsx
import React, { memo } from 'react';
import { formatSecondsToMMSS } from '../../../utils/dataUtils'; // Adjust path as needed

const SparklineTooltip = memo(({ active, payload, dataKey }) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload; // Should contain { date, value, isFilled }
        const value = dataPoint?.value;
        const isFilled = dataPoint?.isFilled;
        const date = dataPoint?.date;

        const displayValue = dataKey === 'five_k_seconds' ?
          formatSecondsToMMSS(value) :
          value?.toFixed(1) ?? '--';

        const formattedDate = date ? new Date(date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
        }) : '';

        return (
        <div className="bg-white dark:bg-slate-800 px-2 py-1 rounded-md shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">
              {formattedDate}
            </p>
            <p className="text-gray-900 dark:text-white text-sm font-medium">
              {displayValue}
              {isFilled && (
                  <span className="text-xs ml-1 text-gray-500">*</span> // Simple indicator
              )}
            </p>
        </div>
        );
    }
    return null;
});

SparklineTooltip.displayName = 'SparklineTooltip';

export default SparklineTooltip;