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
import { chartMargins, axisConfig, gridConfig, CATEGORY_COLORS } from '../../config/chartConfig'; // Assuming CATEGORY_COLORS is in chartConfig or import from healthCategories
import CustomTooltip from '../health/tooltips/CustomTooltip'; // We can adapt or create a new one

const SimpleBarChart = memo(({
  chartData,
  xAxisDataKey,
  barDataKey,
  layout = "horizontal", // "horizontal" (vertical bars) or "vertical" (horizontal bars)
  barColor = CATEGORY_COLORS.good || '#3b82f6', // Default to a nice blue
  isDarkMode,
  height = 320, // Default height
  unit = "", // Unit for the tooltip
  xAxisTickFormatter,
  yAxisTickFormatter,
  yAxisWidth = 60,
  barSize = null // null for default, or a number e.g. 20
}) => {
  const axisColors = isDarkMode ? axisConfig.dark : axisConfig.light;
  const gridColors = isDarkMode ? gridConfig.dark : gridConfig.light;

  if (!chartData || chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400" style={{ height: `${height}px` }}>No data to display.</div>;
  }

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout={layout}
          margin={layout === "vertical" ? chartMargins.monthly : chartMargins.daily} // Adjust margins for layout
          barGap={layout === "horizontal" ? 4 : 2}
          barCategoryGap={layout === "horizontal" ? '20%' : '10%'}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={layout === "horizontal"} // Vertical grid lines for vertical bars
            horizontal={layout === "vertical"} // Horizontal grid lines for horizontal bars
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
                tickFormatter={xAxisTickFormatter} // Will format the count
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey={xAxisDataKey} // Source names on Y-axis
                stroke={axisColors.stroke}
                tick={{ fill: axisColors.tickFill, fontSize: 12 }}
                tickLine={{ stroke: axisColors.stroke }}
                axisLine={{ stroke: axisColors.axisLine }}
                width={yAxisWidth + 40} // More space for longer source names
                interval={0}
                tickFormatter={yAxisTickFormatter} // To truncate long source names if needed
              />
            </>
          )}
          <Tooltip
            cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}
            content={<CustomTooltip unit={unit} originalDataKey={barDataKey} />} // Adapt or create specific tooltip
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