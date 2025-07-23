// src/components/ui/Tooltip.jsx
import React, { memo } from 'react';

/**
 * A unified, customizable tooltip for Recharts.
 * It receives the standard Recharts payload and formats it based on props.
 *
 * @param {boolean} active - Injected by Recharts. True if the tooltip is active.
 * @param {Array} payload - Injected by Recharts. The data points for the hovered element.
 * @param {string|number} label - Injected by Recharts. The X-axis label of the hovered element.
 * @param {function} labelFormatter - A function to format the main label (e.g., a date).
 * @param {function} valueFormatter - A function to format the primary value.
 * @param {string} unit - A string unit to append to the value.
 * @param {function} renderContent - A function that receives the processed data point and returns JSX for custom content.
 */
const Tooltip = memo(({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  unit,
  renderContent,
}) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;

    // Allow a custom render function for maximum flexibility
    if (renderContent) {
      return renderContent(dataPoint);
    }

    // Default rendering logic
    const value = dataPoint.value ?? payload[0].value;
    const formattedLabel = labelFormatter ? labelFormatter(label) : label;
    const formattedValue = valueFormatter ? valueFormatter(value) : (value?.toFixed(1) ?? '--');

    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        {formattedLabel && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
            {formattedLabel}
          </p>
        )}
        <p className="text-gray-900 dark:text-white font-semibold">
          {formattedValue}
          {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
        </p>
      </div>
    );
  }
  return null;
});

Tooltip.displayName = 'Tooltip';
export default Tooltip;
