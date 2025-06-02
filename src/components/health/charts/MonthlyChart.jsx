// src/components/health/charts/MonthlyChart.jsx
import React, { memo, useMemo } from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatSecondsToMMSS } from '../../../utils/dataUtils'; // Adjust path
import { getMetricCategoryInfo } from '../../../utils/healthCategories'; // Add category utility
import MonthlyTooltip from '../tooltips/MonthlyTooltip'; // Adjust path
import { chartMargins, monthlyChartConfig, axisConfig, gridConfig } from '../../../config/chartConfig'; // Adjust path

const MonthlyChart = memo(({ monthlyData, unit, domain, dataKey, isDarkMode }) => { // UPDATED props
  const axisColors = isDarkMode ? axisConfig.dark : axisConfig.light;
  const gridColors = isDarkMode ? gridConfig.dark : gridConfig.light;

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
          stroke={gridColors.stroke}
        />
        <XAxis
          dataKey="monthName"
          stroke={axisColors.stroke}
          tick={{ fill: axisColors.tickFill }}
          tickLine={{ stroke: axisColors.stroke }}
          axisLine={{ stroke: axisColors.axisLine }}
        />
        <YAxis
          stroke={axisColors.stroke}
          domain={domain} // Use the domain passed via props
          tickFormatter={(value) => {
            if (dataKey === 'five_k_seconds') return formatSecondsToMMSS(value);
            return `${Math.round(value)}`;
          }}
          tick={{ fill: axisColors.tickFill }}
          tickLine={{ stroke: axisColors.stroke }}
          axisLine={{ stroke: axisColors.axisLine }}
          allowDataOverflow={true} // Important for custom domains
          width={40} // Give Y-axis enough space
        />
        <Tooltip content={<MonthlyTooltip unit={unit} dataKey={dataKey} />} cursor={{fill: 'rgba(156, 163, 175, 0.1)'}}/>
        <Bar
          dataKey="average"
          fill="#a1a1aa"
          radius={[4, 4, 0, 0]}
          maxBarSize={monthlyChartConfig.maxBarSize}
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