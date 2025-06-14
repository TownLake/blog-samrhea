// src/components/data/health/charts/MonthlyChart.jsx

import React, { memo, useMemo } from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceArea } from 'recharts';
import { formatSecondsToMMSS } from '../../../../utils/dataUtils';
import { getMetricCategoryInfo, METRIC_RANGES, CATEGORY_COLORS } from '../../../../utils/healthCategories';
import MonthlyTooltip from '../tooltips/MonthlyTooltip';
import { chartMargins, monthlyChartConfig, axisConfig, gridConfig } from '../../../../config/chartConfig';

const MonthlyChart = memo(({ monthlyData, unit, domain, dataKey, isDarkMode, showBands }) => {
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

  const categoryRanges = METRIC_RANGES[dataKey] || METRIC_RANGES[dataKey.replace('_clinical', '')] || [];

  if (!processedData || processedData.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Not enough data for monthly view.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={processedData} margin={chartMargins.monthly} barGap={10}>
        
        {/* Render Category Bands Behind Grid */}
        {showBands && categoryRanges.map(range => {
          if (range.min === Infinity || !range.max) return null;
          return (
            <ReferenceArea
              key={range.category + range.min}
              y1={range.min}
              y2={range.max === Infinity ? domain[1] : range.max}
              fill={CATEGORY_COLORS[range.category]}
              fillOpacity={0.08}
              stroke={CATEGORY_COLORS[range.category]}
              strokeOpacity={0.2}
              strokeWidth={1}
              strokeDasharray="3 3"
              ifOverflow="hidden"
            />
          );
        })}

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
          domain={domain}
          tickFormatter={(value) => {
            if (dataKey === 'five_k_seconds') return formatSecondsToMMSS(value);
            return `${Math.round(value)}`;
          }}
          tick={{ fill: axisColors.tickFill }}
          tickLine={{ stroke: axisColors.stroke }}
          axisLine={{ stroke: axisColors.axisLine }}
          allowDataOverflow={true}
          width={40}
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