// src/components/data/health/KeyMetricsSlider.jsx
import React from 'react';

const KeyMetricsSlider = ({ metrics }) => {
  if (!metrics || metrics.length === 0) {
    return null; // Don't render anything if there are no metrics
  }

  return (
    <div className="key-metrics-slider mb-4 overflow-x-auto py-2"> {/* Added py-2 */}
      <div className="flex space-x-4 p-2">
        {metrics.map((metric) => (
          <div
            key={metric.dataKey}
            className="metric-item bg-white dark:bg-gray-800 p-3 rounded-lg shadow min-w-[140px] hover:shadow-md dark:hover:bg-gray-700 transition-all" // Adjusted min-w, added hover effects
          >
            <h4 className="text-sm text-gray-500 dark:text-gray-400 truncate">{metric.title}</h4> {/* Added truncate for long titles */}
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {metric.value}
              {metric.unit && <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">{metric.unit}</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyMetricsSlider;
