// src/components/health/charts/MonthlyChart.jsx
import React, { memo, useMemo } from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatSecondsToMMSS } from '../../../utils/dataUtils'; // Adjust path
import { getMetricCategoryInfo } from '../../../utils/healthCategories'; // Add category utility
import MonthlyTooltip from '../tooltips/MonthlyTooltip'; // Adjust path
import { chartMargins, monthlyChartConfig, axisConfig, gridConfig } from '../../../config/chartConfig'; // Adjust path

const MonthlyChart = memo(({ monthlyData, unit, minValue, maxValue, padding, dataKey, isDarkMode }) => {
  // Determine colors based on dark mode
  const axisColors = isDarkMode ? axisConfig.dark : axisConfig.light;
  const gridColors = isDarkMode ? gridConfig.dark : gridConfig.light;

  // Process data to add category colors to each data point
  const processedData = useMemo(() => {
    if (!monthlyData || !monthlyData.length) return [];
    
    return monthlyData.map(monthItem => {
      const { hexColor } = getMetricCategoryInfo(dataKey, monthItem.average);
      return {
        ...monthItem,
        color: hexColor
      };
    });
  }, [monthlyData, dataKey]);

  if (!processedData || processedData.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Not enough data for monthly view.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={processedData} margin={chartMargins.monthly} barGap={10}>
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
          fill="#a1a1aa" // Default color (will be overridden by cell colors)
          radius={[4, 4, 0, 0]}
          maxBarSize={monthlyChartConfig.maxBarSize} // Use configured size
          // Use individual bar colors based on categories
          isAnimationActive={false}
          name={dataKey}
        >
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

MonthlyChart.displayName = 'MonthlyChart';

export default MonthlyChart;