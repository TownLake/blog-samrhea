// src/features/health/components/charts/SimpleBarChart.jsx
import React, { memo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell
} from 'recharts';
import { chartMargins, axisConfig, gridConfig } from '/src/config/chartConfig.js';
import { CATEGORY_COLORS } from '/src/utils/healthCategories.js';
import Tooltip from '/src/components/ui/Tooltip.jsx';
import { getMetricCategoryInfo } from '/src/utils/healthCategories.js';

const SimpleBarChart = memo(({
  chartData,
  xAxisDataKey,
  barDataKey,
  layout = "horizontal",
  barColor = CATEGORY_COLORS.good || '#3b82f6', 
  isDarkMode,
  height = 320,
  unit = "",
  xAxisTickFormatter,
  yAxisTickFormatter,
  yAxisWidth = 60,
  barSize = null
}) => {
  const axisColors = isDarkMode ? axisConfig.dark : axisConfig.light;
  const gridColors = isDarkMode ? gridConfig.dark : gridConfig.light;

  const renderCustomTooltip = (dataPoint) => {
    if (!dataPoint) return null;
    const value = dataPoint[barDataKey];
    const label = dataPoint[xAxisDataKey];

    if (value === null || value === undefined) return null;

    const displayValue = value.toLocaleString();
    const { label: categoryLabel, textColorClass } = getMetricCategoryInfo(barDataKey, value);

    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-gray-900 dark:text-white font-semibold">
          {displayValue}{unit}
        </p>
        {categoryLabel && <p className={`text-xs mt-1 ${textColorClass}`}>{categoryLabel}</p>}
      </div>
    );
  };

  if (!chartData || chartData.length === 0) {
    return <div className="flex items-center justify-center text-gray-500 dark:text-gray-400" style={{ height: `${height}px` }}>No data to display.</div>;
  }

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout={layout}
          margin={layout === "vertical" ? chartMargins.monthly : chartMargins.daily}
          barGap={layout === "horizontal" ? 4 : 2}
          barCategoryGap={layout === "horizontal" ? '20%' : '10%'}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={layout === "horizontal"}
            horizontal={layout === "vertical"}
            stroke={gridColors.stroke}
          />
          {layout === "horizontal" ? (
            <>
              <XAxis dataKey={xAxisDataKey} stroke={axisColors.stroke} tick={{ fill: axisColors.tickFill, fontSize: 12 }} tickLine={{ stroke: axisColors.stroke }} axisLine={{ stroke: axisColors.axisLine }} tickFormatter={xAxisTickFormatter} interval="preserveStartEnd" />
              <YAxis stroke={axisColors.stroke} tick={{ fill: axisColors.tickFill, fontSize: 12 }} tickLine={{ stroke: axisColors.stroke }} axisLine={{ stroke: axisColors.axisLine }} tickFormatter={yAxisTickFormatter} width={yAxisWidth} allowDecimals={false} />
            </>
          ) : (
            <>
              <XAxis type="number" stroke={axisColors.stroke} tick={{ fill: axisColors.tickFill, fontSize: 12 }} tickLine={{ stroke: axisColors.stroke }} axisLine={{ stroke: axisColors.axisLine }} tickFormatter={xAxisTickFormatter} allowDecimals={false} />
              <YAxis type="category" dataKey={xAxisDataKey} stroke={axisColors.stroke} tick={{ fill: axisColors.tickFill, fontSize: 12 }} tickLine={{ stroke: axisColors.stroke }} axisLine={{ stroke: axisColors.axisLine }} width={yAxisWidth + 40} interval={0} tickFormatter={yAxisTickFormatter} />
            </>
          )}
          <RechartsTooltip
            cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}
            content={<Tooltip renderContent={renderCustomTooltip} />}
          />
          <Bar dataKey={barDataKey} radius={[4, 4, 0, 0]} barSize={barSize}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={barColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

SimpleBarChart.displayName = 'SimpleBarChart';
export default SimpleBarChart;