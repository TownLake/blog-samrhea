// src/components/health/charts/DailyChart.jsx
import React, { memo, useMemo } from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatSecondsToMMSS } from '../../../utils/dataUtils'; // Adjust path as needed
import CustomTooltip from '../tooltips/CustomTooltip'; // Adjust path as needed
import { chartMargins, axisConfig, gridConfig } from '../../../config/chartConfig'; // Adjust path as needed

const DailyChart = memo(({
  chartData: initialChartData, // Renamed to avoid confusion in processing step
  dataKey,
  unit,
  lineColor,
  minValue,
  maxValue,
  padding,
  isDarkMode
}) => {
  // Determine colors based on dark mode
  const axisColors = isDarkMode ? axisConfig.dark : axisConfig.light;
  const gridColors = isDarkMode ? gridConfig.dark : gridConfig.light;
  const effectiveLineColor = lineColor || "#3B82F6"; // Fallback line color

  // Gradient IDs should be unique if multiple charts render simultaneously
  const gradientId = `detailGradient-${dataKey}`;
  const filledGradientId = `detailGradientFilled-${dataKey}`;

  // --- Data Processing: Create distinct keys for actual and filled values ---
  // This prepares the data for standard Recharts usage where Area components
  // select data using dataKey from the main chartData prop.
  // It also handles potential upstream data duplication gracefully by processing
  // each point as it comes. The *root cause* of duplication (if present)
  // must be fixed where `initialChartData` is generated/fetched.
  const { processedChartData, actualDataKey, filledDataKey } = useMemo(() => {
    if (!initialChartData || !Array.isArray(initialChartData)) {
        return { processedChartData: [], actualDataKey: `${dataKey}_actual`, filledDataKey: `${dataKey}_filled` };
    }

    // Derive keys dynamically
    const actualKey = `${dataKey}_actual`;
    const filledKey = `${dataKey}_filled`;
    // Construct the flag key based on the primary part of dataKey (e.g., 'hrv' from 'hrv_value')
    const dataKeyBase = dataKey?.split('_')[0]; // Handle potential undefined dataKey
    const fillFlagKey = `is_fill_value_${dataKeyBase}`;

    const processed = initialChartData.map(point => {
        // Ensure point is valid and has the dataKey property
        if (!point || typeof point !== 'object') return null; // Skip invalid points

        const hasDataKeyValue = point.hasOwnProperty(dataKey) && point[dataKey] !== null && point[dataKey] !== undefined;
        const isFilled = point.hasOwnProperty(fillFlagKey) && !!point[fillFlagKey];

        return {
            ...point, // Keep original data like 'date'
            [actualKey]: hasDataKeyValue && !isFilled ? point[dataKey] : null,
            [filledKey]: hasDataKeyValue && isFilled ? point[dataKey] : null,
        };
    }).filter(Boolean); // Remove any null entries created by invalid points

    // Deduplicate data based on the date key to handle potential upstream duplication issues reflected in the axis
    const uniqueData = Array.from(new Map(processed.map(item => [item.date, item])).values());

    return { processedChartData: uniqueData, actualDataKey: actualKey, filledDataKey: filledKey };

  }, [initialChartData, dataKey]);
  // --- End Data Processing ---


  // Check if there's enough valid data to render a chart
  // Check length >= 2 because Area/Line charts need at least two points
  const hasSufficientData = processedChartData && processedChartData.length >= 2;

  if (!hasSufficientData) {
     return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Not enough data for daily view.</div>;
  }

  // --- Recalculate Min/Max/Padding based on *processed* data ---
  // This ensures the Y-axis domain accurately reflects the plotted values
  const { finalMinValue, finalMaxValue, finalPadding } = useMemo(() => {
    const values = processedChartData
        .map(d => d[actualDataKey] ?? d[filledDataKey]) // Consider both actual and filled values
        .filter(v => v !== null && v !== undefined);

    if (values.length === 0) return { finalMinValue: 0, finalMaxValue: 100, finalPadding: 10 }; // Default fallback

    const min = Math.min(...values);
    const max = Math.max(...values);
    // Use a slightly larger padding factor or minimum absolute padding
    const pad = Math.max((max - min) * 0.15, 10); // Adjust multiplier or minimum as needed

    // Ensure calculated min/max don't go beyond provided props if they exist
    const calcMin = minValue !== undefined ? Math.min(minValue, min) : min;
    const calcMax = maxValue !== undefined ? Math.max(maxValue, max) : max;

    return { finalMinValue: calcMin, finalMaxValue: calcMax, finalPadding: pad };
  }, [processedChartData, actualDataKey, filledDataKey, minValue, maxValue]);
  // ---


  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* Pass the single, processed, and potentially deduplicated dataset */}
      <AreaChart data={processedChartData} margin={chartMargins.daily}>
        <defs>
          {/* Gradient for the main "actual" data area */}
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={effectiveLineColor} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={effectiveLineColor} stopOpacity={0}/>
          </linearGradient>
          {/* Gradient for the "filled" data area (subtler) */}
          <linearGradient id={filledGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={effectiveLineColor} stopOpacity={0.15}/>
            <stop offset="95%" stopColor={effectiveLineColor} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={gridColors.stroke}
        />
        <XAxis
          dataKey="date" // Ensure your data points have a 'date' property
          stroke={axisColors.stroke}
          // Added check for valid date object before formatting
          tickFormatter={(dateString) => {
              try {
                  // Attempt to create a date object; handle potential invalid strings
                  const dateObj = new Date(dateString);
                  if (isNaN(dateObj.getTime())) { // Check if date is invalid
                      return ''; // Return empty string for invalid dates
                  }
                  return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              } catch (e) {
                  console.error("Error formatting date:", dateString, e);
                  return ''; // Return empty string on error
              }
          }}
          tick={{ fill: axisColors.tickFill }}
          tickLine={{ stroke: axisColors.stroke }}
          axisLine={{ stroke: axisColors.axisLine }}
          // Recharts usually handles tick distribution well, but interval="preserveStartEnd" or explicit ticks might be needed if labels overlap badly
          // interval="preserveStartEnd" // Example: uncomment if needed
        />
        <YAxis
          stroke={axisColors.stroke}
          // Use the recalculated domain based on actual plotted data
          domain={[finalMinValue - finalPadding, finalMaxValue + finalPadding]}
          tickFormatter={(value) => {
            // Keep your specific formatting logic
            if (dataKey === 'five_k_seconds') return formatSecondsToMMSS(value);
            // Ensure value is a number before rounding
            return typeof value === 'number' ? `${Math.round(value)}` : '';
          }}
          tick={{ fill: axisColors.tickFill }}
          tickLine={{ stroke: axisColors.stroke }}
          axisLine={{ stroke: axisColors.axisLine }}
          // Allow Recharts to determine tick count, or set explicitly if needed
          // tickCount={5} // Example: uncomment and adjust if needed
        />
        {/*
          Tooltip Integration: CustomTooltip might need adjustment.
          The 'payload' passed to it will now contain entries for 'actualDataKey' and 'filledDataKey'.
          It should be updated to display the value from whichever key is non-null in the payload entry.
          It might also need access to the original 'dataKey' for labeling.
        */}
        <Tooltip content={<CustomTooltip unit={unit} originalDataKey={dataKey} actualDataKey={actualDataKey} filledDataKey={filledDataKey}/>} />

        {/* Area for filled values: Uses 'filledDataKey', NO 'data' prop */}
        <Area
          type="monotone"
          dataKey={filledDataKey} // Use the specific key for filled values
          stroke="none" // No border stroke for the fill area itself
          strokeWidth={0}
          fillOpacity={1}
          fill={`url(#${filledGradientId})`} // Use the subtle gradient
          dot={false} // No dots for the fill area
          activeDot={false}
          name="Filled Data" // Tooltip label
          connectNulls={false} // Don't connect gaps in filled data
          isAnimationActive={false} // Performance optimization
          // REMOVED data prop - Inherits from AreaChart
        />

        {/* Area for actual values: Uses 'actualDataKey', NO 'data' prop */}
        <Area
          type="monotone"
          dataKey={actualDataKey} // Use the specific key for actual values
          stroke={effectiveLineColor} // Line color
          strokeWidth={2} // Line thickness
          fillOpacity={1}
          fill={`url(#${gradientId})`} // Use the main gradient
          dot={false} // No dots by default on the line
          activeDot={{ r: 6, stroke: effectiveLineColor, strokeWidth: 2, fill: isDarkMode ? '#1E293B' : '#FFFFFF' }} // Style for hovered dot
          name="Actual Data" // Tooltip label
          connectNulls={false} // Don't connect gaps in actual data
          isAnimationActive={false} // Performance optimization
          // REMOVED data prop - Inherits from AreaChart
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

DailyChart.displayName = 'DailyChart';

export default DailyChart;