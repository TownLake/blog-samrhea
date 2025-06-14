// src/components/data/health/charts/DailyChart.jsx

import React, { memo, useMemo } from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { formatSecondsToMMSS } from '../../../../utils/dataUtils';
import CustomTooltip from '../tooltips/CustomTooltip';
import { chartMargins, axisConfig, gridConfig } from '../../../../config/chartConfig';
import { METRIC_RANGES, CATEGORY_COLORS } from '../../../../utils/healthCategories';

const DailyChart = memo(({
  chartData: initialChartData,
  dataKey,
  unit,
  lineColor,
  domain,
  isDarkMode,
  showBands
}) => {
  const axisColors = isDarkMode ? axisConfig.dark : axisConfig.light;
  const gridColors = isDarkMode ? gridConfig.dark : gridConfig.light;
  const effectiveLineColor = lineColor || "#3B82F6";

  const gradientId = `detailGradient-${dataKey}`;
  const filledGradientId = `detailGradientFilled-${dataKey}`;

  const { processedChartData, actualDataKey, filledDataKey } = useMemo(() => {
    if (!initialChartData || !Array.isArray(initialChartData)) {
        return { processedChartData: [], actualDataKey: `${dataKey}_actual`, filledDataKey: `${dataKey}_filled` };
    }
    const actualKey = `${dataKey}_actual`;
    const filledKey = `${dataKey}_filled`;
    const dataKeyBase = dataKey?.split('_')[0];
    const fillFlagKey = `is_fill_value_${dataKeyBase}`;
    const processed = initialChartData.map(point => {
        if (!point || typeof point !== 'object') return null;
        const hasDataKeyValue = point.hasOwnProperty(dataKey) && point[dataKey] !== null && point[dataKey] !== undefined;
        const isFilled = point.hasOwnProperty(fillFlagKey) && !!point[fillFlagKey];
        return {
            ...point,
            [actualKey]: hasDataKeyValue && !isFilled ? point[dataKey] : null,
            [filledKey]: hasDataKeyValue && isFilled ? point[dataKey] : null,
        };
    }).filter(Boolean);
    const uniqueData = Array.from(new Map(processed.map(item => [item.date, item])).values());
    return { processedChartData: uniqueData, actualDataKey: actualKey, filledDataKey: filledKey };
  }, [initialChartData, dataKey]);

  const categoryRanges = METRIC_RANGES[dataKey] || METRIC_RANGES[dataKey.replace('_clinical', '')] || [];

  if (!processedChartData || processedChartData.length < 2) {
     return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Not enough data for daily view.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={processedChartData} margin={chartMargins.daily}>
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
          dataKey="date"
          stroke={axisColors.stroke}
          tickFormatter={(dateString) => {
              try {
                  const dateObj = new Date(dateString);
                  if (isNaN(dateObj.getTime())) return '';
                  return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              } catch (e) { return ''; }
          }}
          tick={{ fill: axisColors.tickFill }}
          tickLine={{ stroke: axisColors.stroke }}
          axisLine={{ stroke: axisColors.axisLine }}
        />
        <YAxis
          stroke={axisColors.stroke}
          domain={domain}
          tickFormatter={(value) => {
            if (dataKey === 'five_k_seconds') return formatSecondsToMMSS(value);
            return typeof value === 'number' ? `${Math.round(value)}` : '';
          }}
          tick={{ fill: axisColors.tickFill }}
          tickLine={{ stroke: axisColors.stroke }}
          axisLine={{ stroke: axisColors.axisLine }}
          allowDataOverflow={true}
          width={40}
        />
        <Tooltip content={<CustomTooltip unit={unit} originalDataKey={dataKey} actualDataKey={actualDataKey} filledDataKey={filledDataKey}/>} />
        
        <Area
          type="monotone"
          dataKey={filledDataKey}
          stroke="none"
          strokeWidth={0}
          fillOpacity={1}
          fill={`url(#${filledGradientId})`}
          dot={false}
          activeDot={false}
          name="Filled Data"
          connectNulls={false}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey={actualDataKey}
          stroke={effectiveLineColor}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 6, stroke: effectiveLineColor, strokeWidth: 2, fill: isDarkMode ? '#1E293B' : '#FFFFFF' }}
          name="Actual Data"
          connectNulls={true}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

DailyChart.displayName = 'DailyChart';
export default DailyChart;