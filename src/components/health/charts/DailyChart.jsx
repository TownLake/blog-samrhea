// src/components/health/charts/DailyChart.jsx
import React, { memo } from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatSecondsToMMSS } from '../../../utils/dataUtils'; // Adjust path
import CustomTooltip from '../tooltips/CustomTooltip'; // Adjust path
import { chartMargins, axisConfig, gridConfig } from '../../../config/chartConfig'; // Adjust path

const DailyChart = memo(({ chartData, dataKey, unit, lineColor, minValue, maxValue, padding, isDarkMode }) => {
  // Determine colors based on dark mode
  const axisColors = isDarkMode ? axisConfig.dark : axisConfig.light;
  const gridColors = isDarkMode ? gridConfig.dark : gridConfig.light;
  const effectiveLineColor = lineColor || "#3B82F6"; // Fallback line color

  // Gradient IDs should be unique if multiple charts render simultaneously
  const gradientId = `detailGradient-${dataKey}`;
  const filledGradientId = `detailGradientFilled-${dataKey}`;

  if (!chartData || chartData.length < 2) {
     return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Not enough data for daily view.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={chartMargins.daily}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={effectiveLineColor} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={effectiveLineColor} stopOpacity={0}/>
          </linearGradient>
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
          dataKey="date"
          stroke={axisColors.stroke} // Use configured color
          tickFormatter={(date) => date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
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
        <Tooltip content={<CustomTooltip unit={unit} dataKey={dataKey} />} />
        {/* Area for filled values */}
        <Area
          type="monotone" dataKey={dataKey} stroke="none" strokeWidth={0}
          fillOpacity={1} fill={`url(#${filledGradientId})`}
          dot={false} activeDot={false} name="filledData"
          connectNulls={false} isAnimationActive={false}
          data={chartData.map(point => ({ ...point, [dataKey]: point[`is_fill_value_${dataKey?.split('_')[0]}`] ? point[dataKey] : null }))}
        />
        {/* Area for actual values */}
        <Area
          type="monotone" dataKey={dataKey} stroke={effectiveLineColor} strokeWidth={2}
          fillOpacity={1} fill={`url(#${gradientId})`}
          dot={false} activeDot={{ r: 6, stroke: effectiveLineColor, strokeWidth: 2, fill: '#FFFFFF' }}
          connectNulls={false} isAnimationActive={false}
          data={chartData.map(point => ({ ...point, [dataKey]: point[`is_fill_value_${dataKey?.split('_')[0]}`] ? null : point[dataKey] }))}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

DailyChart.displayName = 'DailyChart';

export default DailyChart;