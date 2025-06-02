// src/components/charts/SimpleBarChart.jsx
import React, { memo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
// Imports from chartConfig are fine
import { chartMargins, axisConfig, gridConfig } from '../../config/chartConfig';
// CATEGORY_COLORS is imported from healthCategories
import { CATEGORY_COLORS } from '../../utils/healthCategories';
// Corrected import path for CustomTooltip
import CustomTooltip from '../data/health/tooltips/CustomTooltip';

const SimpleBarChart = memo(({
  chartData,
  xAxisDataKey,
  barDataKey,
  layout = "horizontal",
  // Default barColor now references the correctly imported CATEGORY_COLORS
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
          {layout === "horizontal" ? ( // Vertical Bars
            <>
              <XAxis
                dataKey={xAxisDataKey}
                stroke={axisColors.stroke}
                tick={{ fill: axisColors.tickFill, fontSize: 12 }}
                tickLine={{ stroke: axisColors.stroke }}
                axisLine={{ stroke: axisColors.axisLine }}
                tickFormatter={xAxisTickFormatter}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke={axisColors.stroke}
                tick={{ fill: axisColors.tickFill, fontSize: 12 }}
                tickLine={{ stroke: axisColors.stroke }}
                axisLine={{ stroke: axisColors.axisLine }}
                tickFormatter={yAxisTickFormatter}
                width={yAxisWidth}
                allowDecimals={false}
              />
            </>
          ) : ( // Horizontal Bars
            <>
              <XAxis
                type="number"
                stroke={axisColors.stroke}
                tick={{ fill: axisColors.tickFill, fontSize: 12 }}
                tickLine={{ stroke: axisColors.stroke }}
                axisLine={{ stroke: axisColors.axisLine }}
                tickFormatter={xAxisTickFormatter}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey={xAxisDataKey}
                stroke={axisColors.stroke}
                tick={{ fill: axisColors.tickFill, fontSize: 12 }}
                tickLine={{ stroke: axisColors.stroke }}
                axisLine={{ stroke: axisColors.axisLine }}
                width={yAxisWidth + 40}
                interval={0}
                tickFormatter={yAxisTickFormatter}
              />
            </>
          )}
          <Tooltip
            cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}
            content={<CustomTooltip unit={unit} originalDataKey={barDataKey} />}
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