// src/components/health/charts/MonthlyChart.jsx
import React, { memo } from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatSecondsToMMSS } from '../../../utils/dataUtils'; // Adjust path
import MonthlyTooltip from '../tooltips/MonthlyTooltip'; // Adjust path
import { chartMargins, monthlyChartConfig, axisConfig, gridConfig } from '../../../config/chartConfig'; // Adjust path

const MonthlyChart = memo(({ monthlyData, unit, minValue, maxValue, padding, dataKey, isDarkMode }) => {
  // Determine colors based on dark mode
  const axisColors = isDarkMode ? axisConfig.dark : axisConfig.light;
  const gridColors = isDarkMode ? gridConfig.dark : gridConfig.light;

  // Use a neutral color for bars, could be from config or hardcoded if simple
  const neutralBarColor = isDarkMode ? "#6B7280" : "#9CA3AF"; // Example: gray-500 dark, gray-400 light

  if (!monthlyData || monthlyData.length === 0) {
     return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Not enough data for monthly view.</div>;
  }


  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={monthlyData} margin={chartMargins.monthly} barGap={10}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={gridColors.stroke} // Use configured color
        />
        <XAxis
          dataKey="monthName"
          stroke={axisColors.stroke} // Use configured color
          tick={{ fill: axisColors.tickFill }} // Use configured color
          tickLine={{ stroke: axisColors.stroke }} // Use configured color
          axisLine={{ stroke: axisColors.axisLine }} // Use configured color
        />
        <YAxis
          stroke={axisColors.stroke} // Use configured color
          domain={[minValue - padding, maxValue + padding]}
          tickFormatter={(value) => {
            if (dataKey === 'five_k_seconds') return formatSecondsToMMSS(value);
            return `${Math.round(value)}`;
          }}
          tick={{ fill: axisColors.tickFill }} // Use configured color
          tickLine={{ stroke: axisColors.stroke }} // Use configured color
          axisLine={{ stroke: axisColors.axisLine }} // Use configured color
        />
        <Tooltip content={<MonthlyTooltip unit={unit} dataKey={dataKey} />} cursor={{fill: 'rgba(156, 163, 175, 0.1)'}}/> {/* Subtle hover cursor */}
        <Bar
          dataKey="average"
          fill={neutralBarColor}
          radius={[4, 4, 0, 0]}
          maxBarSize={monthlyChartConfig.maxBarSize} // Use configured size
        />
      </BarChart>
    </ResponsiveContainer>
  );
});

MonthlyChart.displayName = 'MonthlyChart';

export default MonthlyChart;